'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { 
  Send, 
  Bot, 
  User, 
  Paperclip, 
  Smile, 
  MoreHorizontal, 
  Check, 
  CheckCheck,
  Moon,
  Sun,
  Sparkles,
  FileText,
  Image as ImageIcon,
  X,
  Download,
  Minimize2,
  Maximize2
} from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  metadata?: any
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
    size: number
  }>
}

interface PremiumChatInterfaceProps {
  user: any
}

export default function PremiumChatInterface({ user }: PremiumChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat-dark-mode') === 'true'
    }
    return false
  })
  const [isMinimized, setIsMinimized] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserClient()

  // Smooth scroll with easing
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Dark mode persistence
  useEffect(() => {
    localStorage.setItem('chat-dark-mode', isDarkMode.toString())
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Initialize conversation
  useEffect(() => {
    initializeConversation()
  }, [user?.id])

  const initializeConversation = async () => {
    if (!user?.id) return

    try {
      // Check for existing active conversation
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingConversation) {
        setConversationId(existingConversation.id)
        await loadMessages(existingConversation.id)
      } else {
        // Create new conversation
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({
            customer_id: user.id,
            status: 'active',
            sentiment: 'neutral',
            priority: 'normal'
          })
          .select()
          .single()

        if (newConversation) {
          setConversationId(newConversation.id)
        }
      }
    } catch (error) {
      console.error('Error initializing conversation:', error)
    }
  }

  const loadMessages = async (convId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data.map(msg => ({ ...msg, status: 'delivered' })))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  // Auto-resize textarea with animation
  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [])

  // File drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setUploadedFiles(prev => [...prev, ...files])
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedFiles(prev => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if ((!inputMessage.trim() && uploadedFiles.length === 0) || !conversationId || loading) return

    const userMessage = inputMessage.trim()
    const files = uploadedFiles
    setInputMessage('')
    setUploadedFiles([])
    setLoading(true)

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    // Create message with attachments
    const tempUserMessage: Message = {
      id: 'temp-user-' + Date.now(),
      content: userMessage || '📎 Sent attachments',
      role: 'user',
      created_at: new Date().toISOString(),
      status: 'sending',
      attachments: files.map((file, index) => ({
        id: `temp-${index}`,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size
      }))
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      // Save user message to database
      const { data: savedUserMessage } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: userMessage || '📎 Sent attachments',
          role: 'user',
          metadata: {
            attachments: files.map(file => ({
              name: file.name,
              type: file.type,
              size: file.size
            }))
          }
        })
        .select()
        .single()

      // Update temp message
      if (savedUserMessage) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempUserMessage.id 
              ? { ...savedUserMessage, status: 'sent', attachments: tempUserMessage.attachments }
              : msg
          )
        )
      }

      // Show typing indicator
      setTyping(true)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Call AI chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage || 'I sent you some files',
          conversationId,
          customerId: user.id
        }),
      })

      setTyping(false)

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      // Add AI response with animation
      const aiMessage: Message = {
        id: 'temp-ai-' + Date.now(),
        content: data.response,
        role: 'assistant',
        created_at: new Date().toISOString(),
        status: 'delivered',
        metadata: data.metadata
      }
      setMessages(prev => [...prev, aiMessage])

      // Save AI message
      const { data: savedAiMessage } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: data.response,
          role: 'assistant',
          metadata: data.metadata
        })
        .select()
        .single()

      if (savedAiMessage) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessage.id ? savedAiMessage : msg
          )
        )
      }

      // Update conversation
      if (data.conversationUpdate) {
        await supabase
          .from('conversations')
          .update(data.conversationUpdate)
          .eq('id', conversationId)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        created_at: new Date().toISOString(),
        status: 'delivered'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      setTyping(false)
    }
  }

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-60" />
      case 'sent':
        return <Check className="w-3 h-3 opacity-60" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 opacity-60" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '✨']

  return (
    <div 
      className={`flex flex-col h-full transition-all duration-500 ease-in-out ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
      } ${isMinimized ? 'h-16' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Glassmorphism Header */}
      <div className={`relative p-6 backdrop-blur-xl border-b transition-all duration-300 ${
        isDarkMode 
          ? 'border-white/10 bg-white/5' 
          : 'border-black/10 bg-white/40'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Assistant
              </h3>
              <p className={`text-sm flex items-center space-x-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {typing ? (
                  <>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>Typing...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Online</span>
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-yellow-400' 
                  : 'bg-black/5 hover:bg-black/10 text-gray-600'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Minimize/Maximize */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20' 
                  : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
            </button>

            {/* More Options */}
            <button className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20' 
                : 'bg-black/5 hover:bg-black/10'
            }`}>
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drag overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-2 text-blue-500" />
              <p className="text-lg font-semibold text-blue-600">Drop files here</p>
            </div>
          </div>
        )}
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="text-center mt-12 animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </div>
                <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  Welcome to AI Chat!
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Hi {user.name || user.email?.split('@')[0]}, I'm here to help you with anything! ✨
                </p>
                <div className="flex justify-center space-x-3 mt-6">
                  {['Ask a question', 'Report an issue', 'Get help'].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(suggestion)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-white/10 hover:bg-white/20 text-white' 
                          : 'bg-white/60 hover:bg-white/80 text-gray-700'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'order-2' : ''}`}>
                    {message.role === 'user' ? (
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 ${message.role === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`relative rounded-3xl px-6 py-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                        message.role === 'user'
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : isDarkMode
                            ? 'bg-white/10 text-gray-100 border border-white/20'
                            : 'bg-white/80 text-gray-900 border border-black/10'
                      }`}
                    >
                      {/* Message Content */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center space-x-3 p-3 rounded-xl ${
                                isDarkMode ? 'bg-white/10' : 'bg-black/5'
                              }`}
                            >
                              {attachment.type.startsWith('image/') ? (
                                <ImageIcon className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{attachment.name}</p>
                                <p className="text-xs opacity-60">{formatFileSize(attachment.size)}</p>
                              </div>
                              <button className="p-1 hover:bg-white/10 rounded">
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message tail */}
                      <div className={`absolute top-4 ${
                        message.role === 'user' ? 'right-0 translate-x-1' : 'left-0 -translate-x-1'
                      }`}>
                        <div className={`w-3 h-3 rotate-45 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                            : isDarkMode
                              ? 'bg-white/10 border-l border-t border-white/20'
                              : 'bg-white/80 border-l border-t border-black/10'
                        }`}></div>
                      </div>
                    </div>
                    
                    {/* Message Footer */}
                    <div className={`flex items-center mt-2 space-x-2 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      {message.role === 'user' && (
                        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {getMessageStatusIcon(message.status)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className={`relative rounded-3xl px-6 py-4 shadow-lg backdrop-blur-xl ${
                    isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-black/10'
                  }`}>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <div className="absolute top-4 left-0 -translate-x-1">
                      <div className={`w-3 h-3 rotate-45 ${
                        isDarkMode ? 'bg-white/10 border-l border-t border-white/20' : 'bg-white/80 border-l border-t border-black/10'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* File Upload Preview */}
          {uploadedFiles.length > 0 && (
            <div className={`mx-6 p-4 rounded-xl backdrop-blur-xl border ${
              isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white/60 border-black/10'
            }`}>
              <p className="text-sm font-medium mb-3">Attached Files:</p>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-black/5">
                    <FileText className="w-4 h-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs opacity-60">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className={`p-6 backdrop-blur-xl border-t ${
            isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white/40'
          }`}>
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className={`absolute bottom-24 left-6 p-4 rounded-xl backdrop-blur-xl border shadow-xl ${
                isDarkMode ? 'bg-gray-800/90 border-white/20' : 'bg-white/90 border-black/10'
              }`}>
                <div className="grid grid-cols-6 gap-2">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputMessage(prev => prev + emoji)
                        setShowEmojiPicker(false)
                      }}
                      className="p-2 hover:bg-blue-500/20 rounded-lg text-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={sendMessage} className="flex items-end space-x-4">
              {/* File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-2xl transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-gray-300' 
                    : 'bg-black/5 hover:bg-black/10 text-gray-600'
                }`}
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Message Input Container */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value)
                    adjustTextareaHeight()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage(e)
                    }
                  }}
                  placeholder="Type your message..."
                  className={`w-full px-6 py-4 pr-16 rounded-2xl resize-none transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-xl border ${
                    isDarkMode 
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                      : 'bg-white/60 border-black/10 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={1}
                  disabled={loading || !conversationId}
                />
                
                {/* Emoji Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`absolute right-4 top-4 transition-all duration-300 hover:scale-110 ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={loading || (!inputMessage.trim() && uploadedFiles.length === 0) || !conversationId}
                className="group p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            </form>
            
            <p className={`text-xs mt-3 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Press Enter to send • Shift + Enter for new line • Drag & drop files
            </p>
          </div>
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {/* Custom Styles - These will be moved to globals.css */}
      <style jsx>{`
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-blue-500\/20 {
          scrollbar-color: rgba(59, 130, 246, 0.2) transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(59, 130, 246, 0.2);
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  )
}