// app/chat/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient, getCurrentCustomer } from '@/lib/supabase'
import AuthGuard from '@/components/auth/AuthGuard'
import ChatLayout from '@/components/chat/ChatLayout'

export default function ChatPage() {
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const customerData = await getCurrentCustomer(supabase)
        if (customerData) {
          setCustomer(customerData)
        } else {
          setError('Customer profile not found')
        }
      } catch (err) {
        console.error('Error loading customer:', err)
        setError('Failed to load customer profile')
      } finally {
        setLoading(false)
      }
    }

    loadCustomer()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error || 'Customer profile not found'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm underline"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <ChatLayout customer={customer} />
    </AuthGuard>
  )
}