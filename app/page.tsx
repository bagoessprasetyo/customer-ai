import { createServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center lg:pt-32">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
            Customer Service{' '}
            <span className="relative whitespace-nowrap text-blue-600">
              <span className="relative">AI Assistant</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
            Get instant support with our AI-powered customer service system. 
            Personalized assistance, ticket management, and seamless escalation to human agents.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link
              href="/auth"
              className="group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}