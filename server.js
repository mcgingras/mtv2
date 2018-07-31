var express = require('express');
var socket = require('socket.io');
const bodyParser = require('body-parser');
const base64Img = require('base64-img');


var app = express();
var server = app.listen(3000);
var io = socket(server);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/save', (req, res) => {
  const image = req.body.image;
  base64Img.imgSync(req.body.image, 'data/', 'sketch');
  res.status(200).send();

})

io.sockets.on('connection', (socket) => {
  socket.on('mouse', (data) => {
    socket.broadcast.emit('mouse', data);
  })
});
