import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const initializeSocket = (): Socket => {
  return io(SOCKET_URL, {
    transports: ['websocket'],
  });
};

export const socketEvents = {
  NEW_MESSAGE: 'newMessage',
  MESSAGE_DELETED_FOR_ME: 'messageDeletedForMe',
  MESSAGE_DELETED_FOR_EVERYONE: 'messageDeletedForEveryone',
  MESSAGE_PINNED: 'messagePinned',
};
