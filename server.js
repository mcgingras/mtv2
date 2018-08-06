var express = require('express');
var socket = require('socket.io');
const bodyParser = require('body-parser');
const base64Img = require('base64-img');
const request = require('request');
const fs = require('fs');

const { spawn } = require('child_process');


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
  var time = String(Date.now());
  base64Img.imgSync(req.body.image, './GAN/inputData/'+time, 'sketch');

  var processGan = ['./GAN/tools/process.py', '--input_dir', './GAN/inputData/'+time, '--b_dir', './GAN/inputData/'+time, '--operation', 'combine', '--output_dir', './GAN/images/inputs/'+time];
  var runGan = ['./GAN/pix2pix.py', '--mode', 'test', '--output_dir', './public/imgs/gans/'+time, '--input_dir', './GAN/images/inputs/'+time, '--checkpoint', './GAN/models/pointilism_train'];

  const pro = spawn('python', processGan);

  pro.on('close', (code) => {
    const run = spawn('python', runGan);
    run.on('close', (code) => {
      console.log('it is done!');
      res.send(time);
    })
  });
});

app.post('/cache', (req, res) => {
  var urls = req.body['urls'];
  urls.forEach((url) => {
    var meta = url.split('/')
    var artist  = meta[meta.length-2];
    var title   = meta[meta.length-1];
    // download(url, './public/imgs/'+artist+'/'+title, function(){
    download(url, './public/imgs/'+artist+title, function(){});
  });
})

io.sockets.on('connection', (socket) => {
  socket.on('mouse', (data) => {
    socket.broadcast.emit('mouse', data);
  })
});
