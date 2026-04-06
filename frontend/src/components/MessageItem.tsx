import React, { useState } from 'react';
import { Message } from '../types/message';
import { Pin, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onTogglePin: (messageId: string) => void;
  isOwnMessage: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  onDeleteForMe,
  onDeleteForEveryone,
  onTogglePin,
  isOwnMessage,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDeleteForMe = () => {
    onDeleteForMe(message._id);
    setShowMenu(false);
  };

  const handleDeleteForEveryone = () => {
    onDeleteForEveryone(message._id);
    setShowMenu(false);
  };

  const handleTogglePin = () => {
    onTogglePin(message._id);
    setShowMenu(false);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  return (
    <div
      className={`relative group p-4 rounded-lg mb-2 transition-all ${
        message.isPinned
          ? 'bg-yellow-50 border border-yellow-200'
          : isOwnMessage
          ? 'bg-blue-50 ml-auto max-w-[70%]'
          : 'bg-gray-50 max-w-[70%]'
      }`}
    >
      {message.isPinned && (
        <div className="absolute top-2 right-2">
          <Pin className="w-4 h-4 text-yellow-600" />
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-semibold text-sm text-gray-700">
            {message.senderName}
          </span>
          {isOwnMessage && (
            <span className="ml-2 text-xs text-blue-600 font-medium">You</span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>

      <div className="text-gray-800 whitespace-pre-wrap break-words">
        {message.content}
      </div>

      {/* Message actions menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {showMenu && (
          <div className="absolute top-6 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
            <button
              onClick={handleTogglePin}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Pin className="w-4 h-4" />
              {message.isPinned ? 'Unpin' : 'Pin'}
            </button>
            
            <button
              onClick={handleDeleteForMe}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete for me
            </button>
            
            {isOwnMessage && (
              <button
                onClick={handleDeleteForEveryone}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete for everyone
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
