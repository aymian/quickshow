-- Fix Foreign Key Relationships for Messages
-- This fixes the "Could not find a relationship" error

-- First, check if the foreign key constraints exist
-- If they don't exist, we'll add them

-- Add foreign key for sender_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages2_sender_id_fkey'
    ) THEN
        ALTER TABLE messages2 
        ADD CONSTRAINT messages2_sender_id_fkey 
        FOREIGN KEY (sender_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for conversation_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages2_conversation_id_fkey'
    ) THEN
        ALTER TABLE messages2 
        ADD CONSTRAINT messages2_conversation_id_fkey 
        FOREIGN KEY (conversation_id) 
        REFERENCES conversations2(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for reply_to_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages2_reply_to_id_fkey'
    ) THEN
        ALTER TABLE messages2 
        ADD CONSTRAINT messages2_reply_to_id_fkey 
        FOREIGN KEY (reply_to_id) 
        REFERENCES messages2(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Verify foreign keys exist
SELECT
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='messages2';
