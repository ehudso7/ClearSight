/**
 * Authentication utilities
 */
import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'

/**
 * Get current user session (server-side)
 * Returns null if not authenticated
 */
export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('[Auth] Error getting session:', error)
    return null
  }
  
  return session
}

/**
 * Get current user (server-side)
 * Returns null if not authenticated
 */
export async function getUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('[Auth] Error getting user:', error)
    return null
  }
  
  return user
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use in Server Components that require auth
 */
export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const user = await getUser()
  
  if (!user) {
    return false
  }
  
  const role = user.user_metadata?.role
  return role === 'admin' || role === 'super_admin'
}

/**
 * Require admin role - redirects if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth()
  const adminCheck = await isAdmin()
  
  if (!adminCheck) {
    redirect('/dashboard') // Redirect non-admins to dashboard
  }
  
  return user
}

/**
 * Get user's client ID
 */
export async function getUserClientId(): Promise<string | null> {
  const user = await getUser()
  
  if (!user) {
    return null
  }
  
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()
  
  if (error) {
    console.error('[Auth] Error fetching client ID:', error)
    return null
  }
  
  return data?.id || null
}
