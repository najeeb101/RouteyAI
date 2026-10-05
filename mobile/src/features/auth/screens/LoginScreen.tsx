import { useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Banner } from '@/components/primitives/Banner'
import { Button } from '@/components/primitives/Button'
import { TextField } from '@/components/primitives/TextField'
import { Txt } from '@/components/primitives/Txt'
import { routes } from '@/lib/navigation/routes'
import { supabase } from '@/lib/supabase'
import { space, useTheme } from '@/lib/theme'

const LOGO = require('../../../../assets/splash-icon.png')

export function LoginScreen() {
  const router = useRouter()
  const t = useTheme()
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
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: space.xxl, paddingVertical: space.xxxl, gap: space.xxxl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={{ alignItems: 'center', gap: space.sm }}>
            <Image source={LOGO} style={{ width: 76, height: 76 }} accessibilityIgnoresInvertColors accessible={false} />
            <Txt variant="largeTitle">RouteyAI</Txt>
          </View>

          {/* Sign in */}
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

          <Txt variant="caption" tone="inkTertiary" align="center">
            RouteyAI · Doha, Qatar
          </Txt>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
