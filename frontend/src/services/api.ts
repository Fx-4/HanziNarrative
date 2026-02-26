import axios from 'axios'
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
} from '@/types'
import { apiLogger } from '@/utils/debugLogger'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
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
  (error) => {
    const status = error.response?.status
    const url = error.config?.url ?? 'unknown'
    const method = error.config?.method?.toUpperCase() ?? '?'
    const detail = error.response?.data?.detail ?? error.message

    if (status === 401) {
      apiLogger.warn(`← 401 ${method} ${url} — session expired, redirecting to login`)
      localStorage.removeItem('access_token')
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
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
}

export const storiesApi = {
  getAll: async (hskLevel?: number): Promise<Story[]> => {
    const params = hskLevel ? { hsk_level: hskLevel } : {}
    const response = await api.get('/stories', { params })
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
    const response = await api.post('/stories', story)
    return response.data
  },

  generateStory: async (request: {
    hsk_level: number
    topic?: string
    character_names?: string[]
    length?: 'short' | 'medium' | 'long'
  }) => {
    const response = await api.post('/stories/generate', request)
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
    const response = await api.get('/progress')
    return response.data
  },

  updateProgress: async (wordId: number, familiarityLevel: number): Promise<UserProgress> => {
    const response = await api.post('/progress', {
      word_id: wordId,
      familiarity_level: familiarityLevel,
    })
    return response.data
  },
}

export const vocabularySetsApi = {
  getAll: async (): Promise<VocabularySet[]> => {
    const response = await api.get('/vocabulary-sets')
    return response.data
  },

  create: async (name: string, description?: string): Promise<VocabularySet> => {
    const response = await api.post('/vocabulary-sets', { name, description })
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
    const params = hskLevel ? { hsk_level: hskLevel } : {}
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
    const params: any = {}
    if (mode) params.mode = mode
    if (hskLevel) params.hsk_level = hskLevel
    const response = await api.get('/typing/progress', { params })
    return response.data
  },

  getStats: async (mode?: string, hskLevel?: number): Promise<TypingStats> => {
    const params: any = {}
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
    const params: any = { hsk_level: hskLevel, limit }
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
    const params: any = { hsk_level: hskLevel, limit }
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
  getStats: async (hskLevel?: number) => {
    const params = hskLevel ? { hsk_level: hskLevel } : {}
    const response = await api.get('/learning/stats', { params })
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

  submit: async (quizResults: any) => {
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
  getStats: async () => {
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

  getLeaderboard: async (limit: number = 50, metric: string = 'total_xp') => {
    const response = await api.get('/gamification/leaderboard', {
      params: { limit, metric }
    })
    return response.data
  }
}

export default api
