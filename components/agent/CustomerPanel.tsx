'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { 
  User, 
  Mail, 
  Building, 
  Calendar, 
  MessageCircle, 
  Eye, 
  LogIn,
  Phone,
  Gift,
  CreditCard,
  Activity,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'

interface Customer {
  id: string
  name: string | null
  email: string
  company: string | null
}

interface CustomerPanelProps {
  customerId: string
  customer?: Customer
}

interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  icon: string
}

interface Ticket {
  id: string
  title: string
  status: string
  created_at: string
}

export default function CustomerPanel({ customerId, customer }: CustomerPanelProps) {
  const [customerData, setCustomerData] = useState<any>(null)
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadCustomerData()
  }, [customerId])

  const loadCustomerData = async () => {
    setLoading(true)
    try {
      // Load full customer data
      const { data: fullCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      setCustomerData(fullCustomer || customer)

      // Load recent tickets
      const { data: tickets } = await supabase
        .from('tickets')
        .select('id, title, status, created_at')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentTickets(tickets || [])

      // Load recent conversations (activities)
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, title, status, created_at, updated_at')
        .eq('customer_id', customerId)
        .order('updated_at', { ascending: false })
        .limit(5)

      // Mock activity data (in real app, you'd have an activities table)
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'chat',
          description: 'Started chat about payment issues',
          timestamp: new Date().toISOString(),
          icon: 'message-circle'
        },
        {
          id: '2',
          type: 'view',
          description: 'Viewed pricing page',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          icon: 'eye'
        },
        {
          id: '3',
          type: 'login',
          description: 'Logged into account',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          icon: 'log-in'
        }
      ]

      setActivities(mockActivities)
    } catch (error) {
      console.error('Error loading customer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'message-circle':
        return MessageCircle
      case 'eye':
        return Eye
      case 'log-in':
        return LogIn
      default:
        return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'chat':
        return 'text-blue-500'
      case 'view':
        return 'text-green-500'
      case 'login':
        return 'text-gray-500'
      default:
        return 'text-gray-500'
    }
  }

  const getTicketStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Customer Profile */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Customer Profile</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {customerData?.name || 'Unknown Customer'}
              </p>
              <p className="text-sm text-gray-600">{customerData?.email}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3 text-sm">
            {customerData?.company && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>Company</span>
                </div>
                <span className="font-medium text-gray-900">{customerData.company}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>Plan</span>
              </div>
              <span className="font-medium text-gray-900">Free</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined</span>
              </div>
              <span className="font-medium text-gray-900">
                {customerData?.created_at ? 
                  new Date(customerData.created_at).toLocaleDateString() : 
                  'Unknown'
                }
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-600">
                <Activity className="w-4 h-4" />
                <span>Last Active</span>
              </div>
              <span className="font-medium text-gray-900">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">Schedule Call</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">Apply Discount</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Upgrade Account</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.icon)
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <Icon className={`w-4 h-4 mt-0.5 ${getActivityColor(activity.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Recent Tickets</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
            <span>View All</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        
        {recentTickets.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No previous tickets</p>
        ) : (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ticket.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTicketStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Value Score */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Customer Score</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Engagement</span>
            <span className="font-medium">High</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Satisfaction</span>
            <span className="font-medium">Good</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Value Potential</span>
            <span className="font-medium">High</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '90%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}