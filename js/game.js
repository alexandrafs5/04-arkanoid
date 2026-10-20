const CANVAS_W = 640;
const CANVAS_H = 480;
const PADDLE_W = 120;
const PADDLE_H = 14;
const PADDLE_SPEED = 480;
const BALL_SIZE = 16;
const BALL_SPEED = 360;
const MAX_DT = 1 / 30;

const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const state = {
  mode: 'ready',
  score: 0,
  lives: 3,
  paddle: {
    x: ( CANVAS_W - PADDLE_W ) / 2,
    y: CANVAS_H - 40,
    w: PADDLE_W,
    h: PADDLE_H,
    speed: PADDLE_SPEED,
  },
  ball: { x: 0, y: 0, w: BALL_SIZE, h: BALL_SIZE, vx: 0, vy: 0, speed: BALL_SPEED },
  blocks: [],
};

let lastTime = 0;

function update( dt ) {
}

function draw() {
  ctx.clearRect( 0, 0, CANVAS_W, CANVAS_H );
  const p = state.paddle;
  drawSprite( ctx, 'paddle', p.x, p.y, p.w, p.h );
}

function frame( time ) {
  const dt = Math.min( ( time - lastTime ) / 1000, MAX_DT );
  lastTime = time;
  update( dt );
  draw();
  requestAnimationFrame( frame );
}

loadSpritesheet( () => {
  requestAnimationFrame( ( time ) => {
    lastTime = time;
    frame( time );
  } );
} );
