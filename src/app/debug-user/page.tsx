import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export default async function DebugUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8">Not logged in</div>
  }

  const person = await prisma.person.findUnique({
    where: { supabaseUserId: user.id },
  })

  const allPersons = await prisma.person.findMany({
    select: {
      displayName: true,
      email: true,
      supabaseUserId: true,
      onboardingLevel: true,
    },
  })

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Debug User Info</h1>

      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h2 className="font-bold mb-2">Current Supabase User:</h2>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 rounded">
        <h2 className="font-bold mb-2">Person Record Found?</h2>
        <p>{person ? `Yes - ${person.displayName}` : 'NO - This is why you see "Finishing Setup"'}</p>
      </div>

      <div className="p-4 bg-gray-50 rounded">
        <h2 className="font-bold mb-2">All Person Records in Database:</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Supabase User ID</th>
              <th className="text-left py-2">Onboarding</th>
            </tr>
          </thead>
          <tbody>
            {allPersons.map((p) => (
              <tr key={p.email} className="border-b">
                <td className="py-2">{p.displayName}</td>
                <td className="py-2">{p.email}</td>
                <td className="py-2 font-mono text-xs">{p.supabaseUserId}</td>
                <td className="py-2">{p.onboardingLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded">
        <h2 className="font-bold mb-2">Fix:</h2>
        <p className="mb-2">Run this SQL to connect your Supabase user to a Person record:</p>
        <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
{`UPDATE "Person"
SET "supabaseUserId" = '${user.id}'
WHERE "email" = '${user.email}';`}
        </pre>
      </div>
    </div>
  )
}
