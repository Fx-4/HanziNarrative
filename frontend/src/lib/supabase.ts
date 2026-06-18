import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseClient = null

// Extremely defensive initialization to prevent any crash during app boot
try {
  if (typeof supabaseUrl === 'string' && supabaseUrl.trim() !== '' && 
      typeof supabaseAnonKey === 'string' && supabaseAnonKey.trim() !== '') {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch (err) {
  console.error('Failed to initialize Supabase client:', err)
}

if (!supabaseClient) {
  console.warn('Supabase configuration is missing or invalid. Feedback screenshots will be disabled.')
}

export const supabase = supabaseClient as any
