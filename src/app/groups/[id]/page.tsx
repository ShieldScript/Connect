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

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          person: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
      },
      creator: {
        select: {
          id: true,
          displayName: true,
        },
      },
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

  const membership = group.memberships.find(m => m.personId === person.id);

  return (
    <GroupDetailClient
      group={group}
      personId={person.id}
      personName={person.displayName}
      membership={membership}
    />
  );
}
