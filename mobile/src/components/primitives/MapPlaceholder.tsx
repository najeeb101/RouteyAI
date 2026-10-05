import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/lib/colors'

/** Stands in for the Mapbox map in Expo Go, which has no Mapbox native code (see lib/mapbox). */
export function MapPlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 24, backgroundColor: colors.borderLight }}>
      <Ionicons name="map-outline" size={compact ? 24 : 32} color={colors.subtle} />
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.dark }}>Map shows in the full app</Text>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, textAlign: 'center', maxWidth: 260 }}>
        Expo Go can&apos;t draw Mapbox maps. Everything else on this screen works.
      </Text>
    </View>
  )
}
