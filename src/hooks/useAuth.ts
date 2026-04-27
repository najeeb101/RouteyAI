'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { ROLE_HOME, type Role } from '@/lib/constants'

interface AuthState {
  user: User | null
  role: Role | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, role: null, loading: true })
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setState({ user: null, role: null, loading: false })
        return
      }

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      setState({ user, role: (roleRow?.role as Role) ?? null, loading: false })
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setState({ user: null, role: null, loading: false })
      } else {
        loadUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const redirectToHome = () => {
    if (state.role) {
      router.push(ROLE_HOME[state.role])
    }
  }

  return { ...state, signOut, redirectToHome }
}
