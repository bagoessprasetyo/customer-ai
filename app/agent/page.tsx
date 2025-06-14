'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AgentDashboard from '@/components/agent/AgentDashboard'

export default function AgentPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAgent, setIsAgent] = useState(false)
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const checkAgentAccess = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/auth')
          return
        }

        setUser(user)

        // Check if user is an agent (in real app, check agent permissions)
        // For now, we'll allow any authenticated user to access agent dashboard
        const isAgentUser = true // In real app: check user.user_metadata.role === 'agent'
        
        if (!isAgentUser) {
          router.push('/chat') // Redirect to customer chat if not an agent
          return
        }

        setIsAgent(true)
      } catch (err) {
        console.error('Error checking agent access:', err)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    checkAgentAccess()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agent dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access the agent dashboard.</p>
          <button
            onClick={() => router.push('/chat')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Customer Chat
          </button>
        </div>
      </div>
    )
  }

  return <AgentDashboard />
}