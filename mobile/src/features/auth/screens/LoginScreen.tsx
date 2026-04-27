import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '@/lib/colors'
import { routes } from '@/lib/navigation/routes'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types/route'

const hasSupabaseEnv = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)

export function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('parent')

  async function handleLogin() {
    setError('')
    setLoading(true)

    if (hasSupabaseEnv && email && password) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('Sign in failed. Check the email and password.')
        setLoading(false)
        return
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 550))
    }

    setLoading(false)
    router.replace(selectedRole === 'driver' ? routes.driverHome : routes.parentHome)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.dark }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 28, fontFamily: 'Inter_800ExtraBold', color: colors.accent }}>R</Text>
            </View>
            <Text style={{ fontSize: 26, fontFamily: 'Inter_800ExtraBold', color: '#FFFFFF' }}>
              Routey<Text style={{ color: colors.accent }}>AI</Text>
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontFamily: 'Inter_400Regular' }}>
              Smart routing. Real-time tracking.
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.dark, marginBottom: 4 }}>Welcome back</Text>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 20, fontFamily: 'Inter_400Regular' }}>
              Sign in to continue
            </Text>

            <Text
              style={{
                fontSize: 11,
                fontFamily: 'Inter_600SemiBold',
                color: colors.dark,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              I am a
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {[
                { role: 'parent' as Role, label: 'Parent', color: colors.primary, bg: colors.infoBg },
                { role: 'driver' as Role, label: 'Driver', color: colors.success, bg: colors.successBg },
              ].map(item => (
                <TouchableOpacity
                  key={item.role}
                  onPress={() => setSelectedRole(item.role)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: selectedRole === item.role ? item.color : colors.border,
                    backgroundColor: selectedRole === item.role ? item.bg : '#FAFAFA',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: 'Inter_600SemiBold',
                      color: selectedRole === item.role ? item.color : colors.muted,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: colors.dark, marginBottom: 6 }}>EMAIL</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.subtle}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  fontSize: 14,
                  color: colors.dark,
                  backgroundColor: '#FAFAFA',
                  fontFamily: 'Inter_400Regular',
                }}
              />
            </View>

            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: colors.dark, marginBottom: 6 }}>PASSWORD</Text>
              <View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={colors.subtle}
                  secureTextEntry={!showPassword}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    paddingRight: 58,
                    fontSize: 14,
                    color: colors.dark,
                    backgroundColor: '#FAFAFA',
                    fontFamily: 'Inter_400Regular',
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(value => !value)} style={{ position: 'absolute', right: 12, top: 12 }}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontFamily: 'Inter_700Bold' }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <Text style={{ color: colors.danger, fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 12 }}>{error}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading ? 0.72 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 }}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: 'rgba(255,255,255,0.38)',
                marginBottom: 10,
                fontFamily: 'Inter_400Regular',
              }}
            >
              Demo shortcuts
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => router.replace(routes.driverHome)}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(16,185,129,0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(16,185,129,0.35)',
                  borderRadius: 12,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.success, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>Driver Demo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.replace(routes.parentHome)}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(59,130,246,0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(59,130,246,0.35)',
                  borderRadius: 12,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.info, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>Parent Demo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
