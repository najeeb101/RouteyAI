import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Redirect } from 'expo-router'
import { routes } from '@/lib/navigation/routes'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'

type Target = typeof routes.login | typeof routes.driverHome | typeof routes.parentHome

/** Opens the driver or parent app for someone already signed in (the session is kept on the phone), otherwise login. */
export default function Index() {
  const t = useTheme()
  const [target, setTarget] = useState<Target | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        if (!cancelled) setTarget(routes.login)
        return
      }
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).maybeSingle()
      const role = (data as { role?: string } | null)?.role
      if (!cancelled) setTarget(role === 'driver' ? routes.driverHome : role === 'parent' ? routes.parentHome : routes.login)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!target) {
    return (
      <View style={{ flex: 1, backgroundColor: t.canvas, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={t.brand} />
      </View>
    )
  }
  return <Redirect href={target} />
}
