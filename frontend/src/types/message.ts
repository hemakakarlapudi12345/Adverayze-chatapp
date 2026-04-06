export interface Message {
  _id: string;
  content: string;
  timestamp: string;
  isDeleted: boolean;
  deletedFor: string[];
  isPinned: boolean;
  senderId: string;
  senderName: string;
}
