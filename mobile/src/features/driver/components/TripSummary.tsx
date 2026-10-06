import { View } from 'react-native'
import { RotateCcw } from 'lucide-react-native'
import { SignatureCard } from '@/components/brand/SignatureCard'
import { Banner } from '@/components/primitives/Banner'
import { Button } from '@/components/primitives/Button'
import { Stat } from '@/components/primitives/Stat'
import { StatusText } from '@/components/primitives/StatusText'
import { Txt } from '@/components/primitives/Txt'
import { durationLabel, timeLabel } from '@/lib/dates'
import { space, useTheme } from '@/lib/theme'

type TripSummaryProps = {
  busName: string
  startedAt: Date | null
  endedAt: Date | null
  total: number
  boarded: number
  absent: number
  reported: number
  stopsDone: number
  stopCount: number
  onNewRoute: () => void
}

/** Shown after the driver ends the route: times, who rode, who didn't, and anyone never checked in. */
export function TripSummary({ busName, startedAt, endedAt, total, boarded, absent, reported, stopsDone, stopCount, onNewRoute }: TripSummaryProps) {
  const t = useTheme()
  const notChecked = Math.max(0, total - boarded - absent - reported)

  return (
    <SignatureCard style={{ gap: space.xl }}>
      <View style={{ gap: space.xs }}>
        <StatusText label="Route complete" tone="success" onNight />
        <Txt variant="largeTitle" tone="onNight">
          {busName}
        </Txt>
        {startedAt && endedAt && (
          <Txt variant="body" tone="onNightSecondary">
            {timeLabel(startedAt)} to {timeLabel(endedAt)} · {durationLabel(endedAt.getTime() - startedAt.getTime())} · {stopsDone} of {stopCount} stops
          </Txt>
        )}
      </View>

      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: t.nightLine, paddingTop: space.lg }}>
        <View style={{ flex: 1 }}>
          <Stat onNight size="md" value={String(boarded)} suffix={`/${total}`} label="Rode the bus" />
        </View>
        <View style={{ flex: 1 }}>
          <Stat onNight size="md" value={String(absent)} label="Absent at stop" />
        </View>
        <View style={{ flex: 1 }}>
          <Stat onNight size="md" value={String(reported)} label="Reported by parents" />
        </View>
      </View>

      {notChecked > 0 && <Banner tone="warning" text={`${notChecked} student${notChecked === 1 ? ' was' : 's were'} never checked in. Let the school know if they rode.`} />}
      <Button label="Start a new route" icon={RotateCcw} variant="onNight" onPress={onNewRoute} />
    </SignatureCard>
  )
}
