-- RouteyAI — Doha International Academy Demo Seed
-- Loads a realistic Qatari school with buses, students, drivers, and parents.
-- Run with:  supabase db reset   (applies all migrations then this seed)
--
-- Demo credentials:
--   Platform Admin : admin@routeyai.qa       / RouteyAI@2024!
--   School Admin   : school@doha-academy.qa  / School@2024!
--   Driver 1       : ahmed@doha-academy.qa   / Driver@2024!
--   Driver 2       : khalid@doha-academy.qa  / Driver@2024!
--   Parent (sample): parent1@example.qa      / Parent@2024!

-- ─────────────────────────────────────────────
-- AUTH USERS  (via Supabase admin API, not SQL — handled below with auth.users insert hack for local dev)
-- ─────────────────────────────────────────────
-- NOTE: In production, users are created by Supabase Auth.
-- For local seed we insert directly into auth.users.
-- Passwords are bcrypt hashes of the demo passwords above.

DO $$
DECLARE
  v_platform_admin_id UUID := '00000000-0000-0000-0000-000000000001';
  v_school_admin_id   UUID := '00000000-0000-0000-0000-000000000002';
  v_driver1_id        UUID := '00000000-0000-0000-0000-000000000003';
  v_driver2_id        UUID := '00000000-0000-0000-0000-000000000004';
  -- Parents
  v_parent_ids        UUID[] := ARRAY[
    '00000000-0000-0000-0000-000000000010'::UUID,
    '00000000-0000-0000-0000-000000000011'::UUID,
    '00000000-0000-0000-0000-000000000012'::UUID,
    '00000000-0000-0000-0000-000000000013'::UUID,
    '00000000-0000-0000-0000-000000000014'::UUID,
    '00000000-0000-0000-0000-000000000015'::UUID,
    '00000000-0000-0000-0000-000000000016'::UUID,
    '00000000-0000-0000-0000-000000000017'::UUID,
    '00000000-0000-0000-0000-000000000018'::UUID,
    '00000000-0000-0000-0000-000000000019'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    '00000000-0000-0000-0000-000000000021'::UUID,
    '00000000-0000-0000-0000-000000000022'::UUID,
    '00000000-0000-0000-0000-000000000023'::UUID,
    '00000000-0000-0000-0000-000000000024'::UUID,
    '00000000-0000-0000-0000-000000000025'::UUID,
    '00000000-0000-0000-0000-000000000026'::UUID,
    '00000000-0000-0000-0000-000000000027'::UUID,
    '00000000-0000-0000-0000-000000000028'::UUID,
    '00000000-0000-0000-0000-000000000029'::UUID
  ];
  v_school_id UUID;
  v_bus1_id   UUID;
  v_bus2_id   UUID;
  v_bus3_id   UUID;
