'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Ticket, Clock, User, AlertCircle } from 'lucide-react'

interface TicketData {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  category: string | null
  created_at: string
  updated_at: string
}

interface TicketListProps {
  customerId: string
}

export default function TicketList({ customerId }: TicketListProps) {
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    const loadTickets = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (data) {
        setTickets(data)
      }
      setLoading(false)
    }

    loadTickets()
  }, [customerId])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading tickets...</div>
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <Ticket className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't created any support tickets yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {ticket.title}
              </h3>
              {ticket.description && (
                <p className="mt-1 text-sm text-gray-600">
                  {ticket.description}
                </p>
              )}
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Created {new Date(ticket.created_at).toLocaleDateString()}
                </div>
                {ticket.category && (
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {ticket.category}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority} priority
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}