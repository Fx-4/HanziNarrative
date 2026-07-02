import axios from 'axios'
import { API_URL } from '@/lib/env'
import { ensureBackendReady } from '@/lib/backendStatus'
import type {
  User,
  Story,
  HanziWord,
  VocabularySet,
  UserProgress,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  UserUpdate,
  WritingProgress,
  WritingAttempt,
  WritingStats,
  TypingProgress,
  TypingAttempt,
  TypingStats,
  OnboardingStatus,
  AssessmentQuestionsResponse,
  AssessmentSubmission,
  AssessmentResult,
  Goals,
  OnboardingCompleteRequest,
  OnboardingCompleteResponse,
  GamificationStats,
} from '@/types'
import { apiLogger } from '@/utils/debugLogger'


type LearningStatsResponse = {
  hsk_level: number | 'all'
  stats: {
    total_words_learning: number
    mastered_words: number
    due_for_review: number
    average_mastery: number
    total_reviews: number
    accuracy: number
  }
}

type DailyChallengeTodayResponse = {
  story: {
    id: number
    title: string
    title_english: string
    hsk_level: number
    content?: string
    content_pinyin?: string
    english_translation?: string
  }
  completed: boolean
  date: string
}

type DailyChallengeStatsResponse = {
  total_completions: number
  challenge_streak: number
  total_xp_earned: number
}

type AdminSystemStatsResponse = {
  total_users: number
  total_stories: number
  published_stories: number
  total_ai_requests: number
  total_vocabulary: number
  new_users_today: number
  new_users_this_week: number
  stories_by_hsk: Record<string, number>
  ai_usage_by_feature: Record<string, number>
}

const api = axios.create({
  baseURL: API_URL,
  // Non-stream calls should never fail due to client timeout.
  timeout: 0,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  apiLogger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`, config.params ?? undefined)
  return config
})

// Response interceptor to handle errors globally with detailed logging
api.interceptors.response.use(
  (response) => {
    apiLogger.debug(`← ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    const status = error.response?.status
    const url = error.config?.url ?? 'unknown'
    const method = error.config?.method?.toUpperCase() ?? '?'
    const detail = error.response?.data?.detail ?? error.message
    const isTimeout = error.code === 'ECONNABORTED' || /timeout/i.test(String(error.message))
    const isNetworkError = !status && !isTimeout

    // On Network Error, wait for the shared backend health-check and retry once.
    // Multiple concurrent requests all await the same ensureBackendReady() promise —
    // no duplicate polling loops, no fixed arbitrary delay.
    if (isNetworkError) {
      const originalRequest = error.config as typeof error.config & { _networkRetry?: boolean }
      if (!originalRequest._networkRetry) {
        originalRequest._networkRetry = true
        apiLogger.warn(`← NETWORK_ERROR ${method} ${url} — waiting for backend to wake up`)
        try {
          await ensureBackendReady()
          return api(originalRequest)
        } catch {
          apiLogger.error(`← NETWORK_ERROR ${method} ${url} — backend unreachable, giving up`)
        }
      }
      return Promise.reject(error)
    }

    if (isTimeout) {
      apiLogger.warn(`← TIMEOUT ${method} ${url} — request exceeded client timeout`)
    } else if (status === 401) {
      const originalRequest = error.config as typeof error.config & { _retry?: boolean }
      const refreshToken = localStorage.getItem('refresh_token')
      const isRefreshCall = String(url).includes('/auth/refresh')

      if (!isRefreshCall && refreshToken && !originalRequest?._retry) {
        try {
          originalRequest._retry = true
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          const newAccessToken: string = refreshResponse.data.access_token
          const newRefreshToken: string | undefined = refreshResponse.data.refresh_token

          localStorage.setItem('access_token', newAccessToken)
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken)
          }

          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } catch (refreshErr) {
          apiLogger.warn('Refresh token rotation failed; redirecting to login')
        }
      }

      apiLogger.warn(`← 401 ${method} ${url} — session expired, redirecting to login`)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    } else if (status === 422) {
      apiLogger.warn(`← 422 ${method} ${url} — validation error`, error.response?.data)
    } else if (status >= 500) {
      apiLogger.error(`← ${status} ${method} ${url} — server error: ${detail}`, error.response?.data)
    } else {
      apiLogger.warn(`← ${status ?? 'ERR'} ${method} ${url} — ${detail}`)
    }

    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthTokens> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me')
    return response.data
  },

  updateProfile: async (data: UserUpdate): Promise<User> => {
    const response = await api.put('/auth/me', data)
    return response.data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, new_password: newPassword })
  },
}

