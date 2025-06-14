'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth guard error:', error)
          setError(error.message)
          router.push('/auth')
          return
        }
        
        setUser(user)
        
        if (!user) {
          router.push('/auth')
          return
        }

        // Verify customer profile exists
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (customerError) {
          console.error('Customer profile error:', customerError)
          // Try to create the profile if it's missing
          if (customerError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('customers')
              .insert({
                user_id: user.id,
                email: user.email!,
                name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              })
            
            if (insertError) {
              console.error('Failed to create customer profile:', insertError)
              setError('Failed to create your profile. Please try signing in again.')
              await supabase.auth.signOut()
              router.push('/auth')
              return
            }
          } else {
            setError('Profile verification failed')
            router.push('/auth')
            return
          }
        }
      } catch (err) {
        console.error('Unexpected auth guard error:', err)
        setError('Authentication failed')
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          router.push('/auth')
        } else if (event === 'SIGNED_IN') {
          setUser(session?.user || null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => router.push('/auth')}
              className="mt-2 text-sm underline"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}