import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'gvas-auth-token'
  }
})

// Helper to check connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('count')
      .limit(1)
    
    if (error) throw error
    return { success: true, message: 'Connected to Supabase' }
  } catch (error) {
    console.error('Supabase connection error:', error)
    return { success: false, message: error.message }
  }
}
