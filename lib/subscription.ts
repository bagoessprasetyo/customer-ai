// lib/subscription.ts
import { createServiceClient } from '@/lib/supabase'

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  limits: {
    conversations_per_month: number
    agent_seats: number
    has_analytics: boolean
    has_api_access: boolean
    has_custom_training: boolean
  }
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: [
      '100 AI conversations/month',
      '1 agent seat',
      'Basic ticket management',
      'Email support'
    ],
    limits: {
      conversations_per_month: 100,
      agent_seats: 1,
      has_analytics: false,
      has_api_access: false,
      has_custom_training: false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    features: [
      '1,000 AI conversations/month',
      '5 agent seats',
      'Advanced analytics',
      'Multi-channel support',
      'Response templates'
    ],
    limits: {
      conversations_per_month: 1000,
      agent_seats: 5,
      has_analytics: true,
      has_api_access: false,
      has_custom_training: false
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    features: [
      'Unlimited AI conversations',
      'Unlimited agent seats',
      'Custom AI training',
      'API access',
      'White-label options',
      'Priority support'
    ],
    limits: {
      conversations_per_month: -1, // unlimited
      agent_seats: -1, // unlimited
      has_analytics: true,
      has_api_access: true,
      has_custom_training: true
    }
  }
]

export class SubscriptionService {
  private supabase = createServiceClient()

  async checkUsageLimits(organizationId: string): Promise<{
    canCreateConversation: boolean
    canAddAgent: boolean
    usage: {
      conversations_this_month: number
      active_agents: number
    }
    plan: SubscriptionPlan
  }> {
    // Get organization subscription
    const { data: org } = await this.supabase
      .from('organizations')
      .select('subscription_plan, subscription_status')
      .eq('id', organizationId)
      .single()

    if (!org || org.subscription_status !== 'active') {
      throw new Error('No active subscription found')
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === org.subscription_plan)
    if (!plan) {
      throw new Error('Invalid subscription plan')
    }

    // Get current month usage
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: conversations } = await this.supabase
      .from('conversations')
      .select('id')
      .eq('organization_id', organizationId)
      .gte('created_at', startOfMonth.toISOString())

    const { data: agents } = await this.supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('role', 'agent')
      .eq('status', 'active')

    const usage = {
      conversations_this_month: conversations?.length || 0,
      active_agents: agents?.length || 0
    }

    return {
      canCreateConversation: plan.limits.conversations_per_month === -1 || 
                           usage.conversations_this_month < plan.limits.conversations_per_month,
      canAddAgent: plan.limits.agent_seats === -1 || 
                   usage.active_agents < plan.limits.agent_seats,
      usage,
      plan
    }
  }

  async trackConversationUsage(organizationId: string, conversationId: string): Promise<void> {
    // Track conversation for billing
    await this.supabase
      .from('usage_tracking')
      .insert({
        organization_id: organizationId,
        conversation_id: conversationId,
        event_type: 'conversation_created',
        created_at: new Date().toISOString()
      })
  }

  async getUsageAnalytics(organizationId: string): Promise<{
    current_month: {
      conversations: number
      messages: number
      tickets_created: number
    }
    trend: {
      conversations_growth: number
      tickets_growth: number
    }
  }> {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const startOfLastMonth = new Date(startOfMonth)
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

    // Current month stats
    const { data: currentConversations } = await this.supabase
      .from('conversations')
      .select('id')
      .eq('organization_id', organizationId)
      .gte('created_at', startOfMonth.toISOString())

    const { data: currentMessages } = await this.supabase
      .from('messages')
      .select('id')
      .in('conversation_id', (currentConversations || []).map(c => c.id))

    const { data: currentTickets } = await this.supabase
      .from('tickets')
      .select('id')
      .eq('organization_id', organizationId)
      .gte('created_at', startOfMonth.toISOString())

    // Last month stats for comparison
    const { data: lastMonthConversations } = await this.supabase
      .from('conversations')
      .select('id')
      .eq('organization_id', organizationId)
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString())

    const { data: lastMonthTickets } = await this.supabase
      .from('tickets')
      .select('id')
      .eq('organization_id', organizationId)
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString())

    const currentCount = currentConversations?.length || 0
    const lastMonthCount = lastMonthConversations?.length || 0
    const currentTicketCount = currentTickets?.length || 0
    const lastMonthTicketCount = lastMonthTickets?.length || 0

    return {
      current_month: {
        conversations: currentCount,
        messages: currentMessages?.length || 0,
        tickets_created: currentTicketCount
      },
      trend: {
        conversations_growth: lastMonthCount > 0 ? 
          ((currentCount - lastMonthCount) / lastMonthCount) * 100 : 0,
        tickets_growth: lastMonthTicketCount > 0 ? 
          ((currentTicketCount - lastMonthTicketCount) / lastMonthTicketCount) * 100 : 0
      }
    }
  }
}