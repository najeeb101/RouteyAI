-- Add push_token column to user_roles for Expo push notifications
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS push_token TEXT;
