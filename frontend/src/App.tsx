import React, { useState, useEffect, useCallback } from 'react';
import { Message } from './types/message';
import { api } from './services/api';
import { initializeSocket, socketEvents } from './services/socket';
import { MessageItem } from './components/MessageItem';
import { MessageInput } from './components/MessageInput';
import { PinnedMessages } from './components/PinnedMessages';
import { UserSetup } from './components/UserSetup';
import { Pin, MessageCircle, Users } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [showPinned, setShowPinned] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [messagesData, pinnedData] = await Promise.all([
        api.getMessages(user.id),
        api.getPinnedMessages(user.id),
      ]);
      
      setMessages(messagesData);
      setPinnedMessages(pinnedData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadMessages();
      
      const newSocket = initializeSocket();
      setSocket(newSocket);

      newSocket.on(socketEvents.NEW_MESSAGE, (message: Message) => {
        if (message.senderId !== user.id && !message.deletedFor.includes(user.id)) {
          setMessages((prev) => [...prev, message]);
          if (message.isPinned) {
            setPinnedMessages((prev) => [...prev, message]);
          }
        }
      });

      newSocket.on(socketEvents.MESSAGE_DELETED_FOR_ME, ({ messageId, userId }: { messageId: string; userId: string }) => {
        if (userId === user.id) {
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
          setPinnedMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        }
      });

      newSocket.on(socketEvents.MESSAGE_DELETED_FOR_EVERYONE, ({ messageId }: { messageId: string }) => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        setPinnedMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      });

      newSocket.on(socketEvents.MESSAGE_PINNED, ({ messageId, isPinned }: { messageId: string; isPinned: boolean }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isPinned } : msg
          )
        );
        
        setPinnedMessages((prev) => {
          const message = prev.find((msg) => msg._id === messageId);
          if (message && !isPinned) {
            return prev.filter((msg) => msg._id !== messageId);
          } else if (!message && isPinned) {
            const msgToPin = messages.find((msg) => msg._id === messageId);
            return msgToPin ? [...prev, msgToPin] : prev;
          }
          return prev;
        });
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, messages]);

  const handleUserSet = (userId: string, userName: string) => {
    setUser({ id: userId, name: userName });
  };

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    try {
      const message = await api.sendMessage(content, user.id, user.name);
      setMessages((prev) => [...prev, message]);
      if (message.isPinned) {
        setPinnedMessages((prev) => [...prev, message]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDeleteForMe = async (messageId: string) => {
    if (!user) return;

    try {
      await api.deleteMessageForMe(messageId, user.id);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      setPinnedMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error('Failed to delete message for me:', error);
    }
  };

  const handleDeleteForEveryone = async (messageId: string) => {
    try {
      await api.deleteMessageForEveryone(messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      setPinnedMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error('Failed to delete message for everyone:', error);
    }
  };

  const handleTogglePin = async (messageId: string) => {
    try {
      const result = await api.togglePinMessage(messageId);
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isPinned: result.isPinned } : msg
        )
      );

      setPinnedMessages((prev) => {
        const message = prev.find((msg) => msg._id === messageId);
        if (message && !result.isPinned) {
          return prev.filter((msg) => msg._id !== messageId);
        } else if (!message && result.isPinned) {
          const msgToPin = messages.find((msg) => msg._id === messageId);
          return msgToPin ? [...prev, msgToPin] : prev;
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to pin/unpin message:', error);
    }
  };

  if (!user) {
    return <UserSetup onUserSet={handleUserSet} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Chat App</h1>
              <p className="text-sm text-gray-500">Welcome, {user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPinned(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Pin className="w-5 h-5" />
              {pinnedMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pinnedMessages.length}
                </span>
              )}
            </button>
            
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p>Start the conversation with a message!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <MessageItem
                  key={message._id}
                  message={message}
                  currentUserId={user.id}
                  onDeleteForMe={handleDeleteForMe}
                  onDeleteForEveryone={handleDeleteForEveryone}
                  onTogglePin={handleTogglePin}
                  isOwnMessage={message.senderId === user.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />

      {/* Pinned Messages Modal */}
      {showPinned && (
        <PinnedMessages
          pinnedMessages={pinnedMessages}
          currentUserId={user.id}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onTogglePin={handleTogglePin}
          onClose={() => setShowPinned(false)}
        />
      )}
    </div>
  );
}

export default App;
