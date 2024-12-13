let victorySound, gameOverSound; 
let startScreenImage;
let gameStarted = false; 
let bg;
let jumpSound, coinSound, bgMusic;
let mario;
let monsters = [];
let monsterNum = 3;
let marioLives = 100;
let marioImage, advancedMarioImage, deterioratedMarioImage;
let monsterImgs = [];
let coins = [];
let coinImage, platformImage;
let platforms = [];
let coinsCollected = 0;
let isAdvancedMario = false;
let victoryTriggered = false;

function preload() {
  startScreenImage = loadImage("../photos/a7/start-screen-image.jpg");
  victorySound = loadSound("../photos/a7/victory-sound.mp3"); 
  gameOverSound = loadSound("../photos/a7/game-over-sound.mp3"); 
  bg = loadImage("../photos/a7/pngtree-pixel-game-background-pixel-game-landscape-image_1342443.jpg");
  jumpSound = loadSound("../photos/a7/../photos/a7/jump-sound-effect_1.mp3");
  coinSound = loadSound("../photos/a7/mario-coin-sound.mp3");
  bgMusic = loadSound("../photos/a7/background-music.mp3");
  marioImage = loadImage("../photos/a7/myself.png");
  advancedMarioImage = loadImage("../photos/a7/advanced_myself.png");
  deterioratedMarioImage = loadImage("../photos/a7/deteriorated_myself.png");
  coinImage = loadImage("../photos/a7/coin.png");
  platformImage = loadImage("../photos/a7/platform.png");
  
  for (let i = 0; i < monsterNum; i++) {
    let filepath = "../photos/a7/images/Monster" + i + ".png";
    monsterImgs.push(loadImage(filepath));
  }
}

function setup() {

  let canvas = createCanvas(400, 400);
  canvas.parent('sketch-container')
  mario = new Mario();

  for (let i = 0; i < monsterNum; i++) {
    let monsterImage = monsterImgs[i % monsterImgs.length];
    monsters[i] = new Monster(random(0, width), random(0, height / 2), monsterImage);
  }

  platforms.push(new Platform(50, height - 100, 150, 20));
  platforms.push(new Platform(200, height - 150, 100, 20));
  platforms.push(new Platform(350, height - 200, 120, 20));

  for (let i = 0; i < 3; i++) {
    coins.push(new Coin(random(50, width - 50), random(170, height - 30)));
  }
}

function draw() {
  if (!gameStarted) {
    startScreen();
  } else {
    playGame();
  }
}

function startScreen() {
  background(0);
  imageMode(CENTER);
  image(startScreenImage, width / 2, height / 2,   startScreenImage.width / 2, startScreenImage.height / 2);
  textAlign(CENTER, CENTER);
  textSize(23);
  fill(3, 17, 43);
  text("Press Start to Begin", width / 2, height / 5);

  fill(100, 255, 100);
  rectMode(CENTER);
  rect(width / 2, height / 2 + 50, 100, 40);
  fill(0);
  text("START", width / 2, height / 2 + 50);
}

function mousePressed() {
  if (!gameStarted && mouseX > width / 2 - 50 && mouseX < width / 2 + 50 && mouseY > height / 2 + 30 && mouseY < height / 2 + 70) {
    gameStarted = true;
    bgMusic.loop();
  }
}

function playGame() {
  imageMode(CENTER);
  image(bg, width / 2, height / 2, width, height);

  for (let platform of platforms) {
    platform.body();
  }

  mario.body();
  mario.move();

  for (let monster of monsters) {
    monster.body();
    monster.move();
    monster.checkPosition();
  }

  for (let coin of coins) {
    coin.body();
    coin.checkCollection();
  }

  drawHealthBar();

  if (coinsCollected >= 3 && !isAdvancedMario) {
    isAdvancedMario = true;
    setTimeout(gameClear, 2000); 
  }

  if (marioLives <= 0) {
    gameOver();
  }
}

