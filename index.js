const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const DEGREE = Math.PI / 180;

class Sprite {
  constructor(sourceX, sourceY, width, height, x, y) {
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }

  draw() {
    ctx.drawImage(
      this.sprite,
      this.sourceX,
      this.sourceY,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

class Background extends Sprite {
  constructor(sprite) {
    super(0, 0, 275, 226, 0, canvas.height - 226);
    this.sprite = sprite;
  }

  draw() {
    super.draw();
    ctx.drawImage(
      this.sprite,
      this.sourceX,
      this.sourceY,
      this.width,
      this.height,
      this.x + this.width,
      this.y,
      this.width,
      this.height
    );
  }
}

class Foreground extends Sprite {
  constructor(sprite, state) {
    super(276, 0, 224, 112, 0, canvas.height - 112);
    this.sprite = sprite;
    this.dx = 2;
    this.state = state;
  }

  draw() {
    super.draw();
    ctx.drawImage(
      this.sprite,
      this.sourceX,
      this.sourceY,
      this.width,
      this.height,
      this.x + this.width,
      this.y,
      this.width,
      this.height
    );
  }

  update() {
    if (this.state.current == this.state.game) {
      this.x = (this.x - this.dx) % (this.width / 2);
    }
  }
}

class Bird {
  constructor(sprite, state, foreground, dieSound) {
    this.animation = [
      { sourceX: 276, sourceY: 112 },
      { sourceX: 276, sourceY: 139 },
      { sourceX: 276, sourceY: 164 },
      { sourceX: 276, sourceY: 139 },
    ];
    this.x = 30;
    this.y = 75;
    this.width = 34;
    this.height = 26;
    this.frame = 0;
    this.sprite = sprite;
    this.gravity = 0.25;
    this.jump = 4.2;
    this.speed = 0;
    this.state = state;
    this.radius = 12;
    this.rotation = 0;
    this.dieSound = dieSound;
    this.foreground = foreground;
  }

  draw() {
    const bird = this.animation[this.frame];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.drawImage(
      this.sprite,
      bird.sourceX,
      bird.sourceY,
      this.width,
      this.height,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    ctx.restore();
  }

  flap() {
    this.speed = -this.jump;
  }

  update(frames) {
    //if game is in getReady state, the bird must flap slowly

    this.period = this.state.current == this.state.getReady ? 10 : 5;

    //we increase the frame by 1 each period
    this.frame += frames % this.period == 0 ? 1 : 0;
    // console.log(this.frame);
    // console.log(this.frames);

    //frame goes to 0 to 4 and then starts over again
    this.frame = this.frame % this.animation.length;

    if (this.state.current == this.state.getReady) {
      this.y = 75;
      this.rotation = 0;
    } else {
      if (this.state.current == this.state.game) {
        this.speed += this.gravity;
        this.y += this.speed;
        if (this.collidesWithForeground()) {
          this.state.current = this.state.over;
          this.dieSound.play();
        }

        if (
          this.y + this.height / 2 >=
          canvas.height - this.foreground.height
        ) {
          this.y = canvas.height - this.foreground.height - this.height / 2;
          this.state.current = this.state.over;
          this.dieSound.play();
        }
        if (this.speed >= this.jump) {
          this.rotation = 90 * DEGREE;

          this.frame = 1;

         
        } else {
          this.rotation = -25 * DEGREE;
        }
      }
    }
  }
  collidesWithForeground() {
    const birdTop = this.y - this.height / 2;
    const birdBottom = this.y + this.height / 2;
    const foregroundTop = canvas.height - this.foreground.height;

    return birdBottom >= foregroundTop || birdTop <= 0;
  }
  speedReset() {
    this.speed = 0;
  }
}

class TextSprite extends Sprite {
  constructor(sourceX, sourceY, width, height, x, y, sprite) {
    super(sourceX, sourceY, width, height, x, y);
    this.sprite = sprite;
  }

  draw() {
    super.draw();
  }
}

class GetReady extends TextSprite {
  constructor(sprite) {
    const x = canvas.width / 2 - 173 / 2;
    const y = 80;

    super(0, 228, 173, 152, x, y, sprite);
  }
}

class GameOver extends TextSprite {
  constructor(sprite) {
    const x = canvas.width / 2 - 225 / 2;
    const y = 90;
    super(175, 228, 225, 202, x, y, sprite);
  }
}
class Pipes {
  constructor(sprite, state, bird, score, hitSound) {
    this.top = {
      sourceX: 553,
      sourceY: 0,
    };
    this.bottom = {
      sourceX: 502,
      sourceY: 0,
    };
    this.width = 53;
    this.height = 400;
    this.gap = 85;
    this.maxYPosition = -150;
    this.dx = 2;
    this.position = [];
    this.sprite = sprite;
    this.state = state;
    this.bird = bird;
    this.score = score;
    this.hitSound = hitSound;
  }

  draw() {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      //   let bottomYPosition = p.y + this.height + this.gap;

      //top pipe
      ctx.drawImage(
        this.sprite,
        this.top.sourceX,
        this.top.sourceY,
        this.width,
        this.height,
        p.x,
        p.y,
        this.width,
        this.height
      );

      //bottom pipe
      ctx.drawImage(
        this.sprite,
        this.bottom.sourceX,
        this.bottom.sourceY,
        this.width,
        this.height,
        p.x,
        p.y + this.height + this.gap,
        this.width,
        this.height
      );
    }
  }
  update(frames) {
    if (this.state.current !== this.state.game) return;
    // console.log(this.frames);
    if (frames % 100 == 0) {
      this.position.push({
        x: canvas.width,
        y: this.maxYPosition * (Math.random() + 1),
      });
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      if (
        this.bird.x + this.bird.radius > p.x &&
        this.bird.x - this.bird.radius < p.x + this.width &&
        this.bird.y + this.bird.radius > p.y &&
        this.bird.y - this.bird.radius < p.y + this.height
      ) {
        this.state.current = this.state.over;
        this.hitSound.play();
      }

      if (
        this.bird.x + this.bird.radius > p.x &&
        this.bird.x - this.bird.radius < p.x + this.width &&
        this.bird.y + this.bird.radius > p.y + this.height + this.gap &&
        this.bird.y - this.bird.radius < p.y + this.gap + this.height
      ) {
        this.state.current = this.state.over;
        this.hitSound.play();
      }

      p.x -= this.dx;

      if (p.x + this.width <= 0) {
        this.position.shift();
        this.score.value += 1;

        this.score.highest = Math.max(this.score.value, this.score.highest);
        localStorage.setItem("highest", this.score.highest);
      }
    }
  }
  reset() {
    this.position = [];
  }
}

class Score {
  constructor(state) {
    this.highest = parseInt(localStorage.getItem("highest") || 0);
    this.value = 0;
    this.state = state;
  }
  draw() {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";

    if (this.state.current == this.state.game) {
      ctx.lineWidth = 2;
      ctx.font = "35px Arial";
      ctx.fillText(this.value, canvas.width / 2, 50);
      ctx.strokeText(this.value, canvas.width / 2, 50);
    } else if (this.state.current == this.state.over) {
      ctx.font = "25px Arial";
      ctx.fillText(this.value, 225, 186);
      ctx.fillText(this.value, 225, 186);

      ctx.fillText(this.highest, 225, 228);
      ctx.strokeText(this.highest, 225, 228);
    }
  }
  reset() {
    this.value = 0;
  }
}

class BirdGame {
  constructor() {
    this.sprite = new Image();
    this.sprite.src = "./images/sprite.png";

    this.background = new Background(this.sprite);
    this.getReady = new GetReady(this.sprite);
    this.gameOver = new GameOver(this.sprite);

    this.flapSound = new Audio();
    this.flapSound.src = "./audio/sfx_flap.wav";

    this.hitSound = new Audio();
    this.hitSound.src = "./audio/sfx_hit.wav";

    this.swooshingSound = new Audio();
    this.swooshingSound.src = "./audio/sfx_swooshing.wav";

    this.dieSound = new Audio();
    this.dieSound.src = "./audio/sfx_die.wav";

    this.state = {
      current: "getReady",
      getReady: "getReady",
      game: "game",
      over: "over",
    };

    this.foreground = new Foreground(this.sprite, this.state);
    this.bird = new Bird(
      this.sprite,
      this.state,
      this.foreground,
      this.dieSound
    );
    this.score = new Score(this.state);
    this.pipes = new Pipes(
      this.sprite,
      this.state,
      this.bird,
      this.score,
      this.hitSound
    );

    this.frames = 0;
  }

  draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.background.draw();
    this.pipes.draw();
    this.foreground.draw();
    this.bird.draw();

    if (this.state.current == this.state.getReady) {
      this.getReady.draw();
    } else if (this.state.current == this.state.over) {
      this.gameOver.draw();
    }

    this.score.draw();
  }
  update() {
    this.bird.update(this.frames);
    this.pipes.update(this.frames);
    this.foreground.update();
  }

  loop() {
    this.frames++;

    this.update();

    this.draw();

    // console.log(this.frames)
    requestAnimationFrame(() => this.loop());
  }

  start() {
    const startBtn = {
      x: 120,
      y: 263,
      w: 83,
      h: 29,
    };
    canvas.addEventListener("click", (evt) => {
      switch (this.state.current) {
        case this.state.getReady:
          //   console.log(birdGame.state.current, "hii from getReady");
          this.state.current = this.state.game;
          this.swooshingSound.play();
          break;

        case this.state.game:
          console.log("going to flap");
          //   console.log(birdGame.state.current, "hi from game");
          this.bird.flap();
          this.flapSound.play();
          break;

        case this.state.over:
          let rect = canvas.getBoundingClientRect();
          let clickX = evt.clientX - rect.left;
          let clickY = evt.clientY - rect.top;

          if (
            clickX >= startBtn.x &&
            clickX <= startBtn.x + startBtn.w &&
            clickY >= startBtn.y &&
            clickY <= startBtn.y + startBtn.h
          ) {
            this.pipes.reset();
            this.bird.speedReset();
            this.score.reset();
            // console.log("everything reset");
            this.state.current = this.state.getReady;
          }
          break;
      }
    });

    this.loop();
  }
}

const birdGame = new BirdGame();
birdGame.start();
