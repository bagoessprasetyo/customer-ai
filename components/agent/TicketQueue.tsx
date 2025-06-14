'use client'

import { Clock, User, AlertCircle, MessageCircle } from 'lucide-react'

interface Customer {
  id: string
  name: string | null
  email: string
  company: string | null
}

interface Ticket {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  category: string | null
  created_at: string
  updated_at: string
  customer_id: string
  customer?: Customer
}

interface TicketQueueProps {
  tickets: Ticket[]
  selectedTicket: Ticket | null
  onSelectTicket: (ticket: Ticket) => void
  loading: boolean
}

export default function TicketQueue({ 
  tickets, 
  selectedTicket, 
  onSelectTicket, 
  loading 
}: TicketQueueProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50'
      case 'high':
        return 'border-l-orange-500 bg-orange-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-gray-300 bg-white'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-20 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">No tickets</h3>
          <p className="text-sm text-gray-500">All caught up! No tickets match your filter.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onSelectTicket(ticket)}
            className={`
              relative cursor-pointer rounded-lg border-l-4 p-4 transition-all hover:shadow-md
              ${getPriorityColor(ticket.priority)}
              ${selectedTicket?.id === ticket.id 
                ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-md' 
                : 'hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {ticket.title}
                </h3>
                {ticket.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {ticket.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-3 mt-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-24">
                      {ticket.customer?.name || ticket.customer?.email?.split('@')[0] || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeAgo(ticket.created_at)}</span>
                  </div>
                </div>

                {ticket.category && (
                  <div className="mt-2">
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {ticket.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="ml-3 flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                
                {ticket.priority === 'urgent' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Status indicator */}
            <div className="absolute top-2 right-2">
              <div className={`w-2 h-2 rounded-full ${
                ticket.status === 'open' ? 'bg-red-400' :
                ticket.status === 'in_progress' ? 'bg-blue-400' :
                ticket.status === 'resolved' ? 'bg-green-400' :
                'bg-gray-400'
              }`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}