import { createClient } from '@supabase/supabase-js'

// Dessa värden sätts automatiskt av Lovable för Supabase-integrerade projekt
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)