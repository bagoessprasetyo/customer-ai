'use client'

import { useState } from 'react'
import PremiumChatInterface from './ChatInterface'
import ConversationHistory from './ConversationHistory'
import UserMenu from '@/components/auth/UserMenu'
import { MessageSquare, History, Ticket, Settings, Sparkles } from 'lucide-react'
import TicketList from '../tickets/TicketList'
import Link from 'next/link'

interface ChatLayoutProps {
  customer: any
}

export default function ChatLayout({ customer }: ChatLayoutProps) {
  const [selectedView, setSelectedView] = useState<'chat' | 'history' | 'tickets'>('chat')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Customer Service AI
                </h1>
              </div>
              
              <nav className="flex space-x-2">
                <button
                  onClick={() => setSelectedView('chat')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedView === 'chat'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setSelectedView('history')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedView === 'history'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => setSelectedView('tickets')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedView === 'tickets'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <Ticket className="h-4 w-4" />
                  <span>My Tickets</span>
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Agent Dashboard Link */}
              <Link 
                href="/agent"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-all duration-300 hover:scale-105"
              >
                <Settings className="h-4 w-4" />
                <span>Agent Dashboard</span>
              </Link>
              <UserMenu user={customer} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 h-[calc(100vh-200px)] overflow-hidden">
            {selectedView === 'chat' && (
              <PremiumChatInterface user={customer} />
            )}
            {selectedView === 'history' && (
              <div className="h-full bg-gradient-to-br from-gray-50 to-white">
                <ConversationHistory customerId={customer.id} />
              </div>
            )}
            {selectedView === 'tickets' && (
              <div className="p-6 h-full bg-gradient-to-br from-gray-50 to-white">
                <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Support Tickets
                </h2>
                <TicketList customerId={customer.id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}