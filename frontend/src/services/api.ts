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
  WritingProgress,
  WritingAttempt,
  WritingStats
} from '@/types'

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
  return config
})

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

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me')
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

export default api
