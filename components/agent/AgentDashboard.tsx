'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  Clock, 
  TicketIcon,
  MessageSquare,
  TrendingUp,
  Filter,
  MoreHorizontal
} from 'lucide-react'

// Type definitions
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
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  category: string | null
  created_at: string
  updated_at: string
  customer_id: string
  assigned_to: string | null
  resolution: string | null
  resolved_at: string | null
  customer?: Customer
}

type FilterType = 'all' | 'urgent' | 'assigned' | 'unassigned'

// Component imports - we'll create inline components for now to avoid import errors
const AgentStats = ({ tickets }: { tickets: Ticket[] }) => {
  const openTickets = tickets.filter(t => t.status === 'open').length
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length
  const resolvedToday = tickets.filter(t => {
    const today = new Date().toDateString()
    return t.status === 'resolved' && new Date(t.created_at).toDateString() === today
  }).length
  const urgentTickets = tickets.filter(t => t.priority === 'urgent').length

  const stats = [
    { label: 'Open Tickets', value: openTickets, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'In Progress', value: inProgressTickets, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resolved Today', value: resolvedToday, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Urgent', value: urgentTickets, color: 'text-orange-600', bg: 'bg-orange-50' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bg} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const TicketQueue = ({ 
  tickets, 
  selectedTicket, 
  onSelectTicket, 
  loading 
}: {
  tickets: Ticket[]
  selectedTicket: Ticket | null
  onSelectTicket: (ticket: Ticket) => void
  loading: boolean
}) => {
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50'
      case 'high': return 'border-l-orange-500 bg-orange-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-300 bg-white'
    }
  }

  const getTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => onSelectTicket(ticket)}
          className={`cursor-pointer rounded-lg border-l-4 p-4 transition-all hover:shadow-md ${getPriorityColor(ticket.priority)} ${
            selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{ticket.title}</h3>
              {ticket.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
              )}
              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                <span>{ticket.customer?.name || ticket.customer?.email || 'Unknown'}</span>
                <span>{getTimeAgo(ticket.created_at)}</span>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
              ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {ticket.priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const TicketDetails = ({ 
  ticket, 
  onUpdateTicket 
}: {
  ticket: Ticket
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void
}) => {
  const [response, setResponse] = useState('')

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{ticket.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <span>#{ticket.id.slice(0, 8)}</span>
          <span>{ticket.customer?.name || ticket.customer?.email}</span>
          <span>{new Date(ticket.created_at).toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={ticket.status}
            onChange={(e) => onUpdateTicket(ticket.id, { status: e.target.value as Ticket['status'] })}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={ticket.priority}
            onChange={(e) => onUpdateTicket(ticket.id, { priority: e.target.value as Ticket['priority'] })}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Original Issue</h3>
          <p className="text-sm text-gray-700">{ticket.description || 'No description provided.'}</p>
        </div>
      </div>
      
      <div className="border-t p-6">
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response..."
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              console.log('Sending response:', response)
              setResponse('')
            }}
            disabled={!response.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Send Response
          </button>
        </div>
      </div>
    </div>
  )
}

const CustomerPanel = ({ 
  customerId, 
  customer 
}: {
  customerId: string
  customer?: Customer
}) => {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-medium mb-4">Customer Profile</h3>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium">{customer?.name || 'Unknown Customer'}</p>
            <p className="text-sm text-gray-600">{customer?.email}</p>
          </div>
        </div>
        {customer?.company && (
          <div className="text-sm">
            <span className="text-gray-600">Company: </span>
            <span className="font-medium">{customer.company}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AgentDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadTickets()
  }, [filter])

  const loadTickets = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          customer:customers (
            id,
            name,
            email,
            company
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filter === 'urgent') {
        query = query.eq('priority', 'urgent')
      } else if (filter === 'assigned') {
        query = query.not('assigned_to', 'is', null)
      } else if (filter === 'unassigned') {
        query = query.is('assigned_to', null)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading tickets:', error)
        setError('Failed to load tickets')
      } else {
        const typedTickets: Ticket[] = (data || []).map(item => ({
          ...item,
          customer: Array.isArray(item.customer) ? item.customer[0] : item.customer
        }))
        
        setTickets(typedTickets)
        
        if (typedTickets.length > 0 && !selectedTicket) {
          setSelectedTicket(typedTickets[0])
        }
      }
    } catch (err) {
      console.error('Unexpected error loading tickets:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)

      if (error) {
        console.error('Error updating ticket:', error)
        return
      }

      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket
      ))
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, ...updates } : null)
      }
    } catch (err) {
      console.error('Error updating ticket:', err)
    }
  }

  const handleSelectTicket = (ticket: Ticket): void => {
    setSelectedTicket(ticket)
  }

  const handleFilterChange = (newFilter: FilterType): void => {
    setFilter(newFilter)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold text-gray-900">Agent Dashboard</h1>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">
                  {tickets.filter(t => t.priority === 'urgent').length} Urgent
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Avg Response: 2.3 min</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>

            {/* Agent Profile */}
            <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Agent Sarah</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <AgentStats tickets={tickets} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Sidebar - Ticket Queue */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-gray-900">Tickets</h2>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                {tickets.filter(t => t.status === 'open').length} Open
              </span>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all' as const, label: 'All' },
                { key: 'urgent' as const, label: 'Urgent' },
                { key: 'assigned' as const, label: 'Assigned' },
                { key: 'unassigned' as const, label: 'Unassigned' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleFilterChange(tab.key)}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === tab.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <TicketQueue
            tickets={tickets}
            selectedTicket={selectedTicket}
            onSelectTicket={handleSelectTicket}
            loading={loading}
          />
        </div>

        {/* Main Content - Ticket Details */}
        <div className="flex-1 bg-white">
          {selectedTicket ? (
            <TicketDetails
              ticket={selectedTicket}
              onUpdateTicket={updateTicket}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TicketIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ticket selected</h3>
                <p className="text-gray-500">Select a ticket from the queue to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Customer Panel */}
        {selectedTicket && (
          <div className="w-80 bg-gray-50 border-l border-gray-200">
            <CustomerPanel
              customerId={selectedTicket.customer_id}
              customer={selectedTicket.customer}
            />
          </div>
        )}
      </div>
    </div>
  )
}