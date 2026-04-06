# Real-Time Chat Application

A full-stack chat application built with React, Node.js, Express, Socket.io, and MongoDB as part of the Adverayze technical assignment.

## Features

- **Real-time Messaging**: Send and receive messages instantly using WebSockets
- **Message Deletion**: 
  - Delete for me: Remove messages only for the current user
  - Delete for everyone: Remove messages for all users (message owners only)
- **Message Pinning**: Pin important messages for easy access
- **Modern UI**: Clean, responsive interface built with TailwindCSS
- **User Authentication**: Simple username-based user identification
- **Persistent Storage**: Messages persist across page refreshes using MongoDB

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Socket.io-client** for real-time communication
- **Lucide React** for icons
- **date-fns** for date formatting

### Backend
- **Node.js** with Express.js
- **Socket.io** for WebSocket connections
- **MongoDB** with Mongoose ODM
- **CORS** for cross-origin requests

### Database
- **MongoDB Atlas** (cloud-hosted)

## Project Structure

```
adveryaze/
├── backend/
│   ├── node_modules/
│   ├── server.js              # Main server file
│   ├── package.json
│   ├── .env                   # Environment variables
│   └── render.yaml            # Render deployment config
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── MessageItem.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── PinnedMessages.tsx
│   │   │   └── UserSetup.tsx
│   │   ├── services/          # API and socket services
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── types/             # TypeScript types
│   │   │   └── message.ts
│   │   ├── App.tsx            # Main App component
│   │   └── index.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vercel.json            # Vercel deployment config
└── README.md
```

## API Endpoints

### Messages
- `GET /api/messages?userId=<userId>` - Get all messages (excluding deleted for user)
- `POST /api/messages` - Send a new message
- `DELETE /api/messages/:id/delete-for-me` - Delete message for current user
- `DELETE /api/messages/:id/delete-for-everyone` - Delete message for all users
- `PUT /api/messages/:id/pin` - Pin/unpin a message
- `GET /api/messages/pinned?userId=<userId>` - Get pinned messages

### WebSocket Events
- `newMessage` - New message received
- `messageDeletedForMe` - Message deleted for specific user
- `messageDeletedForEveryone` - Message deleted for all users
- `messagePinned` - Message pinned/unpinned

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (for cloud database)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adveryaze
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chatapp
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

5. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

6. **Configure frontend environment**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

7. **Start the frontend development server**
   ```bash
   npm start
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Deployment

### Backend (Render)
1. Push the code to a GitHub repository
2. Connect the repository to Render
3. Use the `render.yaml` configuration file
4. Set environment variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `FRONTEND_URL`: Your deployed frontend URL

### Frontend (Vercel)
1. Push the code to a GitHub repository
2. Connect the repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `REACT_APP_API_URL`: Your deployed backend URL
   - `REACT_APP_SOCKET_URL`: Your deployed backend URL

## Design Decisions and Tradeoffs

### Architecture
- **Monolithic Backend**: Chose a single Express.js server for simplicity and ease of deployment
- **RESTful API + WebSockets**: Combined REST for CRUD operations with WebSockets for real-time updates
- **MongoDB**: NoSQL database chosen for flexibility with message schema

### Frontend Architecture
- **Component-based Design**: Modular React components for maintainability
- **TypeScript**: Added type safety for better development experience
- **TailwindCSS**: Utility-first CSS for rapid UI development

### Real-time Implementation
- **Socket.io**: Chosen over raw WebSockets for better browser compatibility and fallback support
- **Event-driven**: Used event emitters for real-time updates

### Security Considerations
- **Input Validation**: Basic validation on both frontend and backend
- **CORS**: Configured for cross-origin requests
- **Environment Variables**: Sensitive data stored in environment variables

### Tradeoffs
- **Simplified Authentication**: Used username-based identification instead of full auth system for demo purposes
- **Single Chat Room**: Implemented as a single global chat room for simplicity
- **No Message History Limits**: Currently loads all messages; in production, would implement pagination

## Known Limitations

1. **No User Authentication**: Simplified to username-based identification
2. **Single Chat Room**: All users share one chat space
3. **No Message History Pagination**: Loads all messages at once
4. **No File/Image Support**: Text messages only
5. **No Typing Indicators**: Could be added with additional Socket.io events
6. **No Online User List**: Shows "Online" status but no actual user tracking

## Performance Considerations

- **Database Indexing**: Should add indexes on timestamps and user fields for production
- **Message Pagination**: Implement pagination for large message histories
- **Caching**: Could add Redis caching for frequently accessed messages
- **CDN**: Static assets could be served via CDN in production

## Future Enhancements

1. **User Authentication**: Implement JWT-based authentication
2. **Multiple Chat Rooms**: Support for private and group chats
3. **File Sharing**: Add support for images and documents
4. **Message Reactions**: Add emoji reactions to messages
5. **Message Search**: Implement search functionality
6. **User Profiles**: Add user avatars and profiles
7. **Push Notifications**: Browser notifications for new messages

## Testing

The application includes basic error handling and validation. For production use, consider adding:
- Unit tests for API endpoints
- Integration tests for WebSocket events
- Frontend component tests
- End-to-end testing

## License

This project was created as part of a technical assignment for Adverayze.

## Contact

For questions about this implementation, please contact the development team.
