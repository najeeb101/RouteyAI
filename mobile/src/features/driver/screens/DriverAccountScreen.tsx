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
                  { icon: 'bus-outline', label: 'Bus', value: profile.busName },
                  { icon: 'people-outline', label: 'Seats', value: `${profile.capacity}` },
                  { icon: 'location-outline', label: 'Route', value: `${stops.length} stops · ${totalStudents} students` },
                  { icon: 'school-outline', label: 'School', value: profile.schoolName },
                ],
              },
            ]
          : []
      }
    />
  )
}
