const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log("🚀 HELLO DEPLOY");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
console.log("HELLO DEPLOY");
// Middleware
app.use(cors());
app.use(express.json());

// 🔥 MongoDB Connection (FINAL FIX)
mongoose.connect("mongodb+srv://hemak8375_db_user:eknbtEQ5erATcngV@cluster0.mnbj2xj.mongodb.net/chatapp?retryWrites=true&w=majority")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB FULL ERROR:", err));

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

// Routes
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

app.post('/api/messages', async (req, res) => {
  try {
    const { content, senderId, senderName } = req.body;

    if (!content || !senderId || !senderName) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const message = new Message({ content, senderId, senderName });
    await message.save();

    io.emit('newMessage', message);
    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.delete('/api/messages/:id/delete-for-me', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: 'Not found' });

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    io.emit('messageDeletedForMe', { messageId: id, userId });
    res.json({ success: true });

  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.delete('/api/messages/:id/delete-for-everyone', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: 'Not found' });

    message.isDeleted = true;
    await message.save();

    io.emit('messageDeletedForEveryone', { messageId: id });
    res.json({ success: true });

  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.put('/api/messages/:id/pin', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: 'Not found' });

    message.isPinned = !message.isPinned;
    await message.save();

    io.emit('messagePinned', { messageId: id, isPinned: message.isPinned });
    res.json({ success: true });

  } catch {
    res.status(500).json({ error: 'Pin failed' });
  }
});

app.get('/api/messages/pinned', async (req, res) => {
  try {
    const messages = await Message.find({ isPinned: true });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});
console.log("DEPLOY TEST");

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});