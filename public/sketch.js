// Drawing canvas for Mixi - GANS + IA
// Michael Gingras for IDEO CoLab
// July + August 2018


// CONSTANT VARIABLES
// ---


const MAIN_WIDTH = 600;
const MAIN_HEIGHT = 600;
const SIDECANVAS_WIDTH = 200;
const SIDECANVAS_HEIGHT = 200;

var SCREEN_WIDTH;
var SCREEN_HEIGHT;

const LINE_COLOR = 0;
const STROKE_WIDTH = 5.0;
const SCALE  = MAIN_WIDTH/SIDECANVAS_WIDTH;
const EPSILON = 2;

const RESET_STRING = 'reset';


// VARIABLES THAT ARE GOING TO CHANGE
// ---

// at the very beginning of the drawing, there will be no prior lines to draw.
// need to init these sorts of variables.
var startx;
var starty;
var startTime;

// the current x,y position
var x;
var y;

var currently_drawing = false; // currently_drawing... is the user drawing _right now_

var lines = []; // what lines are in the users drawing??
var adx = []; // autodraw x
var ady = []; // autodraw y
var adt = []; // autodraw time
var adHistory = []; // array of AD drawings added to canvas so it can be repopulated


var s1 = function( p ) {

   p.setup = function() {
     var cv = p.createCanvas(SIDECANVAS_WIDTH, SIDECANVAS_HEIGHT);
     cv.attribute('data-id', 0);
    //  p.background(150);
   }

   p.draw = function() {
     process_screens(p);
   }
}

var s2 = function( p ) {

   p.setup = function() {
     var cv = p.createCanvas(SIDECANVAS_WIDTH, SIDECANVAS_HEIGHT);
     cv.attribute('data-id', 1);
    //  p.background(150);
   }

   p.draw = function() {
     process_screens(p);
   }
}

var s3 = function( p ) {

   p.setup = function() {
     var cv = p.createCanvas(SIDECANVAS_WIDTH, SIDECANVAS_HEIGHT);
     cv.attribute('data-id', 2);
    //  p.background(150);
   }

   p.draw = function() {
     process_screens(p);
   }
}

var s4 = function( p ) {

   p.setup = function() {
     var cv = p.createCanvas(SIDECANVAS_WIDTH, SIDECANVAS_HEIGHT);
     cv.attribute('data-id', 3);
    //  p.background(150);
   }

   p.draw = function() {
     process_screens(p);
   }
}

/*
Draw Strokes (GLOBAL)
---
draw strokes draws a single line from x,y to x+dx, y+dy...
it is repeatedly called from function _________.

All it really does it draw lines tho.
*/
var draw_strokes = function(x,y,dx,dy,p,s) {

  if (s) { p.strokeWeight(1.0);}
  else{ p.strokeWeight(STROKE_WIDTH);}

  p.stroke(LINE_COLOR);
  p.line(x,y,x+dx,y+dy);

  // TODO:
  // possibly draw on the smaller screens?

}

var process_screens = function(p) {
  var first = true;
  var reset = false;
  for (var i = 0; i < lines.length; i++) {
    var pt = lines[i];

    if(lines[i] == RESET_STRING){
      reset = true;
    }

    if (reset) {
      var x = pt[0]/SCALE;
      var y = pt[1]/SCALE;
      reset = false;
    } else {
      var dx = (pt[0]/SCALE - x);
      var dy = (pt[1]/SCALE - y);

      draw_strokes(x,y,dx,dy,p,true);

      x = pt[0]/SCALE;
      y = pt[1]/SCALE;
    }
  }
}


var s = function( p ) {
  var socket;

   p.setup = function() {
    init();
    socket = io.connect('localhost:3000');
    // socket.on('mouse', newDrawing);

  }

  function init() {
    screen_width = Math.max(window.innerWidth, 480);
    screen_height = Math.max(window.innerHeight, 320);
    p.frameRate(30);
    p.createCanvas(MAIN_WIDTH, MAIN_HEIGHT);
    p.background(240);
  }

  /*
  Process User Input
  ---

  Process user input gets called every frame in the p.draw function on the main processing loop.
  So, the main loop is constantly watching for new user input, which then gets processed in this function.

  */
  var process_user_input = function() {

    if (p.mouseIsPressed && p.mouseX > 0 && p.mouseX < 600 && p.mouseY < 600 && p.mouseY > 0 ) { // should bound this to the box...
      if (!currently_drawing){ // not currently drawing
        x = p.mouseX;
        y = p.mouseY;
        startx = x;
        starty = y;
        startTime = Date.now();

        // for the regular drawing
        lines.push(RESET_STRING);
        lines.push([x,y]);

        // for autodraw
        adx.push(x);
        ady.push(y);
        adt.push(0);

        currently_drawing = true;
      } else { // not the first start of the drawing

        dx = p.mouseX - x;
        dy = p.mouseY - y;
        var time = Date.now() - startTime;

        if(dx*dx+dy*dy > EPSILON*EPSILON) {
          draw_strokes(x,y,dx,dy,p,false);
          x = p.mouseX;
          y = p.mouseY;
          lines.push([x,y])

          adx.push(x);
          ady.push(y);
          adt.push(time);
        }
      }

    }
    else{
      currently_drawing = false;
    }
  }



  p.mouseDragged = function() {
    var data = {
      'x': p.mouseX,
      'y': p.mouseY
    };

    socket.emit('mouse', data);
  }

  p.draw = function(){
    process_user_input();
  }

};

