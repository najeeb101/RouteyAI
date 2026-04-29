import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'

type InviteState = 'loading' | 'valid' | 'invalid' | 'already_used'

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>()
  const router = useRouter()
  const [state, setState] = useState<InviteState>('loading')
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    if (!code) { setState('invalid'); return }
    validateInvite(code)
  }, [code])

  async function validateInvite(inviteCode: string) {
    // Check if current user is already logged in
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      // Already logged in — redirect to their dashboard
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle()
      const userRole = roleRow?.role
      if (userRole === 'driver') router.replace('/driver' as never)
      else if (userRole === 'parent') router.replace('/parent' as never)
      else router.replace('/login' as never)
      return
    }

    // Not logged in — check if invite code is a valid user ID or token
    // For now, treat the code as the invited user's pre-created ID
    // and redirect to login with the code stored for post-login linking
    if (inviteCode.length > 10) {
      setRole('parent')
      setState('valid')
    } else {
      setState('invalid')
    }
  }

  function handleAccept() {
    // Navigate to login; post-login flow will handle role assignment
    router.replace(`/login?invite=${code}` as never)
  }

  return (
    <SafeAreaView style={styles.container}>
      {state === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Validating invite…</Text>
        </View>
      )}

      {state === 'valid' && (
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>
          <Text style={styles.title}>You&apos;re invited!</Text>
          <Text style={styles.subtitle}>
            You&apos;ve been invited to join RouteyAI as a {role ?? 'user'}.
            {'\n'}Create your account to get started.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleAccept}>
            <Text style={styles.buttonText}>Accept Invite</Text>
          </TouchableOpacity>
        </View>
      )}

      {(state === 'invalid' || state === 'already_used') && (
        <View style={styles.center}>
          <View style={[styles.iconCircle, styles.iconCircleError]}>
            <Text style={styles.iconText}>✕</Text>
          </View>
          <Text style={styles.title}>
            {state === 'already_used' ? 'Invite already used' : 'Invalid invite link'}
          </Text>
          <Text style={styles.subtitle}>
            {state === 'already_used'
              ? 'This invite has already been accepted. Try logging in instead.'
              : 'This invite link is invalid or has expired. Contact your school admin.'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/login' as never)}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconCircleError: {
    backgroundColor: '#FEE2E2',
  },
  iconText: {
    fontSize: 28,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})
