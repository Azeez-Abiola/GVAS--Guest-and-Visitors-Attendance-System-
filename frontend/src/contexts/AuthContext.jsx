import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user.email)

        // PREVENT UNNECESSARY REFRESH: Only fetch if user changed or profile is missing
        setUser(prevUser => {
          if (prevUser?.id === session.user.id) {
            console.log('User already loaded, skipping profile fetch for token refresh');
            return prevUser;
          }

          // New user or initial load
          setTimeout(async () => {
            setLoading(true)
            await fetchUserProfile(session.user.id, session.user)
            setLoading(false)
          }, 0);
          return session.user;
        })

      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription?.unsubscribe()
  }, []) // Empty dependency array - only run once on mount

  const checkUser = async () => {
    try {
      console.log('Checking for existing session...')
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Session check error:', error)
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      if (session?.user) {
        console.log('Session found:', session.user.email)
        setUser(session.user)
        await fetchUserProfile(session.user.id, session.user) // Pass session user
      } else {
        console.log('No session found')
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error('Check user error:', error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async (userId, sessionUser = null) => {
    try {
      console.log('Fetching profile for user:', userId)

      // Use session user if provided, otherwise fall back to state user
      const currentUser = sessionUser || user

      if (!currentUser?.email) {
        console.log('No current user email, using basic profile')
        const basicProfile = {
          id: userId,
          email: 'user@uachouse.com',
          full_name: 'User',
          role: 'reception',
          created_at: new Date().toISOString()
        }
        setProfile(basicProfile)
        return basicProfile
      }

      // FETCH THE ACTUAL PROFILE FROM DATABASE
      console.log('🔍 Querying database for user profile...')
      console.log('User ID:', userId)
      console.log('User email:', currentUser.email)

      // Query with race condition timeout
      const timeoutMs = 10000 // Increased to 10 seconds to prevent premature timeouts

      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: 'timeout' } }), timeoutMs)
      )

      const { data: dbProfile, error: profileError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ])

      console.log('🔍 Query result:', {
        hasData: !!dbProfile,
        hasError: !!profileError,
        errorMessage: profileError?.message
      })

      if (profileError) {
        if (profileError.message === 'timeout') {
          console.error('❌ Query timed out after', timeoutMs, 'ms')
        } else {
          console.warn('⚠️ Database profile fetch error:', profileError.message)
        }
      }

      if (dbProfile) {
        console.log('✅ Database profile found:', {
          role: dbProfile.role,
          email: dbProfile.email
        })

        // Parse assigned_floors if it's a string
        if (dbProfile.assigned_floors && typeof dbProfile.assigned_floors === 'string') {
          try {
            dbProfile.assigned_floors = JSON.parse(dbProfile.assigned_floors)
          } catch (e) {
            console.error('❌ Failed to parse assigned_floors:', e)
          }
        }

        setProfile(dbProfile)
        return dbProfile
      }

      console.log('⚠️ No profile in database, creating fallback profile')

      // Fallback: Determine role from user_metadata FIRST, then email
      let role = 'reception' // default

      if (currentUser.user_metadata?.role) {
        role = currentUser.user_metadata.role;
        console.log('Using role from user_metadata:', role);
      } else if (currentUser.email.includes('admin')) {
        role = 'admin';
      } else if (currentUser.email.includes('security')) {
        role = 'security';
      } else if (currentUser.email.includes('host')) {
        role = 'host';
      }

      console.log('Using ultimate fallback role:', role, 'for', currentUser.email)

      // For testing: Assign default floors to reception users
      let defaultFloors = []
      if (role === 'reception') {
        defaultFloors = [0, 1]
      }

      const profile = {
        id: userId,
        email: currentUser.email,
        full_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
        role: role,
        created_at: currentUser.created_at || new Date().toISOString(),
        tenant_id: null,
        assigned_floors: defaultFloors
      }

      setProfile(profile)
      return profile

    } catch (error) {
      console.error('Error in fetchUserProfile:', error.message)

      // Fallback profile
      const basicProfile = {
        id: userId,
        email: 'unknown',
        full_name: 'User',
        role: 'reception',
        created_at: new Date().toISOString()
      }
      setProfile(basicProfile)
      return basicProfile
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      console.log('Attempting login for:', email)

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error('Login failed:', error.message)
        setLoading(false)
        throw error
      }

      console.log('Login successful')
      setUser(data.user)

      const profile = await fetchUserProfile(data.user.id, data.user)
      console.log('Profile loaded:', profile?.role)

      setLoading(false)
      return { user: data.user, profile, error: null }
    } catch (error) {
      console.error('Login error:', error.message)
      setLoading(false)
      return { user: null, profile: null, error: error.message }
    }
  }

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: userData.full_name, role: userData.role } }
      })

      if (error) throw error

      if (data.user && userData.tenant_id) {
        await supabase.from('users').update({ tenant_id: userData.tenant_id }).eq('id', data.user.id)
      }

      return { user: data.user, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const hasRole = (requiredRole) => {
    if (!profile || !profile.role) {
      if (user) return true
      return false
    }

    const userRole = profile.role.toLowerCase()
    if (userRole === 'admin') return true

    if (Array.isArray(requiredRole)) {
      return requiredRole.map(r => r.toLowerCase()).includes(userRole)
    }

    return userRole === requiredRole.toLowerCase()
  }

  const canAccess = (feature) => {
    if (!profile) {
      if (user) return ['reception', 'badges'].includes(feature)
      return false
    }

    const permissions = {
      admin: ['reception', 'badges', 'evacuation', 'approvals', 'blacklist', 'settings', 'users'],
      reception: ['reception', 'badges'],
      host: ['approvals', 'host-analytics', 'host-badges'],
      security: ['evacuation', 'blacklist']
    }

    const userPermissions = permissions[profile.role] || ['reception', 'badges']
    return userPermissions.includes(feature)
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    canAccess,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isReception: profile?.role === 'reception',
    isHost: profile?.role === 'host',
    isSecurity: profile?.role === 'security'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