function gameClear() {
  if (!victoryTriggered) {
    victoryTriggered = true;
    bgMusic.stop();
    victorySound.play();
    noLoop();
    fill(255, 255, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("You Win!", width / 2, height / 2);
  }
}

function gameOver() {
  bgMusic.stop();
  gameOverSound.play();
  noLoop();
  fill(255, 0, 0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);
}

function drawHealthBar() {
  fill(255, 0, 0);
  rect(10, height - 20, marioLives * 2, 10);
}

class Mario {
  constructor() {
    this.x = width / 2;
    this.y = height - 50;
    this.w = 30;
    this.h = 30;
    this.ySpeed = 0;
    this.gravity = 0.375;
    this.lift = -10;
    this.onGround = false;
  }

  body() {
    imageMode(CENTER);
    let marioImg;

    if (marioLives < 50) {
      marioImg = deterioratedMarioImage;
    } else if (isAdvancedMario) {
      marioImg = advancedMarioImage;
    } else {
      marioImg = marioImage;
    }

    let scaleFactor = isAdvancedMario ? 1.2 : 1;
    image(marioImg, this.x, this.y, marioImg.width * scaleFactor, marioImg.height * scaleFactor);
  }

  move() {
    if (keyIsDown(LEFT_ARROW)) this.x -= 5;
    if (keyIsDown(RIGHT_ARROW)) this.x += 5;

    if (keyIsDown(UP_ARROW) && this.onGround) {
      this.ySpeed = this.lift;
      this.onGround = false;
      jumpSound.play();
    }

    this.ySpeed += this.gravity;
    this.y += this.ySpeed;

    if (this.y > height - 50) {
      this.y = height - 50;
      this.ySpeed = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    for (let platform of platforms) {
      if (
        this.x + this.w / 2 > platform.x &&
        this.x - this.w / 2 < platform.x + platform.w &&
        this.y + this.h / 2 > platform.y &&
        this.y + this.h / 2 < platform.y + platform.h
      ) {
        this.y = platform.y - this.h / 2;
        this.ySpeed = 0;
        this.onGround = true;
      }
    }
  }
}

class Monster {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.w = 50;
    this.h = 50;
    this.img = img;
  }

  body() {
    imageMode(CENTER);
    image(this.img, this.x, this.y, this.w, this.h);
  }

  move() {
    this.x += 1;
    if (this.x > width) {
      this.x = 0;
    }
  }

  checkPosition() {
    if (
      mario.x + mario.w / 2 > this.x &&
      mario.x - mario.w / 2 < this.x + this.w &&
      mario.y + mario.h / 2 > this.y &&
      mario.y - mario.h / 2 < this.y + this.h
    ) {
      mario.y = height - 50;
      marioLives -= 20;
      if (marioLives <= 0) {
        noLoop();
      }
    }
  }
}

class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.diameter = 40;
    this.collected = false;
  }

  body() {
    if (!this.collected) {
      imageMode(CENTER);
      image(coinImage, this.x, this.y, this.diameter, this.diameter);
    }
  }

  checkCollection() {
    if (!this.collected && dist(mario.x, mario.y, this.x, this.y) < this.diameter / 2 + mario.w / 2) {
      this.collected = true;
      coinsCollected++;
      coinSound.play(); 
    }
  }
}

class Platform {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  body() {
    imageMode(CENTER);
    image(platformImage, this.x + this.w / 2, this.y + this.h / 2, this.w, this.h*1.5);
  }
}
// let victorySound, gameOverSound; 
// let startScreenImage;
// let gameStarted = false; 
// let bg;
// let jumpSound, coinSound, bgMusic;
// let mario;
// let monsters = [];
// let monsterNum = 3;
// let marioLives = 100;
// let marioImage, advancedMarioImage, deterioratedMarioImage;
// let monsterImgs = [];
// let coins = [];
// let coinImage, platformImage;
// let platforms = [];
// let coinsCollected = 0;
// let isAdvancedMario = false;
// let victoryTriggered = false;

