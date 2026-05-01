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

type RoleOption = { role: Role; label: string; icon: string; color: string; bg: string; border: string }
const ROLE_OPTIONS: RoleOption[] = [
  { role: 'parent', label: 'Parent', icon: '👨‍👧', color: colors.info, bg: colors.infoBg, border: 'rgba(59,130,246,0.35)' },
  { role: 'driver', label: 'Driver', icon: '🚌', color: colors.success, bg: colors.successBg, border: 'rgba(16,185,129,0.35)' },
]

export function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('parent')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)

    if (hasSupabaseEnv && email && password) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('Sign in failed. Check your email and password.')
        setLoading(false)
        return
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 600))
    }

    setLoading(false)
    router.replace(selectedRole === 'driver' ? routes.driverHome : routes.parentHome)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.dark }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Brand Header ── */}
          <View style={{ alignItems: 'center', paddingTop: 52, paddingBottom: 36 }}>
            {/* App icon */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                shadowColor: colors.accent,
                shadowOpacity: 0.4,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 6 },
                borderWidth: 1,
                borderColor: 'rgba(0,212,255,0.25)',
              }}
            >
              <Text style={{ fontSize: 38 }}>🚌</Text>
            </View>

            <Text style={{ fontSize: 30, fontFamily: 'Inter_800ExtraBold', color: '#FFFFFF', letterSpacing: -0.8 }}>
              Routey<Text style={{ color: colors.accent }}>AI</Text>
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, fontFamily: 'Inter_400Regular', letterSpacing: 0.2 }}>
              Smart routing · Real-time tracking
            </Text>

            {/* Decorative dots */}
            <View style={{ flexDirection: 'row', gap: 5, marginTop: 18 }}>
              {[colors.accent, 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'].map((c, i) => (
                <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
              ))}
            </View>
          </View>

          {/* ── Login Card ── */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 28,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.3,
              shadowRadius: 32,
              elevation: 16,
            }}
          >
            <Text style={{ fontSize: 22, fontFamily: 'Inter_800ExtraBold', color: colors.dark, marginBottom: 2, letterSpacing: -0.4 }}>
              Welcome back
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 22, fontFamily: 'Inter_400Regular' }}>
              Sign in to your account to continue
            </Text>

            {/* Role Selector */}
            <Text
              style={{
                fontSize: 10,
                fontFamily: 'Inter_700Bold',
                color: colors.subtle,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              I am a
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
              {ROLE_OPTIONS.map(item => {
                const active = selectedRole === item.role
                return (
                  <TouchableOpacity
                    key={item.role}
                    onPress={() => setSelectedRole(item.role)}
                    activeOpacity={0.75}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: active ? item.color : colors.border,
                      backgroundColor: active ? item.bg : '#FAFAFA',
                      alignItems: 'center',
                      gap: 4,
                      shadowColor: active ? item.color : 'transparent',
                      shadowOpacity: active ? 0.2 : 0,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 3 },
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: active ? 'Inter_700Bold' : 'Inter_500Medium',
                        color: active ? item.color : colors.muted,
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Email Field */}
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Inter_700Bold',
                  color: colors.subtle,
                  marginBottom: 7,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: emailFocused ? 1.5 : 1,
                  borderColor: emailFocused ? colors.primary : colors.border,
                  borderRadius: 14,
                  backgroundColor: emailFocused ? '#F8FAFF' : '#FAFAFA',
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 8, opacity: 0.6 }}>✉️</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.subtle}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    fontSize: 14,
                    color: colors.dark,
                    fontFamily: 'Inter_400Regular',
                  }}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Inter_700Bold',
                  color: colors.subtle,
                  marginBottom: 7,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: passwordFocused ? 1.5 : 1,
                  borderColor: passwordFocused ? colors.primary : colors.border,
                  borderRadius: 14,
                  backgroundColor: passwordFocused ? '#F8FAFF' : '#FAFAFA',
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 8, opacity: 0.6 }}>🔒</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={colors.subtle}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    fontSize: 14,
                    color: colors.dark,
                    fontFamily: 'Inter_400Regular',
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ color: colors.muted, fontSize: 14, fontFamily: 'Inter_500Medium' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 8,
                  backgroundColor: colors.dangerBg,
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.25)',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 14,
                }}
              >
                <Text style={{ fontSize: 14 }}>⚠️</Text>
                <Text style={{ color: colors.danger, fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1 }}>{error}</Text>
              </View>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 16,
                paddingVertical: 15,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading ? 0.75 : 1,
                shadowColor: colors.primary,
                shadowOpacity: 0.45,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 16, letterSpacing: 0.2 }}>
                  Sign In →
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Demo Shortcuts ── */}
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter_500Medium' }}>Demo shortcuts</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => router.replace(routes.driverHome)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(16,185,129,0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(16,185,129,0.3)',
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 20 }}>🚌</Text>
                <Text style={{ color: colors.success, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>Driver Demo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.replace(routes.parentHome)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(59,130,246,0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(59,130,246,0.3)',
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 20 }}>👨‍👧</Text>
                <Text style={{ color: colors.info, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>Parent Demo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 24, fontFamily: 'Inter_400Regular' }}>
            RouteyAI · Doha, Qatar
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
