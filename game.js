// game.js COMPLETO con vibración visual al perder vida o activar modo difícil

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const startScreen = document.getElementById('startScreen');
const mobileControls = document.getElementById('mobileControls');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const restartContainer = document.getElementById('restartContainer');

let player, objects, particles, score, lives, objectSpeed, gameStarted = false;
let selectedColor = 'blue';
let spawnInterval;
let moveLeft = false;
let moveRight = false;
let hardMode = false;
let flashEffect = 0;

function chooseCharacter(color) {
  selectedColor = color;
}

function startGame() {
  objectSpeed = 2;
  player = { x: 180, y: 550, width: 50, height: 20, speed: 7 };
  objects = [];
  particles = [];
  score = 0;
  lives = 5;
  gameStarted = true;
  hardMode = false;
  flashEffect = 0;

  menu.style.display = 'none';
  canvas.style.display = 'block';
  mobileControls.style.display = 'flex';
  restartContainer.style.display = 'block';

  if (spawnInterval) clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnObject, 1000);

  gameLoop();
}

function restartGame() {
  startGame();
}

function playCatchSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(800, ctx.currentTime);
  oscillator.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.1);
}

function playMissSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(300, ctx.currentTime);
  oscillator.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.2);
}

function triggerCanvasVibration() {
  canvas.classList.add('vibrate');
  setTimeout(() => {
    canvas.classList.remove('vibrate');
  }, 300);
}

function clearScreen() {
  const bg = document.body.classList.contains('dark-mode') ? '#1e1e1e' : '#ffffff';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  const isDark = document.body.classList.contains('dark-mode');
  ctx.fillStyle = isDark ? '#90caf9' : selectedColor;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawObjects() {
  const isDark = document.body.classList.contains('dark-mode');
  for (let obj of objects) {
    if (obj.isBonus) {
      ctx.fillStyle = isDark ? '#ffd54f' : 'gold';
    } else if (obj.isLife) {
      ctx.fillStyle = isDark ? '#66bb6a' : 'lime';
    } else {
      ctx.fillStyle = isDark ? '#ef9a9a' : '#ff4500';
    }
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    obj.y += obj.speed;
  }
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawFlash() {
  if (flashEffect > 0) {
    ctx.fillStyle = `rgba(255, 255, 0, ${flashEffect})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    flashEffect -= 0.02;
  }
}

function drawHUD() {
  const isDark = document.body.classList.contains('dark-mode');
  ctx.fillStyle = isDark ? '#f1f1f1' : '#000';
  ctx.font = '20px Arial';
  ctx.fillText('Puntos: ' + score, 10, 20);
  ctx.fillText('Vidas: ' + lives, 300, 20);
  if (hardMode) {
    ctx.fillText('⚡ MODO DIFÍCIL ⚡', 100, 50);
  }
}

function createParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 4 + 1,
      life: 20,
      color: color
    });
  }
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
        createParticles(obj.x, obj.y, 'gold');
      } else if (obj.isLife) {
        lives++;
        createParticles(obj.x, obj.y, 'lime');
      } else {
        score += 10;
        createParticles(obj.x, obj.y, '#4fc3f7');
      }
      objects.splice(i, 1);
      playCatchSound();
    } else if (obj.y > canvas.height) {
      objects.splice(i, 1);
      lives--;
      createParticles(player.x + 25, player.y, 'red');
      playMissSound();
      triggerCanvasVibration();
      if (lives <= 0) {
        endGame();
      }
    }
  }

  if (!hardMode && score >= 500) {
    activateHardMode();
  }
}

function spawnObject() {
  if (gameStarted) {
    const random = Math.random();
    const isBonus = random < (hardMode ? 0.02 : 0.05);
    const isLife = !hardMode && random >= 0.05 && random < 0.08;

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

function activateHardMode() {
  hardMode = true;
  objectSpeed += 2;
  clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnObject, 500);
  flashEffect = 0.7;
  triggerCanvasVibration();
  alert('¡MODO DIFÍCIL ACTIVADO! ⚡🚀');
}

function endGame() {
  gameStarted = false;
  alert('¡GAME OVER! Tu puntaje fue: ' + score);
}

function gameLoop() {
  clearScreen();
  if (gameStarted) {
    drawPlayer();
    drawObjects();
    drawParticles();
    checkCollisions();
    drawHUD();
    drawFlash();
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
