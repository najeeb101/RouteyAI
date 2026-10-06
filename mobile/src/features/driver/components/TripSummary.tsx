import { View } from 'react-native'
import { Check } from 'lucide-react-native'
import { SignatureCard } from '@/components/brand/SignatureCard'
import { Banner } from '@/components/primitives/Banner'
import { Button } from '@/components/primitives/Button'
import { Stat } from '@/components/primitives/Stat'
import { StatusText } from '@/components/primitives/StatusText'
import { Txt } from '@/components/primitives/Txt'
import type { RunSummary } from '@/features/driver/hooks/useTrip'
import { durationLabel, timeLabel } from '@/lib/dates'
import { RUN_LABEL } from '@/lib/runs'
import { space, useTheme } from '@/lib/theme'

/**
 * Shown after the driver ends a run: times, who rode, who didn't, anyone never checked in, and in the afternoon anyone
 * still marked on the bus (flagged for the school; parents are never told they're home).
 */
export function TripSummary({ busName, summary, onDone }: { busName: string; summary: RunSummary; onDone: () => void }) {
  const t = useTheme()
  const { run, startedAt, endedAt, counts } = summary
  const morning = run === 'morning'
  const stillOnBoard = morning ? [] : counts.onBoard

  return (
    <SignatureCard style={{ gap: space.xl }}>
      <View style={{ gap: space.xs }}>
        <StatusText label={`${RUN_LABEL[run]} complete`} tone="success" onNight />
        <Txt variant="largeTitle" tone="onNight">
          {busName}
        </Txt>
        {startedAt && (
          <Txt variant="body" tone="onNightSecondary">
            {timeLabel(startedAt)} to {timeLabel(endedAt)} · {durationLabel(endedAt.getTime() - startedAt.getTime())}
          </Txt>
        )}
      </View>

      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: t.nightLine, paddingTop: space.lg }}>
        <View style={{ flex: 1 }}>
          {morning ? (
            <Stat onNight size="md" value={String(counts.rode)} suffix={`/${counts.total}`} label="Arrived at school" />
          ) : (
            <Stat onNight size="md" value={String(counts.droppedOff)} suffix={`/${counts.rode}`} label="Dropped off" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Stat onNight size="md" value={String(counts.absent)} label={morning ? 'Absent at stop' : 'Absent at school'} />
        </View>
        <View style={{ flex: 1 }}>
          <Stat onNight size="md" value={String(counts.reported)} label="Reported by parents" />
        </View>
      </View>

      {stillOnBoard.length > 0 && (
        <Banner
          tone="warning"
          text={`Still marked on the bus: ${stillOnBoard.map((s) => s.name).join(', ')}. Let the school know where they got off.`}
        />
      )}
      {counts.notChecked > 0 && (
        <Banner tone="warning" text={`${counts.notChecked} student${counts.notChecked === 1 ? ' was' : 's were'} never checked in. Let the school know if they rode.`} />
      )}
      <Button label={morning ? 'Done' : 'Done for today'} icon={Check} variant="onNight" onPress={onDone} />
    </SignatureCard>
  )
}
