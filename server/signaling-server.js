/* Minimal Socket.IO signaling server for WebRTC (ESM) */
import http from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3001;
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('join', (room) => {
    socket.join(room);
    socket.to(room).emit('peer-joined', { socketId: socket.id });
  });

  socket.on('offer', ({ room, sdp }) => {
    socket.to(room).emit('offer', { from: socket.id, sdp });
  });

  socket.on('answer', ({ room, sdp }) => {
    socket.to(room).emit('answer', { from: socket.id, sdp });
  });

  socket.on('candidate', ({ room, candidate }) => {
    socket.to(room).emit('candidate', { from: socket.id, candidate });
  });

  socket.on('hangup', ({ room }) => {
    socket.to(room).emit('hangup');
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) socket.to(room).emit('peer-left', { socketId: socket.id });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server listening on :${PORT}`);
});
