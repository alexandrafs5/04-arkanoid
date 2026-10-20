const CANVAS_W = 640;
const CANVAS_H = 480;
const PADDLE_W = 120;
const PADDLE_H = 14;
const PADDLE_SPEED = 480;
const BALL_SIZE = 16;
const BALL_SPEED = 360;
const MAX_DT = 1 / 30;
const MAX_BOUNCE_ANGLE = Math.PI / 3;
const BLOCK_W = 64;
const BLOCK_H = 32;
const BLOCK_COLS = 10;
const BLOCK_TOP = 60;
const BLOCK_COLORS = [ 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green' ];
const BLOCK_POINTS = 10;

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

function createBlocks() {
  const blocks = [];
  BLOCK_COLORS.forEach( ( color, row ) => {
    for ( let col = 0; col < BLOCK_COLS; col++ ) {
      blocks.push( {
        x: col * BLOCK_W,
        y: BLOCK_TOP + row * BLOCK_H,
        w: BLOCK_W,
        h: BLOCK_H,
        color,
        alive: true,
      } );
    }
  } );
  return blocks;
}

state.blocks = createBlocks();

let lastTime = 0;
const keys = {};

function clampPaddle() {
  const p = state.paddle;
  p.x = Math.max( 0, Math.min( CANVAS_W - p.w, p.x ) );
}

window.addEventListener( 'keydown', ( e ) => {
  keys[ e.code ] = true;
  if ( e.code === 'ArrowLeft' || e.code === 'ArrowRight' ) e.preventDefault();
} );

window.addEventListener( 'keyup', ( e ) => {
  keys[ e.code ] = false;
} );

canvas.addEventListener( 'mousemove', ( e ) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = ( e.clientX - rect.left ) * ( CANVAS_W / rect.width );
  state.paddle.x = mouseX - state.paddle.w / 2;
  clampPaddle();
} );

function overlaps( a, b ) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function placeBallOnPaddle() {
  const b = state.ball;
  const p = state.paddle;
  b.x = p.x + ( p.w - b.w ) / 2;
  b.y = p.y - b.h;
  b.vx = 0;
  b.vy = 0;
}

function launchBall() {
  if ( state.mode !== 'ready' ) return;
  state.ball.vx = 0;
  state.ball.vy = -state.ball.speed;
  state.mode = 'playing';
}

window.addEventListener( 'keydown', ( e ) => {
  if ( e.code === 'Space' ) {
    e.preventDefault();
    launchBall();
  }
} );

canvas.addEventListener( 'click', launchBall );

function update( dt ) {
  const p = state.paddle;
  const left = keys.ArrowLeft || keys.KeyA;
  const right = keys.ArrowRight || keys.KeyD;
  if ( left ) p.x -= p.speed * dt;
  if ( right ) p.x += p.speed * dt;
  clampPaddle();

  const b = state.ball;
  if ( state.mode === 'ready' ) {
    placeBallOnPaddle();
  } else if ( state.mode === 'playing' ) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if ( b.x < 0 ) {
      b.x = 0;
      b.vx = Math.abs( b.vx );
    } else if ( b.x + b.w > CANVAS_W ) {
      b.x = CANVAS_W - b.w;
      b.vx = -Math.abs( b.vx );
    }
    if ( b.y < 0 ) {
      b.y = 0;
      b.vy = Math.abs( b.vy );
    }

    if ( b.vy > 0 && overlaps( b, p ) ) {
      const offset = ( ( b.x + b.w / 2 ) - ( p.x + p.w / 2 ) ) / ( p.w / 2 );
      const angle = Math.max( -1, Math.min( 1, offset ) ) * MAX_BOUNCE_ANGLE;
      b.vx = b.speed * Math.sin( angle );
      b.vy = -b.speed * Math.cos( angle );
      b.y = p.y - b.h;
    }

    // At most one block per frame to avoid double bounces.
    const hit = state.blocks.find( ( k ) => k.alive && overlaps( b, k ) );
    if ( hit ) {
      hit.alive = false;
      state.score += BLOCK_POINTS;
      const overlapX = Math.min( b.x + b.w, hit.x + hit.w ) - Math.max( b.x, hit.x );
      const overlapY = Math.min( b.y + b.h, hit.y + hit.h ) - Math.max( b.y, hit.y );
      if ( overlapX < overlapY ) {
        b.vx = -b.vx;
      } else {
        b.vy = -b.vy;
      }
    }
  }
}

function draw() {
  ctx.clearRect( 0, 0, CANVAS_W, CANVAS_H );
  state.blocks.forEach( ( k ) => {
    if ( k.alive ) drawSprite( ctx, 'block_' + k.color, k.x, k.y, k.w, k.h );
  } );
  const p = state.paddle;
  drawSprite( ctx, 'paddle', p.x, p.y, p.w, p.h );
  const b = state.ball;
  drawSprite( ctx, 'ball', b.x, b.y, b.w, b.h );
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
