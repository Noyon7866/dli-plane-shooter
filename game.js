const canvas = document.getElementById("game");

const ctx = canvas.getContext("2d");


/* =========================
   IMAGES
========================= */

const playerImg = new Image();
const enemyImg = new Image();

playerImg.src = "assets/player.png";
enemyImg.src = "assets/enemy.png";


/* =========================
   HUD
========================= */

const scoreEl =
  document.getElementById("score");

const bestEl =
  document.getElementById("best");

const livesEl =
  document.getElementById("lives");

const finalScoreEl =
  document.getElementById("finalScore");

const finalBestEl =
  document.getElementById("finalBest");


const startScreen =
  document.getElementById("startScreen");

const gameOverScreen =
  document.getElementById("gameOverScreen");

const pauseBtn =
  document.getElementById("pauseBtn");


/* =========================
   GAME VARIABLES
========================= */

let W = 0;
let H = 0;

let dpr = 1;

let running = false;
let paused = false;

let last = 0;

let spawnTimer = 0;
let shootTimer = 0;

let score = 0;
let lives = 3;
let level = 1;

let best =
  Number(
    localStorage.getItem(
      "dliAirStrikeBest"
    ) || 0
  );

bestEl.textContent = best;


/* =========================
   ARRAYS
========================= */

const keys = new Set();

const stars = [];

const bullets = [];

const enemies = [];

const particles = [];

const enemyShots = [];


/* =========================
   PLAYER
========================= */

const player = {

  x: 0,
  y: 0,

  w: 88,
  h: 70,

  speed: 420,

  invuln: 0

};


/* =========================
   RESIZE
========================= */

function resize() {

  dpr =
    Math.min(
      devicePixelRatio || 1,
      2
    );

  W = canvas.clientWidth;

  H = canvas.clientHeight;

  canvas.width =
    Math.floor(W * dpr);

  canvas.height =
    Math.floor(H * dpr);

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );


  player.w =
    Math.max(
      64,
      Math.min(
        100,
        W * 0.105
      )
    );

  player.h =
    player.w * 0.8;


  player.x =
    Math.min(
      Math.max(
        player.x || W / 2,
        player.w / 2
      ),
      W - player.w / 2
    );


  player.y =
    H - 105;


  stars.length = 0;


  for (
    let i = 0;
    i <
    Math.floor(
      W * H / 9500
    );
    i++
  ) {

    stars.push({

      x: Math.random() * W,

      y: Math.random() * H,

      r:
        Math.random() *
        1.8 + 0.3,

      s:
        Math.random() *
        60 + 25,

      a:
        Math.random() *
        0.8 + 0.2

    });

  }

}


window.addEventListener(
  "resize",
  resize
);

resize();


/* =========================
   RESET
========================= */

function reset() {

  score = 0;

  lives = 3;

  level = 1;

  spawnTimer = 0;

  shootTimer = 0;


  bullets.length = 0;

  enemies.length = 0;

  particles.length = 0;

  enemyShots.length = 0;


  player.x =
    W / 2;

  player.y =
    H - 105;

  player.invuln = 0;


  updateHud();

}


/* =========================
   HUD
========================= */

function updateHud() {

  scoreEl.textContent =
    score;

  livesEl.textContent =
    lives;

  bestEl.textContent =
    best;

}


/* =========================
   START
========================= */

function start() {

  reset();

  running = true;

  paused = false;


  startScreen.classList.add(
    "hidden"
  );

  gameOverScreen.classList.add(
    "hidden"
  );


  pauseBtn.textContent =
    "Ⅱ";


  last =
    performance.now();


  requestAnimationFrame(loop);

}


/* =========================
   GAME OVER
========================= */

function gameOver() {

  running = false;


  if (score > best) {

    best = score;

    localStorage.setItem(
      "dliAirStrikeBest",
      best
    );

  }


  finalScoreEl.textContent =
    score;

  finalBestEl.textContent =
    best;


  updateHud();


  gameOverScreen.classList.remove(
    "hidden"
  );

}


/* =========================
   PAUSE
========================= */

