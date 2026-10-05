import { Children, Fragment, isValidElement, type ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { ChevronRight, ExternalLink, type LucideIcon } from 'lucide-react-native'
import { Icon } from '@/components/primitives/Icon'
import { Txt } from '@/components/primitives/Txt'
import { fonts, radius, space, useTheme } from '@/lib/theme'

/** Where a row's text starts when it has a 21 pt icon: padding + icon + gap. */
const ROW_TEXT_INSET = space.lg + 21 + space.md

/** A grouped, inset list (iOS Settings style): optional header and footer, rows split by hairlines. */
export function ListSection({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const t = useTheme()
  const rows = Children.toArray(children).filter(isValidElement)
  // Hairlines start where the text starts, like iOS: past the icon when the rows have one.
  const withIcons = rows.some((row) => Boolean((row.props as { icon?: unknown; leading?: unknown }).icon ?? (row.props as { leading?: unknown }).leading))
  return (
    <View style={{ gap: space.sm }}>
      {title && (
        <Txt variant="subhead" tone="inkSecondary" style={{ paddingHorizontal: space.lg }}>
          {title}
        </Txt>
      )}
      <View style={{ backgroundColor: t.surface, borderRadius: radius.md, overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <Fragment key={row.key ?? i}>
            {i > 0 && <View style={{ height: 1, backgroundColor: t.separator, marginLeft: withIcons ? ROW_TEXT_INSET : space.lg }} />}
            {row}
          </Fragment>
        ))}
      </View>
      {footer && (
        <Txt variant="caption" tone="inkSecondary" style={{ paddingHorizontal: space.lg }}>
          {footer}
        </Txt>
      )}
    </View>
  )
}

type ListRowProps = {
  title: string
  /** Lines the title may wrap to (default 2). */
  titleLines?: number
  subtitle?: string
  icon?: LucideIcon
  /** Custom content on the left instead of an icon, e.g. an Avatar. */
  leading?: ReactNode
  /** Text on the right. */
  value?: string
  /** What sits at the far right: a chevron, an external-link mark, or any element (a Switch). */
  accessory?: 'chevron' | 'external' | ReactNode
  destructive?: boolean
  /** Brand-coloured icon and title, for "add" rows like Report an absence. */
  accent?: boolean
  onPress?: () => void
}

/** One row of a ListSection. Tappable when onPress is set. */
export function ListRow({ title, titleLines = 2, subtitle, icon, leading, value, accessory, destructive = false, accent = false, onPress }: ListRowProps) {
  const t = useTheme()
  const ink = destructive ? t.dangerText : accent ? t.brand : undefined
  const trailing =
    accessory === 'chevron' ? <Icon icon={ChevronRight} size={18} color={t.inkTertiary} /> : accessory === 'external' ? <Icon icon={ExternalLink} size={17} color={t.inkTertiary} /> : accessory

  const content = (pressed: boolean) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52, paddingHorizontal: space.lg, paddingVertical: space.md, backgroundColor: pressed ? t.canvas : t.surface }}>
      {leading ?? (icon && <Icon icon={icon} size={21} color={ink ?? t.inkSecondary} />)}
      <View style={{ flex: 1, gap: 1 }}>
        <Txt variant="body" color={ink} numberOfLines={titleLines}>
          {title}
        </Txt>
        {subtitle && (
          <Txt variant="subhead" tone="inkSecondary" style={{ fontFamily: fonts.regular }}>
            {subtitle}
          </Txt>
        )}
      </View>
      {value && (
        <Txt variant="subhead" tone="inkSecondary" numberOfLines={1} style={{ maxWidth: '50%', fontFamily: fonts.regular }}>
          {value}
        </Txt>
      )}
      {trailing}
    </View>
  )

  if (!onPress) return content(false)
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      {({ pressed }) => content(pressed)}
    </Pressable>
  )
}
