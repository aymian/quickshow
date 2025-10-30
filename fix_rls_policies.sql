-- Fix RLS Policies for Messages to Show
-- Run this in Supabase SQL Editor

-- First, enable RLS on all tables
ALTER TABLE conversations2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators2 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages2;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages2;
DROP POLICY IF EXISTS "Users can edit their own messages" ON messages2;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages2;

-- Create CORRECT policies for messages2
-- This allows you to see messages in your conversations
CREATE POLICY "Users can view messages in their conversations"
ON messages2
FOR SELECT
TO authenticated
USING (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants2
    WHERE user_id = auth.uid()
  )
  AND (deleted_for IS NULL OR deleted_for != auth.uid())
);

-- This allows you to send messages
CREATE POLICY "Users can send messages in their conversations"
ON messages2
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants2
    WHERE user_id = auth.uid()
  )
);

-- This allows you to edit your own messages
CREATE POLICY "Users can edit their own messages"
ON messages2
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- This allows you to delete your own messages
CREATE POLICY "Users can delete their own messages"
ON messages2
FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- Fix conversation_participants2 policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants2;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants2;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants2;

CREATE POLICY "Users can view participants in their conversations"
ON conversation_participants2
FOR SELECT
TO authenticated
USING (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants2
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants"
ON conversation_participants2
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own participant record"
ON conversation_participants2
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix conversations2 policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations2;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations2;

CREATE POLICY "Users can view their conversations"
ON conversations2
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants2
    WHERE conversation_participants2.conversation_id = conversations2.id
    AND conversation_participants2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations"
ON conversations2
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix typing_indicators2 policies
DROP POLICY IF EXISTS "Users can view typing in their conversations" ON typing_indicators2;
DROP POLICY IF EXISTS "Users can update own typing status" ON typing_indicators2;

CREATE POLICY "Users can view typing in their conversations"
ON typing_indicators2
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants2
    WHERE conversation_participants2.conversation_id = typing_indicators2.conversation_id
    AND conversation_participants2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own typing status"
ON typing_indicators2
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('messages2', 'conversations2', 'conversation_participants2', 'typing_indicators2')
ORDER BY tablename, policyname;