export const storiesApi = {
  getAll: async (hskLevel?: number, category?: string): Promise<Story[]> => {
    const params: Record<string, string | number> = {}
    if (hskLevel) params.hsk_level = hskLevel
    if (category) params.category = category
    const response = await api.get('/stories/', { params })
    return response.data
  },

  getById: async (id: number): Promise<Story> => {
    const response = await api.get(`/stories/${id}`)
    return response.data
  },

  getStoryWords: async (storyId: number): Promise<HanziWord[]> => {
    const response = await api.get(`/stories/${storyId}/words`)
    return response.data
  },

  create: async (story: Partial<Story>): Promise<Story> => {
    const response = await api.post('/stories/', story)
    return response.data
  },

  generateStory: async (request: {
    hsk_level: number
    topic?: string
    character_names?: string[]
    length?: 'short' | 'medium' | 'long'
    mode?: 'quick' | 'advanced'
    // Advanced mode customization
    genre?: string
    tone?: string
    setting?: string
    narrative_perspective?: string
    target_grammar?: string[]
    target_vocabulary?: string[]
    include_dialogue?: boolean
    cultural_theme?: string
  }) => {
    const response = await api.post('/stories/generate', request, { timeout: 0 }) // no timeout — wait until AI finishes
    return response.data
  },

  getAIUsageStats: async () => {
    const response = await api.get('/stories/ai-usage-stats')
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/stories/${id}`)
  },

  getStoryQuiz: async (storyId: number) => {
    const response = await api.get(`/stories/${storyId}/quiz`)
    return response.data
  },

  bookmarkStory: async (storyId: number) => {
    const response = await api.post(`/stories/${storyId}/bookmark`)
    return response.data
  },

  unbookmarkStory: async (storyId: number) => {
    await api.delete(`/stories/${storyId}/bookmark`)
  },

  getMyBookmarks: async (): Promise<Story[]> => {
    const response = await api.get('/stories/bookmarks/my-bookmarks')
    return response.data
  },

  isBookmarked: async (storyId: number): Promise<{ is_bookmarked: boolean }> => {
    const response = await api.get(`/stories/${storyId}/is-bookmarked`)
    return response.data
  },
}

export const vocabularyApi = {
  getWord: async (id: number): Promise<HanziWord> => {
    const response = await api.get(`/vocabulary/${id}`)
    return response.data
  },

  searchWords: async (query: string, hskLevel?: number): Promise<HanziWord[]> => {
    const params = { q: query, ...(hskLevel && { hsk_level: hskLevel }) }
    const response = await api.get('/vocabulary/search', { params })
    return response.data
  },

  getByHSKLevel: async (level: number, category?: string): Promise<HanziWord[]> => {
    const params = category ? { category } : {}
    const response = await api.get(`/vocabulary/hsk/${level}`, { params })
    return response.data
  },

  getCategories: async (hskLevel?: number): Promise<{ value: string; label: string }[]> => {
    const endpoint = hskLevel
      ? `/vocabulary/categories/hsk/${hskLevel}`
      : '/vocabulary/categories/all'
    const response = await api.get(endpoint)
    return response.data
  },

  getMnemonic: async (wordId: number): Promise<{ mnemonic: string; memory_technique: string }> => {
    const response = await api.get(`/vocabulary/${wordId}/mnemonic`)
    return response.data
  },

  getWordOfTheDay: async (): Promise<{ word: HanziWord; date: string; message: string }> => {
    const response = await api.get('/vocabulary/word-of-the-day')
    return response.data
  },
}

export const userProgressApi = {
  getProgress: async (): Promise<UserProgress[]> => {
    const response = await api.get('/progress/')
    return response.data
  },

  updateProgress: async (wordId: number, familiarityLevel: number): Promise<UserProgress> => {
    const response = await api.post('/progress/', {
      word_id: wordId,
      familiarity_level: familiarityLevel,
    })
    return response.data
  },
}

export const vocabularySetsApi = {
  getAll: async (): Promise<VocabularySet[]> => {
    const response = await api.get('/vocabulary-sets/')
    return response.data
  },

  create: async (name: string, description?: string): Promise<VocabularySet> => {
    const response = await api.post('/vocabulary-sets/', { name, description })
    return response.data
  },

  addWord: async (setId: number, wordId: number): Promise<void> => {
    await api.post(`/vocabulary-sets/${setId}/words/${wordId}`)
  },

  removeWord: async (setId: number, wordId: number): Promise<void> => {
    await api.delete(`/vocabulary-sets/${setId}/words/${wordId}`)
  },
}

export const writingApi = {
  getCharacters: async (hskLevel: number, limit: number = 20): Promise<HanziWord[]> => {
    const response = await api.get('/writing/characters', {
      params: { hsk_level: hskLevel, limit }
    })
    return response.data
  },

  recordAttempt: async (attempt: WritingAttempt): Promise<WritingProgress> => {
    const response = await api.post('/writing/attempt', attempt)
    return response.data
  },

  getProgress: async (hskLevel?: number): Promise<WritingProgress[]> => {
    const params = hskLevel ? { hsk_level: hskLevel } : {}
    const response = await api.get('/writing/progress', { params })
    return response.data
  },

  getStats: async (hskLevel?: number): Promise<WritingStats> => {
    const params = hskLevel ? { hsk_level: hskLevel } : undefined
    const response = await api.get('/writing/stats', { params })
    return response.data
  },

  getCharacterProgress: async (wordId: number): Promise<WritingProgress | null> => {
    const response = await api.get(`/writing/character/${wordId}/progress`)
    return response.data
  },
}

// Typing Practice API
export const typingApi = {
  getWords: async (hskLevel: number, mode: string, limit: number = 20): Promise<HanziWord[]> => {
    const response = await api.get('/typing/words', {
      params: { hsk_level: hskLevel, mode, limit }
    })
    return response.data
  },

  recordAttempt: async (attempt: TypingAttempt): Promise<TypingProgress> => {
    const response = await api.post('/typing/attempt', attempt)
    return response.data
  },

  getProgress: async (mode?: string, hskLevel?: number): Promise<TypingProgress[]> => {
    const params: Record<string, string | number> = {}
    if (mode) params.mode = mode
    if (hskLevel) params.hsk_level = hskLevel
    const response = await api.get('/typing/progress', { params })
    return response.data
  },

  getStats: async (mode?: string, hskLevel?: number): Promise<TypingStats> => {
    const params: Record<string, string | number> = {}
    if (mode) params.mode = mode
    if (hskLevel) params.hsk_level = hskLevel
    const response = await api.get('/typing/stats', { params })
    return response.data
  },

  getWordProgress: async (wordId: number, mode: string): Promise<TypingProgress | null> => {
    const response = await api.get(`/typing/word/${wordId}/progress/${mode}`)
    return response.data
  },
}

// SRS (Spaced Repetition System) API
export const learningApi = {
  // Get new words for learning
  getNewWords: async (hskLevel: number, limit: number = 20, category?: string) => {
    const params: Record<string, string | number> = { hsk_level: hskLevel, limit }
    if (category) params.category = category
    const response = await api.get('/learning/words/new', { params })
    return response.data
  },

  // Get words due for review (SRS)
  getReviewWords: async (hskLevel?: number) => {
    const params = hskLevel ? { hsk_level: hskLevel } : {}
    const response = await api.get('/learning/words/review', { params })
    return response.data
  },

  // Get words for testing
  getTestWords: async (hskLevel: number, limit: number = 20, category?: string) => {
    const params: Record<string, string | number> = { hsk_level: hskLevel, limit }
    if (category) params.category = category
    const response = await api.get('/learning/words/test', { params })
    return response.data
  },

  // Record a review (quality: 0-5)
  recordReview: async (wordId: number, quality: number) => {
    const response = await api.post('/learning/review', {
      word_id: wordId,
      quality
    })
    return response.data
  },

  // Get learning statistics
  getStats: async (hskLevel?: number): Promise<LearningStatsResponse> => {
    const params = hskLevel ? { hsk_level: hskLevel } : undefined
    const response = await api.get('/learning/stats', { params })
    return response.data
  },

  // Get all stats (overall + all 6 HSK levels) in a single request
  getAllStats: async () => {
    const response = await api.get<{
      overall: { total_words_learning: number; mastered_words: number; due_for_review: number; average_mastery: number; total_reviews: number; accuracy: number }
      levels: Record<number, { total_words_learning: number; mastered_words: number; due_for_review: number; average_mastery: number; total_reviews: number; accuracy: number }>
    }>('/learning/stats/all')
    return response.data
  },

  // Get progress for a specific word
  getWordProgress: async (wordId: number) => {
    const response = await api.get(`/learning/progress/${wordId}`)
    return response.data
  },

  // Get count of words due for review (for badge notifications)
  getReviewCount: async () => {
    const response = await api.get('/learning/review-count')
    return response.data
  },

  // Seed words from a completed LearningSession into the SRS queue
  seedWords: async (simplifiedChars: string[]) => {
    const response = await api.post('/learning/seed', { simplified_chars: simplifiedChars })
    return response.data
  },
}

// Quiz API
export const quizApi = {
  generate: async (hskLevel: number, quizType: string = 'multiple_choice', numQuestions: number = 10, category?: string) => {
    const response = await api.post('/quiz/generate', {
      hsk_level: hskLevel,
      quiz_type: quizType,
      num_questions: numQuestions,
      category
    })
    return response.data
  },

  submit: async (quizResults: unknown) => {
    const response = await api.post('/quiz/submit', quizResults)
    return response.data
  }
}

// Onboarding API
export const onboardingApi = {
  // Get onboarding status
  getStatus: async (): Promise<OnboardingStatus> => {
    const response = await api.get('/onboarding/status')
    return response.data
  },

  // Get assessment questions
  getAssessmentQuestions: async (): Promise<AssessmentQuestionsResponse> => {
    const response = await api.get('/onboarding/assessment/questions')
    return response.data
  },

  // Submit assessment
  submitAssessment: async (submission: AssessmentSubmission): Promise<AssessmentResult> => {
    const response = await api.post('/onboarding/assessment/submit', submission)
    return response.data
  },

  // Save goals
  saveGoals: async (goals: Goals) => {
    const response = await api.post('/onboarding/goals', goals)
    return response.data
  },

  // Skip assessment
  skipAssessment: async () => {
    const response = await api.post('/onboarding/skip-assessment')
    return response.data
  },

  // Complete onboarding
  complete: async (data: OnboardingCompleteRequest): Promise<OnboardingCompleteResponse> => {
    const response = await api.post('/onboarding/complete', data)
    return response.data
  }
}

export const gamificationApi = {
  getStats: async (): Promise<GamificationStats> => {
    const response = await api.get('/gamification/stats')
    return response.data
  },

  dailyCheckin: async () => {
    const response = await api.post('/gamification/daily-checkin')
    return response.data
  },

  generateBadge: async (achievementId: string, style: 'modern' | 'traditional' | 'minimalist' | 'vibrant' = 'modern') => {
    const response = await api.post(`/gamification/generate-badge/${achievementId}`, null, {
      params: { style }
    })
    return response.data
  },

  getBadgeUsageStats: async () => {
    const response = await api.get('/gamification/badge-usage-stats')
    return response.data
  },

  getLeaderboard: async (limit: number = 50, metric: string = 'total_xp', period: string = 'all_time') => {
    const response = await api.get('/gamification/leaderboard', {
      params: { limit, metric, period }
    })
    return response.data
  }
}

// Dictation (听写) API — zero AI cost
export const dictationApi = {
  getSentences: async (hskLevel: number, limit: number = 10) => {
    const response = await api.get('/dictation/sentences', {
      params: { hsk_level: hskLevel, limit }
    })
    return response.data
  },
}

// Adventure Stories API — AI-powered branching stories
export const adventureApi = {
  start: async (hskLevel: number, topic: string = 'daily life') => {
    const response = await api.post('/adventure/start', {
      hsk_level: hskLevel,
      topic,
    })
    return response.data
  },

  continue: async (storySoFar: string, chosenOption: string, hskLevel: number, stepNumber: number) => {
    const response = await api.post('/adventure/continue', {
      story_so_far: storySoFar,
      chosen_option: chosenOption,
      hsk_level: hskLevel,
      step_number: stepNumber,
    })
    return response.data
  },

  getUsageStats: async () => {
    const response = await api.get('/adventure/usage-stats')
    return response.data
  },

  /**
   * Start an adventure with SSE token streaming.
   * Calls onToken for each streamed text chunk, resolves with the full adventure data
   * from the `done` event.  Pass an AbortSignal to cancel mid-stream.
   */
  startStream: async (
    hskLevel: number,
    topic: string = 'daily life',
    onToken: (text: string) => void,
    signal?: AbortSignal,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_URL}/adventure/start-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ hsk_level: hskLevel, topic }),
      signal,
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return _readAdventureStream(response, onToken)
  },

  /**
   * Continue an adventure with SSE token streaming.
   */
  continueStream: async (
    storySoFar: string,
    chosenOption: string,
    hskLevel: number,
    stepNumber: number,
    onToken: (text: string) => void,
    signal?: AbortSignal,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_URL}/adventure/continue-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        story_so_far: storySoFar,
        chosen_option: chosenOption,
        hsk_level: hskLevel,
        step_number: stepNumber,
      }),
      signal,
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return _readAdventureStream(response, onToken)
  },
}

/** Parse an SSE stream for the adventure endpoints. */
async function _readAdventureStream(
  response: Response,
  onToken: (text: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalData: any = null

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (!payload) continue
      try {
        const event = JSON.parse(payload)
        if (event.type === 'token') {
          onToken(event.text as string)
        } else if (event.type === 'done') {
          finalData = event.data
        } else if (event.type === 'error') {
          throw new Error(event.message as string)
        }
      } catch (_e) {
        // Skip malformed SSE lines
      }
    }
  }

  return finalData
}

// Sentence Scramble API — zero AI cost
export const scrambleApi = {
  getSentences: async (hskLevel: number, count: number = 5) => {
    const response = await api.get(`/scramble/sentences?hsk_level=${hskLevel}&count=${count}`)
    return response.data
  },
}

// Speech-to-Text (STT) API — pronunciation practice
export const sttApi = {
  recognize: async (audioBase64: string, expectedText: string = '') => {
    const response = await api.post('/stt/recognize', {
      audio_base64: audioBase64,
      language: 'cmn-Hans-CN',
      expected_text: expectedText,
    })
    return response.data
  },

  getStatus: async (): Promise<{ available: boolean; credentials_path: string }> => {
    const response = await api.get('/stt/status')
    return response.data
  },
}

// Daily Challenge API — zero AI cost
export const dailyChallengeApi = {
  getToday: async (): Promise<DailyChallengeTodayResponse> => {
    const response = await api.get('/daily-challenge/today')
    return response.data
  },

  complete: async () => {
    const response = await api.post('/daily-challenge/complete')
    return response.data
  },

  getStats: async (): Promise<DailyChallengeStatsResponse> => {
    const response = await api.get('/daily-challenge/stats')
    return response.data
  },
}

// ── SSE helpers ─────────────────────────────────────────────────────────────

/**
 * Pump a fetch Response body that emits SSE events.
 * Calls onToken for each "token" event and onDone when the "done" event arrives.
 * Returns the full parsed data object from the "done" event, or throws on "error".
 */
async function pumpSSE(
  res: Response,
  onToken: (text: string) => void,
  signal?: AbortSignal,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${body}`)
  }
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (signal?.aborted) break
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE events are separated by double newlines
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data:')) continue
      const raw = line.slice('data:'.length).trim()
      let event: Record<string, unknown>
      try {
        event = JSON.parse(raw) as Record<string, unknown>
      } catch {
        continue
      }
      if (event.type === 'token') {
        onToken(event.text as string)
      } else if (event.type === 'done') {
        reader.cancel()
        return event.data
      } else if (event.type === 'error') {
        reader.cancel()
        throw new Error((event.message as string) ?? 'SSE stream error')
      }
    }
  }

  return null
}

