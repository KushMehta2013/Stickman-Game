document.addEventListener("DOMContentLoaded", () => {

  const startScreen = document.getElementById("start-screen");
  const playBtn = document.getElementById("play-btn");
  const game = document.getElementById("game");

  const player = document.getElementById("player");
  const scoreEl = document.getElementById("score");
  const healthEl = document.getElementById("health");

  let playerX = window.innerWidth / 2;
  let score = 0;
  let health = 100;

  let bullets = [];
  let enemies = [];
  let gameRunning = false;
  let enemyInterval = null;

  playBtn.addEventListener("click", startGame);

  function startGame() {
    startScreen.style.display = "none";
    game.classList.remove("hidden");

    score = 0;
    health = 100;
    bullets = [];
    enemies = [];
    gameRunning = true;

    scoreEl.textContent = "Score: 0";
    healthEl.style.width = "100%";

    enemyInterval = setInterval(createEnemy, 1200);
    requestAnimationFrame(update);
  }

  document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;

    if (e.key === "ArrowLeft") playerX -= 20;
    if (e.key === "ArrowRight") playerX += 20;
    if (e.key === " ") shoot();
  });

  function shoot() {
    const bullet = document.createElement("div");
    bullet.className = "bullet";
    bullet.style.left = playerX + 25 + "px";
    bullet.style.bottom = "70px";
    game.appendChild(bullet);
    bullets.push({ el: bullet, y: 70 });
  }

  function createEnemy() {
    if (!gameRunning) return;

    const enemy = document.createElement("div");
    enemy.className = "enemy";
    enemy.innerHTML = `
      <div class="eye left"></div>
      <div class="eye right"></div>
      <div class="mouth"></div>
    `;
    enemy.style.left = Math.random() * (window.innerWidth - 30) + "px";
    enemy.style.top = "0px";
    game.appendChild(enemy);
    enemies.push({ el: enemy, y: 0 });
  }

  function update() {
    if (!gameRunning) return;

    player.style.left = playerX + "px";

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y += 12;
      bullets[i].el.style.bottom = bullets[i].y + "px";

      if (bullets[i].y > window.innerHeight) {
        bullets[i].el.remove();
        bullets.splice(i, 1);
      }
    }

    // Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].y += 3;
      enemies[i].el.style.top = enemies[i].y + "px";

      // Collision
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (isColliding(bullets[j].el, enemies[i].el)) {
          bullets[j].el.remove();
          enemies[i].el.remove();
          bullets.splice(j, 1);
          enemies.splice(i, 1);
          score++;
          scoreEl.textContent = "Score: " + score;
          break;
        }
      }

      // Enemy reaches player
      if (enemies[i] && enemies[i].y > window.innerHeight - 100) {
        enemies[i].el.remove();
        enemies.splice(i, 1);
        health -= 20;
        healthEl.style.width = health + "%";

        if (health <= 0) {
          endGame();
          return;
        }
      }
    }

    requestAnimationFrame(update);
  }

  function endGame() {
    gameRunning = false;
    clearInterval(enemyInterval);
    alert("Game Over! Score: " + score);
    location.reload();
  }

  function isColliding(a, b) {
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return (
      ar.left < br.right &&
      ar.right > br.left &&
      ar.top < br.bottom &&
      ar.bottom > br.top
    );
  }

});




// MOBILE CONTROLS
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");
const shootBtn = document.getElementById("shoot-btn");

let moveInterval = null;

function startMove(dir) {
  stopMove();
  moveInterval = setInterval(() => {
    if (!gameRunning) return;
    playerX += dir * 10;
  }, 30);
}

function stopMove() {
  clearInterval(moveInterval);
}

leftBtn.addEventListener("touchstart", () => startMove(-1));
rightBtn.addEventListener("touchstart", () => startMove(1));
leftBtn.addEventListener("touchend", stopMove);
rightBtn.addEventListener("touchend", stopMove);

shootBtn.addEventListener("touchstart", () => {
  if (gameRunning) shoot();
});


const pauseBtn = document.getElementById("pause-btn");
let paused = false;

pauseBtn.onclick = () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶ Resume" : "⏸ Pause";
};


const shootSound = new Audio("sounds/shoot.wav");
const hitSound = new Audio("sounds/hit.wav");
const bossSound = new Audio("sounds/boss.wav");

shootSound.currentTime = 0;
shootSound.play();

hitSound.currentTime = 0;
hitSound.play();


let boss = null;
let bossHealth = 0;

function createBoss() {
  if (boss) return;

  const b = document.createElement("div");
  b.className = "enemy boss";
  b.innerHTML = `
    <div class="eye left"></div>
    <div class="eye right"></div>
    <div class="mouth"></div>
  `;

  b.style.left = (window.innerWidth / 2 - 40) + "px";
  b.style.top = "0px";
  game.appendChild(b);

  boss = { el: b, y: 0 };
  bossHealth = 20;
  bossSound.play();
}
if (score > 0 && score % 10 === 0 && !boss) {
  createBoss();
}

if (boss) {
  boss.y += 1.5;
  boss.el.style.top = boss.y + "px";

  bullets.forEach((b, bi) => {
    if (isColliding(b.el, boss.el)) {
      b.el.remove();
      bullets.splice(bi, 1);
      bossHealth--;
      hitSound.play();

      if (bossHealth <= 0) {
        boss.el.remove();
        boss = null;
        score += 5;
        scoreEl.textContent = "Score: " + score;
      }
    }
  });
}

function getClosestEnemy() {
  let closest = null;
  let minDist = Infinity;

  enemies.forEach(e => {
    const dx = e.el.offsetLeft - playerX;
    if (Math.abs(dx) < minDist) {
      minDist = Math.abs(dx);
      closest = e;
    }
  });

  return closest;
}

const target = getClosestEnemy();
if (target) {
  const tx = target.el.offsetLeft;
  const bx = parseFloat(b.el.style.left);
  b.el.style.left = bx + (tx - bx) * 0.05 + "px";
}

