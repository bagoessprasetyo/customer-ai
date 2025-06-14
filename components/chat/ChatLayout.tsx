'use client'

import { useState } from 'react'
import ChatInterface from './ChatInterface'
import ConversationHistory from './ConversationHistory'
import UserMenu from '@/components/auth/UserMenu'
import { MessageSquare, History, Ticket } from 'lucide-react'
import TicketList from '../tickets/TicketList'

interface ChatLayoutProps {
  customer: any
}

export default function ChatLayout({ customer }: ChatLayoutProps) {
  const [selectedView, setSelectedView] = useState<'chat' | 'history' | 'tickets'>('chat')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Customer Service AI
              </h1>
              <nav className="flex space-x-4">
                <button
                  onClick={() => setSelectedView('chat')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    selectedView === 'chat'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setSelectedView('history')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    selectedView === 'history'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => setSelectedView('tickets')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    selectedView === 'tickets'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Ticket className="h-4 w-4" />
                  <span>My Tickets</span>
                </button>
              </nav>
            </div>
            <UserMenu user={customer} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)]">
            {selectedView === 'chat' && (
              <ChatInterface user={customer} />
            )}
            {selectedView === 'history' && (
              <ConversationHistory customerId={customer.id} />
            )}
            {selectedView === 'tickets' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">My Support Tickets</h2>
                <TicketList customerId={customer.id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}