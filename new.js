// Select the canvas
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

// Game class
class Game {
  constructor() {
    this.frames = 0;
    this.degree = Math.PI / 180;
    this.sprite = new Image();
    this.sprite.src = "./images/sprite.png";
    // Load sounds
    this.scoreSound = new Audio();
    this.scoreSound.src = "./audio/sfx_point.wav";
    this.flapSound = new Audio();
    this.flapSound.src = "./audio/sfx_flap.wav";
    this.hitSound = new Audio();
    this.hitSound.src = "./audio/sfx_hit.wav";
    this.swooshingSound = new Audio();
    this.swooshingSound.src = "./audio/sfx_swooshing.wav";
    this.dieSound = new Audio();
    this.dieSound.src = "./audio/sfx_die.wav";

    this.currentState = {
      getReady: 0,
      game: 1,
      over: 2,
    };
    this.currentState.current = this.currentState.getReady;

    // Start button coordinates
    this.startBtn = {
      x: 120,
      y: 263,
      w: 83,
      h: 29,
    };

    // Control the game
    cvs.addEventListener("click", (evt) => {
      switch (this.currentState.current) {
        case this.currentState.getReady:
          this.currentState.current = this.currentState.game;
          this.swooshingSound.play();
          break;
        case this.currentState.game:
          if (bird.y - bird.radius <= 0) return;
          bird.flap();
          this.flapSound.play();
          break;
        case this.currentState.over:
          let rect = cvs.getBoundingClientRect();
          let clickX = evt.clientX - rect.left;
          let clickY = evt.clientY - rect.top;

          // Check if we click on the start button
          if (
            clickX >= this.startBtn.x &&
            clickX <= this.startBtn.x + this.startBtn.w &&
            clickY >= this.startBtn.y &&
            clickY <= this.startBtn.y + this.startBtn.h
          ) {
            pipes.reset();
            bird.speedReset();
            score.reset();
            this.currentState.current = this.currentState.getReady;
          }
          break;
      }
    });
  }

  update() {
    bird.update();
    fg.update();
    pipes.update();
  }

  draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
  }

  loop() {
    this.update();
    this.draw();
    this.frames++;

    requestAnimationFrame(this.loop.bind(this));
  }

  start() {
    this.loop();
  }
}

// Background class
class Background {
  constructor() {
    this.sX = 0;
    this.sY = 0;
    this.w = 275;
    this.h = 226;
    this.x = 0;
    this.y = cvs.height - 226;
  }

