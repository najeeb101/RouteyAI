import { View } from 'react-native'
import { Map } from 'lucide-react-native'
import { Icon } from '@/components/primitives/Icon'
import { Txt } from '@/components/primitives/Txt'
import { space, useTheme } from '@/lib/theme'

/** Stands in for the Mapbox map in Expo Go and the web preview, which have no Mapbox native code (see lib/mapbox). */
export function MapPlaceholder({ compact = false }: { compact?: boolean }) {
  const t = useTheme()
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xs + 2, padding: space.xxl, backgroundColor: t.separator }}>
      <Icon icon={Map} size={compact ? 24 : 32} color={t.inkTertiary} />
      <Txt variant="headline">Map shows in the full app</Txt>
      <Txt variant="subhead" tone="inkSecondary" align="center" style={{ maxWidth: 260 }}>
        Expo Go can&apos;t draw Mapbox maps. Everything else on this screen works.
      </Txt>
    </View>
  )
}
