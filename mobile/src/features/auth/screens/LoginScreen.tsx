import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import { BrandMark } from '@/components/brand/BrandMark'
import { NightGlow, ROUTE_MOTIF_LINE_Y, RouteMotif } from '@/components/brand/SignatureCard'
import { LegalLinks } from '@/components/LegalLinks'
import { Banner } from '@/components/primitives/Banner'
import { Button } from '@/components/primitives/Button'
import { TextField } from '@/components/primitives/TextField'
import { Txt } from '@/components/primitives/Txt'
import { routes } from '@/lib/navigation/routes'
import { supabase } from '@/lib/supabase'
import { radius, space, useTheme } from '@/lib/theme'

const LOGO_SIZE = 64

export function LoginScreen() {
  const router = useRouter()
  const t = useTheme()
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    setLoading(true)

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (signInError) {
      setError('Sign in failed. Check your email and password.')
      setLoading(false)
      return
    }

    const { data: roleData, error: roleErr } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', signInData.user.id)
      .maybeSingle()

    setLoading(false)

    if (roleErr || !roleData) {
      setError('Account not configured. Please use your invite link to register.')
      await supabase.auth.signOut()
      return
    }

    if (roleData.role === 'driver') {
      router.replace(routes.driverHome)
    } else if (roleData.role === 'parent') {
      router.replace(routes.parentHome)
    } else {
      setError('This app is for drivers and parents only. Please use the web dashboard.')
      await supabase.auth.signOut()
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.night }}>
      <StatusBar style="light" />
      {/* White behind the lower half, so pulling the form up past the end doesn't show navy under it. */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', backgroundColor: t.surface }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Brand panel: the landing page's navy with the logo's route line */}
          <View style={{ paddingTop: insets.top + space.xxxl, paddingBottom: space.xxxl + radius.lg, paddingHorizontal: space.xxl, gap: space.lg, overflow: 'hidden' }}>
            <NightGlow />
            {/* The route line starts beside the logo, at its middle */}
            <RouteMotif style={{ position: 'absolute', right: -12, top: insets.top + space.xxxl + LOGO_SIZE / 2 - ROUTE_MOTIF_LINE_Y }} />
            <BrandMark size={LOGO_SIZE} />
            <View style={{ gap: space.xs }}>
              <BrandName />
              <Txt variant="body" tone="onNightSecondary">
                The school bus, live. For drivers and parents.
              </Txt>
            </View>
          </View>

          {/* Sign in */}
          <View
            style={{
              flex: 1,
              marginTop: -radius.lg,
              backgroundColor: t.surface,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              paddingHorizontal: space.xxl,
              paddingTop: space.xxl,
              paddingBottom: insets.bottom + space.xl,
              gap: space.xxxl,
            }}
          >
            <View style={{ gap: space.xl }}>
              <View style={{ gap: space.xs }}>
                <Txt variant="title">Sign in</Txt>
                <Txt variant="body" tone="inkSecondary">
                  Use the email and password you chose from your school&apos;s invite.
                </Txt>
              </View>

              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secure
                autoComplete="password"
                textContentType="password"
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />

              {error ? <Banner text={error} /> : null}

              <Button label="Sign in" onPress={handleLogin} loading={loading} />
              <LegalLinks />
            </View>

            {/* Dev shortcuts: development builds only, never in store builds */}
            {__DEV__ && (
              <View style={{ alignItems: 'center', gap: space.sm }}>
                <Txt variant="caption" tone="inkTertiary">
                  Preview screens without signing in (no data, development only)
                </Txt>
                <View style={{ flexDirection: 'row', gap: space.xxl }}>
                  <Pressable onPress={() => router.replace(routes.driverHome)} hitSlop={8} accessibilityRole="button">
                    <Txt variant="subhead" tone="inkSecondary">
                      Driver screens
                    </Txt>
                  </Pressable>
                  <Pressable onPress={() => router.replace(routes.parentHome)} hitSlop={8} accessibilityRole="button">
                    <Txt variant="subhead" tone="inkSecondary">
                      Parent screens
                    </Txt>
                  </Pressable>
                </View>
              </View>
            )}

            <Txt variant="caption" tone="inkTertiary" align="center" style={{ marginTop: 'auto' }}>
              RouteyAI · Doha, Qatar
            </Txt>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

/** "RouteyAI" large on the navy panel: white, with "AI" in cyan like the logo's end. */
function BrandName() {
  const t = useTheme()
  return (
    <Txt variant="largeTitle" tone="onNight" style={{ fontSize: 34, lineHeight: 40 }} accessibilityRole="header">
      Routey
      <Txt variant="largeTitle" color={t.live} style={{ fontSize: 34, lineHeight: 40 }}>
        AI
      </Txt>
    </Txt>
  )
}
