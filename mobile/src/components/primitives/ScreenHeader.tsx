import type { ReactNode } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { colors } from '@/lib/colors'

type ScreenHeaderProps = {
  title?: string
  subtitle?: string
  action?: ReactNode
  back?: boolean
}

export function ScreenHeader({ title = 'RouteyAI', subtitle, action, back = false }: ScreenHeaderProps) {
  const router = useRouter()
  const isBrand = title === 'RouteyAI'

  return (
    <View
      style={{
        backgroundColor: colors.dark,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {back && (
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.07)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: -2 }}>←</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: back ? 16 : 19,
              fontFamily: 'Inter_800ExtraBold',
              letterSpacing: -0.4,
            }}
            numberOfLines={1}
          >
            {isBrand ? (
              <>Routey<Text style={{ color: colors.accent }}>AI</Text></>
            ) : (
              title
            )}
          </Text>
          {subtitle && (
            <Text
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: 11,
                fontFamily: 'Inter_400Regular',
                marginTop: 2,
                letterSpacing: 0.1,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {action}
      </View>
    </View>
  )
}