function togglePause() {

  if (!running)
    return;


  paused = !paused;


  pauseBtn.textContent =
    paused ? "▶" : "Ⅱ";


  if (!paused) {

    last =
      performance.now();

    requestAnimationFrame(
      loop
    );

  }

}


/* =========================
   HELPERS
========================= */

function clamp(v, a, b) {

  return Math.max(
    a,
    Math.min(b, v)
  );

}


function hit(a, b) {

  return (

    Math.abs(a.x - b.x) <
      (a.w + b.w) * 0.42

    &&

    Math.abs(a.y - b.y) <
      (a.h + b.h) * 0.42

  );

}


/* =========================
   ENEMY SPAWN
========================= */

function spawnEnemy() {

  const size =
    54 + Math.random() * 28;


  enemies.push({

    x:
      size / 2 +
      Math.random() *
      (W - size),

    y:
      -size,

    w:
      size,

    h:
      size * 0.78,

    speed:
      80 +
      Math.random() * 65 +
      level * 10,

    hp:
      1 +
      (
        level > 5 &&
        Math.random() < 0.22
          ? 1
          : 0
      ),

    phase:
      Math.random() *
      Math.PI *
      2

  });

}


/* =========================
   SHOOT
========================= */

function shoot() {

  if (
    !running ||
    paused
  )
    return;


  bullets.push({

    x: player.x,

    y:
      player.y -
      player.h * 0.48,

    w: 7,

    h: 22,

    speed: 700

  });


  bullets.push({

    x:
      player.x - 13,

    y:
      player.y -
      player.h * 0.36,

    w: 5,

    h: 16,

    speed: 670

  });


  bullets.push({

    x:
      player.x + 13,

    y:
      player.y -
      player.h * 0.36,

    w: 5,

    h: 16,

    speed: 670

  });

}


/* =========================
   EXPLOSION
========================= */

function explode(
  x,
  y,
  amount = 18
) {

  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const a =
      Math.random() *
      Math.PI *
      2;

    const s =
      Math.random() *
      190 + 50;


    particles.push({

      x: x,

      y: y,

      vx:
        Math.cos(a) * s,

      vy:
        Math.sin(a) * s,

      life:
        0.65 +
        Math.random() *
        0.5,

      max: 0.9,

      r:
        Math.random() *
        3 + 1

    });

  }

}


/* =========================
   PLAYER DAMAGE
========================= */

function playerHit() {

  if (
    player.invuln > 0
  )
    return;


  lives--;

  player.invuln =
    1.6;


  explode(
    player.x,
    player.y,
    28
  );


  updateHud();


  if (lives <= 0) {

    gameOver();

  }

}


/* =========================
   UPDATE
========================= */

