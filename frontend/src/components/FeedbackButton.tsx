import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquarePlus, X, Bug, Lightbulb, MessageSquare, AlertTriangle, Loader2, CheckCircle, Sparkles, RefreshCw } from 'lucide-react'
import { feedbackApi } from '@/services/api'
import { useLocation } from 'react-router-dom'

// ── Types ──────────────────────────────────────────────────────────────────────

type FeedbackType = 'general' | 'bug' | 'feature' | 'error'

const TYPES: { value: FeedbackType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'general', label: 'General', icon: MessageSquare, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-700' },
  { value: 'bug', label: 'Bug', icon: Bug, color: 'text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-900/30 border-error-200 dark:border-error-700' },
  { value: 'feature', label: 'Feature', icon: Lightbulb, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700' },
  { value: 'error', label: 'Error', icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700' },
]

const TEMPLATES: Record<FeedbackType, string> = {
  general: '',
  bug: 'What happened:\n\n\nSteps to reproduce:\n1. \n2. \n\nExpected behavior:\n',
  feature: 'Feature request:\n\n\nWhy it would be useful:\n\n\nPossible implementation (optional):\n',
  error: 'Error encountered:\n\n\nWhen it happens:\n\n\nBrowser / Device:\n',
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('general')
  const [subject, setSubject] = useState('')
  const [messages, setMessages] = useState<Record<FeedbackType, string>>({ ...TEMPLATES })
  const [submitting, setSubmitting] = useState(false)
  const [improving, setImproving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()

  const currentMessage = messages[type]

  const reset = () => {
    setType('general')
    setSubject('')
    setMessages({ ...TEMPLATES })
    setError(null)
    setSubmitted(false)
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(reset, 300)
  }

  const handleTypeChange = (newType: FeedbackType) => {
    setType(newType)
  }

  const handleResetTemplate = () => {
    setMessages(prev => ({
      ...prev,
      [type]: TEMPLATES[type]
    }))
  }

  const handleImprove = async () => {
    if (!currentMessage.trim() || improving) return
    setImproving(true)
    setError(null)
    try {
      const result = await feedbackApi.improve({ type, subject, message: currentMessage })
      setMessages(prev => ({
        ...prev,
        [type]: result.message
      }))
      if (result.subject && !subject.trim()) setSubject(result.subject)
    } catch {
      setError('AI improvement failed. Please try again.')
    } finally {
      setImproving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !currentMessage.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await feedbackApi.submit({
        type,
        subject: subject.trim(),
        message: currentMessage.trim(),
        page_url: location.pathname,
      })
      setSubmitted(true)
      setTimeout(handleClose, 2000)
    } catch {
      setError('Failed to send feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        title="Send Feedback"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center cursor-pointer transition-colors"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </motion.button>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-[88px] right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-primary-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Send Feedback</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Success state */}
              {submitted ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 px-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle className="w-12 h-12 text-success-500" />
                  </motion.div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Thanks for the feedback!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">We'll review it shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {/* Type selector */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Type
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TYPES.map(({ value, label, icon: Icon, color }) => {
                        const selected = type === value
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleTypeChange(value)}
                            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                              selected
                                ? color
                                : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Subject
                    </label>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Brief description…"
                      maxLength={200}
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Message
                    </label>
                    <textarea
                      value={currentMessage}
                      onChange={e => setMessages(prev => ({ ...prev, [type]: e.target.value }))}
                      placeholder="Describe in detail…"
                      rows={3}
                      maxLength={2000}
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow resize-none"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleImprove}
                          disabled={improving || !currentMessage.trim() || submitting}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          {improving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          {improving ? 'Improving…' : 'Improve with AI'}
                        </button>
                        
                        {TEMPLATES[type] && (
                          <button
                            type="button"
                            onClick={handleResetTemplate}
                            disabled={submitting || currentMessage === TEMPLATES[type]}
                            title="Reset to template"
                            className="p-1 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{currentMessage.length}/2000</span>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-error-600 dark:text-error-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !subject.trim() || !currentMessage.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    ) : (
                      'Send Feedback'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
