// components/chat/ConversationHistory.tsx
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { MessageCircle, Clock } from 'lucide-react'

interface Conversation {
  id: string
  title: string | null
  status: string
  created_at: string
  updated_at: string
}

interface ConversationHistoryProps {
  customerId: string
  onSelectConversation?: (conversationId: string) => void
}

export default function ConversationHistory({ 
  customerId, 
  onSelectConversation 
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    const loadConversations = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', customerId)
        .order('updated_at', { ascending: false })

      if (data) {
        setConversations(data)
      }
      setLoading(false)
    }

    loadConversations()
  }, [customerId])

  if (loading) {
    return <div className="p-4">Loading conversations...</div>
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Chat History</h3>
      </div>
      <div className="overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation?.(conversation.id)}
            className="p-4 border-b hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex items-start space-x-3">
              <MessageCircle className="w-5 h-5 text-gray-400 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {conversation.title || 'Untitled Conversation'}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(conversation.updated_at).toLocaleDateString()}
                </div>
                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                  conversation.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {conversation.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  )
}