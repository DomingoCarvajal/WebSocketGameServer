

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const { sendMessageToRoom } = require('./socketController');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

const rooms = {}; // Store active rooms and their members

// Function to generate a unique ID for rooms
function generateRoomId() {
  return Math.random().toString(36).substr(2, 9);
}

// Function to find an available room
function findAvailableRoom() {
  for (const roomId in rooms) {
    if (rooms[roomId].length < 2) {
      return roomId;
    }
  }
  return null;
}

io.on('connection', (socket) => {
  console.log('New client connected');

  // Joining a game
  socket.on('joinGame', () => {
    const availableRoomId = findAvailableRoom() || generateRoomId();
    socket.join(availableRoomId);

    if (!rooms[availableRoomId]) {
      rooms[availableRoomId] = [socket.id];
    } else {
      rooms[availableRoomId].push(socket.id);
    }

    const roomSize = rooms[availableRoomId].length;
    if (roomSize === 2) {
      io.to(availableRoomId).emit('gameStarted', { roomId: availableRoomId, players: rooms[availableRoomId], turn: rooms[availableRoomId][0] });
    }
  });

  // Handling messages when the game has started
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    const roomId = message.roomId;
    const roomMembers = rooms[roomId];
    const userIndex = roomMembers.indexOf(socket.id);
    const sender = userIndex === 0 ? 'Player 1' : 'Player 2';

    sendMessageToRoom(io, roomId, 'message', { sender, content: message.content });

    // io.to(roomId).emit('message', { sender, content: message.content });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');

    // Remove disconnected user from rooms
    for (const roomId in rooms) {
      const index = rooms[roomId].indexOf(socket.id);
      if (index !== -1) {
        rooms[roomId].splice(index, 1);
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