function update(dt) {

  if (
    player.invuln > 0
  ) {

    player.invuln -= dt;

  }


  let dx = 0;
  let dy = 0;


  if (
    keys.has("ArrowLeft") ||
    keys.has("a")
  )
    dx--;


  if (
    keys.has("ArrowRight") ||
    keys.has("d")
  )
    dx++;


  if (
    keys.has("ArrowUp") ||
    keys.has("w")
  )
    dy--;


  if (
    keys.has("ArrowDown") ||
    keys.has("s")
  )
    dy++;


  const len =
    Math.hypot(dx, dy) || 1;


  player.x =
    clamp(
      player.x +
        dx / len *
        player.speed *
        dt,

      player.w / 2,

      W -
        player.w / 2
    );


  player.y =
    clamp(
      player.y +
        dy / len *
        player.speed *
        dt,

      70,

      H -
        player.h / 2 -
        18
    );


  /* SHOOT */

  shootTimer -= dt;


  if (
    keys.has(" ") &&
    shootTimer <= 0
  ) {

    shoot();

    shootTimer =
      0.19;

  }


  /* LEVEL */

  level =
    1 +
    Math.floor(
      score / 1000
    );


  /* ENEMY SPAWN */

  spawnTimer -= dt;


  const interval =
    Math.max(
      0.28,
      0.9 -
        level * 0.055
    );


  if (
    spawnTimer <= 0
  ) {

    spawnEnemy();

    spawnTimer =
      interval;

  }


  /* BULLETS */

  for (
    let i =
      bullets.length - 1;
    i >= 0;
    i--
  ) {

    const b =
      bullets[i];


    b.y -=
      b.speed * dt;


    if (
      b.y < -30
    ) {

      bullets.splice(
        i,
        1
      );

    }

  }


  /* ENEMIES */

  for (
    let i =
      enemies.length - 1;
    i >= 0;
    i--
  ) {

    const e =
      enemies[i];


    e.y +=
      e.speed * dt;


    e.x +=
      Math.sin(
        performance.now() /
          500 +
          e.phase
      ) *
      18 *
      dt;


    /* Enemy reached bottom */

    if (
      e.y >
      H + e.h
    ) {

      enemies.splice(
        i,
        1
      );

      playerHit();

      continue;

    }


    /* Player collision */

    if (
      hit(e, player)
    ) {

      enemies.splice(
        i,
        1
      );

      explode(
        e.x,
        e.y,
        22
      );

      playerHit();

      continue;

    }


    /* Enemy shooting */

    if (
      Math.random() <
      dt *
        (
          0.06 +
          level * 0.008
        ) &&
      e.y > 80
    ) {

      enemyShots.push({

        x: e.x,

        y:
          e.y +
          e.h * 0.4,

        w: 7,

        h: 15,

        speed:
          240 +
          level * 10

      });

    }

  }


  /* ENEMY BULLETS */

  for (
    let i =
      enemyShots.length - 1;
    i >= 0;
    i--
  ) {

    const s =
      enemyShots[i];


    s.y +=
      s.speed * dt;


    if (
      s.y >
      H + 30
    ) {

      enemyShots.splice(
        i,
        1
      );

      continue;

    }


    if (
      hit(s, player)
    ) {

      enemyShots.splice(
        i,
        1
      );

      playerHit();

    }

  }


  /* BULLET / ENEMY COLLISION */

  for (
    let i =
      bullets.length - 1;
    i >= 0;
    i--
  ) {

    let removed = false;


    for (
      let j =
        enemies.length - 1;
      j >= 0;
      j--
    ) {

      if (
        hit(
          bullets[i],
          enemies[j]
        )
      ) {

        const e =
          enemies[j];


        e.hp--;


        bullets.splice(
          i,
          1
        );


        removed = true;


        if (
          e.hp <= 0
        ) {

          score += 100;


          explode(
            e.x,
            e.y,
            20
          );


          enemies.splice(
            j,
            1
          );


          updateHud();

        } else {

          explode(
            e.x,
            e.y,
            6
          );

        }


        break;

      }

    }


    if (removed)
      continue;

  }


  /* PARTICLES */

  for (
    let i =
      particles.length - 1;
    i >= 0;
    i--
  ) {

    const p =
      particles[i];


    p.life -= dt;


    p.x +=
      p.vx * dt;


    p.y +=
      p.vy * dt;


    p.vy +=
      110 * dt;


    if (
      p.life <= 0
    ) {

      particles.splice(
        i,
        1
      );

    }

  }


  /* STARS */

  for (
    const s of stars
  ) {

    s.y +=
      s.s * dt;


    if (
      s.y > H
    )
      s.y = 0;

  }

}


/* =========================
   BACKGROUND
========================= */

function drawBackground() {

  const g =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );


  g.addColorStop(
    0,
    "#030817"
  );

  g.addColorStop(
    0.55,
    "#071947"
  );

  g.addColorStop(
    1,
    "#020612"
  );


  ctx.fillStyle = g;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* Stars */

  for (
    const s of stars
  ) {

    ctx.globalAlpha =
      s.a;

    ctx.fillStyle =
      "#bfe2ff";


    ctx.beginPath();

    ctx.arc(
      s.x,
      s.y,
      s.r,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }


  ctx.globalAlpha = 1;


  /* Glow */

  const rg =
    ctx.createRadialGradient(
      W / 2,
      H * 0.6,
      20,
      W / 2,
      H * 0.6,
      H * 0.75
    );


  rg.addColorStop(
    0,
    "rgba(35,105,255,.12)"
  );

  rg.addColorStop(
    1,
    "rgba(35,105,255,0)"
  );


  ctx.fillStyle = rg;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );

}


