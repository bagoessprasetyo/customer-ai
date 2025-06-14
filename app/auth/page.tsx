// app/auth/page.tsx
import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to Customer Service AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to start chatting with our AI assistant
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}

// app/auth/callback/route.ts


// app/chat/page.tsx


// components/chat/ChatLayout.tsx


// components/tickets/TicketList.tsx


// app/page.tsx (Homepage - redirect to chat if authenticated)
