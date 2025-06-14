# Customer Service AI 🤖

A comprehensive AI-powered customer service platform with personalized chat, automatic ticket creation, and intelligent escalation management.

## 🌟 Features

### ✅ **Phase 1 - Core System (COMPLETED)**
- **AI Chat Interface** - GPT-4 powered conversations with customer context
- **Customer Memory** - AI remembers customer details, preferences, and history
- **Automatic Ticket Creation** - Complex issues automatically generate support tickets
- **Sentiment Analysis** - Real-time mood tracking and escalation triggers
- **Authentication System** - Supabase Auth with automatic profile creation
- **Conversation History** - Full chat history with search and filtering
- **Ticket Management** - Customer can view and track their support tickets
- **Real-time Updates** - Live chat with message persistence

### 🚧 **Phase 2 - Automation (PLANNED)**
- **n8n Workflow Integration** - Automated business processes
- **Agent Dashboard** - Support team interface for ticket management  
- **Multi-channel Support** - Email, SMS, WhatsApp integration
- **Advanced Analytics** - Performance metrics and reporting
- **CRM Integration** - Salesforce, HubSpot connectivity

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email, Google, GitHub)
- **AI**: OpenAI GPT-4, sentiment analysis, auto-categorization
- **Database**: PostgreSQL with Row Level Security (RLS)
- **UI Components**: Lucide React icons, custom chat interface
- **Future**: n8n workflow automation

## 📁 Project Structure

```
customer-service-ai/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts              # AI chat API endpoint
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts              # Supabase auth callback
│   │   ├── error/
│   │   │   └── page.tsx              # Auth error handling
│   │   └── page.tsx                  # Login/signup page
│   ├── chat/
│   │   └── page.tsx                  # Main chat interface
│   ├── globals.css                   # Global styles + chat scrollbar
│   ├── layout.tsx                    # Root layout with debug tools
│   └── page.tsx                      # Homepage (redirects if authenticated)
├── components/
│   ├── auth/
│   │   ├── AuthForm.tsx              # Login/signup form with error handling
│   │   ├── AuthGuard.tsx             # Protected route wrapper
│   │   └── UserMenu.tsx              # User dropdown menu
│   ├── chat/
│   │   ├── ChatInterface.tsx         # Main chat component with AI integration
│   │   ├── ChatLayout.tsx            # Chat page layout with navigation
│   │   └── ConversationHistory.tsx   # Chat history sidebar
│   ├── debug/
│   │   ├── EnvChecker.tsx            # Environment variable validator
│   │   └── ProfileCreator.tsx        # Customer profile debug tool
│   └── tickets/
│       └── TicketList.tsx            # Customer ticket list view
├── lib/
│   └── supabase.ts                   # Supabase client configuration + helpers
├── .env.local                        # Environment variables (not in repo)
├── .env.example                      # Environment template
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- OpenAI API account

### 1. Clone and Install
```bash
git clone <your-repo>
cd customer-service-ai
npm install
```

### 2. Environment Setup
Create `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration  
OPENAI_API_KEY=sk-your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Copy database schema** from `/database/schema.sql` (see Database Schema section)
3. **Run in Supabase SQL Editor** to create tables, RLS policies, and functions
4. **Configure auth redirect URLs**: 
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Run Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

## 🗄️ Database Schema

### Core Tables
- **customers** - User profiles with preferences and metadata
- **conversations** - Chat sessions with status and sentiment tracking  
- **messages** - Individual chat messages with role and content
- **tickets** - Support tickets with priority and category
- **ticket_comments** - Comments and updates on tickets
- **knowledge_base** - AI knowledge articles and FAQs

### Key Features
- **Row Level Security (RLS)** - Users can only access their own data
- **Automatic Triggers** - Customer profiles created on user signup
- **Helper Functions** - `ensure_customer_profile()` for reliable profile creation
- **Optimized Indexes** - Fast queries on frequently accessed fields