BEGIN

  -- ── Seed auth users ──────────────────────────────────────────────────────
  INSERT INTO auth.users(id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    aud, role)
  VALUES
    (v_platform_admin_id, 'admin@routeyai.qa',
      crypt('RouteyAI@2024!', gen_salt('bf')),
      NOW(), '{"provider":"email","providers":["email"]}',
      '{"full_name":"Platform Admin"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_school_admin_id,  'school@doha-academy.qa',
      crypt('School@2024!', gen_salt('bf')),
      NOW(), '{"provider":"email","providers":["email"]}',
      '{"full_name":"Sara Al-Mannai"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_driver1_id, 'ahmed@doha-academy.qa',
      crypt('Driver@2024!', gen_salt('bf')),
      NOW(), '{"provider":"email","providers":["email"]}',
      '{"full_name":"Ahmed Al-Kuwari"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_driver2_id, 'khalid@doha-academy.qa',
      crypt('Driver@2024!', gen_salt('bf')),
      NOW(), '{"provider":"email","providers":["email"]}',
      '{"full_name":"Khalid Al-Hamad"}', NOW(), NOW(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- Seed parent auth users
  INSERT INTO auth.users(id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES
    (v_parent_ids[1],  'parent1@example.qa',  crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fatima Al-Thani"}',    NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[2],  'parent2@example.qa',  crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mohammed Al-Ansari"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[3],  'parent3@example.qa',  crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aisha Al-Marri"}',     NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[4],  'parent4@example.qa',  crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ibrahim Al-Sulaiti"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[5],  'parent5@example.qa',  crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maryam Al-Nasr"}',     NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[6],  'parent6@example.qa',  crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hamad Al-Attiyah"}',   NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[7],  'parent7@example.qa',  crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Noura Al-Mohannadi"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[8],  'parent8@example.qa',  crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Yousuf Al-Jaber"}',    NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[9],  'parent9@example.qa',  crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Shaikha Al-Baker"}',   NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[10], 'parent10@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ali Al-Nuaimi"}',      NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[11], 'parent11@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hessa Al-Kuwari"}',    NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[12], 'parent12@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rashid Al-Kaabi"}',    NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[13], 'parent13@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Moza Al-Hajri"}',      NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[14], 'parent14@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Saad Al-Dosari"}',     NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[15], 'parent15@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Latifa Al-Emadi"}',    NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[16], 'parent16@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nasser Al-Buainain"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[17], 'parent17@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Wadha Al-Khater"}',    NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[18], 'parent18@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jassim Al-Malki"}',    NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[19], 'parent19@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Reem Al-Muftah"}',     NOW(), NOW(), 'authenticated', 'authenticated'),
    (v_parent_ids[20], 'parent20@example.qa', crypt('Parent@2024!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fahad Al-Obaidly"}',   NOW(), NOW(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- ── School ───────────────────────────────────────────────────────────────
  INSERT INTO schools(id, name, address, starting_point, created_by)
  VALUES (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Doha International Academy',
    'Al Waab Street, West Bay, Doha, Qatar',
    ST_SetSRID(ST_MakePoint(51.5310, 25.3260), 4326)::GEOGRAPHY,
    v_school_admin_id
  ) ON CONFLICT (id) DO NOTHING;

  v_school_id := 'aaaaaaaa-0000-0000-0000-000000000001';

  -- ── Roles ────────────────────────────────────────────────────────────────
  INSERT INTO user_roles(user_id, role, school_id) VALUES
    (v_platform_admin_id, 'platform_admin', NULL),
    (v_school_admin_id,   'school_admin',   v_school_id),
    (v_driver1_id,        'driver',         v_school_id),
    (v_driver2_id,        'driver',         v_school_id)
  ON CONFLICT DO NOTHING;

  -- Parent roles
  FOR i IN 1..20 LOOP
    INSERT INTO user_roles(user_id, role, school_id)
    VALUES (v_parent_ids[i], 'parent', v_school_id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- ── Buses ────────────────────────────────────────────────────────────────
  INSERT INTO buses(id, school_id, name, capacity, driver_id, color) VALUES
    ('bbbbbbbb-0000-0000-0000-000000000001', v_school_id, 'Bus #1', 40, v_driver1_id, '#3B82F6'),
    ('bbbbbbbb-0000-0000-0000-000000000002', v_school_id, 'Bus #2', 40, v_driver2_id, '#10B981'),
    ('bbbbbbbb-0000-0000-0000-000000000003', v_school_id, 'Bus #3', 40, NULL,         '#F59E0B')
  ON CONFLICT (id) DO NOTHING;

  v_bus1_id := 'bbbbbbbb-0000-0000-0000-000000000001';
  v_bus2_id := 'bbbbbbbb-0000-0000-0000-000000000002';
  v_bus3_id := 'bbbbbbbb-0000-0000-0000-000000000003';

  -- ── Students ─────────────────────────────────────────────────────────────
  -- Bus #1 (14 students) — Al Sadd, Nuaija, Madinat Khalifa
  INSERT INTO students(school_id, name, parent_id, home_address, home_location, bus_id, stop_order) VALUES
    (v_school_id, 'Yousef Al-Thani',    v_parent_ids[1],  'Al Sadd, Doha',           ST_SetSRID(ST_MakePoint(51.5136, 25.2733), 4326)::GEOGRAPHY, v_bus1_id, 1),
    (v_school_id, 'Layla Al-Thani',     v_parent_ids[1],  'Al Sadd, Doha',           ST_SetSRID(ST_MakePoint(51.5140, 25.2738), 4326)::GEOGRAPHY, v_bus1_id, 2),
    (v_school_id, 'Khalid Al-Ansari',   v_parent_ids[2],  'Al Nuaija, Doha',         ST_SetSRID(ST_MakePoint(51.5010, 25.2650), 4326)::GEOGRAPHY, v_bus1_id, 3),
    (v_school_id, 'Sara Al-Ansari',     v_parent_ids[2],  'Al Nuaija, Doha',         ST_SetSRID(ST_MakePoint(51.5015, 25.2655), 4326)::GEOGRAPHY, v_bus1_id, 4),
    (v_school_id, 'Ahmed Al-Marri',     v_parent_ids[3],  'Madinat Khalifa, Doha',   ST_SetSRID(ST_MakePoint(51.4890, 25.2890), 4326)::GEOGRAPHY, v_bus1_id, 5),
    (v_school_id, 'Hessa Al-Sulaiti',   v_parent_ids[4],  'Al Muntazah, Doha',       ST_SetSRID(ST_MakePoint(51.5200, 25.2610), 4326)::GEOGRAPHY, v_bus1_id, 6),
    (v_school_id, 'Nasser Al-Nasr',     v_parent_ids[5],  'Al Hilal, Doha',          ST_SetSRID(ST_MakePoint(51.5320, 25.2580), 4326)::GEOGRAPHY, v_bus1_id, 7),
    (v_school_id, 'Mona Al-Nasr',       v_parent_ids[5],  'Al Hilal, Doha',          ST_SetSRID(ST_MakePoint(51.5325, 25.2585), 4326)::GEOGRAPHY, v_bus1_id, 8),
    (v_school_id, 'Hamad Al-Attiyah',   v_parent_ids[6],  'Al Mirqab, Doha',         ST_SetSRID(ST_MakePoint(51.5270, 25.2870), 4326)::GEOGRAPHY, v_bus1_id, 9),
    (v_school_id, 'Noura Al-Mohannadi', v_parent_ids[7],  'Old Airport Rd, Doha',    ST_SetSRID(ST_MakePoint(51.5480, 25.2710), 4326)::GEOGRAPHY, v_bus1_id, 10),
    (v_school_id, 'Tariq Al-Jaber',     v_parent_ids[8],  'Al Nasr, Doha',           ST_SetSRID(ST_MakePoint(51.5090, 25.2770), 4326)::GEOGRAPHY, v_bus1_id, 11),
    (v_school_id, 'Reem Al-Jaber',      v_parent_ids[8],  'Al Nasr, Doha',           ST_SetSRID(ST_MakePoint(51.5093, 25.2774), 4326)::GEOGRAPHY, v_bus1_id, 12),
    (v_school_id, 'Jassim Al-Baker',    v_parent_ids[9],  'Najma, Doha',             ST_SetSRID(ST_MakePoint(51.5160, 25.2810), 4326)::GEOGRAPHY, v_bus1_id, 13),
    (v_school_id, 'Shaikha Al-Nuaimi',  v_parent_ids[10], 'Fereej Bin Mahmoud, Doha',ST_SetSRID(ST_MakePoint(51.5220, 25.2680), 4326)::GEOGRAPHY, v_bus1_id, 14),

  -- Bus #2 (14 students) — Pearl Qatar, West Bay, Lusail
    (v_school_id, 'Ali Al-Kuwari',      v_parent_ids[11], 'The Pearl Qatar, Doha',   ST_SetSRID(ST_MakePoint(51.5503, 25.3707), 4326)::GEOGRAPHY, v_bus2_id, 1),
    (v_school_id, 'Fatima Al-Kuwari',   v_parent_ids[11], 'The Pearl Qatar, Doha',   ST_SetSRID(ST_MakePoint(51.5508, 25.3712), 4326)::GEOGRAPHY, v_bus2_id, 2),
    (v_school_id, 'Rashid Al-Kaabi',    v_parent_ids[12], 'West Bay, Doha',          ST_SetSRID(ST_MakePoint(51.5387, 25.3284), 4326)::GEOGRAPHY, v_bus2_id, 3),
    (v_school_id, 'Moza Al-Kaabi',      v_parent_ids[12], 'West Bay, Doha',          ST_SetSRID(ST_MakePoint(51.5392, 25.3289), 4326)::GEOGRAPHY, v_bus2_id, 4),
    (v_school_id, 'Saad Al-Hajri',      v_parent_ids[13], 'Lusail, Qatar',           ST_SetSRID(ST_MakePoint(51.5080, 25.4280), 4326)::GEOGRAPHY, v_bus2_id, 5),
    (v_school_id, 'Latifa Al-Hajri',    v_parent_ids[13], 'Lusail, Qatar',           ST_SetSRID(ST_MakePoint(51.5085, 25.4285), 4326)::GEOGRAPHY, v_bus2_id, 6),
    (v_school_id, 'Nasser Al-Dosari',   v_parent_ids[14], 'Fox Hills, Lusail',       ST_SetSRID(ST_MakePoint(51.4960, 25.4180), 4326)::GEOGRAPHY, v_bus2_id, 7),
    (v_school_id, 'Wadha Al-Emadi',     v_parent_ids[15], 'Marina District, Lusail', ST_SetSRID(ST_MakePoint(51.5230, 25.4350), 4326)::GEOGRAPHY, v_bus2_id, 8),
    (v_school_id, 'Fahad Al-Buainain',  v_parent_ids[16], 'Al Khor, Qatar',          ST_SetSRID(ST_MakePoint(51.4986, 25.6887), 4326)::GEOGRAPHY, v_bus2_id, 9),
    (v_school_id, 'Mariam Al-Khater',   v_parent_ids[17], 'Al Khor, Qatar',          ST_SetSRID(ST_MakePoint(51.4990, 25.6892), 4326)::GEOGRAPHY, v_bus2_id, 10),
    (v_school_id, 'Ibrahim Al-Malki',   v_parent_ids[18], 'Legtaifiya, Doha',        ST_SetSRID(ST_MakePoint(51.5634, 25.3543), 4326)::GEOGRAPHY, v_bus2_id, 11),
    (v_school_id, 'Hind Al-Muftah',     v_parent_ids[19], 'Al Dafna, West Bay',      ST_SetSRID(ST_MakePoint(51.5313, 25.3178), 4326)::GEOGRAPHY, v_bus2_id, 12),
    (v_school_id, 'Jaber Al-Obaidly',   v_parent_ids[20], 'Viva Bahriya, Pearl',     ST_SetSRID(ST_MakePoint(51.5545, 25.3745), 4326)::GEOGRAPHY, v_bus2_id, 13),
    (v_school_id, 'Rawan Al-Obaidly',   v_parent_ids[20], 'Viva Bahriya, Pearl',     ST_SetSRID(ST_MakePoint(51.5550, 25.3750), 4326)::GEOGRAPHY, v_bus2_id, 14),

  -- Bus #3 (12 students) — Al Wakra, Education City, Al Rayyan
    (v_school_id, 'Khalifa Al-Muftah',  v_parent_ids[1],  'Al Wakra, Qatar',         ST_SetSRID(ST_MakePoint(51.5987, 25.1657), 4326)::GEOGRAPHY, v_bus3_id, 1),
    (v_school_id, 'Maryam Al-Muftah',   v_parent_ids[2],  'Al Wakra, Qatar',         ST_SetSRID(ST_MakePoint(51.5992, 25.1662), 4326)::GEOGRAPHY, v_bus3_id, 2),
    (v_school_id, 'Omar Al-Buainain',   v_parent_ids[3],  'Education City, Doha',    ST_SetSRID(ST_MakePoint(51.4271, 25.3152), 4326)::GEOGRAPHY, v_bus3_id, 3),
    (v_school_id, 'Lulwa Al-Hamad',     v_parent_ids[4],  'Education City, Doha',    ST_SetSRID(ST_MakePoint(51.4275, 25.3157), 4326)::GEOGRAPHY, v_bus3_id, 4),
    (v_school_id, 'Mansour Al-Malki',   v_parent_ids[5],  'Al Rayyan, Qatar',        ST_SetSRID(ST_MakePoint(51.4133, 25.2936), 4326)::GEOGRAPHY, v_bus3_id, 5),
    (v_school_id, 'Maitha Al-Malki',    v_parent_ids[6],  'Al Rayyan, Qatar',        ST_SetSRID(ST_MakePoint(51.4138, 25.2941), 4326)::GEOGRAPHY, v_bus3_id, 6),
    (v_school_id, 'Hassan Al-Dosari',   v_parent_ids[7],  'Muaither, Al Rayyan',     ST_SetSRID(ST_MakePoint(51.3900, 25.2720), 4326)::GEOGRAPHY, v_bus3_id, 7),
    (v_school_id, 'Amal Al-Khater',     v_parent_ids[8],  'Muaither, Al Rayyan',     ST_SetSRID(ST_MakePoint(51.3905, 25.2725), 4326)::GEOGRAPHY, v_bus3_id, 8),
    (v_school_id, 'Faisal Al-Nuaimi',   v_parent_ids[9],  'Al Wukair, Qatar',        ST_SetSRID(ST_MakePoint(51.5612, 25.1187), 4326)::GEOGRAPHY, v_bus3_id, 9),
    (v_school_id, 'Dalal Al-Nuaimi',    v_parent_ids[10], 'Al Wukair, Qatar',        ST_SetSRID(ST_MakePoint(51.5617, 25.1192), 4326)::GEOGRAPHY, v_bus3_id, 10),
    (v_school_id, 'Saif Al-Jaber',      v_parent_ids[11], 'Mesaimeer, Doha',         ST_SetSRID(ST_MakePoint(51.5430, 25.2150), 4326)::GEOGRAPHY, v_bus3_id, 11),
    (v_school_id, 'Asma Al-Sulaiti',    v_parent_ids[12], 'Mesaimeer, Doha',         ST_SetSRID(ST_MakePoint(51.5435, 25.2155), 4326)::GEOGRAPHY, v_bus3_id, 12);

END $$;

-- ─────────────────────────────────────────────
-- Seed demo invites (for testing the invite flow)
-- ─────────────────────────────────────────────
INSERT INTO invites(code, role, school_id, bus_id, created_by, expires_at)
VALUES
  ('DEMO-DRIVER1', 'driver', 'aaaaaaaa-0000-0000-0000-000000000001',
   'bbbbbbbb-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000002',
   NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;

INSERT INTO invites(code, role, school_id, student_ids, created_by, expires_at)
VALUES
  ('DEMO-PARENT1', 'parent', 'aaaaaaaa-0000-0000-0000-000000000001',
   ARRAY(SELECT id FROM students WHERE name IN ('Yousef Al-Thani','Layla Al-Thani') LIMIT 2),
   '00000000-0000-0000-0000-000000000002',
   NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;