/* =========================
   IMAGE DRAW
========================= */

function drawImageCentered(
  img,
  x,
  y,
  w,
  h,
  alpha = 1,
  rotation = 0
) {

  if (!img.complete)
    return;


  ctx.save();


  ctx.globalAlpha =
    alpha;


  ctx.translate(
    x,
    y
  );


  ctx.rotate(
    rotation
  );


  ctx.drawImage(
    img,
    -w / 2,
    -h / 2,
    w,
    h
  );


  ctx.restore();

}


/* =========================
   DRAW
========================= */

function draw() {

  drawBackground();


  /* Player bullets */

  for (
    const b of bullets
  ) {

    ctx.save();


    ctx.shadowBlur =
      18;

    ctx.shadowColor =
      "#64d9ff";


    const g =
      ctx.createLinearGradient(
        b.x,
        b.y - b.h,
        b.x,
        b.y
      );


    g.addColorStop(
      0,
      "#fff"
    );

    g.addColorStop(
      1,
      "#42aaff"
    );


    ctx.fillStyle = g;


    ctx.fillRect(
      b.x - b.w / 2,
      b.y - b.h / 2,
      b.w,
      b.h
    );


    ctx.restore();

  }


  /* Enemy bullets */

  for (
    const s of enemyShots
  ) {

    ctx.save();


    ctx.shadowBlur =
      14;

    ctx.shadowColor =
      "#ff5b9d";


    ctx.fillStyle =
      "#ff79b2";


    ctx.beginPath();


    ctx.roundRect(
      s.x - s.w / 2,
      s.y - s.h / 2,
      s.w,
      s.h,
      4
    );


    ctx.fill();


    ctx.restore();

  }


  /* Enemies */

  for (
    const e of enemies
  ) {

    ctx.save();


    ctx.shadowBlur =
      18;

    ctx.shadowColor =
      "rgba(62,130,255,.8)";


    drawImageCentered(
      enemyImg,
      e.x,
      e.y,
      e.w,
      e.h,
      1,
      Math.sin(
        e.phase +
        performance.now() /
          700
      ) * 0.08
    );


    ctx.restore();


    /* HP */

    if (
      e.hp > 1
    ) {

      ctx.fillStyle =
        "rgba(255,255,255,.25)";


      ctx.fillRect(
        e.x - e.w / 2,
        e.y - e.h / 2 - 8,
        e.w,
        3
      );


      ctx.fillStyle =
        "#7ce0ff";


      ctx.fillRect(
        e.x - e.w / 2,
        e.y - e.h / 2 - 8,
        e.w * 0.5,
        3
      );

    }

  }


  /* PLAYER */

  const blink =
    player.invuln > 0 &&
    Math.floor(
      player.invuln * 12
    ) % 2 === 0;


  if (!blink) {

    drawImageCentered(
      playerImg,
      player.x,
      player.y,
      player.w,
      player.h
    );

  }


  /* Exhaust */

  if (
    running &&
    !paused
  ) {

    ctx.save();


    ctx.globalAlpha =
      0.55;


    const flame =
      ctx.createLinearGradient(
        player.x,
        player.y +
          player.h * 0.25,
        player.x,
        player.y +
          player.h * 0.65
      );


    flame.addColorStop(
      0,
      "#d8f7ff"
    );

    flame.addColorStop(
      1,
      "rgba(45,126,255,0)"
    );


    ctx.fillStyle =
      flame;


    ctx.beginPath();


    ctx.moveTo(
      player.x - 8,
      player.y +
        player.h * 0.28
    );


    ctx.lineTo(
      player.x,
      player.y +
        player.h * 0.65 +
        Math.random() * 12
    );


    ctx.lineTo(
      player.x + 8,
      player.y +
        player.h * 0.28
    );


    ctx.closePath();


    ctx.fill();


    ctx.restore();

  }


  /* Particles */

  for (
    const p of particles
  ) {

    ctx.globalAlpha =
      Math.max(
        0,
        p.life / p.max
      );


    ctx.fillStyle =
      "#78c8ff";


    ctx.beginPath();


    ctx.arc(
      p.x,
      p.y,
      p.r,
      0,
      Math.PI * 2
    );


    ctx.fill();

  }


  ctx.globalAlpha =
    1;


  /* Pause */

  if (
    paused &&
    running
  ) {

    ctx.fillStyle =
      "rgba(0,0,0,.4)";


    ctx.fillRect(
      0,
      0,
      W,
      H
    );


    ctx.fillStyle =
      "#fff";


    ctx.textAlign =
      "center";


    ctx.font =
      "800 34px system-ui";


    ctx.fillText(
      "PAUSED",
      W / 2,
      H / 2
    );

  }

}


