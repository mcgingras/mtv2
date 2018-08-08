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
  const type  = req.body.type;
  var time = String(Date.now());
  var models = [];
  base64Img.imgSync(req.body.image, './GAN/inputData/'+time, 'sketch');
  var processGan = ['./GAN/tools/process.py', '--input_dir', './GAN/inputData/'+time, '--b_dir', './GAN/inputData/'+time, '--operation', 'combine', '--output_dir', './GAN/images/inputs/'+time];

  if (type == 'pizza'){
    models.push('pizza');
  }

  else if (type == "watercolor"){
    models.push('rose');
    models.push('space');
    models.push('pabloortiz');
    models.push('chenjie');
  }

  else if (type == "bw"){
    models.push('pointilism');
    models.push('jiomaia');
  }

  const pro = spawn('python', processGan);

  var count = 0;
  pro.on('close', (code) => {
    models.forEach((model) =>{
      var runGan = ['./GAN/pix2pix.py', '--mode', 'test', '--output_dir', './public/imgs/gans/'+time+'/'+model, '--input_dir', './GAN/images/inputs/'+time, '--checkpoint', './GAN/models/'+model+'_train'];
      const run = spawn('python', runGan);
      run.on('close', (code) => {
        count++;
        console.log('it is done! '+model);
        if(count == models.length){
          res.send({'time': time, 'models': models});
        }
      });
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
