// Elementos
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const startScreen = document.getElementById('startScreen');
const mobileControls = document.getElementById('mobileControls');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Variables
let player, objects, particles, score, lives, objectSpeed, gameStarted = false;
let selectedColor = 'blue';
let spawnInterval;
let moveLeft = false;
let moveRight = false;

// Mostrar menú
function showMenu() {
  startScreen.style.display = 'none';
  menu.style.display = 'block';
}

// Elegir color
function chooseCharacter(color) {
  selectedColor = color;
}

// Iniciar juego
function startGame() {
  objectSpeed = 2;
  player = { x: 180, y: 550, width: 50, height: 20, speed: 7 };
  objects = [];
  particles = [];
  score = 0;
  lives = 5;
  gameStarted = true;

  menu.style.display = 'none';
  canvas.style.display = 'block';
  mobileControls.style.display = 'flex';

  if (spawnInterval) clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnObject, 1000);

  gameLoop();
}

// Juego
function clearScreen() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.fillStyle = selectedColor;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawObjects() {
  for (let obj of objects) {
    ctx.fillStyle = obj.isBonus ? 'gold' : obj.isLife ? 'lime' : '#ff4500';
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    obj.y += obj.speed;
  }
}

function drawHUD() {
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText('Puntos: ' + score, 10, 20);
  ctx.fillText('Vidas: ' + lives, 300, 20);
}

function checkCollisions() {
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    if (
      player.x < obj.x + obj.width &&
      player.x + player.width > obj.x &&
      player.y < obj.y + obj.height &&
      player.y + player.height > obj.y
    ) {
      if (obj.isBonus) {
        score += 100;
      } else if (obj.isLife) {
        lives++;
      } else {
        score += 10;
      }
      objects.splice(i, 1);
    } else if (obj.y > canvas.height) {
      objects.splice(i, 1);
      lives--;
      if (lives <= 0) {
        endGame();
      }
    }
  }
}

function spawnObject() {
  if (gameStarted) {
    const random = Math.random();
    const isBonus = random < 0.05;
    const isLife = random >= 0.05 && random < 0.08;

    const newObj = {
      x: Math.random() * (canvas.width - 20),
      y: -20,
      width: 20,
      height: 20,
      speed: objectSpeed,
      isBonus: isBonus,
      isLife: isLife
    };

    objects.push(newObj);
  }
}

function increaseDifficulty() {
  if (score % 100 === 0 && score > 0) {
    objectSpeed += 0.5;
  }
}

function endGame() {
  gameStarted = false;
  alert('¡GAME OVER! Tu puntaje fue: ' + score);
  location.reload();
}

function gameLoop() {
  clearScreen();
  if (gameStarted) {
    drawPlayer();
    drawObjects();
    checkCollisions();
    drawHUD();
    handleInput();
  }
  requestAnimationFrame(gameLoop);
}

// Controles
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') moveLeft = true;
  if (e.key === 'ArrowRight') moveRight = true;
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') moveLeft = false;
  if (e.key === 'ArrowRight') moveRight = false;
});

leftBtn.addEventListener('touchstart', () => moveLeft = true);
leftBtn.addEventListener('touchend', () => moveLeft = false);
rightBtn.addEventListener('touchstart', () => moveRight = true);
rightBtn.addEventListener('touchend', () => moveRight = false);

function handleInput() {
  if (moveLeft) player.x -= player.speed;
  if (moveRight) player.x += player.speed;
}
