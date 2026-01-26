// lib/auth.js
import { supabase } from './supabase'

// Check if current user is authenticated
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// Check if current user is an admin
export async function isAdmin() {
  const user = await getUser()
  if (!user) return false
  
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()
  
  return !error && !!data
}

// Get admin profile for current user
export async function getAdminProfile() {
  const user = await getUser()
  if (!user) return null
  
  const { data } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()
  
  return data
}

// Sign in with email and password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) return { error: error.message }

  // Skip admin check here - let the page handle it after login
  return { user: data.user }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error: error?.message }
}

// Create a new admin (only existing admins can do this)
export async function createAdmin(email, name, role = 'admin') {
  // First check if caller is admin
  const callerIsAdmin = await isAdmin()
  if (!callerIsAdmin) return { error: 'Unauthorized' }
  
  // Check if email already exists in admins
  const { data: existing } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email)
    .single()
  
  if (existing) return { error: 'Admin with this email already exists' }
  
  // Create the admin record (user_id will be linked when they first log in)
  const { data, error } = await supabase
    .from('admins')
    .insert([{ email, name, role, is_active: true }])
    .select()
    .single()
  
  if (error) return { error: error.message }
  return { admin: data }
}

// Invite a new admin (creates auth user + admin record)
export async function inviteAdmin(email, name, role = 'admin') {
  const callerIsAdmin = await isAdmin()
  if (!callerIsAdmin) return { error: 'Unauthorized' }
  
  // Generate a temporary password (user should reset on first login)
  const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true
  })
  
  // If we can't use admin API, try regular signup
  if (authError) {
    // Create admin record without user_id - they'll need to sign up themselves
    const { data, error } = await supabase
      .from('admins')
      .insert([{ email, name, role, is_active: true }])
      .select()
      .single()
    
    if (error) return { error: error.message }
    return { 
      admin: data, 
      message: 'Admin record created. User needs to sign up with this email.',
      needsSignup: true
    }
  }
  
  // Create admin record with user_id
  const { data, error } = await supabase
    .from('admins')
    .insert([{ 
      email, 
      name, 
      role, 
      user_id: authData.user.id,
      is_active: true 
    }])
    .select()
    .single()
  
  if (error) return { error: error.message }
  return { admin: data, tempPassword }
}

// Update admin
export async function updateAdmin(adminId, updates) {
  const callerIsAdmin = await isAdmin()
  if (!callerIsAdmin) return { error: 'Unauthorized' }
  
  const { data, error } = await supabase
    .from('admins')
    .update(updates)
    .eq('id', adminId)
    .select()
    .single()
  
  if (error) return { error: error.message }
  return { admin: data }
}

// Deactivate admin (soft delete)
export async function deactivateAdmin(adminId) {
  const callerIsAdmin = await isAdmin()
  if (!callerIsAdmin) return { error: 'Unauthorized' }
  
  // Prevent deactivating yourself
  const profile = await getAdminProfile()
  if (profile?.id === adminId) {
    return { error: 'Cannot deactivate yourself' }
  }
  
  const { error } = await supabase
    .from('admins')
    .update({ is_active: false })
    .eq('id', adminId)
  
  if (error) return { error: error.message }
  return { success: true }
}

// Reactivate admin
export async function reactivateAdmin(adminId) {
  const callerIsAdmin = await isAdmin()
  if (!callerIsAdmin) return { error: 'Unauthorized' }
  
  const { error } = await supabase
    .from('admins')
    .update({ is_active: true })
    .eq('id', adminId)
  
  if (error) return { error: error.message }
  return { success: true }
}

// Get all admins
export async function getAllAdmins() {
  const callerIsAdmin = await isAdmin()
  if (!callerIsAdmin) return { error: 'Unauthorized' }
  
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return { error: error.message }
  return { admins: data }
}

// Link user_id to admin record on first login
export async function linkUserToAdmin(userId, email) {
  const { data, error } = await supabase
    .from('admins')
    .update({ user_id: userId })
    .eq('email', email)
    .is('user_id', null)
    .select()
    .single()
  
  return { admin: data, error: error?.message }
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}