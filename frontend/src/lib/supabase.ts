import { createClient } from '@supabase/supabase-js'

// We use a helper to safely get env vars to avoid any build-time issues
const getEnv = (key: string): string => {
  try {
    const val = import.meta.env[key]
    return typeof val === 'string' ? val.trim() : ''
  } catch {
    return ''
  }
}

const supabaseUrl = getEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY')

let supabaseClient = null

// Final safety check: Only call createClient if we have both values
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.error('Supabase initialization error:', err)
  }
}

if (!supabaseClient) {
  console.warn('Supabase is not configured. Some features will be disabled, but the app should run.')
}

export const supabase = supabaseClient as any