/* =========================
   GAME LOOP
========================= */

function loop(t) {

  if (!running)
    return;


  if (paused) {

    draw();

    return;

  }


  const dt =
    Math.min(
      0.033,
      (t - last) /
        1000 || 0
    );


  last = t;


  update(dt);

  draw();


  if (running) {

    requestAnimationFrame(
      loop
    );

  }

}


/* =========================
   KEYBOARD
========================= */

window.addEventListener(
  "keydown",
  e => {

    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        " ",
        "w",
        "a",
        "s",
        "d"
      ].includes(e.key)
    ) {

      e.preventDefault();

    }


    keys.add(e.key);


    if (
      e.key === "p"
    ) {

      togglePause();

    }


    if (
      e.key === "Enter" &&
      !running
    ) {

      start();

    }

  }
);


window.addEventListener(
  "keyup",
  e => {

    keys.delete(
      e.key
    );

  }
);


/* =========================
   MOBILE BUTTONS
========================= */

function bindHold(
  el,
  fn
) {

  const on = e => {

    e.preventDefault();

    fn(true);

  };


  const off = e => {

    e.preventDefault();

    fn(false);

  };


  el.addEventListener(
    "pointerdown",
    on
  );


  el.addEventListener(
    "pointerup",
    off
  );


  el.addEventListener(
    "pointercancel",
    off
  );


  el.addEventListener(
    "pointerleave",
    off
  );

}


document
  .querySelectorAll(
    "[data-dir]"
  )
  .forEach(btn => {

    bindHold(
      btn,
      down => {

        const dir =
          btn.dataset.dir;


        const map = {

          up: "ArrowUp",

          down: "ArrowDown",

          left: "ArrowLeft",

          right: "ArrowRight"

        };


        if (down) {

          keys.add(
            map[dir]
          );

        } else {

          keys.delete(
            map[dir]
          );

        }

      }
    );

  });


bindHold(
  document.getElementById(
    "fireBtn"
  ),
  down => {

    if (down) {

      keys.add(" ");

    } else {

      keys.delete(" ");

    }

  }
);


/* =========================
   MOBILE DRAG
========================= */

let dragging = false;


canvas.addEventListener(
  "pointerdown",
  e => {

    if (!running)
      return;


    dragging = true;


    canvas.setPointerCapture(
      e.pointerId
    );

  }
);


canvas.addEventListener(
  "pointerup",
  () => {

    dragging = false;

  }
);


canvas.addEventListener(
  "pointermove",
  e => {

    if (
      !dragging ||
      !running
    )
      return;


    const r =
      canvas.getBoundingClientRect();


    player.x =
      clamp(
        e.clientX - r.left,

        player.w / 2,

        W -
          player.w / 2
      );


    player.y =
      clamp(
        e.clientY - r.top,

        70,

        H -
          player.h / 2 -
          18
      );

  }
);


/* =========================
   BUTTONS
========================= */

document
  .getElementById("startBtn")
  .addEventListener(
    "click",
    start
  );


document
  .getElementById("restartBtn")
  .addEventListener(
    "click",
    start
  );


pauseBtn.addEventListener(
  "click",
  togglePause
);
