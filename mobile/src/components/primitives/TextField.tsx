import { useState } from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'
import { Txt } from '@/components/primitives/Txt'
import { fonts, radius, space, useTheme } from '@/lib/theme'

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string
  /** Password field with a Show / Hide button. */
  secure?: boolean
}

/** Labelled input: label above, 50 pt field (taller when multiline), brand outline while focused. */
export function TextField({ label, secure = false, ...input }: TextFieldProps) {
  const multiline = Boolean(input.multiline)
  const t = useTheme()
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(true)

  return (
    <View style={{ gap: space.xs + 2 }}>
      <Txt variant="subhead">{label}</Txt>
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          ...(multiline ? { minHeight: 88 } : { height: 50 }),
          borderRadius: radius.md,
          borderWidth: focused ? 1.5 : 1,
          borderColor: focused ? t.brand : t.separator,
          backgroundColor: t.surface,
          paddingHorizontal: space.lg,
        }}
      >
        <TextInput
          {...input}
          secureTextEntry={secure && hidden}
          placeholderTextColor={t.inkTertiary}
          onFocus={(e) => {
            setFocused(true)
            input.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            input.onBlur?.(e)
          }}
          accessibilityLabel={label}
          maxFontSizeMultiplier={1.3}
          style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15, color: t.ink, ...(multiline ? { minHeight: 88, paddingVertical: space.md, textAlignVertical: 'top' } : { height: '100%' }) }}
        />
        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} accessibilityRole="button" hitSlop={10}>
            <Txt variant="subhead" tone="brand">
              {hidden ? 'Show' : 'Hide'}
            </Txt>
          </Pressable>
        )}
      </View>
    </View>
  )
}
