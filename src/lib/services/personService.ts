import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Person Service - Handles all person-related database operations
 */

export interface CreatePersonParams {
  supabaseUserId: string;
  email: string;
  displayName: string;
}

export interface UpdatePersonParams {
  displayName?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Create a new person record after Supabase signup
 */
export async function createPerson(params: CreatePersonParams) {
  const { supabaseUserId, email, displayName } = params;

  const person = await prisma.person.create({
    data: {
      supabaseUserId,
      email,
      displayName,
      onboardingLevel: 0, // Not onboarded yet
    },
  });

  return person;
}

/**
 * Get person by Supabase user ID
 */
export async function getPersonBySupabaseId(supabaseUserId: string) {
  const person = await prisma.person.findUnique({
    where: { supabaseUserId },
  });

  if (!person) return null;

  // Fetch interests separately to avoid RLS issues
  const personInterests = await prisma.personInterest.findMany({
    where: { personId: person.id },
  });

  // Fetch interest details
  const interestIds = personInterests.map(pi => pi.interestId);
  const interests = await prisma.interest.findMany({
    where: { id: { in: interestIds } },
  });

  // Map interests by ID
  const interestMap = new Map(interests.map(i => [i.id, i]));

  // Attach interest data to personInterests
  const personInterestsWithDetails = personInterests.map(pi => ({
    ...pi,
    interest: interestMap.get(pi.interestId)!,
  }));

  return {
    ...person,
    interests: personInterestsWithDetails,
  };
}

/**
 * Get person by ID
 */
export async function getPersonById(personId: string) {
  const person = await prisma.person.findUnique({
    where: { id: personId },
  });

  if (!person) return null;

  // Fetch interests separately to avoid RLS issues
  const personInterests = await prisma.personInterest.findMany({
    where: { personId: person.id },
  });

  // Fetch interest details
  const interestIds = personInterests.map(pi => pi.interestId);
  const interests = await prisma.interest.findMany({
    where: { id: { in: interestIds } },
  });

  // Map interests by ID
  const interestMap = new Map(interests.map(i => [i.id, i]));

  // Attach interest data to personInterests
  const personInterestsWithDetails = personInterests.map(pi => ({
    ...pi,
    interest: interestMap.get(pi.interestId)!,
  }));

  return {
    ...person,
    interests: personInterestsWithDetails,
  };
}

/**
 * Update person profile
 */
export async function updatePerson(
  personId: string,
  updates: UpdatePersonParams
) {
  const person = await prisma.person.update({
    where: { id: personId },
    data: updates,
  });

  return person;
}

/**
 * Update person location
 */
export async function updatePersonLocation(
  personId: string,
  latitude: number,
  longitude: number
) {
  const person = await prisma.person.update({
    where: { id: personId },
    data: {
      latitude,
      longitude,
      lastActiveAt: new Date(),
    },
  });

  return person;
}

/**
 * Add interests to person
 */
export async function addPersonInterests(
  personId: string,
  interestIds: string[],
  proficiencyLevel: number = 3
) {
  // Remove existing interests
  await prisma.personInterest.deleteMany({
    where: { personId },
  });

  // Add new interests
  const personInterests = await prisma.personInterest.createMany({
    data: interestIds.map((interestId) => ({
      personId,
      interestId,
      proficiencyLevel,
    })),
  });

  return personInterests;
}

/**
 * Remove interest from person
 */
export async function removePersonInterest(
  personId: string,
  interestId: string
) {
  await prisma.personInterest.deleteMany({
    where: {
      personId,
      interestId,
    },
  });
}

/**
 * Block a person
 */
export async function blockPerson(blockerId: string, blockedId: string) {
  // Add to blocked list using Prisma's array operations
  await prisma.person.update({
    where: { id: blockerId },
    data: {
      blockedPersons: {
        push: blockedId,
      },
    },
  });

  return { success: true };
}

/**
 * Check if person has completed onboarding
 */
export async function isPersonOnboarded(personId: string): Promise<boolean> {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { onboardingLevel: true },
  });

  return (person?.onboardingLevel ?? 0) >= 1;
}

/**
 * Update last active timestamp
 */
export async function updateLastActive(personId: string) {
  await prisma.person.update({
    where: { id: personId },
    data: { lastActiveAt: new Date() },
  });
}
