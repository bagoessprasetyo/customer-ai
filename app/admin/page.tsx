'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { 
  Users, 
  MessageSquare, 
  Ticket, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Server,
  Database,
  Activity,
  Eye,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react'

interface AdminMetrics {
  users: {
    total: number
    active_today: number
    new_this_month: number
    growth_rate: number
  }
  conversations: {
    total: number
    today: number
    avg_per_day: number
    ai_resolution_rate: number
  }
  tickets: {
    total: number
    open: number
    resolved_today: number
    avg_response_time: number
  }
  revenue: {
    mrr: number
    arr: number
    churn_rate: number
    ltv: number
  }
  system: {
    uptime: number
    response_time: number
    error_rate: number
    database_size: string
  }
}

interface RecentActivity {
  id: string
  type: 'user_signup' | 'ticket_created' | 'error' | 'subscription' | 'system'
  message: string
  timestamp: string
  severity: 'info' | 'warning' | 'error' | 'success'
  metadata?: any
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d'>('7d')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadDashboardData()
    
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [timeRange, autoRefresh])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [metricsData, activitiesData] = await Promise.all([
        loadMetrics(),
        loadRecentActivities()
      ])
      setMetrics(metricsData)
      setActivities(activitiesData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMetrics = async (): Promise<AdminMetrics> => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // User metrics
    const { data: totalUsers } = await supabase
      .from('customers')
      .select('id, created_at')
    
    const { data: activeUsersToday } = await supabase
      .from('conversations')
      .select('customer_id')
      .gte('updated_at', startOfDay.toISOString())
    
    const usersThisMonth = totalUsers?.filter(u => 
      new Date(u.created_at) >= startOfMonth
    ).length || 0
    
    const usersLastMonth = totalUsers?.filter(u => {
      const created = new Date(u.created_at)
      return created >= startOfLastMonth && created <= endOfLastMonth
    }).length || 0

    // Conversation metrics
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id, created_at')
    
    const { data: conversationsToday } = await supabase
      .from('conversations')
      .select('id')
      .gte('created_at', startOfDay.toISOString())

    // Ticket metrics
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id, status, created_at, resolved_at')
    
    const openTickets = tickets?.filter(t => t.status === 'open').length || 0
    const resolvedToday = tickets?.filter(t => 
      t.resolved_at && new Date(t.resolved_at) >= startOfDay
    ).length || 0

    // Calculate AI resolution rate (conversations that didn't create tickets)
    const { data: ticketConversations } = await supabase
      .from('tickets')
      .select('conversation_id')
    
    const ticketConversationIds = new Set(ticketConversations?.map(t => t.conversation_id) || [])
    const totalConversations = conversations?.length || 1
    const aiResolvedConversations = totalConversations - ticketConversationIds.size
    const aiResolutionRate = (aiResolvedConversations / totalConversations) * 100

    // Mock revenue data (integrate with Stripe in production)
    const mockRevenue = {
      mrr: 15420,
      arr: 185040,
      churn_rate: 3.2,
      ltv: 2400
    }

    // Mock system metrics (integrate with monitoring service)
    const mockSystem = {
      uptime: 99.98,
      response_time: 245,
      error_rate: 0.02,
      database_size: '2.4 GB'
    }

    return {
      users: {
        total: totalUsers?.length || 0,
        active_today: new Set(activeUsersToday?.map(u => u.customer_id)).size,
        new_this_month: usersThisMonth,
        growth_rate: usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0
      },
      conversations: {
        total: totalConversations,
        today: conversationsToday?.length || 0,
        avg_per_day: totalConversations / 30, // Last 30 days average
        ai_resolution_rate: aiResolutionRate
      },
      tickets: {
        total: tickets?.length || 0,
        open: openTickets,
        resolved_today: resolvedToday,
        avg_response_time: 2.3 // Mock - calculate from actual response times
      },
      revenue: mockRevenue,
      system: mockSystem
    }
  }

  const loadRecentActivities = async (): Promise<RecentActivity[]> => {
    // Mock activity data (in production, aggregate from various sources)
    return [
      {
        id: '1',
        type: 'user_signup',
        message: 'New user signed up: john@example.com',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        severity: 'success'
      },
      {
        id: '2',
        type: 'ticket_created',
        message: 'High priority ticket created: Payment issue',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        severity: 'warning'
      },
      {
        id: '3',
        type: 'system',
        message: 'Database backup completed successfully',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        severity: 'info'
      },
      {
        id: '4',
        type: 'error',
        message: 'API rate limit exceeded for organization',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        severity: 'error'
      },
      {
        id: '5',
        type: 'subscription',
        message: 'Customer upgraded to Professional plan',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        severity: 'success'
      }
    ]
  }

  const exportData = async (type: 'users' | 'conversations' | 'tickets') => {
    // Implementation for data export
    console.log(`Exporting ${type} data...`)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return Users
      case 'ticket_created': return Ticket
      case 'error': return AlertTriangle
      case 'subscription': return DollarSign
      case 'system': return Server
      default: return Activity
    }
  }

  const getActivityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-orange-600 bg-orange-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">System overview and monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>

              {/* Auto Refresh Toggle */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Auto-refresh</span>
              </label>

              {/* Manual Refresh */}
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Users */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.users.total.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">
                    +{metrics.users.growth_rate.toFixed(1)}% this month
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Conversations */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Resolution Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.conversations.ai_resolution_rate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {metrics.conversations.today} conversations today
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.tickets.open}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    {metrics.tickets.avg_response_time}min avg response
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Ticket className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${metrics.revenue.mrr.toLocaleString()}</p>
                  <p className="text-sm text-purple-600 mt-1">
                    ${metrics.revenue.arr.toLocaleString()} ARR
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Health */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            {metrics && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-green-600">{metrics.system.uptime}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${metrics.system.uptime}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium">{metrics.system.response_time}ms</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium text-green-600">{metrics.system.error_rate}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Size</span>
                  <span className="text-sm font-medium">{metrics.system.database_size}</span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.severity)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => exportData('users')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Export Users</p>
                <p className="text-sm text-gray-600">Download user data as CSV</p>
              </div>
            </button>
            
            <button
              onClick={() => exportData('tickets')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Export Tickets</p>
                <p className="text-sm text-gray-600">Download ticket data as CSV</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Eye className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">View Logs</p>
                <p className="text-sm text-gray-600">System and error logs</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}