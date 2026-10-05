import { Armchair, Bus, Route, School } from 'lucide-react-native'
import { AccountScreen } from '@/features/account/AccountScreen'
import { useDriverContext } from '@/features/driver/context/DriverDataContext'

export function DriverAccountScreen() {
  const { profile, stops, totalStudents } = useDriverContext()

  return (
    <AccountScreen
      role="driver"
      name={profile?.driverName ?? null}
      email={profile?.email ?? null}
      notificationHint="Messages from your school, for example a change to today's route."
      sections={
        profile
          ? [
              {
                title: 'Your bus',
                rows: [
                  { icon: Bus, label: 'Bus', value: profile.busName },
                  { icon: Armchair, label: 'Seats', value: `${profile.capacity}` },
                  { icon: Route, label: 'Route', value: `${stops.length} stops · ${totalStudents} students` },
                  { icon: School, label: 'School', value: profile.schoolName },
                ],
              },
            ]
          : []
      }
    />
  )
}