// AI Conversation API — Gemini free tier
export const conversationApi = {
  getTopics: async () => {
    const response = await api.get('/conversation/topics')
    return response.data
  },

  start: async (hskLevel: number, topic: string) => {
    const response = await api.post('/conversation/start', {
      hsk_level: hskLevel,
      topic,
    })
    return response.data
  },

  reply: async (message: string, hskLevel: number, history: { role: string; content: string }[]) => {
    const response = await api.post('/conversation/reply', {
      message,
      hsk_level: hskLevel,
      history,
    })
    return response.data
  },

  /** Stream the opening AI greeting. Returns the full parsed response object. */
  startStream: async (
    hskLevel: number,
    topic: string,
    onToken: (text: string) => void,
    signal?: AbortSignal,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const token = localStorage.getItem('access_token')
    const res = await fetch(`${API_URL}/conversation/start-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ hsk_level: hskLevel, topic }),
      signal,
    })
    return pumpSSE(res, onToken, signal)
  },

  /** Stream an AI reply. Returns the full parsed response object. */
  replyStream: async (
    message: string,
    hskLevel: number,
    history: { role: string; content: string }[],
    onToken: (text: string) => void,
    signal?: AbortSignal,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const token = localStorage.getItem('access_token')
    const res = await fetch(`${API_URL}/conversation/reply-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, hsk_level: hskLevel, history }),
      signal,
    })
    return pumpSSE(res, onToken, signal)
  },
}

