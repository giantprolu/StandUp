const { Server } = require('socket.io');

let ioInstance = null;

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: "*",  // Keep this for development
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log('✅ Client connecté via socket.io');

    socket.on('disconnect', () => {
      console.log('❌ Client déconnecté');
    });
  });
}

function emitData(event, data) {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
}

module.exports = {
  initSocket,
  emitData,
};