/*
Display Suggestions


*/
function displaySuggestions(arr) {
    var count = 0; // number of suggestion boxes... can change?
    cacheArr = [];
    // console.log(elem.innerHTML);
    arr.forEach((a) => {
      if (a in window.stencils) {
        window.stencils[a].forEach((b) => {
            if(count < 4){
              suggestionArr[count].innerHTML += '<img id="img'+count+'"class="suggestion-img" src="' + b.src + '"/>';
              cacheArr.push(b.src);
              count++;
            }
        });
      }
    });
    cacheImages(cacheArr);
}

/*
Submit to Autodraw
---

This function packages the drawing strokes into an AJAX call that is sent to googles
autodraw API. autodraw API then returns back an array of its best guesses in the form of strings.
That string array is then passed into displaySuggestions.
*/
var submit_to_autodraw = function(){
  var adData = [[adx, ady, adt]];
  var url = 'https://inputtools.google.com/request?ime=handwriting&app=autodraw&dbg=1&cs=1&oe=UTF-8';
  var requestBody = {
      input_type: 0,
      requests: [{
          ink: adData,
          language: 'autodraw',
          writing_guide: {
              height: 1200,
              width: 1200
          }
      }]
  };
  fetch(url, {
      method: 'POST',
      headers: new Headers({
          'Content-Type': 'application/json; charset=utf-8'
      }),
      body: JSON.stringify(requestBody),
  }).then(function (response) {
      return response.json();
  }).then(function (jsonResponse) {
      displaySuggestions(jsonResponse[1][0][1]);
  });
}



// Processing Instantiations
var s1box = document.getElementById('js--suggest-1');
var s2box = document.getElementById('js--suggest-2');
var s3box = document.getElementById('js--suggest-3');
var s4box = document.getElementById('js--suggest-4');

var suggestionArr = [s1box, s2box, s3box, s4box];

var myp5 = new p5(s, document.getElementById('js--main-canvas'));
var s1   = new p5(s1, s1box);
var s2   = new p5(s2, s2box);
var s3   = new p5(s3, s3box);
var s4   = new p5(s4, s4box);



// Regular JS stuff
var submit_button = document.getElementById('submit');
submit_button.addEventListener('click', () => {
  submit_to_autodraw();
})


var drawImage = function() {
  var id = this.children[0].getAttribute('data-id');
  console.log(id);
  var canvas = document.getElementById('defaultCanvas0');
  var context = canvas.getContext('2d');
  var img = new Image();
  var dimensions = getDimensions(adx, ady);
  var position = getPosition(adx, ady);
  var h = dimensions[0];
  var w = dimensions[1];
  var x = position[0] - w;
  var y = position[1] - h;
  img.src = './imgs/cache'+id+'.svg';
  resetScreen();
  img.onload = function(){
    console.log('loaded');
    context.drawImage(img,x,y,h,w);
  };
}

var suggestionBoxes = document.getElementsByClassName("suggestion-item");
Array.from(suggestionBoxes).forEach(function(element) {
      console.log(element);
      element.addEventListener('click', drawImage);
});

var resetScreen = function() {
  // clear all the position and time arrays
  adx = [];
  ady = [];
  adt = [];
  lines = [];

  var imgs = Array.from(document.getElementsByClassName('suggestion-img'));
  var l = imgs.length;
  for (var i = 0; i < l; i++) {
    var img = imgs[i];
    img.parentNode.removeChild(img);
  }
  var canvas = document.getElementById('defaultCanvas0');
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  // going to have to put all the images back on thes creen
}

// arr is the array of images that should be cached.
// 'cached' means I am storing them in a temp img folder.
// have not yet thoght about cache redundency
var cacheImages = function(arr) {
  var data = JSON.stringify({'urls': arr});
  $.ajax({
    type: "POST",
    url: '/cache',
    data: {'urls': arr},
    success: function(){
      console.log('it worked');
    }
  });

}

/*
Get Dimensions
---

We need this function to get the width/height of the users drawing. Probably
going to have to do this on a stroke by stroke basis. There are so many moving parts
to this project, YIKES alert, it needs some organizing but I dont Have TIME!

probably just need to clear this whenever they submit.
aka that would turn into a new drawing duh.
*/
var getDimensions = function(adx,ady){
  var maxX = Math.max.apply(null, adx);
  var minX = Math.min.apply(null, adx);
  var maxY = Math.max.apply(null, ady);
  var minY = Math.min.apply(null, ady);

  var dx = maxX - minX;
  var dy = maxY - minY;

  return [dx,dy];
}

var getPosition = function(adx, ady){
  var xSort = adx.slice(0).sort();
  var ySort = ady.slice(0).sort(); // we dont want to mutate these arrays.

  var mid = parseInt(xSort.length/2); // mid is same for both... needs to be integer for array indexing later.

  return [adx[mid], ady[mid]];

}

var export_button = document.getElementById('export');
export_button.addEventListener('click', () => {
  var canvas = document.getElementById('defaultCanvas0');
  var context = canvas.getContext('2d');
  var w = canvas.width;
  var h = canvas.height;
  var data;

  data = context.getImageData(0, 0, w, h);
  var compositeOperation = context.globalCompositeOperation;
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = '#FFFFFF';
  context.fillRect(0,0,w,h);

  var imageData = canvas.toDataURL("image/png");
  context.clearRect (0,0,w,h);
  context.putImageData(data, 0,0);
  context.globalCompositeOperation = compositeOperation;

  // I cant for the life of me figure out how to make POSTs in vanilla JS
  // and it makes me really sad
  $.ajax({
    type: "POST",
    url: '/save',
    data: {'image': imageData},
    success: function(){
      console.log('it worked');
    }
  });
})