// ── Learning Path API ────────────────────────────────────────────────────────

export interface LessonProgressRecord {
  session_id: string
  unit_id: string
  hsk_level: number
  score: number
  xp_earned: number
  completed_at: string | null
}

export const learningPathApi = {
  getProgress: async (): Promise<LessonProgressRecord[]> => {
    const res = await api.get('/learning-path/progress')
    return res.data
  },

  completeSession: async (body: {
    session_id: string
    unit_id: string
    hsk_level: number
    score: number
    base_xp?: number
  }): Promise<{ is_new: boolean; xp_earned: number; score: number }> => {
    const res = await api.post('/learning-path/complete', body)
    return res.data
  },

  getStats: async (): Promise<{
    total_sessions: number
    total_xp: number
    by_hsk_level: Record<string, number>
  }> => {
    const res = await api.get('/learning-path/stats')
    return res.data
  },
}

// ── Ladder Race API ──────────────────────────────────────────────────────────

export const ladderApi = {
  createRoom: async (boardSize: 50 | 100): Promise<{
    room_code: string
    board_size: number
    host_id: number
  }> => {
    const res = await api.post('/ladder/rooms', { board_size: boardSize })
    return res.data
  },

  getRoom: async (roomCode: string): Promise<{
    room_code: string
    board_size: number
    host_id: number
    state: string
    player_count: number
  }> => {
    const res = await api.get(`/ladder/rooms/${roomCode}`)
    return res.data
  },
}

