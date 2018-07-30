// Drawing canvas for Mixi - GANS + IA
// Michael Gingras for IDEO CoLab
// July + August 2018


// CONSTANT VARIABLES
// ---


var MAIN_WIDTH = 600;
var MAIN_HEIGHT = 600;
var SIDECANVAS_WIDTH = 150;
var SIDECANVAS_HEIGHT = 150;

var SCREEN_WIDTH;
var SCREEN_HEIGHT;

var LINE_COLOR = 0;
var STROKE_WIDTH = 5.0;

var SCALE  = 4;
var EPSILON = 2;



// VARIABLES THAT ARE GOING TO CHANGE
// ---

// at the very beginning of the drawing, there will be no prior lines to draw.
// need to init these sorts of variables.
var startx;
var starty;

// the current x,y position
var x;
var y;

var currently_drawing = false; // currently_drawing... is the user drawing _right now_

var lines = []; // what lines are in the users drawing??

var s1 = function( p ) {

   p.setup = function() {
     p.createCanvas(SIDECANVAS_WIDTH, SIDECANVAS_HEIGHT);
    //  p.background(150);
   }

   p.draw = function() {
     process_screens(p);
   }
}

var s2 = function( p ) {

   p.setup = function() {
     p.createCanvas(SIDECANVAS_WIDTH, SIDECANVAS_HEIGHT);
    //  p.background(150);
   }

   p.draw = function() {
     process_screens(p);
   }
}

var s3 = function( p ) {

   p.setup = function() {
     p.createCanvas(SIDECANVAS_WIDTH, SIDECANVAS_HEIGHT);
    //  p.background(150);
   }

   p.draw = function() {
     process_screens(p);
   }
}

var s4 = function( p ) {

   p.setup = function() {
     p.createCanvas(SIDECANVAS_WIDTH, SIDECANVAS_HEIGHT);
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
var draw_strokes = function(x,y,dx,dy,p) {

  p.stroke(LINE_COLOR);
  p.strokeWeight(STROKE_WIDTH);
  p.line(x,y,x+dx,y+dy);

  // TODO:
  // possibly draw on the smaller screens?

}

var process_screens = function(p) {
  var first = true;
  for (var i = 0; i < lines.length; i++) {
    var pt = lines[i];

    if (i == 0){
      var x = pt[0]/SCALE;
      var y = pt[1]/SCALE;
    } else {
      var dx = (pt[0]/SCALE - x);
      var dy = (pt[1]/SCALE - y);

      draw_strokes(x,y,dx,dy,p);

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

    if (p.mouseIsPressed) { // should bound this to the box...
      if (!currently_drawing){ // not currently drawing
        x = p.mouseX;
        y = p.mouseY;
        startx = x;
        starty = y;

        lines.push([x,y]);
        currently_drawing = true;
      } else { // not the first start of the drawing

        dx = p.mouseX - x;
        dy = p.mouseY - y;

        if(dx*dx+dy*dy > EPSILON*EPSILON) {
          draw_strokes(x,y,dx,dy,p);
          x = p.mouseX;
          y = p.mouseY;
          lines.push([x,y])
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

var myp5 = new p5(s, document.getElementById('js--main-canvas'));
var s1   = new p5(s1, document.getElementById('js--suggest-1'));
var s2   = new p5(s2, document.getElementById('js--suggest-2'));
var s3   = new p5(s3, document.getElementById('js--suggest-3'));
var s4   = new p5(s4, document.getElementById('js--suggest-4'));
