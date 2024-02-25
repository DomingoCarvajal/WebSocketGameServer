const { Server } = require('socket.io');

const rooms = {};

function generateRoomId() {
  return Math.random().toString(36).substr(2, 9);
}

function findAvailableRoom() {
  for (const roomId in rooms) {
    if (rooms[roomId].length < 2) {
      return roomId;
    }
  }
  return generateRoomId();
}

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinGame', () => {
      const availableRoomId = findAvailableRoom();
      socket.join(availableRoomId);

      if (!rooms[availableRoomId]) {
        rooms[availableRoomId] = [socket.id];
      } else {
        rooms[availableRoomId].push(socket.id);
      }

      const roomSize = rooms[availableRoomId].length;
      if (roomSize === 2) {
        io.to(availableRoomId).emit('gameStarted', {
          roomId: availableRoomId,
          players: rooms[availableRoomId],
          turn: rooms[availableRoomId][0],
        });
      }
    });

    // Handling messages when the game has started
    socket.on('sendMessage', (message) => {
        console.log('Message received:', message);
        const roomId = message.roomId;
        const roomMembers = rooms[roomId];
        const userIndex = roomMembers.indexOf(socket.id);
        const sender = userIndex === 0 ? 'Player 1' : 'Player 2';
        const turn = roomMembers[userIndex === 0 ? 1 : 0];

        sendMessageToRoom(io, roomId, 'message', { sender, content: message.content, turn });
    });


    socket.on('disconnect', () => {
      console.log('Client disconnected');

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

  return io;
}

function sendMessageToRoom(io, roomId, event, data) {
  io.to(roomId).emit(event, data);
}

module.exports = {
  initializeSocket,
  sendMessageToRoom,
};
