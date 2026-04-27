import { Redirect } from 'expo-router'
import { routes } from '@/lib/navigation/routes'

export default function Index() {
  return <Redirect href={routes.login} />
}
