var express = require('express');
var socket = require('socket.io');


var app = express();
var server = app.listen(3000);
var io = socket(server);

app.use(express.static('public'));

io.sockets.on('connection', (socket) => {
  socket.on('mouse', (data) => {
    socket.broadcast.emit('mouse', data);
  })
});
