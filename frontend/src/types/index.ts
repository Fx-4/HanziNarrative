export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  profile_picture?: string
  is_admin?: boolean
  created_at: string
}

export interface UserUpdate {
  full_name?: string
  profile_picture?: string
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
  evolution_history?: string
  radical?: string
  strokes?: number
}

export interface Story {
  id: number
  title: string
  title_english?: string
  content: string
  content_pinyin?: string  // Context-aware pinyin from AI
  english_translation?: string
  hsk_level: number
  author_id: number
  created_at: string
  updated_at: string
  is_published: boolean
  category?: 'curated' | 'ai_generated' | string
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
  refresh_token?: string
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

// Onboarding Types
export interface Goals {
  daily_time_minutes?: number
  daily_words?: number
  target_hsk_level?: number
  target_date?: string
  weekly_xp?: number
}

export interface Preferences {
  learning_style?: string
  difficulty_preference?: string
  reminder_enabled?: boolean
  reminder_time?: string
  show_pinyin_by_default?: boolean
}

export interface OnboardingStatus {
  onboarding_completed: boolean
  current_step: number
  determined_hsk_level: number
  took_assessment?: boolean
  assessment_score?: number
  goals?: Goals
  preferences?: Preferences
}

export interface AssessmentAnswer {
  question_id: number
  word_id: number
  hsk_level: number
  user_answer: string | number
  correct_answer: string | number
  is_correct: boolean
  time_taken: number
}

export interface AssessmentSubmission {
  answers: AssessmentAnswer[]
  total_time: number
}

export interface AssessmentResult {
  determined_level: number
  score_percentage: number
  total_correct: number
  total_questions: number
  level_performance: Record<number, { correct: number; total: number }>
  xp_earned: number
  message: string
}

export interface QuestionData {
  word_id: number
  hsk_level: number
  chinese: string
  pinyin: string
  english: string
}

export interface AssessmentQuestionsResponse {
  questions_pool: QuestionData[]
  initial_level: number
  adaptive_strategy: string
}

export interface OnboardingCompleteRequest {
  took_assessment: boolean
  determined_hsk_level: number
  goals: Goals
  preferences: Preferences
}

export interface OnboardingCompleteResponse {
  message: string
  xp_earned: number
  level: number
  leveled_up: boolean
  initial_words_count: number
  achievement_unlocked: boolean
  redirect_to: string
}

export interface GamificationStats {
  total_xp: number
  level: number
  xp_to_next_level: number
  current_xp_in_level: number
  current_streak: number
  longest_streak: number
  total_words_reviewed: number
  total_correct_answers: number
  total_stories_read: number
  achievements: Array<{
    id: string
    name: string
    description: string
    xp: number
  }>
  accuracy_rate: number
}

// Typing Practice Types
export type TypingMode = 'pinyin' | 'ime' | 'speed' | null

export interface TypingProgress {
  id: number
  user_id: number
  word_id: number
  mode: 'pinyin' | 'ime' | 'speed'
  total_attempts: number
  successful_attempts: number
  accuracy_score: number
  pinyin_accuracy: number
  best_wpm: number
  average_wpm: number
  average_time_per_char: number
  ime_selection_accuracy: number
  ime_average_attempts: number
  mastery_level: number
  last_practiced: string
  created_at: string
}

export interface TypingAttempt {
  word_id: number
  mode: 'pinyin' | 'ime' | 'speed'
  is_correct: boolean
  time_taken: number
  typed_text: string
  expected_text: string
  wpm?: number
  ime_attempts?: number
  tone_errors?: number[]
}

export interface TypingStats {
  total_words_practiced: number
  total_attempts: number
  average_accuracy: number
  average_wpm: number
  best_wpm: number
  mastered_words: number
  words_in_progress: number
  new_words: number
}
