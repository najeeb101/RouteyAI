// Creates (or repairs) the app-review demo school on the database in .env.local.
//
//   node scripts/review-accounts/setup.mjs
//
// App Store and Play reviewers need working sign-ins, but RouteyAI accounts only come from school invites. This sets
// up "RouteyAI Demo School" next to Aspire Zone with two buses, nine students and three accounts:
//   demo-parent@example.com  parent of two children on Bus 1 (shows the child switcher)
//   demo-driver@example.com  driver of Bus 1
//   demo-school@example.com  school admin, to manage the demo school on the web dashboard
// It never touches other schools. Safe to re-run: reviewers may try Delete account, and running this again recreates
// the deleted user, relinks the children and resets every password.
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local. The shared password is
// REVIEW_ACCOUNTS_PASSWORD there; if it's missing a random one is generated and appended. The repo is public, so the
// password must never be committed: give it to reviewers in the store consoles only.

import { randomBytes } from 'node:crypto'
import { appendFileSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const ENV_FILE = join(ROOT, '.env.local')

const env = Object.fromEntries(
  readFileSync(ENV_FILE, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
)
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')

let password = env.REVIEW_ACCOUNTS_PASSWORD
if (!password) {
  password = `Routey-${randomBytes(9).toString('base64url')}`
  appendFileSync(ENV_FILE, `\n# App-review demo accounts (scripts/review-accounts/setup.mjs). Never commit.\nREVIEW_ACCOUNTS_PASSWORD=${password}\n`)
  console.log('Generated REVIEW_ACCOUNTS_PASSWORD and saved it to .env.local')
}

const SCHOOL_ID = 'd0000000-0000-4000-8000-000000000001'
const BUS_1 = 'd0000000-0000-4000-8000-000000000101'
const BUS_2 = 'd0000000-0000-4000-8000-000000000102'
const point = (lat, lng) => `SRID=4326;POINT(${lng} ${lat})`

const ACCOUNTS = {
  parent: { email: 'demo-parent@example.com', name: 'Mariam Hassan' },
  driver: { email: 'demo-driver@example.com', name: 'Rashid Omar' },
  school: { email: 'demo-school@example.com', name: 'Sara Khalil' },
}

// [id suffix, name, area, lat, lng, bus, parent account or null]
const STUDENTS = [
  ['201', 'Yousef Hassan', 'Al Waab, Doha', 25.2603, 51.4652, BUS_1, 'parent'],
  ['202', 'Lina Hassan', 'Al Waab, Doha', 25.2606, 51.4656, BUS_1, 'parent'],
  ['203', 'Khalid Ibrahim', 'Al Aziziya, Doha', 25.2521, 51.4548, BUS_1, null],
  ['204', 'Noor Saleh', 'Fereej Al Soudan, Doha', 25.2698, 51.4889, BUS_1, null],
  ['205', 'Adam Farouk', 'Al Luqta, Doha', 25.2946, 51.4566, BUS_1, null],
  ['206', 'Huda Nasser', 'Baaya, Doha', 25.2781, 51.4431, BUS_1, null],
  ['207', 'Omar Haddad', 'Muaither North, Al Rayyan', 25.2792, 51.4172, BUS_2, null],
  ['208', 'Reem Mansour', 'Muaither, Al Rayyan', 25.2718, 51.4105, BUS_2, null],
  ['209', 'Ali Karim', 'Al Rayyan, Qatar', 25.2915, 51.4248, BUS_2, null],
]

async function api(path, { method = 'GET', body, prefer } = {}) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

const upsert = (table, rows, onConflict = 'id') =>
  api(`/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    body: rows,
    prefer: 'resolution=merge-duplicates,return=minimal',
  })

// Accounts: create, or reset the password and name of an existing one.
const { users } = await api('/auth/v1/admin/users?page=1&per_page=1000')
const ids = {}
for (const [key, { email, name }] of Object.entries(ACCOUNTS)) {
  const existing = users.find((u) => u.email === email)
  const attrs = { password, email_confirm: true, user_metadata: { full_name: name } }
  const user = existing
    ? await api(`/auth/v1/admin/users/${existing.id}`, { method: 'PUT', body: attrs })
    : await api('/auth/v1/admin/users', { method: 'POST', body: { email, ...attrs } })
  ids[key] = user.id
  console.log(`${existing ? 'updated' : 'created'} ${email}`)
}

await upsert('schools', [{
  id: SCHOOL_ID,
  name: 'RouteyAI Demo School',
  address: 'Aspire Zone, Al Waab, Doha, Qatar',
  starting_point: point(25.2668, 51.4456),
  created_by: ids.school,
}])

await upsert('user_roles', [
  { user_id: ids.school, role: 'school_admin', school_id: SCHOOL_ID },
  { user_id: ids.driver, role: 'driver', school_id: SCHOOL_ID },
  { user_id: ids.parent, role: 'parent', school_id: SCHOOL_ID },
], 'user_id,school_id')

await upsert('buses', [
  { id: BUS_1, school_id: SCHOOL_ID, name: 'Bus 1', capacity: 30, driver_id: ids.driver, color: '#1E3A8A', is_active: true },
  { id: BUS_2, school_id: SCHOOL_ID, name: 'Bus 2', capacity: 30, driver_id: null, color: '#10B981', is_active: true },
])

await upsert('students', STUDENTS.map(([suffix, name, area, lat, lng, bus, parent]) => ({
  id: `d0000000-0000-4000-8000-000000000${suffix}`,
  school_id: SCHOOL_ID,
  name,
  parent_id: parent ? ids[parent] : null,
  home_address: area,
  home_location: point(lat, lng),
  bus_id: bus,
})))
console.log(`school, 2 buses, ${STUDENTS.length} students`)

// Routes: the same Edge Function the dashboard calls, one bus at a time so no other school is touched.
for (const bus of [BUS_1, BUS_2]) {
  const res = await api('/functions/v1/optimize-route', { method: 'POST', body: { bus_id: bus } })
  const route = res?.results?.[0] ?? res
  console.log(`route for ${bus === BUS_1 ? 'Bus 1' : 'Bus 2'}: ${route?.stop_count ?? '?'} stops, ${route?.distance_km ?? '?'} km`)
}

const welcome = await api(`/rest/v1/announcements?school_id=eq.${SCHOOL_ID}&select=id&limit=1`)
if (welcome.length === 0) {
  await api('/rest/v1/announcements', {
    method: 'POST',
    body: { school_id: SCHOOL_ID, bus_id: null, sender_id: ids.school, message: 'Welcome to RouteyAI Demo School. Bus 1 runs the morning route from 6:45.' },
    prefer: 'return=minimal',
  })
  console.log('welcome announcement')
}

console.log('\nDone. Sign in with:')
for (const { email } of Object.values(ACCOUNTS)) console.log(`  ${email}`)
console.log('Password: REVIEW_ACCOUNTS_PASSWORD in .env.local')