### Database Functions
```sql
-- Automatically ensures customer profile exists
SELECT ensure_customer_profile(user_id, email, name);

-- Trigger function for new user signup
handle_new_user() -- Creates customer profile automatically
```

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side) |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for GPT-4 |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app URL (for auth redirects) |

## 🔧 Development Tools

### Debug Widgets (Development Mode Only)
- **Environment Checker** (bottom-right) - Validates configuration
- **Profile Creator** (bottom-left) - Debug customer profile creation
- **Console Logging** - Detailed auth and API logs

### Useful Commands
```bash
# Check environment
npm run dev  # Will show debug widgets

# Database operations (via Supabase dashboard)
# SQL Editor: Run migrations and check data
# Authentication: Configure providers and redirect URLs
# Database: View tables and RLS policies
```

## 📡 API Endpoints

### `/api/chat` (POST)
Handles AI chat conversations with customer context.

**Request:**
```json
{
  "message": "User message text",
  "conversationId": "uuid",
  "customerId": "uuid"
}
```

**Response:**
```json
{
  "response": "AI response text",
  "conversationUpdate": { "sentiment": "positive" },
  "ticketCreated": { "id": "uuid", "title": "Issue title" },
  "metadata": { "sentiment": "positive", "shouldCreateTicket": false }
}
```

**Features:**
- Customer context loading (profile, history, previous tickets)
- Sentiment analysis and escalation detection
- Automatic ticket creation for complex issues
- Conversation updates (sentiment, priority)

## 🎯 Current Status

### ✅ **Working Features**
- User authentication (email, Google, GitHub)
- Customer profile automatic creation
- AI chat with memory and context
- Conversation history and persistence
- Automatic ticket generation
- Sentiment analysis and priority detection
- Customer ticket viewing
- Error handling and debugging tools

### 🧪 **Tested Scenarios**
- New user signup → automatic profile creation
- Returning user login → profile loading
- AI chat → contextual responses using customer data
- Complex queries → automatic ticket creation
- Chat history → conversation persistence and retrieval

### 🚨 **Known Issues**
- None currently - all core features working
- Ready for Phase 2 (n8n integration)

## 🔄 Next Phase - n8n Automation

### Planned Workflows
1. **Ticket Routing** - Auto-assign tickets based on category/priority
2. **Customer Onboarding** - Welcome emails and setup workflows
3. **Escalation Management** - Notify agents of high-priority issues
4. **Knowledge Base Sync** - Update AI context from external sources
5. **Performance Analytics** - Generate reports and insights

### Agent Dashboard (Planned)
- Real-time ticket queue management
- Customer conversation monitoring
- AI response suggestions for agents
- Performance metrics and analytics

## 🐛 Troubleshooting

### Common Issues

**PGRST116 Error (Customer not found)**
- ✅ Fixed: Automatic profile creation now works
- Use debug widget to manually create if needed

**Authentication Issues**
- Check environment variables with debug widget
- Verify Supabase redirect URLs are configured
- Clear browser cookies and try again

**Chat API Errors** 
- Verify OpenAI API key is set
- Check browser console for detailed error logs
- Ensure customer profile exists

**Database Permission Errors**
- RLS policies are properly configured
- Service role key has proper permissions
- Database functions exist and are callable

### Debug Tools Usage
1. **Environment Checker**: Validates all required env vars
2. **Profile Creator**: Manually test customer profile creation
3. **Browser Console**: Check for detailed error logs
4. **Supabase Dashboard**: View auth users and database records

## 📚 Additional Resources

### Supabase Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

### OpenAI Resources
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4 Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)

### Next.js Resources
- [Next.js App Router](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Ready for Production!

This customer service AI system is production-ready with:
- ✅ Secure authentication and authorization
- ✅ Scalable database architecture
- ✅ AI-powered customer interactions
- ✅ Automatic ticket management
- ✅ Comprehensive error handling
- ✅ Development and debugging tools

**Next Step**: Integrate n8n for workflow automation and build the agent dashboard! 🚀