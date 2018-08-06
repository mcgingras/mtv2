var express = require('express');
var socket = require('socket.io');
const bodyParser = require('body-parser');
const base64Img = require('base64-img');
const request = require('request');
const fs = require('fs');

const { spawn } = require('child_process');

// ../GAN/pix2pix.py --mode test --output_dir ../GAN/images/test --input_dir ../GAN/images/testinput --checkpoint ../GAN/models/pizza_train
const time = String(Date.now());
const processGan = ['../GAN/tools/process.py', '--input_dir', '../GAN/inputData', '--b_dir', '../GAN/inputData', '--operation', 'combine', '--output_dir', '../GAN/images/inputs/'+time];
const runGan = ['../GAN/pix2pix.py', '--mode', 'test', '--output_dir', '../GAN/images/outputs/'+time, '--input_dir', '../GAN/images/inputs/'+time, '--checkpoint', '../GAN/models/pizza_train'];

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
  base64Img.imgSync(req.body.image, '../GAN/inputData/', 'sketch');

  const pro = spawn('python', processGan);
  pro.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pro.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  pro.on('close', (code) => {
    const run = spawn('python', runGan);
    run.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    run.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    run.on('close', (code) => {
      console.log('it is done!!');
    })
  });



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
