var express = require('express');
var socket = require('socket.io');
const bodyParser = require('body-parser');
const base64Img = require('base64-img');
const request = require('request');
const fs = require('fs');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var app = express();
var server = app.listen(3000);
var io = socket(server);

app.use(express.static('public'));
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/save', (req, res) => {
  const image = req.body.image;
  base64Img.imgSync(req.body.image, 'data/', 'sketch');
  res.status(200).send();

});

app.post('/cache', (req, res) => {
  console.log(req.body);
  var urls = req.body['urls'];
  urls.forEach((url) => {
    var meta = url.split('/')
    var artist  = meta[meta.length-2];
    var title   = meta[meta.length-1];
    // download(url, './public/imgs/'+artist+'/'+title, function(){
    download(url, './public/imgs/'+artist+title, function(){
      console.log('picture saved'); //?
    });
  });
})

io.sockets.on('connection', (socket) => {
  socket.on('mouse', (data) => {
    socket.broadcast.emit('mouse', data);
  })
});
