'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Lock, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  huddleId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
  };
}

interface HuddleChatProps {
  huddleId: string;
  personId: string;
  personName: string;
}

export function HuddleChat({ huddleId, personId, personName }: HuddleChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch initial messages and mark as read
  useEffect(() => {
    fetchMessages();
    markAsRead();
  }, [huddleId]);

  // Mark huddle as read
  const markAsRead = async () => {
    try {
      await fetch(`/api/huddles/${huddleId}/read`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`huddle-${huddleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'HuddleMessage',
          filter: `huddleId=eq.${huddleId}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          // Fetch the full message with sender info
          fetchNewMessage(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [huddleId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/huddles/${huddleId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/huddles/${huddleId}/messages/${messageId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.message) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err) {
      console.error('Failed to fetch new message:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      const res = await fetch(`/api/huddles/${huddleId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send message');
      }

      // Message will appear via real-time subscription
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err.message || 'Failed to send message');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (senderId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = senderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-gray-900">Huddle Chat</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Private & Confidential</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Shield className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start the conversation with your brothers
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === personId;
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar (only for others) */}
                {!isOwnMessage && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getAvatarColor(
                      message.senderId
                    )}`}
                  >
                    {getInitials(message.sender.displayName)}
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage ? 'items-end' : 'items-start'
                  } flex flex-col`}
                >
                  {!isOwnMessage && (
                    <span className="text-xs text-gray-500 font-medium mb-1">
                      {message.sender.displayName}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  <span
                    className={`text-xs text-gray-400 mt-1 ${
                      isOwnMessage ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2">
          Messages are private to huddle members only
        </p>
      </div>
    </div>
  );
}
