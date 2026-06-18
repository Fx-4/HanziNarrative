import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a dummy client if keys are missing to prevent the app from crashing during initialization
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any
  
if (!supabase) {
  console.warn('Supabase URL or Anon Key is missing. Storage features (feedback screenshots) will not work.')
}
