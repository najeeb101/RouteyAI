/**
 * Date helpers that don't depend on Intl (Hermes on Android ships limited locale data).
 * Dates are 'YYYY-MM-DD' keys in the phone's local time, matching the `date` columns.
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const LONG_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const

export function localDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function addDays(key: string, days: number): string {
  const date = dateFromKey(key)
  date.setDate(date.getDate() + days)
  return localDateKey(date)
}

/** The school week in Qatar runs Sunday to Thursday. */
export function isSchoolDay(key: string): boolean {
  const day = dateFromKey(key).getDay()
  return day !== 5 && day !== 6
}

/** The next `count` school days, starting today (if it is one). */
export function upcomingSchoolDays(count: number, from: string = localDateKey()): string[] {
  const days: string[] = []
  let key = from
  while (days.length < count) {
    if (isSchoolDay(key)) days.push(key)
    key = addDays(key, 1)
  }
  return days
}

/** "Today", "Tomorrow", "Yesterday" or "Sun 5 Oct". */
export function dayLabel(key: string, today: string = localDateKey()): string {
  if (key === today) return 'Today'
  if (key === addDays(today, 1)) return 'Tomorrow'
  if (key === addDays(today, -1)) return 'Yesterday'
  return shortDate(key)
}

export function shortDate(key: string): string {
  const date = dateFromKey(key)
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

/** "Monday 5 October". */
export function longDate(key: string = localDateKey()): string {
  const date = dateFromKey(key)
  return `${LONG_WEEKDAYS[date.getDay()]} ${date.getDate()} ${LONG_MONTHS[date.getMonth()]}`
}

/** "6:52 AM" from an ISO timestamp. */
export function timeLabel(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`
}

/** "1 h 12 min" or "35 min". */
export function durationLabel(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60000))
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours} h ${minutes % 60} min` : `${minutes} min`
}

/** "6:52 AM" for today, otherwise "Yesterday, 6:52 AM" or "Sun 5 Oct, 6:52 AM". */
export function whenLabel(iso: string, today: string = localDateKey()): string {
  const day = localDateKey(new Date(iso))
  return day === today ? timeLabel(iso) : `${dayLabel(day, today)}, ${timeLabel(iso)}`
}

/** For sentences: "today", "tomorrow" or "on Sun 4 Oct". */
export function dayPhrase(key: string, today: string = localDateKey()): string {
  const label = dayLabel(key, today)
  return label === 'Today' || label === 'Tomorrow' || label === 'Yesterday' ? label.toLowerCase() : `on ${label}`
}
