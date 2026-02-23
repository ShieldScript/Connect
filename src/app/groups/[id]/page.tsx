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

  try {
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

    // Ensure memberships is an array
    const memberships = group.memberships || [];

    // Fetch person data separately to bypass RLS issues with includes
    const personIds = [...new Set([group.createdBy, ...memberships.map(m => m.personId)].filter(Boolean))];

    const persons = await prisma.person.findMany({
      where: { id: { in: personIds } },
      select: {
        id: true,
        displayName: true,
        email: true,
      },
    });

    console.log(`Fetched ${persons.length} persons for ${personIds.length} person IDs`);

    // Map persons by ID for easy lookup
    const personMap = new Map(persons.map(p => [p.id, p]));

    // Attach person data to memberships (filter out any with missing person data)
    const membershipsWithPersons = memberships
      .map(m => ({
        ...m,
        person: personMap.get(m.personId) || null,
      }))
      .filter(m => m.person !== null); // Only include memberships with valid person data

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
  } catch (error) {
    console.error('Error loading group detail:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600">Error Loading Group</h1>
        <p className="text-gray-600 mb-4">Failed to load group details</p>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-w-2xl">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}
