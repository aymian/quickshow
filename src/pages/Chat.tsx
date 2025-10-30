import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, User, Plus, Search, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/supabase";
import { toast } from "sonner";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

const Chat = () => {
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

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadConversations();
    
    const userId = searchParams.get("user");
    if (userId) {
      startConversation(userId);
    }
  }, [user]);

  const loadConversations = async () => {
    const { data, error } = await authService.getConversations();
    if (!error && data) {
      setConversations(data);
    }
    setLoading(false);
  };

  const startConversation = async (userId: string) => {
    const { data: conversationId, error } = await authService.getOrCreateConversation(userId);
    if (!error && conversationId) {
      setSelectedConversation(conversationId);
      loadMessages(conversationId);
      // Reload conversations list to show the new conversation
      await loadConversations();
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await authService.getMessages(conversationId);
    if (!error && data) {
      setMessages(data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const { error } = await authService.sendMessage(selectedConversation, newMessage);
    if (error) {
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
    loadMessages(selectedConversation);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const { data, error } = await authService.searchUsers(query);
    if (!error && data) {
      setSearchResults(data);
    }
    setSearching(false);
  };

  const handleSelectUser = async (userId: string) => {
    setShowNewMessage(false);
    setSearchQuery("");
    setSearchResults([]);
    await startConversation(userId);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header onSearch={() => {}} />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Conversations List */}
          <div className="md:col-span-1 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
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
              <p className="text-gray-400 text-center py-8">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv: any) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => {
                      setSelectedConversation(conv.conversation_id);
                      loadMessages(conv.conversation_id);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-colors ${
                      selectedConversation === conv.conversation_id
                        ? "bg-primary/20 border border-primary"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
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
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {conv.other_user?.full_name || "User"}
                        </p>
                        {conv.last_message ? (
                          <p className="text-sm text-gray-400 truncate">
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

          {/* Chat Area */}
          <div className="md:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 flex flex-col h-[600px]">
            {selectedConversation ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message: any) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}>
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
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
                          <div>
                            <div
                              className={`p-3 rounded-2xl ${
                                isOwn
                                  ? "bg-primary text-white"
                                  : "bg-gray-800 text-gray-200"
                              }`}
                            >
                              <p>{message.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 px-2">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 border-gray-700"
                    />
                    <Button type="submit" size="icon" className="bg-primary">
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>

        {/* New Message Modal */}
        <AnimatePresence>
          {showNewMessage && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50"
                onClick={() => setShowNewMessage(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 p-6 z-50 max-h-[80vh] overflow-y-auto"
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

                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name, username, email, or phone..."
                    className="pl-10 bg-gray-800 border-gray-700"
                  />
                </div>

                {/* Search Results */}
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
                            {result.email && (
                              <p className="text-xs text-gray-500">{result.email}</p>
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

      <MobileNav />
    </div>
  );
};

export default Chat;
