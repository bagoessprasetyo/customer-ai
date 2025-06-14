'use client'

import { useState } from 'react'
import { 
  Clock, 
  User, 
  Tag, 
  Calendar, 
  MessageSquare, 
  Send, 
  Bot, 
  AlertTriangle,
  CheckCircle,
  FileText,
  ExternalLink
} from 'lucide-react'

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
  assigned_to: string | null
  resolution: string | null
  customer?: Customer
}

interface TicketDetailsProps {
  ticket: Ticket
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void
}

export default function TicketDetails({ ticket, onUpdateTicket }: TicketDetailsProps) {
  const [response, setResponse] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [activeTab, setActiveTab] = useState<'response' | 'note'>('response')
  const [loading, setLoading] = useState(false)

  const handleStatusChange = (newStatus: string) => {
    onUpdateTicket(ticket.id, { 
      status: newStatus,
      updated_at: new Date().toISOString(),
      ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {})
    })
  }

  const handlePriorityChange = (newPriority: string) => {
    onUpdateTicket(ticket.id, { 
      priority: newPriority,
      updated_at: new Date().toISOString()
    })
  }

  const handleAssignToMe = () => {
    onUpdateTicket(ticket.id, {
      assigned_to: 'current_agent', // In real app, use actual agent ID
      updated_at: new Date().toISOString()
    })
  }

  const handleSendResponse = async () => {
    if (!response.trim()) return
    
    setLoading(true)
    try {
      // In real app, send response to customer via email/chat
      console.log('Sending response:', response)
      
      // Update ticket with response
      onUpdateTicket(ticket.id, {
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      
      setResponse('')
      setActiveTab('response')
    } catch (error) {
      console.error('Error sending response:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {ticket.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span>#{ticket.id.slice(0, 8)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>
                  {ticket.customer?.name || ticket.customer?.email} 
                  {ticket.customer?.company && (
                    <span className="text-gray-500"> • {ticket.customer.company}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Dropdown */}
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Dropdown */}
            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Assign Button */}
            {!ticket.assigned_to && (
              <button
                onClick={handleAssignToMe}
                className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Assign to Me
              </button>
            )}
          </div>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
            {ticket.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority.toUpperCase()} PRIORITY
          </span>
          {ticket.category && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              {ticket.category.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Original Issue */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900">
                    {ticket.customer?.name || 'Customer'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(ticket.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {ticket.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-2">AI Analysis</h3>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-blue-800">Category:</span>
                      <span className="text-gray-700">{ticket.category || 'General'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-blue-800">Sentiment:</span>
                      <span className="text-gray-700">
                        {ticket.priority === 'urgent' ? 'Frustrated' : 'Neutral'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Suggested Actions:</span>
                      <ul className="list-disc list-inside mt-1 text-gray-700 space-y-1">
                        <li>Acknowledge the issue promptly</li>
                        <li>Provide status updates</li>
                        <li>Offer temporary workaround if available</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Interactions */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Previous Interactions
            </h3>
            <div className="bg-white rounded-lg p-3 shadow-sm text-sm text-gray-700">
              <p>Customer has had 1 previous resolved ticket regarding account setup.</p>
              <p className="mt-1 text-yellow-800">
                <strong>Note:</strong> High-value customer - handle with priority
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Response Area */}
      <div className="border-t border-gray-200 p-6 bg-white">
        <div className="space-y-4">
          {/* Tab Selection */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('response')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'response'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Customer Response
            </button>
            <button
              onClick={() => setActiveTab('note')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'note'
                  ? 'bg-gray-100 text-gray-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Internal Note
            </button>
          </div>

          {/* Response Input */}
          {activeTab === 'response' ? (
            <div>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response to the customer..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex space-x-3">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Insert Template
                  </button>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Add Attachment
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setResponse('')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSendResponse}
                    disabled={!response.trim() || loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Sending...' : 'Send Response'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Add an internal note for other agents..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => {
                    // Save internal note
                    console.log('Saving internal note:', internalNote)
                    setInternalNote('')
                  }}
                  disabled={!internalNote.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Save Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}