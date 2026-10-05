import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CircleAlert, Mail } from 'lucide-react-native'
import { Button } from '@/components/primitives/Button'
import { Icon } from '@/components/primitives/Icon'
import { Txt } from '@/components/primitives/Txt'
import { supabase } from '@/lib/supabase'
import { space, useTheme } from '@/lib/theme'

const LOGO = require('../../../assets/splash-icon.png')

type InviteState = 'loading' | 'valid' | 'invalid' | 'already_used'

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>()
  const router = useRouter()
  const t = useTheme()
  const [state, setState] = useState<InviteState>('loading')
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
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

    if (!code) { setState('invalid'); return }
    validateInvite(code)
  }, [code, router])

  function handleAccept() {
    router.replace(`/login?invite=${code}` as never)
  }

  if (state === 'loading') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
          <ActivityIndicator size="large" color={t.brand} />
          <Txt variant="body" tone="inkSecondary">
            Checking your invite link…
          </Txt>
        </View>
      </SafeAreaView>
    )
  }

  const isValid = state === 'valid'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: space.xxl, gap: space.xxxl }}>
        <View style={{ alignItems: 'center', gap: space.sm }}>
          <Image source={LOGO} style={{ width: 56, height: 56 }} accessible={false} />
          <Txt variant="title">RouteyAI</Txt>
        </View>

        <View style={{ alignItems: 'center', gap: space.md }}>
          <Icon icon={isValid ? Mail : CircleAlert} size={40} color={isValid ? t.brand : t.dangerText} strokeWidth={1.5} />
          <Txt variant="largeTitle" align="center">
            {state === 'already_used' ? 'Already accepted' : isValid ? 'You’re invited' : 'This link doesn’t work'}
          </Txt>
          <Txt variant="body" tone="inkSecondary" align="center">
            {isValid
              ? `You've been invited to join RouteyAI as a ${role ?? 'user'}. Create your account to get started.`
              : state === 'already_used'
                ? 'This invite has already been accepted. Try signing in instead.'
                : 'This invite link is invalid or has expired. Ask your school for a new one.'}
          </Txt>
        </View>

        <View style={{ gap: space.md }}>
          <Button label={isValid ? 'Accept invite' : 'Go to sign in'} variant={isValid ? 'primary' : 'secondary'} onPress={isValid ? handleAccept : () => router.replace('/login' as never)} />
          {isValid && (
            <Txt variant="caption" tone="inkTertiary" align="center">
              By accepting, you agree to create an account with the email this invite was sent to.
            </Txt>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}
