import React from 'react';
import { Message } from '../types/message';
import { MessageItem } from './MessageItem';
import { Pin, X } from 'lucide-react';

interface PinnedMessagesProps {
  pinnedMessages: Message[];
  currentUserId: string;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onTogglePin: (messageId: string) => void;
  onClose: () => void;
}

export const PinnedMessages: React.FC<PinnedMessagesProps> = ({
  pinnedMessages,
  currentUserId,
  onDeleteForMe,
  onDeleteForEveryone,
  onTogglePin,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Pin className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold">Pinned Messages</h2>
            <span className="text-sm text-gray-500">
              ({pinnedMessages.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {pinnedMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Pin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No pinned messages yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pinnedMessages.map((message) => (
                <MessageItem
                  key={message._id}
                  message={message}
                  currentUserId={currentUserId}
                  onDeleteForMe={onDeleteForMe}
                  onDeleteForEveryone={onDeleteForEveryone}
                  onTogglePin={onTogglePin}
                  isOwnMessage={message.senderId === currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