// function preload() {
//   startScreenImage = loadImage("start-screen-image.jpg");
//   victorySound = loadSound("victory-sound.mp3"); // Added load for victory sound
//   gameOverSound = loadSound("game-over-sound.mp3"); // Added load for game over sound
//   bg = loadImage("pngtree-pixel-game-background-pixel-game-landscape-image_1342443.jpg");
//   jumpSound = loadSound("jump-sound-effect_1.mp3");
//   coinSound = loadSound("mario-coin-sound.mp3");
//   bgMusic = loadSound("background-music.mp3");
//   marioImage = loadImage("myself.png");
//   advancedMarioImage = loadImage("advanced_myself.png");
//   deterioratedMarioImage = loadImage("deteriorated_myself.png");
//   coinImage = loadImage("coin.png");
//   platformImage = loadImage("platform.png");
  
//   for (let i = 0; i < monsterNum; i++) {
//     let filepath = "images/Monster" + i + ".png";
//     monsterImgs.push(loadImage(filepath));
//   }
// }

// function setup() {
//   createCanvas(400, 400);
//   mario = new Mario();

//   for (let i = 0; i < monsterNum; i++) {
//     let monsterImage = monsterImgs[i % monsterImgs.length];
//     monsters[i] = new Monster(random(0, width), random(0, height / 2), monsterImage);
//   }

//   platforms.push(new Platform(50, height - 100, 150, 20));
//   platforms.push(new Platform(200, height - 150, 100, 20));
//   platforms.push(new Platform(350, height - 200, 120, 20));

//   for (let i = 0; i < 3; i++) {
//     coins.push(new Coin(random(50, width - 50), random(170, height - 30)));
//   }
// }

// function draw() {
//   if (!gameStarted) {
//     startScreen();
//   } else {
//     playGame();
//   }
// }

// function startScreen() {
//   background(0);
//   imageMode(CENTER);
//   image(startScreenImage, width / 2, height / 2,   startScreenImage.width / 2, startScreenImage.height / 2);
//   textAlign(CENTER, CENTER);
//   textSize(23);
//   fill(3, 17, 43);
//   text("Press Start to Begin", width / 2, height / 5);

//   fill(100, 255, 100);
//   rectMode(CENTER);
//   rect(width / 2, height / 2 + 50, 100, 40);
//   fill(0);
//   text("START", width / 2, height / 2 + 50);
// }

// function mousePressed() {
//   if (!gameStarted && mouseX > width / 2 - 50 && mouseX < width / 2 + 50 && mouseY > height / 2 + 30 && mouseY < height / 2 + 70) {
//     gameStarted = true;
//     bgMusic.loop();
//   }
// }

// function playGame() {
//   imageMode(CENTER);
//   image(bg, width / 2, height / 2, width, height);

//   for (let platform of platforms) {
//     platform.body();
//   }

//   mario.body();
//   mario.move();

//   for (let monster of monsters) {
//     monster.body();
//     monster.move();
//     monster.checkPosition();
//   }

//   for (let coin of coins) {
//     coin.body();
//     coin.checkCollection();
//   }

//   drawHealthBar();

//   if (coinsCollected >= 3 && !isAdvancedMario) {
//     isAdvancedMario = true;
//     setTimeout(gameClear, 2000); 
//   }

//   if (marioLives <= 0) {
//     gameOver();
//   }
// }

// function gameClear() {
//   if (!victoryTriggered) {
//     victoryTriggered = true;
//     bgMusic.stop();
//     victorySound.play();
//     noLoop();
//     fill(255, 255, 0);
//     textSize(32);
//     textAlign(CENTER, CENTER);
//     text("You Win!", width / 2, height / 2);
//   }
// }

