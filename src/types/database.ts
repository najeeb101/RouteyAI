export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Role = 'platform_admin' | 'school_admin' | 'driver' | 'parent'
export type AttendanceStatus = 'boarded' | 'absent'
export type InviteRole = 'school_admin' | 'driver' | 'parent'
export type AbsenceReason = 'sick' | 'appointment' | 'travel' | 'other'

/** JSONB returned by the redeem_invite RPC (supabase/migrations/0002_invites.sql). */
export type RedeemInviteResult =
  | { error: 'invite_not_found' | 'invite_already_used' | 'invite_expired' }
  | { role: InviteRole; school_id: string | null; bus_id: string | null }

export interface RouteWaypoint {
  lat: number
  lng: number
  student_id: string
  stop_order: number
  eta_offset_min: number
}

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          address: string
          starting_point: unknown // PostGIS GEOGRAPHY
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          starting_point: unknown
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          starting_point?: unknown
          created_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: Role
          school_id: string | null
          push_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: Role
          school_id?: string | null
          push_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: Role
          school_id?: string | null
          push_token?: string | null
        }
        Relationships: []
      }
      buses: {
        Row: {
          id: string
          school_id: string
          name: string
          capacity: number
          driver_id: string | null
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          capacity?: number
          driver_id?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          capacity?: number
          driver_id?: string | null
          color?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          school_id: string
          name: string
          parent_id: string | null
          home_address: string
          home_location: unknown // PostGIS GEOGRAPHY
          bus_id: string | null
          stop_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          parent_id?: string | null
          home_address: string
          home_location: unknown
          bus_id?: string | null
          stop_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          parent_id?: string | null
          home_address?: string
          home_location?: unknown
          bus_id?: string | null
          stop_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          id: string
          school_id: string
          bus_id: string
          waypoints: RouteWaypoint[]
          total_distance_km: number | null
          total_duration_min: number | null
          encoded_polyline: string | null
          optimized_at: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          bus_id: string
          waypoints?: RouteWaypoint[]
          total_distance_km?: number | null
          total_duration_min?: number | null
          encoded_polyline?: string | null
          optimized_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          bus_id?: string
          waypoints?: RouteWaypoint[]
          total_distance_km?: number | null
          total_duration_min?: number | null
          encoded_polyline?: string | null
          optimized_at?: string
        }
        Relationships: []
      }
      bus_locations: {
        Row: {
          id: string
          bus_id: string
          location: unknown // PostGIS GEOGRAPHY
          heading: number | null
          speed: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          bus_id: string
          location: unknown
          heading?: number | null
          speed?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          bus_id?: string
          location?: unknown
          heading?: number | null
          speed?: number | null
          timestamp?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          school_id: string | null
          bus_id: string | null
          sender_id: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id?: string | null
          bus_id?: string | null
          sender_id?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string | null
          bus_id?: string | null
          sender_id?: string | null
          message?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          id: string
          student_id: string | null
          bus_id: string | null
          status: AttendanceStatus | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id?: string | null
          bus_id?: string | null
          status?: AttendanceStatus | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string | null
          bus_id?: string | null
          status?: AttendanceStatus | null
          date?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          id: string
          code: string
          role: InviteRole
          school_id: string | null
          bus_id: string | null
          student_ids: string[]
          created_by: string | null
          expires_at: string
          used_at: string | null
          used_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          role: InviteRole
          school_id?: string | null
          bus_id?: string | null
          student_ids?: string[]
          created_by?: string | null
          expires_at?: string
          used_at?: string | null
          used_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          role?: InviteRole
          school_id?: string | null
          bus_id?: string | null
          student_ids?: string[]
          expires_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      absence_reports: {
        Row: {
          id: string
          student_id: string
          school_id: string
          date: string
          reason: AbsenceReason
          note: string | null
          reported_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          /** Set by a trigger from the student; any value sent is replaced. */
          school_id?: string
          date: string
          reason?: AbsenceReason
          note?: string | null
          reported_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          school_id?: string
          date?: string
          reason?: AbsenceReason
          note?: string | null
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          id: string
          full_name: string
          school_name: string
          email: string
          phone: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          school_name: string
          email: string
          phone?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          school_name?: string
          email?: string
          phone?: string | null
          notes?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_user_role: { Args: Record<PropertyKey, never>; Returns: Role }
      get_user_school_id: { Args: Record<PropertyKey, never>; Returns: string }
      redeem_invite: { Args: { p_code: string; p_user_id: string }; Returns: Json }
      // 0013_absence_reports.sql
      set_push_token: { Args: { p_token: string | null }; Returns: undefined }
      // 0005_admin_helpers.sql
      get_platform_stats: { Args: Record<PropertyKey, never>; Returns: Json }
      get_schools_with_admins: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          address: string
          created_at: string
          bus_count: number
          student_count: number
          admin_name: string | null
          admin_email: string | null
        }[]
      }
      create_school: { Args: { p_name: string; p_address: string; p_lat?: number; p_lng?: number }; Returns: string }
      generate_school_admin_invite: { Args: { p_school_id: string }; Returns: string }
      // 0006_school_helpers.sql
      get_school_info: { Args: Record<PropertyKey, never>; Returns: Json }
      get_school_stats: { Args: Record<PropertyKey, never>; Returns: Json }
      get_buses_with_drivers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          school_id: string
          name: string
          capacity: number
          driver_id: string | null
          driver_name: string | null
          driver_email: string | null
          color: string
          is_active: boolean
          student_count: number
          created_at: string
        }[]
      }
      get_students_with_bus: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          school_id: string
          name: string
          home_address: string
          bus_id: string | null
          bus_name: string | null
          stop_order: number | null
          created_at: string
        }[]
      }
      get_recent_announcements: {
        Args: { p_limit?: number }
        Returns: {
          id: string
          message: string
          bus_id: string | null
          bus_name: string | null
          created_at: string
        }[]
      }
      create_bus: { Args: { p_name: string; p_capacity?: number; p_color?: string }; Returns: string }
      add_student: {
        Args: { p_name: string; p_home_address: string; p_lat?: number; p_lng?: number; p_bus_id?: string | null }
        Returns: string
      }
      generate_driver_invite: { Args: { p_bus_id: string }; Returns: string }
      generate_parent_invite: { Args: { p_student_id: string }; Returns: string }
      send_announcement: { Args: { p_message: string; p_bus_id?: string | null }; Returns: string }
      // 0010_routes_with_school_id.sql
      get_routes_with_buses: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          school_id: string
          bus_id: string
          bus_name: string
          bus_color: string
          waypoints: Json
          total_distance_km: number | null
          total_duration_min: number | null
          optimized_at: string | null
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
