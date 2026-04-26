-- RouteyAI — Core Schema
-- Run with: supabase db reset  (local)  or  supabase db push  (remote)

-- Enable PostGIS for geography types
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─────────────────────────────────────────────
-- SCHOOLS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schools (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  address      TEXT        NOT NULL,
  starting_point GEOGRAPHY(POINT, 4326) NOT NULL,   -- school coordinates
  created_by   UUID        REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- USER ROLES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  id         UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID  REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT  NOT NULL CHECK (role IN ('platform_admin','school_admin','driver','parent')),
  school_id  UUID  REFERENCES schools(id) ON DELETE CASCADE,   -- NULL for platform_admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

-- ─────────────────────────────────────────────
-- BUSES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS buses (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id  UUID    REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  name       TEXT    NOT NULL,           -- e.g. "Bus #1"
  capacity   INTEGER DEFAULT 40,
  driver_id  UUID    REFERENCES auth.users(id),
  color      TEXT    DEFAULT '#3B82F6',  -- hex color for map route
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id     UUID    REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  name          TEXT    NOT NULL,
  parent_id     UUID    REFERENCES auth.users(id),
  home_address  TEXT    NOT NULL,
  home_location GEOGRAPHY(POINT, 4326) NOT NULL,   -- geocoded coordinates
  bus_id        UUID    REFERENCES buses(id) ON DELETE SET NULL,
  stop_order    INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ROUTES  (AI-optimized, upserted per bus)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routes (
  id                  UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id           UUID    REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  bus_id              UUID    REFERENCES buses(id) ON DELETE CASCADE NOT NULL,
  -- ordered array of {lat, lng, student_id, stop_order, eta_offset_min}
  waypoints           JSONB   NOT NULL DEFAULT '[]',
  total_distance_km   DECIMAL,
  total_duration_min  DECIMAL,
  encoded_polyline    TEXT,              -- from Mapbox Directions, used to draw route line
  optimized_at        TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bus_id)      -- one active route per bus; re-optimization replaces it
);

-- ─────────────────────────────────────────────
-- BUS LOCATIONS  (real-time GPS stream)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bus_locations (
  id        UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id    UUID    REFERENCES buses(id) ON DELETE CASCADE NOT NULL,
  location  GEOGRAPHY(POINT, 4326) NOT NULL,
  heading   DECIMAL,   -- degrees (0–360)
  speed     DECIMAL,   -- km/h
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Hot path index: latest location per bus
CREATE INDEX IF NOT EXISTS idx_bus_locations_bus_id
  ON bus_locations(bus_id, timestamp DESC);

-- ─────────────────────────────────────────────
-- ANNOUNCEMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id  UUID    REFERENCES schools(id) ON DELETE CASCADE,
  bus_id     UUID    REFERENCES buses(id) ON DELETE CASCADE,  -- NULL = all buses
  sender_id  UUID    REFERENCES auth.users(id),
  message    TEXT    NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ATTENDANCE  (per-day per-student)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID    REFERENCES students(id) ON DELETE CASCADE,
  bus_id     UUID    REFERENCES buses(id) ON DELETE CASCADE,
  status     TEXT    CHECK (status IN ('boarded','absent')),
  date       DATE    DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)   -- one record per student per day
);

-- ─────────────────────────────────────────────
-- DEMO REQUESTS  (landing page form)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demo_requests (
  id          UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name   TEXT  NOT NULL,
  school_name TEXT  NOT NULL,
  email       TEXT  NOT NULL,
  phone       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- updated_at auto-refresh trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schools_updated_at  BEFORE UPDATE ON schools  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER buses_updated_at    BEFORE UPDATE ON buses    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
