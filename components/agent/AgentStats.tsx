'use client'

import { TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface Ticket {
  id: string
  status: string
  priority: string
  created_at: string
}

interface AgentStatsProps {
  tickets: Ticket[]
}

export default function AgentStats({ tickets }: AgentStatsProps) {
  // Calculate stats
  const totalTickets = tickets.length
  const openTickets = tickets.filter(t => t.status === 'open').length
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length
  const resolvedToday = tickets.filter(t => {
    const today = new Date().toDateString()
    return t.status === 'resolved' && new Date(t.created_at).toDateString() === today
  }).length
  const urgentTickets = tickets.filter(t => t.priority === 'urgent').length

  const stats = [
    {
      label: 'Open Tickets',
      value: openTickets,
      change: '+12%',
      changeType: 'increase' as const,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      label: 'In Progress',
      value: inProgressTickets,
      change: '+8%',
      changeType: 'increase' as const,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Resolved Today',
      value: resolvedToday,
      change: '+23%',
      changeType: 'increase' as const,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      label: 'Urgent',
      value: urgentTickets,
      change: '-5%',
      changeType: 'decrease' as const,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}