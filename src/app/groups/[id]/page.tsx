import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { GroupDetailClient } from '@/components/GroupDetailClient';

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const person = await prisma.person.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!person) {
    redirect('/onboarding');
  }

  // Fetch group first without includes (to avoid RLS issues)
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: true,
    },
  });

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold">Group Not Found</h1>
        <p className="text-gray-600">This group doesn't exist or has been removed.</p>
      </div>
    );
  }

  // Fetch person data separately to bypass RLS issues with includes
  const personIds = [...new Set([group.createdBy, ...group.memberships.map(m => m.personId)])];
  const persons = await prisma.person.findMany({
    where: { id: { in: personIds } },
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  });

  // Map persons by ID for easy lookup
  const personMap = new Map(persons.map(p => [p.id, p]));

  // Attach person data to memberships
  const membershipsWithPersons = group.memberships.map(m => ({
    ...m,
    person: personMap.get(m.personId) || null,
  }));

  // Attach creator data
  const groupWithRelations = {
    ...group,
    memberships: membershipsWithPersons,
    creator: personMap.get(group.createdBy) || { id: group.createdBy, displayName: 'Unknown', email: '' },
  };

  const membership = groupWithRelations.memberships.find(m => m.personId === person.id);

  return (
    <GroupDetailClient
      group={groupWithRelations}
      personId={person.id}
      personName={person.displayName}
      membership={membership}
    />
  );
}
