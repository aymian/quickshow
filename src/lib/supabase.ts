import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://orkvbsyqfrxqedykvhnt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ya3Zic3lxZnJ4cWVkeWt2aG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQ0NDcsImV4cCI6MjA3NzM0MDQ0N30.onqsqpKcamZL_ltF7yeqIBDvzC7zwlS1I1SocbNZyeU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  is_private: any;
  is_private: any;
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  country?: string;
  profile_picture_url?: string;
  is_premium: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const authService = {
  // Sign up with email
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });
    return { data, error };
  },

  // Sign in with email
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/google-callback`,
      },
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get user profile
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>) => {
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    console.log('Updating user profile:', userId, cleanUpdates);

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      // Profile doesn't exist, create it with upsert
      console.log('Profile does not exist, creating new profile...');
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: user.user?.email || '',
          ...cleanUpdates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Insert profile error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('Profile created successfully:', data);
      }
      
      return { data, error };
    }

    // Profile exists, update it
    const { data, error } = await supabase
      .from('users')
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Update profile error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('Profile updated successfully:', data);
    }
    
    return { data, error };
  },

  // Upload profile picture
  uploadProfilePicture: async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      return { data: null, error };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { data: publicUrl, error: null };
  },

  // Resend confirmation email
  resendConfirmation: async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { data, error };
  },

  // Social Features
  
  // Follow user
  followUser: async (followingId: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: null, error: new Error('Not authenticated') };

    // Check if target user is private
    const { data: targetUser } = await supabase
      .from('users')
      .select('is_private')
      .eq('id', followingId)
      .single();

    const status = targetUser?.is_private ? 'pending' : 'accepted';

    const { data, error } = await supabase
      .from('followers')
      .insert({
        follower_id: user.user.id,
        following_id: followingId,
        status,
      })
      .select()
      .single();

    return { data, error };
  },

  // Unfollow user
  unfollowUser: async (followingId: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', user.user.id)
      .eq('following_id', followingId);

    return { error };
  },

  // Accept follow request
  acceptFollowRequest: async (followerId: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('followers')
      .update({ status: 'accepted' })
      .eq('follower_id', followerId)
      .eq('following_id', user.user.id)
      .select()
      .single();

    return { data, error };
  },

  // Get followers
  getFollowers: async (userId: string) => {
    const { data, error } = await supabase
      .from('followers')
      .select(`
        *,
        follower:follower_id (id, full_name, username, profile_picture_url)
      `)
      .eq('following_id', userId)
      .eq('status', 'accepted');

    return { data, error };
  },

  // Get following
  getFollowing: async (userId: string) => {
    const { data, error } = await supabase
      .from('followers')
      .select(`
        *,
        following:following_id (id, full_name, username, profile_picture_url)
      `)
      .eq('follower_id', userId)
      .eq('status', 'accepted');

    return { data, error };
  },

  // Get notifications
  getNotifications: async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    return { error };
  },

  // Get or create conversation
  getOrCreateConversation: async (otherUserId: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: null, error: new Error('Not authenticated') };

    // Check if conversation exists
    const { data: existingConv } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.user.id);

    if (existingConv) {
      for (const conv of existingConv) {
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.conversation_id)
          .eq('user_id', otherUserId)
          .single();

        if (otherParticipant) {
          return { data: conv.conversation_id, error: null };
        }
      }
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convError) return { data: null, error: convError };

    // Add participants
    await supabase.from('conversation_participants').insert([
      { conversation_id: newConv.id, user_id: user.user.id },
      { conversation_id: newConv.id, user_id: otherUserId },
    ]);

    return { data: newConv.id, error: null };
  },

  // Get conversations
  getConversations: async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: null, error: new Error('Not authenticated') };

    // Get all conversations where user is a participant
    const { data: myConversations, error: convError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.user.id);

    if (convError || !myConversations) return { data: null, error: convError };

    // For each conversation, get the other participant
    const conversationsWithUsers = await Promise.all(
      myConversations.map(async (conv) => {
        // Get other participant
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select(`
            user_id,
            users:user_id (
              id,
              full_name,
              username,
              profile_picture_url
            )
          `)
          .eq('conversation_id', conv.conversation_id)
          .neq('user_id', user.user.id)
          .single();

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.conversation_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          conversation_id: conv.conversation_id,
          other_user: otherParticipant?.users,
          last_message: lastMessage,
        };
      })
    );

    return { data: conversationsWithUsers, error: null };
  },

  // Get messages
  getMessages: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (id, full_name, profile_picture_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    return { data, error };
  },

  // Send message
  sendMessage: async (conversationId: string, content: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.user.id,
        content,
      })
      .select()
      .single();

    return { data, error };
  },

  // Search users
  searchUsers: async (query: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, username, email, phone_number, profile_picture_url')
      .neq('id', user.user.id) // Exclude current user
      .or(`username.ilike.%${query}%,email.ilike.%${query}%,phone_number.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);

    return { data, error };
  },

  // Update privacy setting
  updatePrivacy: async (isPrivate: boolean) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('users')
      .update({ is_private: isPrivate })
      .eq('id', user.user.id);

    return { error };
  },
};
