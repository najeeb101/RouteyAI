import { Linking, Pressable, View } from 'react-native'
import { Txt } from '@/components/primitives/Txt'
import { SITE_URL } from '@/lib/site'
import { space } from '@/lib/theme'

/** "Terms of Service · Privacy Policy", each opening the website page in the browser. Big enough to tap. */
export function LegalLinks() {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.xl }}>
      <LegalLink label="Terms of Service" path="/terms" />
      <LegalLink label="Privacy Policy" path="/privacy" />
    </View>
  )
}

function LegalLink({ label, path }: { label: string; path: string }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(`${SITE_URL}${path}`)}
      accessibilityRole="link"
      accessibilityLabel={`${label}, opens in your browser`}
      hitSlop={8}
      style={{ minHeight: 44, justifyContent: 'center' }}
    >
      <Txt variant="subhead" tone="brand">
        {label}
      </Txt>
    </Pressable>
  )
}
