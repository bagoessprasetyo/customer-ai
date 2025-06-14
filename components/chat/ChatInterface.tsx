'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings } from 'lucide-react'

interface UserMenuProps {
  user: any
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createBrowserClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
      >
        <User className="h-5 w-5" />
        <span className="text-sm">{user.email}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
            <div className="py-1">
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}