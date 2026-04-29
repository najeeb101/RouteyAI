export type Role = 'driver' | 'parent'

export type TripStatus = 'idle' | 'active' | 'done'

export type Student = {
  id: string | number
  name: string
  grade: string
  initials: string
}

export type RouteStop = {
  id: number
  name: string
  eta: string
  done?: boolean
  current?: boolean
  isHome?: boolean
  isSchool?: boolean
  students: Student[]
}

export type RouteUpdateType = 'ok' | 'info' | 'warn'

export type RouteUpdate = {
  id: number
  title?: string
  from?: string
  body: string
  time: string
  type: RouteUpdateType
}
