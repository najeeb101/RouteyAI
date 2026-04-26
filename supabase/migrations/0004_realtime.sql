-- RouteyAI — Supabase Realtime subscriptions
-- These tables stream changes to subscribed clients via WebSockets.

-- bus_locations → drivers publish, parents/admins subscribe (live tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE bus_locations;

-- attendance → drivers publish, parents subscribe (boarded ✓ confirmation)
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;

-- announcements → admins/drivers publish, all parties subscribe
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
