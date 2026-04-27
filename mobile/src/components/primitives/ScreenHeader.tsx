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

  return (
    <View style={{ backgroundColor: colors.dark, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {back && (
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold' }}>{'<'}</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: back ? 16 : 18, fontFamily: 'Inter_800ExtraBold' }}>
            {title === 'RouteyAI' ? (
              <>
                Routey<Text style={{ color: colors.accent }}>AI</Text>
              </>
            ) : (
              title
            )}
          </Text>
          {subtitle && (
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>

        {action}
      </View>
    </View>
  )
}
