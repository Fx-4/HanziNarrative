import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { conversationApi } from '@/services/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  MessageCircle, Send, ArrowLeft, Eye, EyeOff,
  AlertCircle, BookOpen, Volume2, RotateCcw,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  pinyin?: string
  english?: string
  corrections?: { original: string; corrected: string; explanation: string }[]
  new_vocabulary?: { word: string; pinyin: string; english: string }[]
  isStreaming?: boolean
}

interface Topic {
  id: string
  label: string
  label_en: string
  emoji: string
}

export default function Conversation() {
  const [stage, setStage] = useState<'setup' | 'chat'>('setup')
  const [hskLevel, setHskLevel] = useState(2)
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPinyin, setShowPinyin] = useState(true)
  const [showEnglish, setShowEnglish] = useState(false)
  const [topicsLoading, setTopicsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    conversationApi.getTopics()
      .then(setTopics)
      .catch(() => toast.error('Failed to load topics'))
      .finally(() => setTopicsLoading(false))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cancel any in-flight SSE stream when unmounting
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const startConversation = async () => {
    if (!selectedTopic) {
      toast.error('Please select a topic')
      return
    }
    setLoading(true)

    // Cancel previous stream if any
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    // Add placeholder assistant message immediately
    const placeholder: ConversationMessage = {
      role: 'assistant',
      content: '',
      isStreaming: true,
    }
    setMessages([placeholder])
    setStage('chat')

    try {
      const result = await conversationApi.startStream(
        hskLevel,
        selectedTopic,
        (chunk) => {
          // As tokens arrive, accumulate into the placeholder message
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (!last || last.role !== 'assistant') return prev
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + chunk },
            ]
          })
        },
        controller.signal,
      )

      if (result) {
        // Replace placeholder with full structured data from done event
        setMessages([{
          role: 'assistant',
          content: result.reply ?? '',
          pinyin: result.reply_pinyin,
          english: result.reply_english,
          corrections: result.corrections,
          new_vocabulary: result.new_vocabulary,
          isStreaming: false,
        }])
      } else {
        // Stream was aborted or yielded no done event — mark done
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (!last) return prev
          return [...prev.slice(0, -1), { ...last, isStreaming: false }]
        })
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      toast.error(err?.message || 'Failed to start conversation')
      // Remove the empty placeholder on error
      setMessages([])
      setStage('setup')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    // Cancel any previous in-flight stream
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    const userMsg: ConversationMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Add streaming placeholder for AI reply
    const placeholder: ConversationMessage = {
      role: 'assistant',
      content: '',
      isStreaming: true,
    }
    setMessages(prev => [...prev, placeholder])

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const result = await conversationApi.replyStream(
        text,
        hskLevel,
        history,
        (chunk) => {
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (!last || last.role !== 'assistant') return prev
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + chunk },
            ]
          })
        },
        controller.signal,
      )

      if (result) {
        setMessages(prev => [
          ...prev.slice(0, -1),
          {
            role: 'assistant',
            content: result.reply ?? '',
            pinyin: result.reply_pinyin,
            english: result.reply_english,
            corrections: result.corrections,
            new_vocabulary: result.new_vocabulary,
            isStreaming: false,
          },
        ])
      } else {
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (!last) return prev
          return [...prev.slice(0, -1), { ...last, isStreaming: false }]
        })
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      toast.error(err?.message || 'Failed to get reply')
      // Remove the empty streaming placeholder on error
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last?.isStreaming) return prev.slice(0, -1)
        return prev
      })
    } finally {
      setLoading(false)
    }
  }

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const resetConversation = () => {
    abortControllerRef.current?.abort()
    setMessages([])
    setStage('setup')
    setInput('')
    setLoading(false)
  }

  // ── Setup Screen ──
  if (stage === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/25">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">AI Conversation Partner</h1>
          <p className="text-gray-500 text-sm">Practice Chinese conversation with AI at your HSK level</p>
        </motion.div>

        {/* HSK Level Selection */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm"
        >
          <h2 className="font-bold text-gray-900 text-sm mb-3">Select Your Level</h2>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map(level => (
              <button
                key={level}
                onClick={() => setHskLevel(level)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  hskLevel === level
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                HSK {level}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Topic Selection */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm"
        >
          <h2 className="font-bold text-gray-900 text-sm mb-3">Choose a Topic</h2>
          {topicsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                    selectedTopic === topic.id
                      ? 'bg-blue-50 border-2 border-blue-400 shadow-sm'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{topic.emoji}</span>
                  <p className="font-bold text-gray-900 text-xs mt-1">{topic.label}</p>
                  <p className="text-[10px] text-gray-500">{topic.label_en}</p>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={startConversation}
          disabled={loading || !selectedTopic}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? <LoadingSpinner /> : (
            <>
              <MessageCircle className="w-4 h-4" />
              Start Conversation
            </>
          )}
        </motion.button>
      </div>
    )
  }

  // ── Chat Screen ──
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-120px)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={resetConversation}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-sm">AI Chat — HSK {hskLevel}</h2>
          <p className="text-xs text-gray-500">{messages.length} messages</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPinyin(!showPinyin)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              showPinyin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}
            title="Toggle pinyin"
          >
            拼
          </button>
          <button
            onClick={() => setShowEnglish(!showEnglish)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showEnglish ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}
            title="Toggle English"
          >
            {showEnglish ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={resetConversation}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
            title="New conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                  : 'bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm'
              } p-3.5`}>
                {/* Main text — show typing dots only if streaming with no content yet */}
                {msg.isStreaming && !msg.content ? (
                  <div className="flex items-center gap-1.5 py-0.5">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <p className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-[2px] h-[1em] bg-gray-500 ml-0.5 align-middle animate-pulse" />
                    )}
                  </p>
                )}

                {/* Pinyin — only shown once streaming is complete */}
                {msg.role === 'assistant' && !msg.isStreaming && showPinyin && msg.pinyin && (
                  <p className="text-xs text-gray-400 mt-1 italic">{msg.pinyin}</p>
                )}

                {/* English — only shown once streaming is complete */}
                {msg.role === 'assistant' && !msg.isStreaming && showEnglish && msg.english && (
                  <p className="text-xs text-blue-500 mt-1">{msg.english}</p>
                )}

                {/* TTS button for assistant messages — only when done streaming */}
                {msg.role === 'assistant' && !msg.isStreaming && (
                  <button
                    onClick={() => speakText(msg.content)}
                    className="mt-2 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}

                {/* Corrections — only when done streaming */}
                {!msg.isStreaming && msg.corrections && msg.corrections.length > 0 && (
                  <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-[10px] font-bold text-amber-700 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Corrections
                    </p>
                    {msg.corrections.map((c, ci) => (
                      <div key={ci} className="text-xs text-gray-700 mb-1">
                        <span className="line-through text-red-500">{c.original}</span>
                        {' → '}
                        <span className="text-emerald-600 font-semibold">{c.corrected}</span>
                        {c.explanation && (
                          <p className="text-[10px] text-gray-500 mt-0.5">{c.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* New Vocabulary — only when done streaming */}
                {!msg.isStreaming && msg.new_vocabulary && msg.new_vocabulary.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-[10px] font-bold text-blue-700 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> New Words
                    </p>
                    {msg.new_vocabulary.map((v, vi) => (
                      <div key={vi} className="text-xs text-gray-700">
                        <span className="font-bold">{v.word}</span>
                        <span className="text-gray-400 mx-1">{v.pinyin}</span>
                        <span className="text-gray-500">{v.english}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-2 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="用中文说点什么... (Type in Chinese)"
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
