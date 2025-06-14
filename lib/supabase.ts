import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Types for our database
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          user_id: string
          email: string
          name: string | null
          phone: string | null
          company: string | null
          preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          name?: string | null
          phone?: string | null
          company?: string | null
          preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          name?: string | null
          phone?: string | null
          company?: string | null
          preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          customer_id: string
          title: string | null
          status: string
          sentiment: string
          priority: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          title?: string | null
          status?: string
          sentiment?: string
          priority?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          title?: string | null
          status?: string
          sentiment?: string
          priority?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          content: string
          role: string
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          content: string
          role: string
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          content?: string
          role?: string
          metadata?: any
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          conversation_id: string | null
          customer_id: string
          title: string
          description: string | null
          status: string
          priority: string
          category: string | null
          assigned_to: string | null
          resolution: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          customer_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          category?: string | null
          assigned_to?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string | null
          customer_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          category?: string | null
          assigned_to?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      knowledge_base: {
        Row: {
          id: string
          title: string
          content: string
          category: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Client-side Supabase client
export const createBrowserClient = () =>
  createClientComponentClient<Database>()

// Server-side Supabase client (for App Router)
export const createServerClient = (cookieStore?: any) => {
  if (cookieStore) {
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  }
  // Fallback for pages router or when cookies not available
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Service role client for admin operations
export const createServiceClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

// Helper function to get current user's customer profile
export async function getCurrentCustomer(supabase: any) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return null
  }

  // Try to get existing customer profile
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle() // Use maybeSingle() instead of single() to avoid PGRST116 error

  if (customerError) {
    console.error('Error fetching customer:', customerError)
    return null
  }

  // If customer doesn't exist, create one
  if (!customer) {
    console.log('Customer profile not found, creating new one...')
    
    const newCustomer = {
      user_id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      preferences: {}
    }

    const { data: createdCustomer, error: createError } = await supabase
      .from('customers')
      .insert(newCustomer)
      .select()
      .single()

    if (createError) {
      console.error('Error creating customer profile:', createError)
      return null
    }

    console.log('Customer profile created successfully:', createdCustomer.email)
    return createdCustomer
  }

  return customer
}