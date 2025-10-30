# Troubleshooting Guide

## ❌ "Failed to start conversation"

### **Cause:**
The V2 tables (`conversations2`, `conversation_participants2`, `messages2`, `typing_indicators2`) don't exist yet.

### **Solution:**

**1. Run SQL Files in Order:**
```bash
# In Supabase SQL Editor, run these in order:

1. chat_tables_v2.sql          # Creates all V2 tables
2. add_message_features.sql    # Adds edit/delete/seen features
```

**2. Verify Tables Exist:**
```sql
-- Check if tables exist:
SELECT * FROM conversations2 LIMIT 1;
SELECT * FROM conversation_participants2 LIMIT 1;
SELECT * FROM messages2 LIMIT 1;
SELECT * FROM typing_indicators2 LIMIT 1;
```

**3. Check Browser Console:**
- Open Developer Tools (F12)
- Go to Console tab
- Look for detailed error messages
- Share the error if you need help

### **Common Errors:**

#### **"relation does not exist"**
```
Error: relation "conversations2" does not exist
```
**Fix:** Run `chat_tables_v2.sql`

#### **"permission denied"**
```
Error: permission denied for table conversations2
```
**Fix:** RLS policies not set up. Run `chat_tables_v2.sql` again

#### **"violates foreign key constraint"**
```
Error: violates foreign key constraint
```
**Fix:** Make sure `users` table exists and you're logged in

## ✅ Quick Fix Steps

### **Step 1: Run SQL**
```sql
-- Copy and paste chat_tables_v2.sql into Supabase SQL Editor
-- Click "Run"
-- Wait for success message
```

### **Step 2: Enable Real-time**
```sql
-- Make sure real-time is enabled:
ALTER PUBLICATION supabase_realtime ADD TABLE conversations2;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants2;
ALTER PUBLICATION supabase_realtime ADD TABLE messages2;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators2;
```

### **Step 3: Test**
1. Refresh the page
2. Try starting a conversation
3. Should work now!

## 🔍 Debug Checklist

- [ ] Ran `chat_tables_v2.sql`
- [ ] Ran `add_message_features.sql`
- [ ] Tables exist in database
- [ ] RLS policies are set up
- [ ] Real-time is enabled
- [ ] User is logged in
- [ ] Browser console shows no errors

## 💡 Still Not Working?

### **Check Supabase Dashboard:**
1. Go to Table Editor
2. Look for tables ending in "2":
   - conversations2 ✓
   - conversation_participants2 ✓
   - messages2 ✓
   - typing_indicators2 ✓

### **Check RLS Policies:**
1. Click on a table
2. Go to "Policies" tab
3. Should see multiple policies
4. All should be enabled

### **Check Real-time:**
1. Go to Database → Replication
2. Look for tables in publication
3. All V2 tables should be listed

## 📋 Complete Setup Order

1. **Create Tables:**
   ```bash
   Run: chat_tables_v2.sql
   ```

2. **Add Features:**
   ```bash
   Run: add_message_features.sql
   ```

3. **Verify:**
   ```sql
   SELECT COUNT(*) FROM conversations2;
   SELECT COUNT(*) FROM messages2;
   ```

4. **Test:**
   - Refresh page
   - Try starting conversation
   - Should work! ✅

## 🎯 Expected Behavior

### **When Working:**
- Click message icon → Opens new message modal
- Search for user → Shows results
- Click send icon → "Conversation started!" toast
- Chat opens immediately
- Can send messages

### **When Not Working:**
- "Failed to start conversation" error
- Check console for details
- Follow steps above

All features should work after running the SQL files! 🎉
