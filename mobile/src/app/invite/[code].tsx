import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { colors } from '@/lib/colors'

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
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: roleRow } = await supabase
        .from('user_roles').select('role').eq('user_id', session.user.id).maybeSingle()
      const userRole = roleRow?.role
      if (userRole === 'driver') router.replace('/driver' as never)
      else if (userRole === 'parent') router.replace('/parent' as never)
      else router.replace('/login' as never)
      return
    }

    if (inviteCode.length > 10) {
      setRole('parent')
      setState('valid')
    } else {
      setState('invalid')
    }
  }

  function handleAccept() {
    router.replace(`/login?invite=${code}` as never)
  }

  if (state === 'loading') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dark }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontFamily: 'Inter_500Medium' }}>
            Validating invite link…
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const isValid = state === 'valid'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.dark }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>

        {/* Brand wordmark */}
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'Inter_800ExtraBold', letterSpacing: -0.5, marginBottom: 48 }}>
          Routey<Text style={{ color: colors.accent }}>AI</Text>
        </Text>

        {/* Icon circle */}
        <View style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: isValid ? 'rgba(0,212,255,0.12)' : 'rgba(239,68,68,0.12)',
          borderWidth: 1.5,
          borderColor: isValid ? 'rgba(0,212,255,0.3)' : 'rgba(239,68,68,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 36 }}>{isValid ? '✉️' : '⛔'}</Text>
        </View>

        {/* Heading */}
        <Text style={{ fontSize: 26, fontFamily: 'Inter_800ExtraBold', color: '#FFFFFF', letterSpacing: -0.5, textAlign: 'center', marginBottom: 10 }}>
          {state === 'already_used' ? 'Already Accepted' : isValid ? "You're Invited!" : 'Invalid Link'}
        </Text>

        {/* Subtext */}
        <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 23, marginBottom: 40, fontFamily: 'Inter_400Regular' }}>
          {isValid
            ? `You've been invited to join RouteyAI as a ${role ?? 'user'}.\nCreate your account to get started.`
            : state === 'already_used'
              ? 'This invite has already been accepted.\nTry logging in instead.'
              : 'This invite link is invalid or has expired.\nContact your school admin for a new link.'}
        </Text>

        {/* Role pill — only on valid state */}
        {isValid && role && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(0,212,255,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(0,212,255,0.25)',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 32,
          }}>
            <Text style={{ fontSize: 13 }}>{role === 'driver' ? '🚌' : '👨‍👩‍👧'}</Text>
            <Text style={{ color: colors.accent, fontFamily: 'Inter_700Bold', fontSize: 13 }}>
              {role.charAt(0).toUpperCase() + role.slice(1)} account
            </Text>
          </View>
        )}

        {/* CTA button */}
        <TouchableOpacity
          onPress={isValid ? handleAccept : () => router.replace('/login' as never)}
          style={{
            backgroundColor: isValid ? colors.primary : 'rgba(255,255,255,0.12)',
            width: '100%',
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            borderWidth: isValid ? 0 : 1,
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold', letterSpacing: 0.2 }}>
            {isValid ? 'Accept Invite' : 'Go to Login'}
          </Text>
        </TouchableOpacity>

        {/* Fine print */}
        {isValid && (
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 16, fontFamily: 'Inter_400Regular', lineHeight: 17 }}>
            By accepting, you agree to create an account{'\n'}with the email associated with this invite.
          </Text>
        )}
      </View>
    </SafeAreaView>
  )
}