export const adminApi = {
  getStats: async (): Promise<AdminSystemStatsResponse> => {
    const response = await api.get('/admin/stats')
    return response.data
  },

  getUsers: async (page = 1, pageSize = 20, search?: string) => {
    const response = await api.get('/admin/users', {
      params: { page, page_size: pageSize, search },
    })
    return response.data
  },

  toggleAdmin: async (userId: number) => {
    const response = await api.put(`/admin/users/${userId}/toggle-admin`)
    return response.data
  },

  deleteUser: async (userId: number) => {
    await api.delete(`/admin/users/${userId}`)
  },

  getStories: async (page = 1, pageSize = 20, search?: string, hskLevel?: number) => {
    const response = await api.get('/admin/stories', {
      params: { page, page_size: pageSize, search, hsk_level: hskLevel || undefined },
    })
    return response.data
  },

  toggleStoryPublish: async (storyId: number) => {
    const response = await api.put(`/admin/stories/${storyId}/toggle-publish`)
    return response.data
  },

  deleteStory: async (storyId: number) => {
    await api.delete(`/admin/stories/${storyId}`)
  },

  getAIUsage: async (page = 1, pageSize = 20) => {
    const response = await api.get('/admin/ai-usage', {
      params: { page, page_size: pageSize },
    })
    return response.data
  },

  // ── Trash ──────────────────────────────────────────────────────
  getTrashUsers: async (page = 1, pageSize = 20, search?: string) => {
    const response = await api.get('/admin/trash/users', {
      params: { page, page_size: pageSize, search },
    })
    return response.data
  },

  getTrashStories: async (page = 1, pageSize = 20, search?: string, hskLevel?: number) => {
    const response = await api.get('/admin/trash/stories', {
      params: { page, page_size: pageSize, search, hsk_level: hskLevel || undefined },
    })
    return response.data
  },

  restoreUser: async (userId: number) => {
    const response = await api.post(`/admin/trash/users/${userId}/restore`)
    return response.data
  },

  restoreStory: async (storyId: number) => {
    const response = await api.post(`/admin/trash/stories/${storyId}/restore`)
    return response.data
  },

  permanentDeleteUser: async (userId: number) => {
    await api.delete(`/admin/trash/users/${userId}`)
  },

  permanentDeleteStory: async (storyId: number) => {
    await api.delete(`/admin/trash/stories/${storyId}`)
  },

  purgeTrash: async () => {
    await api.post('/admin/trash/purge')
  },

  // ── Feedback Inbox ─────────────────────────────────────────────
  getFeedback: async (params?: { page?: number; page_size?: number; type?: string; unread_only?: boolean }) => {
    const response = await api.get('/feedback/admin', { params })
    return response.data as {
      feedbacks: FeedbackItem[]
      total: number
      unread_count: number
    }
  },

  updateFeedback: async (id: number, data: { is_read?: boolean; is_resolved?: boolean }) => {
    const response = await api.patch(`/feedback/admin/${id}`, data)
    return response.data as FeedbackItem
  },

  deleteFeedback: async (id: number) => {
    await api.delete(`/feedback/admin/${id}`)
  },
}

// ── Feedback API (user-facing) ─────────────────────────────────────────────────

export const feedbackApi = {
  submit: async (data: {
    type: string
    subject: string
    message: string
    page_url?: string
    attachment_urls?: string[]
    element_selectors?: string[]
  }) => {
    const response = await api.post('/feedback/', data)
    return response.data as FeedbackItem
  },

  improve: async (data: { type: string; subject: string; message: string }) => {
    const response = await api.post('/feedback/improve', data)
    return response.data as { message: string; subject: string }
  },
}

export interface FeedbackItem {
  id: number
  user_id: number | null
  username: string | null
  type: string
  subject: string
  message: string
  page_url: string | null
  attachment_urls: string[] | null
  element_selectors: string[] | null
  is_read: boolean
  is_resolved: boolean
  created_at: string
}

export default api
