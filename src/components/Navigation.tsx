'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, User, Shield, PlusCircle } from 'lucide-react'

const NAV_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Safety', href: '/safety', icon: Shield },
]

export default function Navigation() {
  const pathname = usePathname()

  // Don't show navigation on login or onboarding
  if (pathname === '/login' || pathname === '/onboarding') return null

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 p-6">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter italic">CONNECT</h1>
        </div>
        
        <div className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="pt-6 border-t border-gray-100">
          <Link 
            href="/groups/create"
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            <PlusCircle size={18} />
            New Group
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center gap-1 ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
