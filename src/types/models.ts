/**
 * Core data model types
 * These interfaces match the Prisma schema and are used across the frontend
 */

/**
 * Person model - Represents a user in the system
 */
export interface Person {
  id: string;
  supabaseUserId: string;
  email: string;
  displayName: string;
  phone: string | null;
  bio: string | null;
  profileImageUrl: string | null;

  // Location fields
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  region: string | null;
  community: string | null;
  proximityRadiusKm: number;
  locationPrivacy: LocationPrivacy;

  // Profile fields
  ageRange: string | null;
  gender: string | null;
  archetype: string | null;
  connectionStyle: string | null;
  personalityTraits: any | null; // JSON field

  // Preferences and signals
  groupPreferences: any | null; // JSON field
  leadershipSignals: LeadershipSignals | null;
  isPotentialShepherd: boolean;

  // Safety and blocking
  blockedPersons: string[];
  safetyFlags: string[];

  // Metadata
  onboardingLevel: number;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Person with relations included
 */
export interface PersonWithRelations extends Person {
  interests: PersonInterest[];
  memberships?: GroupMembership[];
  createdGroups?: Group[];
}

/**
 * Interest model - Represents an activity or topic
 */
export interface Interest {
  id: string;
  name: string;
  category: string;
  description: string | null;
  popularity: number;
  subcategory: string | null;
  metadata: any | null; // JSON field
  createdAt: Date;
}

/**
 * PersonInterest model - Links persons to interests with proficiency level
 */
export interface PersonInterest {
  id: string;
  personId: string;
  interestId: string;
  proficiencyLevel: number; // 1-5 scale
  createdAt: Date;
  interest: Interest;
}

/**
 * Group model - Represents a gathering or circle
 */
export interface Group {
  id: string;
  name: string;
  description: string | null;
  protocol: string | null;
  imageUrl: string | null;
  type: GroupType;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  isVirtual: boolean;
  minSize: number;
  maxSize: number | null;
  currentSize: number;
  createdBy: string;
  leaderIds: string[];
  isPublic: boolean;
  tags: string[];
  status: GroupStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Group with relations included
 */
export interface GroupWithRelations extends Group {
  memberships: GroupMembership[];
  creator?: Person;
}

/**
 * GroupMembership model - Links persons to groups with role and status
 */
export interface GroupMembership {
  id: string;
  personId: string;
  groupId: string;
  role: MemberRole;
  status: MemberStatus;
  joinRequestedAt: Date;
  joinedAt: Date | null;
  lastEngagedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  person: Person;
  group?: Group;
}

/**
 * CompatibilityScore model - Represents match scores between persons
 */
export interface CompatibilityScore {
  id: string;
  personId: string;
  matchedPersonId: string;
  interestSimilarity: number;
  proximityScore: number;
  overallScore: number;
  matchReasons: string[];
  calculatedAt: Date;
  expiresAt: Date;
}

/**
 * SafetyReport model - Represents safety concerns or reports
 */
export interface SafetyReport {
  id: string;
  reporterId: string | null;
  reportedPersonId: string | null;
  reportedGroupId: string | null;
  reason: string;
  details: string | null;
  status: ReportStatus;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  actionTaken: any | null; // JSON field
  createdAt: Date;
}

/**
 * Enums
 */

export type LocationPrivacy = 'EXACT' | 'APPROXIMATE' | 'CITY_ONLY' | 'HIDDEN';

export type GroupType = 'HOBBY' | 'SUPPORT' | 'SPIRITUAL' | 'PROFESSIONAL' | 'SOCIAL' | 'OTHER';

export type GroupStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type MemberRole = 'MEMBER' | 'LEADER' | 'CREATOR';

export type MemberStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REMOVED';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED';

/**
 * JSON field types
 */

export interface LeadershipSignals {
  willingness: 'participate' | 'help_organize' | 'share_skills';
  hasAssets: boolean;
  notifyForNewGroups: boolean;
}

/**
 * API Response types
 */

export interface PersonMatchResult {
  person: PersonWithRelations;
  interestSimilarity: number;
  proximityScore: number;
  overallScore: number;
  matchReasons: string[];
  calculatedAt: Date;
}

export interface GroupMatchResult {
  group: GroupWithRelations;
  relevanceScore: number;
  distanceKm: number | null;
  matchReasons: string[];
}

/**
 * Form data types
 */

export interface OnboardingFormData {
  displayName: string;
  interests: Array<{
    interestId: string;
    proficiencyLevel: number;
  }>;
  latitude: number;
  longitude: number;
  community: string;
  city: string;
  region: string;
  archetype?: string;
  connectionStyle?: string;
  leadershipSignals: LeadershipSignals;
}

export interface CreateGroupFormData {
  name: string;
  description?: string;
  protocol?: string;
  type: GroupType;
  isVirtual: boolean;
  locationName?: string | null;
  latitude: number | null;
  longitude: number | null;
  maxSize?: number;
  tags?: string[];
}

export interface UpdateProfileFormData {
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  latitude?: number;
  longitude?: number;
  locationPrivacy?: LocationPrivacy;
  proximityRadiusKm?: number;
  ageRange?: string;
  gender?: string;
}

/**
 * Component prop types
 */

export interface InterestWithProficiency {
  id: string;
  name: string;
  category: string;
  proficiencyLevel: number;
}

export interface GroupCardData {
  id: string;
  name: string;
  type: GroupType;
  status: GroupStatus;
  currentSize: number;
  maxSize: number | null;
  locationName: string | null;
  isVirtual: boolean;
  createdAt: string;
  description: string | null;
  protocol: string | null;
  memberships: Array<{
    person: {
      id: string;
      displayName: string;
      archetype: string | null;
    };
  }>;
}

/**
 * Utility types
 */

export type Nullable<T> = T | null;

export type WithId<T> = T & { id: string };

export type Timestamp = Date | string;

export type OptionalExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;