  draw() {
    ctx.drawImage(
      game.sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    ctx.drawImage(
      game.sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  }
}

// Foreground class
class Foreground {
  constructor() {
    this.sX = 276;
    this.sY = 0;
    this.w = 224;
    this.h = 112;
    this.x = 0;
    this.y = cvs.height - 112;
    this.dx = 2;
  }

  update() {
    if (game.currentState.current === game.currentState.game) {
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  }

  draw() {
    ctx.drawImage(
      game.sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    ctx.drawImage(
      game.sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  }
}

// Bird class
class Bird {
  constructor() {
    this.animation = [
      { sX: 276, sY: 112 },
      { sX: 276, sY: 139 },
      { sX: 276, sY: 164 },
      { sX: 276, sY: 139 },
    ];
    this.x = 50;
    this.y = 150;
    this.w = 34;
    this.h = 26;
    this.radius = 12;
    this.frame = 0;
    this.gravity = 0.25;
    this.jump = 4.6;
    this.speed = 0;
    this.rotation = 0;
  }

  draw() {
    const bird = this.animation[this.frame];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    );
    ctx.restore();
  }

  update(gameState) {
    if (gameState.current !== gameState.game) return;

    this.period = gameState.current === gameState.getReady ? 10 : 5;
    this.frame += frames % this.period === 0 ? 1 : 0;
    this.frame = this.frame % this.animation.length;

    if (gameState.current === gameState.getReady) {
      this.y = 150;
      this.rotation = 0;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;

      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2;
        if (gameState.current === gameState.game) {
          gameState.current = gameState.over;
          HIT.play();
          DIE.play();
        }
      }

      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE;
        this.frame = 1;
      } else {
        this.rotation = -25 * DEGREE;
      }
    }
  }

  flap() {
    this.speed = -this.jump;
    FLAP.play();
  }

  speedReset() {
    this.speed = 0;
  }
}

// Get ready message class
class GetReady {
  constructor() {
    this.sX = 0;
    this.sY = 228;
    this.w = 173;
    this.h = 152;
    this.x = cvs.width / 2 - this.w / 2;
    this.y = 80;
  }

  draw() {
    if (game.currentState.current === game.currentState.getReady) {
      ctx.drawImage(
        game.sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  }
}
// Game over message class
class GameOver {
  constructor() {
    this.sX = 175;
    this.sY = 228;
    this.w = 225;
    this.h = 202;
    this.x = cvs.width / 2 - this.w / 2;
    this.y = 90;
  }

  draw() {
    if (game.currentState.current === game.currentState.over) {
      ctx.drawImage(
        game.sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  }
}

// Pipes class
class Pipes {
  constructor() {
    this.bottom = {
      sX: 502,
      sY: 0,
    };
    this.top = {
      sX: 553,
      sY: 0,
    };
    this.w = 53;
    this.h = 400;
    this.gap = 85;
    this.maxYPos = -150;
    this.dx = 2;
    this.positions = [];
    for (let i = 0; i < 4; i++) {
      this.positions.push({
        x: cvs.width + i * this.gap * 3,
        y: this.maxYPos * (Math.random() + 1),
      });
    }
  }

  update() {
    if (game.currentState.current !== game.currentState.game) return;

    if (game.frames % 100 === 0) {
      this.positions.push({
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1),
      });
    }

    for (let i = 0; i < this.positions.length; i++) {
      let p = this.positions[i];
      let bottomPipeYPos = p.y + this.h + this.gap;

      // Collision detection
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        game.currentState.current = game.currentState.over;
        game.hitSound.play();
      }

      // Move the pipes to the left
      p.x -= this.dx;

      // Remove the pipe if it's out of the screen
      if (p.x + this.w <= 0) {
        this.positions.shift();
        game.scoreSound.play();
        score.value += 1;
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
      }
    }
  }

  draw() {
    for (let i = 0; i < this.positions.length; i++) {
      let p = this.positions[i];

      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      // Draw top pipe
      ctx.drawImage(
        game.sprite,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h
      );

      // Draw bottom pipe
      ctx.drawImage(
        game.sprite,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h
      );
    }
  }

  reset() {
    this.positions = [];
  }
}

// Score class
class Score {
  constructor() {
    this.value = 0;
    this.best = localStorage.getItem("best") || 0;
    this.medal = {
      sX: 0,
      sY: 380,
      w: 44,
      h: 44,
      x: cvs.width / 2 - 50,
      y: 100,
    };
  }

  draw() {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    if (game.currentState.current === game.currentState.game) {
      ctx.lineWidth = 2;
      ctx.font = "35px Teko";
      ctx.fillText(this.value, cvs.width / 2, 50);
      ctx.strokeText(this.value, cvs.width / 2, 50);
    } else if (game.currentState.current === game.currentState.over) {
      // Score value
      ctx.font = "25px Teko";
      ctx.fillText(this.value, 225, 186);
      ctx.strokeText(this.value, 225, 186);
      // Best score value
      ctx.fillText(this.best, 225, 228);
      ctx.strokeText(this.best, 225, 228);
    }
  }

  reset() {
    this.value = 0;
  }
}

// Initialize the game
const game = new Game();
const bg = new Background();
const fg = new Foreground();
const bird = new Bird();
const getReady = new GetReady();
const gameOver = new GameOver();
const pipes = new Pipes();
const score = new Score();

// Start the game
game.start();





// class Pipes {
//   constructor(sprite, state) {
//     this.sprite = sprite;
//     this.state = state;
//     this.position = [1, 2, 3];
//     this.top = {
//       sourceX: 553,
//       sourceY: 0,
//     };
//     this.bottom = {
//       sourceX: 502,
//       sourceY: 0,
//     };

//     this.width = 53;
//     this.height = 400;
//     this.gap = 85;
//     this.maxYPos = -150;
//     this.dx = 2;
//   }

//   draw() {
//     for (let i = 0; i <= this.position.length; i++) {
//       let p = this.position[i];

//       let topYPos = p.y;
//       let bottomYPos = p.y + this.h + this.gap;

//       ctx.drawImage(
//         this.sprite,
//         this.sX,
//         this.sY,
//         this.w,
//         this.h,
//         this.x,
//         this.y,
//         this.w,
//         this.h
//       );

//       //   ctx.drawImage(
//       //     this.sprite,
//       //     this.bottom.sX,
//       //     this.bottom.sY,
//       //     this.w,
//       //     this.h,
//       //     p.x,
//       //     bottomYPos,
//       //     this.w,
//       //     this.h
//       //   );
//     }
//   }

//   update() {
//     // if (this.state.current !== this.state.game) return;
//     // if (this.frames % 100 == 0) {
//     //   this.position.push({
//     //     x: this.canvas.width,
//     //     y: maxYPos * (Math.random() + 1),
//     //   });
//     // }
//     // for (let i = 0; i < this.position.length; i++) {
//     //   let p = this.position[i];
//     //   let bottomPipeYPos = p.y + this.h + this.gap;
//     //   if (
//     //     this.bird.x + this.bird.radius > p.x &&
//     //     this.bird.x - this.bird.radius < p.x + this.w &&
//     //     this.bird.y + this.bird.radius > p.y &&
//     //     this.bird.y - this.bird.radius < p.y + this.h
//     //   ) {
//     //     this.state.current = this.state.over;
//     //   }
//     //   if (
//     //     this.bird.x + this.bird.radius > p.x &&
//     //     this.bird.x - game.bird.radius < p.x + this.w &&
//     //     this.bird.y + this.bird.radius > bottomPipeYPos &&
//     //     this.bird.y - this.bird.radius < bottomPipeYPos + this.h
//     //   ) {
//     //     this.state.current = this.state.over;
//     //     // this.HIT.play();
//     //   }
//     //   p.x -= this.dx;
//     //   if (p.x + this.w <= 0) {
//     //     this.position.shift();
//     // this.score.value += 1;
//     // this.SCORE_S.play();
//     // this.score.best = Math.max(this.score.value, this.score.best);
//     // localStorage.setItem("best", this.score.best);
//     //   }
//     // }
//   }

//   reset() {
//     this.position = [];
//   }
// }