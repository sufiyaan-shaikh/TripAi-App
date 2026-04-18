-- Run this SQL in your Supabase SQL Editor to create the wishlist table
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS wishlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  country     TEXT DEFAULT '',
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row-Level Security so users only see their own wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
ON wishlist
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
