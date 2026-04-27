import type { RouteStop, RouteUpdate } from '@/types/route'

export const driverProfile = {
  name: 'Mohammed Al-Rashid',
  school: 'Al Nour International',
  bus: 'Bus #3',
  route: 'Route A',
  run: 'Morning Run',
}

export const parentChild = {
  name: 'Aisha Rahman',
  grade: 'Grade 4',
  initials: 'AR',
  bus: driverProfile.bus,
  route: driverProfile.route,
  status: 'Boarded',
}

export const routeStops: RouteStop[] = [
  {
    id: 1,
    name: 'Lusail Blvd',
    eta: '7:42 AM',
    done: true,
    isHome: true,
    students: [
      { id: 1, name: 'Aisha Rahman', grade: 'G4', initials: 'AR' },
      { id: 2, name: 'Yusuf Al-Ali', grade: 'G8', initials: 'YA' },
    ],
  },
  {
    id: 2,
    name: 'West Bay',
    eta: '7:38 AM',
    done: true,
    students: [{ id: 3, name: 'Tariq Hassan', grade: 'G6', initials: 'TH' }],
  },
  {
    id: 3,
    name: 'C-Ring Rd',
    eta: '7:51 AM',
    current: true,
    students: [
      { id: 4, name: 'Hana Zayed', grade: 'G5', initials: 'HZ' },
      { id: 5, name: 'Bilal Saleh', grade: 'G3', initials: 'BS' },
    ],
  },
  {
    id: 4,
    name: 'Al Waab St',
    eta: '7:58 AM',
    students: [{ id: 6, name: 'Omar Khalil', grade: 'G5', initials: 'OK' }],
  },
  {
    id: 5,
    name: 'Al Nour School',
    eta: '8:10 AM',
    isSchool: true,
    students: [],
  },
]

export const driverMessages: RouteUpdate[] = [
  {
    id: 1,
    from: 'School Admin',
    body: 'Route D is at capacity. Please proceed on schedule.',
    time: '7:52 AM',
    type: 'warn',
  },
  {
    id: 2,
    from: 'School Admin',
    body: 'Sara Al-Farsi (Bus #7) marked absent by parent.',
    time: '7:44 AM',
    type: 'info',
  },
  {
    id: 3,
    from: 'School Admin',
    body: 'Morning routes started. All buses confirmed active.',
    time: '7:31 AM',
    type: 'ok',
  },
]

export const parentUpdates: RouteUpdate[] = [
  {
    id: 1,
    title: 'Aisha has boarded',
    body: 'Aisha Rahman boarded Bus #3 at Lusail Blvd at 7:42 AM.',
    time: '7:42 AM',
    type: 'ok',
  },
  {
    id: 2,
    title: 'Bus #3 is on the way',
    body: 'Bus #3 started the morning route. ETA to your stop: 7:42 AM.',
    time: '7:31 AM',
    type: 'info',
  },
  {
    id: 3,
    title: 'Driver confirmed',
    body: 'Mohammed Al-Rashid confirmed on duty for Route A this morning.',
    time: '7:10 AM',
    type: 'info',
  },
  {
    id: 4,
    title: 'Route A - Yesterday',
    body: 'Aisha arrived at school at 8:08 AM yesterday. On time.',
    time: 'Yesterday',
    type: 'ok',
  },
]
