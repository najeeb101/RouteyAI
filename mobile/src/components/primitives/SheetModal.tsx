import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'
import { Icon } from '@/components/primitives/Icon'
import { Txt } from '@/components/primitives/Txt'
import { gutter, radius, space, useTheme } from '@/lib/theme'

type SheetModalProps = {
  visible: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  /** Pinned under the scrolling content, e.g. the main button. */
  footer?: ReactNode
}

/** Bottom sheet for short tasks (report an absence, tell parents about a delay). Tap outside or the X to close. */
export function SheetModal({ visible, title, subtitle, onClose, children, footer }: SheetModalProps) {
  const insets = useSafeAreaInsets()
  const t = useTheme()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* A translucent-status-bar modal doesn't resize for the keyboard on Android, so pad on both platforms. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable onPress={onClose} accessibilityLabel="Close" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: t.scrim }} />
          <View
            style={{
              backgroundColor: t.surface,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              maxHeight: '88%',
              paddingBottom: Math.max(insets.bottom, space.lg),
            }}
          >
            <View style={{ alignItems: 'center', paddingTop: space.sm }}>
              <View style={{ width: 36, height: 5, borderRadius: radius.full, backgroundColor: t.separator }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingHorizontal: gutter, paddingTop: space.md, paddingBottom: space.xs }}>
              <View style={{ flex: 1, gap: space.xs - 2 }}>
                <Txt variant="title">{title}</Txt>
                {subtitle && (
                  <Txt variant="body" tone="inkSecondary">
                    {subtitle}
                  </Txt>
                )}
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                style={({ pressed }) => ({ width: 32, height: 32, borderRadius: radius.full, backgroundColor: pressed ? t.separator : t.canvas, alignItems: 'center', justifyContent: 'center' })}
              >
                <Icon icon={X} size={18} color={t.inkSecondary} strokeWidth={2} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space.md, paddingBottom: space.sm, gap: space.xl }} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
            {footer && <View style={{ paddingHorizontal: gutter, paddingTop: space.md }}>{footer}</View>}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

/** A short label above a group of choices inside a sheet (sentence case). */
export function SheetLabel({ children }: { children: ReactNode }) {
  return (
    <Txt variant="subhead" tone="inkSecondary" style={{ marginBottom: space.sm }}>
      {children}
    </Txt>
  )
}
