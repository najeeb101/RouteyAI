import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/lib/colors'

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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* A translucent-status-bar modal doesn't resize for the keyboard on Android, so pad on both platforms. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close"
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(15,23,42,0.45)' }}
          />
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              maxHeight: '88%',
              paddingBottom: Math.max(insets.bottom, 16),
            }}
          >
            <View style={{ alignItems: 'center', paddingTop: 10 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 19, color: colors.dark, letterSpacing: -0.3 }}>{title}</Text>
                {subtitle && (
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.muted, marginTop: 3, lineHeight: 19 }}>{subtitle}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                accessibilityLabel="Close"
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8, gap: 18 }} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
            {footer && <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>{footer}</View>}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

/** A small uppercase label above a group of choices inside a sheet. */
export function SheetLabel({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontFamily: 'Inter_700Bold',
        color: colors.subtle,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  )
}
