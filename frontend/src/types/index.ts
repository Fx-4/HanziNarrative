export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export interface HanziWord {
  id: number
  simplified: string
  traditional: string
  pinyin: string
  english: string
  hsk_level: number
  category?: string
  image_url?: string
}

export interface Story {
  id: number
  title: string
  content: string
  english_translation?: string
  hsk_level: number
  author_id: number
  created_at: string
  updated_at: string
  is_published: boolean
}

export interface StoryWord {
  story_id: number
  word_id: number
  position: number
  word: HanziWord
}

export interface UserProgress {
  id: number
  user_id: number
  word_id: number
  familiarity_level: number
  last_reviewed: string
  review_count: number
}

export interface VocabularySet {
  id: number
  user_id: number
  name: string
  description?: string
  created_at: string
  words: HanziWord[]
}

export interface AuthTokens {
  access_token: string
  token_type: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

// Writing Practice Types
export interface WritingProgress {
  id: number
  user_id: number
  word_id: number
  total_attempts: number
  successful_attempts: number
  accuracy_score: number
  average_time: number
  stroke_accuracy: number[] | null
  mastery_level: number
  last_practiced: string
  created_at: string
}

export interface WritingAttempt {
  word_id: number
  accuracy_score: number
  time_taken: number
  stroke_accuracy?: number[]
}

export interface WritingStats {
  total_characters_practiced: number
  total_attempts: number
  average_accuracy: number
  mastered_characters: number
  characters_in_progress: number
  new_characters: number
}

export interface AttemptResult {
  accuracy: number
  timeTaken: number
  strokeData: any
}
