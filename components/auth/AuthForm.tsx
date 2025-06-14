'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthForm() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Auth check error:', error)
          setError(error.message)
        }
        if (user) {
          console.log('User already logged in, redirecting...')
          router.push('/chat')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Authentication check failed')
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            setError(null)
            console.log('User signed in:', session.user.email)
            
            // Check if customer profile exists
            const { data: existingCustomer, error: customerError } = await supabase
              .from('customers')
              .select('id')
              .eq('user_id', session.user.id)
              .single()

            if (customerError && customerError.code !== 'PGRST116') { // PGRST116 = no rows returned
              console.error('Error checking customer:', customerError)
              setError('Failed to check customer profile')
              return
            }

            // Create customer profile if it doesn't exist
            if (!existingCustomer) {
              console.log('Creating new customer profile...')
              const { error: insertError } = await supabase
                .from('customers')
                .insert({
                  user_id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
                })

              if (insertError) {
                console.error('Failed to create customer profile:', insertError)
                setError('Failed to create customer profile')
                return
              }
              console.log('Customer profile created successfully')
            } else {
              console.log('Customer profile already exists')
            }
            
            // Redirect to chat
            router.push('/chat')
          } catch (err) {
            console.error('Profile creation error:', err)
            setError('Failed to set up your profile')
          }
        } else if (event === 'SIGNED_OUT') {
          setError(null)
          console.log('User signed out')
        } else if (event === 'USER_UPDATED') {
          console.log('User signed up, waiting for email confirmation if required')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#3b82f6',
                brandAccent: '#2563eb',
              }
            }
          }
        }}
        providers={['google', 'github']}
        redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`}
        showLinks={true}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email address',
              password_label: 'Password',
            },
            sign_up: {
              email_label: 'Email address',
              password_label: 'Create a password',
              confirmation_text: 'Check your email for the confirmation link',
            },
          },
        }}
      />
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          <p>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</p>
        </div>
      )}
    </div>
  )
}