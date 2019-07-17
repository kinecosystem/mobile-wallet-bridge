const io = require('socket.io').listen(81);

// Register 'connection' events to the WebSocket
io.sockets.on('connection', function (socket) {
  // Register 'join' events, requested by a connected socket
  console.log(`Clien ${socket.id} has connected`)
  io.sockets.in(room).emit('connection', true);

  socket.on('join', function (room) {
    // join channel provided by socket
    socket.join(room);
    console.log(`Clien ${socket.id} has has joined ${room}`)

    io.sockets.in(room).emit('alert', `Clien ${socket.id} has joined ${room}`);

    // Register 'ping' event, sent by the socket
    socket.on('msg', function (msg) {
      // Broadcast the 'pong' event to all other sockets in the room
      console.log(`Clien ${socket.id} has send msg: ${msg}`)
      io.sockets.in(room).emit('alert', msg);
    });
  });
});