// function gameOver() {
//   bgMusic.stop();
//   gameOverSound.play();
//   noLoop();
//   fill(255, 0, 0);
//   textSize(32);
//   textAlign(CENTER, CENTER);
//   text("Game Over", width / 2, height / 2);
// }

// function drawHealthBar() {
//   fill(255, 0, 0);
//   rect(10, height - 20, marioLives * 2, 10);
// }

// class Mario {
//   constructor() {
//     this.x = width / 2;
//     this.y = height - 50;
//     this.w = 30;
//     this.h = 30;
//     this.ySpeed = 0;
//     this.gravity = 0.375;
//     this.lift = -10;
//     this.onGround = false;
//   }

//   body() {
//     imageMode(CENTER);
//     let marioImg;

//     if (marioLives < 50) {
//       marioImg = deterioratedMarioImage;
//     } else if (isAdvancedMario) {
//       marioImg = advancedMarioImage;
//     } else {
//       marioImg = marioImage;
//     }

//     let scaleFactor = isAdvancedMario ? 1.2 : 1;
//     image(marioImg, this.x, this.y, marioImg.width * scaleFactor, marioImg.height * scaleFactor);
//   }

//   move() {
//     if (keyIsDown(LEFT_ARROW)) this.x -= 5;
//     if (keyIsDown(RIGHT_ARROW)) this.x += 5;

//     if (keyIsDown(UP_ARROW) && this.onGround) {
//       this.ySpeed = this.lift;
//       this.onGround = false;
//       jumpSound.play();
//     }

//     this.ySpeed += this.gravity;
//     this.y += this.ySpeed;

//     if (this.y > height - 50) {
//       this.y = height - 50;
//       this.ySpeed = 0;
//       this.onGround = true;
//     } else {
//       this.onGround = false;
//     }

//     for (let platform of platforms) {
//       if (
//         this.x + this.w / 2 > platform.x &&
//         this.x - this.w / 2 < platform.x + platform.w &&
//         this.y + this.h / 2 > platform.y &&
//         this.y + this.h / 2 < platform.y + platform.h
//       ) {
//         this.y = platform.y - this.h / 2;
//         this.ySpeed = 0;
//         this.onGround = true;
//       }
//     }
//   }
// }

// class Monster {
//   constructor(x, y, img) {
//     this.x = x;
//     this.y = y;
//     this.w = 50;
//     this.h = 50;
//     this.img = img;
//   }

//   body() {
//     imageMode(CENTER);
//     image(this.img, this.x, this.y, this.w, this.h);
//   }

//   move() {
//     this.x += 1;
//     if (this.x > width) {
//       this.x = 0;
//     }
//   }

//   checkPosition() {
//     if (
//       mario.x + mario.w / 2 > this.x &&
//       mario.x - mario.w / 2 < this.x + this.w &&
//       mario.y + mario.h / 2 > this.y &&
//       mario.y - mario.h / 2 < this.y + this.h
//     ) {
//       mario.y = height - 50;
//       marioLives -= 20;
//       if (marioLives <= 0) {
//         noLoop();
//       }
//     }
//   }
// }

// class Coin {
//   constructor(x, y) {
//     this.x = x;
//     this.y = y;
//     this.diameter = 40;
//     this.collected = false;
//   }

//   body() {
//     if (!this.collected) {
//       imageMode(CENTER);
//       image(coinImage, this.x, this.y, this.diameter, this.diameter);
//     }
//   }

//   checkCollection() {
//     if (!this.collected && dist(mario.x, mario.y, this.x, this.y) < this.diameter / 2 + mario.w / 2) {
//       this.collected = true;
//       coinsCollected++;
//       coinSound.play(); 
//     }
//   }
// }

// class Platform {
//   constructor(x, y, w, h) {
//     this.x = x;
//     this.y = y;
//     this.w = w;
//     this.h = h;
//   }

//   body() {
//     imageMode(CENTER);
//     image(platformImage, this.x + this.w / 2, this.y + this.h / 2, this.w, this.h*1.5);
//   }
// }
