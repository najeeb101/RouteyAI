import { AccountScreen } from '@/features/account/AccountScreen'
import { useParentContext } from '@/features/parent/context/ParentDataContext'

export function ParentAccountScreen() {
  const { parentName, email, children } = useParentContext()

  return (
    <AccountScreen
      role="parent"
      name={parentName}
      email={email}
      notificationHint="When your child boards or is marked absent, when the bus is about 5 minutes away, and updates from the driver or school."
      sections={[
        {
          title: children.length === 1 ? 'Your child' : 'Your children',
          rows: children.map((c) => ({
            icon: 'person-outline' as const,
            label: c.name,
            value: [c.busName ?? 'No bus yet', c.schoolName].filter(Boolean).join(' · '),
          })),
        },
      ]}
    />
  )
}
