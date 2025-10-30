import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, User, Plus, Search, X, Reply, Paperclip, MoreVertical, Edit2, Trash2, Check, CheckCheck, Mic, Square } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

const ChatFixed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [editText, setEditText] = useState("");
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Don't redirect immediately, wait for auth to load
    if (user === null) return; // Still loading
    
    if (user === undefined) {
      navigate("/login");
      return;
    }
    
    loadConversations();
    updateOnlineStatus(true);
    
    const userId = searchParams.get("user");
    if (userId) {
      handleStartConversation(userId);
    }

    return () => {
      updateOnlineStatus(false);
    };
  }, [user]);

  // Real-time messages subscription
  useEffect(() => {
    if (!selectedConversation) return;

    const messagesSubscription = supabase
      .channel(`messages:${selectedConversation}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages2',
        filter: `conversation_id=eq.${selectedConversation}`
      }, (payload) => {
        loadMessages(selectedConversation);
        scrollToBottom();
        // Mark messages as read when viewing
        markMessagesAsRead(selectedConversation);
      })
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [selectedConversation]);

  // Typing indicator subscription
  useEffect(() => {
    if (!selectedConversation || !user) return;

    // Ensure we are not marked typing when switching into a conversation
    updateTypingStatus(false);

    const typingSubscription = supabase
      .channel(`typing:${selectedConversation}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_indicators2',
        filter: `conversation_id=eq.${selectedConversation}`
      }, (payload: any) => {
        if (payload.new?.user_id !== user.id) {
          setOtherUserTyping(payload.new?.is_typing || false);
        }
      })
      .subscribe();

    return () => {
      // Clear typing state for this conversation on cleanup
      updateTypingStatus(false);
      typingSubscription.unsubscribe();
    };
  }, [selectedConversation, user]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user) return;
    
    await supabase
      .from('user_status')
      .upsert({
        user_id: user.id,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      });
  };

  const updateTypingStatus = async (typing: boolean) => {
    if (!user || !selectedConversation) return;

    await supabase
      .from('typing_indicators2')
      .upsert({
        conversation_id: selectedConversation,
        user_id: user.id,
        is_typing: typing,
        updated_at: new Date().toISOString(),
      });
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;
    
    // Call the database function to mark messages as read
    await supabase.rpc('mark_messages_read', { conv_id: conversationId });
    
    // Reload conversations to update unread counts
    loadConversations();
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 2000);
  };

  const getLastSeenText = (lastSeen: string) => {
    if (!lastSeen) return '';
    const now = new Date();
    const last = new Date(lastSeen);
    const diffMs = now.getTime() - last.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const { data: myParticipations, error: partError } = await supabase
        .from('conversation_participants2')
        .select('conversation_id, last_read_at')
        .eq('user_id', user.id);

      if (partError) throw partError;
      if (!myParticipations || myParticipations.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = myParticipations.map(p => p.conversation_id);

      const conversationsData = await Promise.all(
        conversationIds.map(async (convId) => {
          const { data: otherPart } = await supabase
            .from('conversation_participants2')
            .select('user_id')
            .eq('conversation_id', convId)
            .neq('user_id', user.id)
            .single();

          if (!otherPart) return null;

          const { data: userData } = await supabase
            .from('users')
            .select('id, full_name, username, profile_picture_url')
            .eq('id', otherPart.user_id)
            .single();

          const { data: statusData } = await supabase
            .from('user_status')
            .select('is_online, last_seen')
            .eq('user_id', otherPart.user_id)
            .single();

          const { data: lastMsg } = await supabase
            .from('messages2')
            .select('content, created_at, sender_id')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages (messages from other user that are not read)
          const { count: unreadCount } = await supabase
            .from('messages2')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convId)
            .neq('sender_id', user.id)
            .eq('is_read', false);

          return {
            conversation_id: convId,
            other_user: { ...userData, ...statusData },
            last_message: lastMsg,
            unread_count: unreadCount || 0,
          };
        })
      );

      const validConversations = conversationsData.filter(c => c !== null);
      setConversations(validConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      // Check if conversation already exists
      const { data: myConvs, error: myConvsError } = await supabase
        .from('conversation_participants2')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (myConvsError) {
        console.error('Error fetching my conversations:', myConvsError);
        throw new Error(`Failed to fetch conversations: ${myConvsError.message}`);
      }

      if (myConvs && myConvs.length > 0) {
        for (const conv of myConvs) {
          const { data: otherPart, error: otherError } = await supabase
            .from('conversation_participants2')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id)
            .eq('user_id', otherUserId)
            .maybeSingle();

          if (otherError) {
            console.error('Error checking other participant:', otherError);
            continue;
          }

          if (otherPart) {
            setSelectedConversation(conv.conversation_id);
            loadMessages(conv.conversation_id);
            loadSelectedUser(otherUserId);
            await loadConversations();
            toast.success("Conversation opened!");
            return;
          }
        }
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations2')
        .insert({})
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw new Error(`Failed to create conversation: ${convError.message}`);
      }

      if (!newConv) {
        throw new Error('No conversation data returned');
      }

      // Add participants
      const { error: partError } = await supabase
        .from('conversation_participants2')
        .insert([
          { conversation_id: newConv.id, user_id: user.id },
          { conversation_id: newConv.id, user_id: otherUserId },
        ]);

      if (partError) {
        console.error('Error adding participants:', partError);
        throw new Error(`Failed to add participants: ${partError.message}`);
      }

      setSelectedConversation(newConv.id);
      loadMessages(newConv.id);
      loadSelectedUser(otherUserId);
      await loadConversations();
      toast.success("Conversation started!");
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast.error(error.message || "Failed to start conversation. Please make sure you've run chat_tables_v2.sql");
    }
  };

  const loadSelectedUser = async (userId: string) => {
    const { data: userData } = await supabase
      .from('users')
      .select('id, full_name, username, profile_picture_url')
      .eq('id', userId)
      .single();

    const { data: statusData } = await supabase
      .from('user_status')
      .select('is_online, last_seen')
      .eq('user_id', userId)
      .single();

    setSelectedUser({ ...userData, ...statusData });
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // First, get all messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages2')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        toast.error(`Failed to load messages: ${messagesError.message}`);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        console.log('No messages found');
        setMessages([]);
        return;
      }

      // Get unique sender IDs
      const senderIds = [...new Set(messagesData.map(m => m.sender_id))];

      // Fetch sender details
      const { data: sendersData } = await supabase
        .from('users')
        .select('id, full_name, profile_picture_url')
        .in('id', senderIds);

      // Create sender lookup map
      const sendersMap = new Map(sendersData?.map(s => [s.id, s]) || []);

      // Get reply message IDs
      const replyIds = messagesData
        .filter(m => m.reply_to_id)
        .map(m => m.reply_to_id);

      // Fetch reply messages if any
      let repliesMap = new Map();
      if (replyIds.length > 0) {
        const { data: repliesData } = await supabase
          .from('messages2')
          .select('id, content, file_url, file_type, sender_id')
          .in('id', replyIds);

        repliesMap = new Map(repliesData?.map(r => [r.id, r]) || []);
      }

      // Combine data
      const enrichedMessages = messagesData.map(msg => ({
        ...msg,
        sender: sendersMap.get(msg.sender_id) || null,
        reply_to: msg.reply_to_id ? repliesMap.get(msg.reply_to_id) || null : null
      }));

      console.log('Loaded messages:', enrichedMessages.length);
      setMessages(enrichedMessages);
      
      // Mark messages as read when loading
      markMessagesAsRead(conversationId);
    } catch (error: any) {
      console.error('Error in loadMessages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Simulate upload progress (Supabase doesn't provide native progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      const fileType = file.type.startsWith('image/') ? 'image' :
                      file.type.startsWith('video/') ? 'video' :
                      file.type.startsWith('audio/') ? 'audio' : 'file';

      await supabase.from('messages2').insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content: file.name,
        file_url: publicUrl,
        file_type: fileType,
        file_name: file.name,
        file_size: file.size,
        reply_to_id: replyingTo?.id,
      });

      setReplyingTo(null);
      loadMessages(selectedConversation);
      loadConversations();
      toast.success("File sent!");
      
      // Reset after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload file");
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      if (!user || !selectedConversation) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setIsRecording(false);
        // Reuse file upload logic to send as audio message to 'audio' bucket
        try {
          setIsUploading(true);
          setUploadProgress(0);
          const fileName = `${user.id}/${Date.now()}.webm`;
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 90) { clearInterval(progressInterval); return 90; }
              return prev + 10;
            });
          }, 100);
          const { error: uploadError } = await supabase.storage
            .from('audio')
            .upload(fileName, file);
          clearInterval(progressInterval);
          setUploadProgress(100);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage
            .from('audio')
            .getPublicUrl(fileName);
          await supabase.from('messages2').insert({
            conversation_id: selectedConversation,
            sender_id: user.id,
            content: 'Voice message',
            file_url: publicUrl,
            file_type: 'audio',
            file_name: 'voice.webm'
          });
          loadMessages(selectedConversation);
          loadConversations();
          toast.success('Voice message sent');
          setTimeout(() => { setIsUploading(false); setUploadProgress(0); }, 500);
        } catch (err) {
          console.error(err);
          toast.error('Failed to send voice message');
          setIsUploading(false);
          setUploadProgress(0);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error', err);
      toast.error('Microphone permission is required');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    // Clear typing indicator
    setIsTyping(false);
    updateTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const { error } = await supabase
      .from('messages2')
      .insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content: newMessage,
        reply_to_id: replyingTo?.id,
      });

    if (error) {
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
    setReplyingTo(null);
    loadConversations();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, username, email, phone_number, profile_picture_url')
      .neq('id', user?.id || '')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%,phone_number.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);

    if (!error && data) {
      setSearchResults(data);
    }
    setSearching(false);
  };

  const handleSelectUser = async (userId: string) => {
    setShowNewMessage(false);
    setSearchQuery("");
    setSearchResults([]);
    await handleStartConversation(userId);
  };

  const handleEditMessage = async () => {
    if (!editText.trim() || !editingMessage) return;

    const { error } = await supabase
      .from('messages2')
      .update({ 
        content: editText,
        edited_at: new Date().toISOString()
      })
      .eq('id', editingMessage.id);

    if (error) {
      toast.error("Failed to edit message");
      return;
    }

    setEditingMessage(null);
    setEditText("");
    loadMessages(selectedConversation!);
    toast.success("Message edited");
  };

  const handleDeleteMessage = async (messageId: string, deleteForEveryone: boolean) => {
    if (deleteForEveryone) {
      // Delete for everyone
      const { error } = await supabase
        .from('messages2')
        .delete()
        .eq('id', messageId);

      if (error) {
        toast.error("Failed to delete message");
        return;
      }
      toast.success("Message deleted for everyone");
    } else {
      // Delete for me only (soft delete)
      const { error } = await supabase
        .from('messages2')
        .update({ 
          deleted_for: user?.id 
        })
        .eq('id', messageId);

      if (error) {
        toast.error("Failed to delete message");
        return;
      }
      toast.success("Message deleted for you");
    }

    setShowMessageMenu(null);
    loadMessages(selectedConversation!);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Only show header on desktop */}
      <div className="hidden md:block">
        <Header onSearch={() => {}} />
      </div>

      <div className="h-screen md:h-auto md:container md:mx-auto md:px-4 md:pt-24 md:pb-8">
        {/* Desktop back button */}
        <Button variant="ghost" onClick={() => navigate("/")} className="hidden md:flex mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="h-full md:grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Conversations List - Hide on mobile when chat is selected */}
          <div className={`${selectedConversation ? 'hidden md:block' : 'block'} h-full md:h-auto md:col-span-1 bg-gray-900/50 backdrop-blur-xl md:rounded-2xl border-0 md:border border-gray-800 p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Messages</h2>
              <Button
                size="icon"
                onClick={() => setShowNewMessage(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            {loading ? (
              <p className="text-gray-400 text-center py-8">Loading...</p>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No conversations yet</p>
                <Button
                  size="sm"
                  onClick={() => setShowNewMessage(true)}
                  className="bg-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv: any) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => {
                      setSelectedConversation(conv.conversation_id);
                      loadMessages(conv.conversation_id);
                      loadSelectedUser(conv.other_user.id);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-colors ${
                      selectedConversation === conv.conversation_id
                        ? "bg-primary/20 border border-primary"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {conv.other_user?.profile_picture_url ? (
                          <img
                            src={conv.other_user.profile_picture_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        {conv.other_user?.is_online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold truncate">
                            {conv.other_user?.full_name || "User"}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                              {conv.unread_count > 99 ? '99+' : conv.unread_count}
                            </span>
                          )}
                        </div>
                        {conv.last_message ? (
                          <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-white font-semibold' : 'text-gray-400'}`}>
                            {conv.last_message.content}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">Start a conversation</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area - Full screen on mobile */}
          <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} h-full md:h-[600px] md:col-span-2 bg-gray-900/50 backdrop-blur-xl md:rounded-2xl border-0 md:border border-gray-800 flex-col`}>
            {selectedConversation && selectedUser ? (
              <>
                {/* Chat Header with mobile back button */}
                <div className="p-3 md:p-4 border-b border-gray-800 flex items-center gap-2 md:gap-3 bg-gray-900/80 backdrop-blur-xl">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    {selectedUser.profile_picture_url ? (
                      <img
                        src={selectedUser.profile_picture_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    {selectedUser.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{selectedUser.full_name}</p>
                    <p className="text-xs text-gray-400">
                      {selectedUser.is_online ? 'Active now' : `Last seen ${getLastSeenText(selectedUser.last_seen)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/audio-call?conv=${selectedConversation}&to=${selectedUser.id}`)}
                      className="hidden md:inline-flex"
                    >
                      Audio Call
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/video-call?conv=${selectedConversation}&to=${selectedUser.id}`)}
                      className="hidden md:inline-flex"
                    >
                      Video Call
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                  {messages.map((message: any) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-1.5 md:gap-2 max-w-[85%] md:max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}>
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            {message.sender?.profile_picture_url ? (
                              <img
                                src={message.sender.profile_picture_url}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            {/* Reply Preview */}
                            {message.reply_to && (
                              <div className={`mb-2 p-2 rounded-lg border-l-2 text-xs ${
                                isOwn ? "bg-white/10 border-white/30" : "bg-gray-700/50 border-primary"
                              }`}>
                                <p className="text-gray-400 font-semibold mb-1">
                                  {message.reply_to.sender_id === user?.id ? "You" : "Replying to"}
                                </p>
                                {message.reply_to.file_url && message.reply_to.file_type === 'image' && (
                                  <img src={message.reply_to.file_url} alt="" className="w-12 h-12 rounded object-cover mb-1" />
                                )}
                                <p className="text-gray-300 truncate">{message.reply_to.content}</p>
                              </div>
                            )}

                            <div
                              className={`p-3 rounded-2xl ${
                                isOwn
                                  ? "bg-primary text-white"
                                  : "bg-gray-800 text-gray-200"
                              }`}
                            >
                              {/* File Preview */}
                              {message.file_url && (
                                <div className="mb-2">
                                  {message.file_type === 'image' && (
                                    <img 
                                      src={message.file_url} 
                                      alt={message.file_name} 
                                      className="rounded-lg max-w-full max-h-64 object-contain cursor-pointer"
                                      onClick={() => window.open(message.file_url, '_blank')}
                                    />
                                  )}
                                  {message.file_type === 'video' && (
                                    <video 
                                      src={message.file_url} 
                                      controls 
                                      className="rounded-lg max-w-full max-h-64"
                                    />
                                  )}
                                  {message.file_type === 'audio' && (
                                    <audio src={message.file_url} controls className="w-full" />
                                  )}
                                  {message.file_type === 'file' && (
                                    <a 
                                      href={message.file_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="flex items-center gap-2 text-sm hover:underline"
                                    >
                                      <Paperclip className="w-4 h-4" />
                                      {message.file_name}
                                    </a>
                                  )}
                                </div>
                              )}
                              {message.content && !message.file_url && <p>{message.content}</p>}
                              {message.content && message.file_url && message.content !== message.file_name && (
                                <p className="mt-2">{message.content}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 px-2 justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                  {message.edited_at && <span className="ml-1">(edited)</span>}
                                </p>
                                {/* Seen checkmarks for own messages */}
                                {isOwn && (
                                  <div className="text-xs">
                                    {message.is_read ? (
                                      <CheckCheck className="w-3 h-3 text-blue-400" />
                                    ) : (
                                      <Check className="w-3 h-3 text-gray-400" />
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setReplyingTo(message)}
                                  className="text-xs text-primary hover:underline"
                                >
                                  Reply
                                </button>
                                {/* Three-dot menu for own messages */}
                                {isOwn && (
                                  <div className="relative">
                                    <button
                                      onClick={() => setShowMessageMenu(showMessageMenu === message.id ? null : message.id)}
                                      className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                      <MoreVertical className="w-3 h-3" />
                                    </button>
                                    {showMessageMenu === message.id && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute right-0 bottom-full mb-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 min-w-[150px] z-10"
                                      >
                                        {!message.file_url && (
                                          <button
                                            onClick={() => {
                                              setEditingMessage(message);
                                              setEditText(message.content);
                                              setShowMessageMenu(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                            Edit
                                          </button>
                                        )}
                                        <button
                                          onClick={() => {
                                            if (confirm("Delete for everyone?")) {
                                              handleDeleteMessage(message.id, true);
                                            }
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-red-400"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          Delete for everyone
                                        </button>
                                        <button
                                          onClick={() => handleDeleteMessage(message.id, false)}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          Delete for me
                                        </button>
                                      </motion.div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {otherUserTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-2 items-end">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          {selectedUser?.profile_picture_url ? (
                            <img
                              src={selectedUser.profile_picture_url}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="bg-gray-800 px-4 py-3 rounded-2xl">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ y: [0, -8, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -8, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -8, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Edit Message Preview */}
                {editingMessage && (
                  <div className="px-3 md:px-4 py-2 bg-gray-800/50 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-primary" />
                        <p className="text-xs text-gray-400">Edit message</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingMessage(null);
                          setEditText("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 bg-gray-800 border-gray-700"
                        autoFocus
                      />
                      <Button onClick={handleEditMessage} size="sm" className="bg-primary">
                        Save
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reply Preview */}
                {replyingTo && !editingMessage && (
                  <div className="px-3 md:px-4 py-2 bg-gray-800/50 border-t border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Reply className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-gray-400">Replying to</p>
                        <p className="text-sm truncate max-w-xs">{replyingTo.content}</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setReplyingTo(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="px-3 md:px-4 py-3 border-t border-gray-800 bg-gray-900/80">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Uploading file...</span>
                          <span className="text-xs font-semibold text-primary">{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-2 md:p-4 border-t border-gray-800 bg-gray-900/80 backdrop-blur-xl">
                  <div className="flex gap-1.5 md:gap-2 items-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => (isRecording ? stopRecording() : startRecording())}
                      disabled={isUploading}
                      className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0"
                    >
                      {isRecording ? (
                        <Square className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                      ) : (
                        <Mic className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0"
                    >
                      <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onBlur={() => updateTypingStatus(false)}
                      placeholder="Message..."
                      disabled={isUploading}
                      className="flex-1 bg-gray-800 border-gray-700 h-9 md:h-10 text-sm md:text-base"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={isUploading}
                      className="bg-primary h-9 w-9 md:h-10 md:w-10 flex-shrink-0"
                    >
                      <Send className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="mb-4">Select a conversation to start chatting</p>
                  <Button onClick={() => setShowNewMessage(true)} className="bg-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Message
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Message Modal - Bottom sheet on mobile, centered on desktop */}
        <AnimatePresence>
          {showNewMessage && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                onClick={() => setShowNewMessage(false)}
              />
              {/* Mobile: Bottom Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl border-t border-gray-800 z-50 max-h-[85vh] overflow-y-auto"
              >
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-12 h-1 bg-gray-700 rounded-full" />
                </div>

                <div className="p-4 pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">New Message</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNewMessage(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search users..."
                      className="pl-10 bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    {searching ? (
                      <p className="text-gray-400 text-center py-8">Searching...</p>
                    ) : searchResults.length === 0 && searchQuery ? (
                      <p className="text-gray-400 text-center py-8">No users found</p>
                    ) : searchQuery === "" ? (
                      <p className="text-gray-400 text-center py-8">
                        Start typing to search
                      </p>
                    ) : (
                      searchResults.map((result: any) => (
                        <div
                          key={result.id}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 active:bg-gray-700 transition-colors"
                        >
                          <button
                            onClick={() => {
                              setShowNewMessage(false);
                              navigate(`/user/${result.id}`);
                            }}
                            className="flex items-center gap-3 flex-1"
                          >
                            {result.profile_picture_url ? (
                              <img
                                src={result.profile_picture_url}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                <User className="w-6 h-6" />
                              </div>
                            )}
                            <div className="text-left flex-1">
                              <p className="font-semibold">{result.full_name}</p>
                              {result.username && (
                                <p className="text-sm text-gray-400">@{result.username}</p>
                              )}
                            </div>
                          </button>
                          <Button
                            size="sm"
                            onClick={() => handleSelectUser(result.id)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Desktop: Centered Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 p-6 z-50 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">New Message</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNewMessage(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name, username, email, or phone..."
                    className="pl-10 bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  {searching ? (
                    <p className="text-gray-400 text-center py-8">Searching...</p>
                  ) : searchResults.length === 0 && searchQuery ? (
                    <p className="text-gray-400 text-center py-8">No users found</p>
                  ) : searchQuery === "" ? (
                    <p className="text-gray-400 text-center py-8">
                      Start typing to search for users
                    </p>
                  ) : (
                    searchResults.map((result: any) => (
                      <div
                        key={result.id}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        <button
                          onClick={() => {
                            setShowNewMessage(false);
                            navigate(`/user/${result.id}`);
                          }}
                          className="flex items-center gap-3 flex-1"
                        >
                          {result.profile_picture_url ? (
                            <img
                              src={result.profile_picture_url}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                          <div className="text-left flex-1">
                            <p className="font-semibold">{result.full_name}</p>
                            {result.username && (
                              <p className="text-sm text-gray-400">@{result.username}</p>
                            )}
                          </div>
                        </button>
                        <Button
                          size="sm"
                          onClick={() => handleSelectUser(result.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Only show mobile nav when no chat is selected */}
      {!selectedConversation && <MobileNav />}
    </div>
  );
};

export default ChatFixed;
