import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, customerId } = await request.json()

    if (!message || !conversationId || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get customer information for personalization
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    // Get conversation context (recent messages)
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get customer's previous tickets for context
    const { data: previousTickets } = await supabase
      .from('tickets')
      .select('title, description, status, category, resolution')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Build conversation context for AI
    const conversationHistory = recentMessages
      ?.reverse()
      ?.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      })) || []

    // System prompt with customer context
    const systemPrompt = `You are a helpful customer service AI assistant. Here's what you know about this customer:

Customer Information:
- Name: ${customer?.name || 'Not provided'}
- Email: ${customer?.email}
- Company: ${customer?.company || 'Not provided'}
- Preferences: ${JSON.stringify(customer?.preferences || {})}

Previous Support History:
${previousTickets?.map(ticket => 
  `- ${ticket.title} (${ticket.status}): ${ticket.description || 'No description'}`
).join('\n') || 'No previous tickets'}

Guidelines:
1. Be helpful, friendly, and professional
2. Use the customer's name when appropriate
3. Reference their previous issues if relevant
4. If you cannot resolve an issue, offer to create a support ticket
5. Be concise but thorough in your responses
6. If the customer seems frustrated or has a complex issue, suggest escalating to human support

Conversation context: This is an ongoing conversation, refer to previous messages for context.`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: message }
    ]

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || 
      "I'm sorry, I couldn't process your request right now. Please try again."

    // Analyze sentiment and intent
    const sentiment = await analyzeSentiment(message)
    const shouldCreateTicket = await shouldEscalateToTicket(message, aiResponse)

    // Prepare conversation updates
    const conversationUpdate: any = {
      updated_at: new Date().toISOString()
    }

    if (sentiment) {
      conversationUpdate.sentiment = sentiment
    }

    // Create ticket if needed
    let ticketCreated = null
    if (shouldCreateTicket) {
      const ticketTitle = await generateTicketTitle(message)
      
      const { data: ticket } = await supabase
        .from('tickets')
        .insert({
          conversation_id: conversationId,
          customer_id: customerId,
          title: ticketTitle,
          description: message,
          status: 'open',
          priority: 'medium',
          category: await categorizeIssue(message)
        })
        .select()
        .single()

      ticketCreated = ticket
      conversationUpdate.status = 'escalated'
    }

    return NextResponse.json({
      response: aiResponse,
      conversationUpdate,
      ticketCreated,
      metadata: {
        sentiment,
        shouldCreateTicket,
        model: 'gpt-4',
        tokens: completion.usage?.total_tokens
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to analyze sentiment
async function analyzeSentiment(message: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following message. Respond with only one word: positive, negative, or neutral.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 10,
      temperature: 0
    })

    return completion.choices[0]?.message?.content?.toLowerCase()?.trim() || 'neutral'
  } catch {
    return 'neutral'
  }
}

// Helper function to determine if ticket should be created
async function shouldEscalateToTicket(userMessage: string, aiResponse: string): Promise<boolean> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Determine if this customer interaction should be escalated to create a support ticket. 
          
          Create a ticket if:
          - The customer has a complex technical issue
          - The customer is requesting a refund or billing change
          - The customer is reporting a bug or system problem
          - The customer seems frustrated or unsatisfied
          - The AI couldn't fully resolve the issue
          
          Don't create a ticket for:
          - Simple questions that were answered
          - General information requests
          - Casual conversation
          
          Respond with only "true" or "false".`
        },
        {
          role: 'user',
          content: `Customer message: "${userMessage}"\nAI response: "${aiResponse}"`
        }
      ],
      max_tokens: 10,
      temperature: 0
    })

    const result = completion.choices[0]?.message?.content?.toLowerCase()?.trim()
    return result === 'true'
  } catch {
    return false
  }
}

// Helper function to generate ticket title
async function generateTicketTitle(message: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate a concise, descriptive title for a support ticket based on the customer message. Maximum 50 characters.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 20,
      temperature: 0.3
    })

    return completion.choices[0]?.message?.content?.trim() || 'Customer Support Request'
  } catch {
    return 'Customer Support Request'
  }
}

// Helper function to categorize the issue
async function categorizeIssue(message: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Categorize this customer message into one of these categories:
          - billing
          - technical
          - general
          - refund
          - bug_report
          - feature_request
          - account
          
          Respond with only the category name.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 10,
      temperature: 0
    })

    return completion.choices[0]?.message?.content?.toLowerCase()?.trim() || 'general'
  } catch {
    return 'general'
  }
}