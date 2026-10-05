import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { Icon } from '@/components/primitives/Icon'
import { Txt } from '@/components/primitives/Txt'
import { gutter, minTouch, radius, space, useTheme } from '@/lib/theme'

type ScreenHeaderProps = {
  title: string
  subtitle?: string
  /** Shown to the right of the title, e.g. an IconButton. */
  action?: ReactNode
  back?: boolean
}

/** iOS-style large title on the canvas, with an optional back button above it and an action beside it. */
export function ScreenHeader({ title, subtitle, action, back = false }: ScreenHeaderProps) {
  const router = useRouter()
  const t = useTheme()

  return (
    <View style={{ paddingHorizontal: gutter, paddingTop: back ? space.xs : space.md, paddingBottom: space.md, backgroundColor: t.canvas }}>
      {back && (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => ({ width: minTouch, height: minTouch, marginLeft: -space.md, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, opacity: pressed ? 0.5 : 1 })}
        >
          <Icon icon={ChevronLeft} size={28} color={t.brand} strokeWidth={2} />
        </Pressable>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md }}>
        <View style={{ flex: 1 }}>
          <Txt variant="largeTitle" numberOfLines={1} accessibilityRole="header">
            {title}
          </Txt>
          {subtitle && (
            <Txt variant="subhead" tone="inkSecondary" numberOfLines={1} style={{ marginTop: 2 }}>
              {subtitle}
            </Txt>
          )}
        </View>
        {action}
      </View>
    </View>
  )
}
