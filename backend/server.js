const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://hemak8375_db_user:eknbtEQ5erATcngV@cluster0.mnbj2xj.mongodb.net/chatapp?appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));
// Message Schema
const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedFor: [{
    type: String
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  }
});

const Message = mongoose.model('Message', messageSchema);

// RESTful API Routes

// Get all messages (excluding messages deleted for current user)
app.get('/api/messages', async (req, res) => {
  try {
    const userId = req.query.userId || 'anonymous';
    const messages = await Message.find({
      $or: [
        { isDeleted: false },
        { deletedFor: { $ne: userId } }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
app.post('/api/messages', async (req, res) => {
  try {
    const { content, senderId, senderName } = req.body;
    
    if (!content || !senderId || !senderName) {
      return res.status(400).json({ error: 'Content, senderId, and senderName are required' });
    }
    
    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }
    
    const message = new Message({
      content: content.trim(),
      senderId,
      senderName
    });
    
    await message.save();
    
    // Emit to all connected clients
    io.emit('newMessage', message);
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete message for me
app.delete('/api/messages/:id/delete-for-me', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Add user to deletedFor array if not already there
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }
    
    // Emit to the specific user
    io.emit('messageDeletedForMe', { messageId: id, userId });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Delete message for everyone
app.delete('/api/messages/:id/delete-for-everyone', async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    message.isDeleted = true;
    await message.save();
    
    // Emit to all connected clients
    io.emit('messageDeletedForEveryone', { messageId: id });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Pin/Unpin message
app.put('/api/messages/:id/pin', async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    message.isPinned = !message.isPinned;
    await message.save();
    
    // Emit to all connected clients
    io.emit('messagePinned', { messageId: id, isPinned: message.isPinned });
    
    res.json({ success: true, isPinned: message.isPinned });
  } catch (error) {
    res.status(500).json({ error: 'Failed to pin/unpin message' });
  }
});

// Get pinned messages
app.get('/api/messages/pinned', async (req, res) => {
  try {
    const userId = req.query.userId || 'anonymous';
    const messages = await Message.find({
      isPinned: true,
      $or: [
        { isDeleted: false },
        { deletedFor: { $ne: userId } }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pinned messages' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
