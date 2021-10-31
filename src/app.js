const express = require('express');
const app = express();
const { v4: uuidV4 } = require('uuid');
const fs = require('fs');
const https = require('https');
const path = require('path');

const options = {
  key: fs.readFileSync(path.join(__dirname, '../cert/localhost+1-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../cert/localhost+1.pem')),
};

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

const PORT = process.env.PORT || 443;
const server = https.createServer(options, app).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('connected');
  socket.on('join-room', (roomId, userId) => {
    console.log(`[join-room] roomId: ${roomId}, userId: ${userId}`);
    
    socket.join(roomId, userId);
    socket
      .broadcast
      .to(roomId)
      .emit('user-connected', userId);

    socket.on('disconnect', () => {
      console.log(`[disconnect] roomId: ${roomId}, userId: ${userId}`);
      socket
        .broadcast
        .to(roomId)
        .emit('user-disconnected', userId);
    });
  });
  
});