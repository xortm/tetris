// Tetris Game
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var next = document.getElementById('nextCanvas');
var nextCtx = next.getContext('2d');

var BLOCK_SIZE = 30;
var COLS = 10;
var ROWS = 20;

// Tetromino shapes and colors
var TETROMINOES = {
  'I': { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  'J': { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  'L': { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' },
  'O': { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  'S': { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  'T': { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  'Z': { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' }
};

var TETROMINO_NAMES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

var board = [];
var currentPiece = null;
var nextPiece = null;
var score = 0;
var level = 1;
var lines = 0;
var gameOver = false;
var isPaused = false;
var dropInterval = 1000;
var lastDropTime = 0;

function init() {
  createBoard();
  resetGame();
  drawBoard();

  // 使用 HTML onclick 直接绑定，不再使用 addEventListener
  // document.getElementById('startBtn').addEventListener('click', startGame);
  // document.getElementById('pauseBtn').addEventListener('click', togglePause);

  document.addEventListener('keydown', handleKeyPress);

  // 移动端控制按钮
  initMobileControls();

  // 初始化效果系统
  initEffects();

  // 显示开始提示
  showStartHint();
}

// 初始化移动端控制
function initMobileControls() {
  var mobileControls = document.getElementById('mobileControls');
  if (!mobileControls) return;
  
  var buttons = mobileControls.querySelectorAll('.control-btn');
  
  buttons.forEach(function(btn) {
    var action = btn.getAttribute('data-action');
    if (!action) return;
    
    // 触摸开始 - 防止默认行为
    btn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleMobileAction(action);
      btn.classList.add('active');
    }, { passive: false });
    
    // 鼠标点击（桌面端测试）
    btn.addEventListener('mousedown', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        handleMobileAction(action);
      }
    });
    
    // 触摸结束
    btn.addEventListener('touchend', function(e) {
      e.preventDefault();
      btn.classList.remove('active');
    }, { passive: false });
    
    // 鼠标松开
    btn.addEventListener('mouseup', function(e) {
      btn.classList.remove('active');
    });
    
    // 触摸取消
    btn.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      btn.classList.remove('active');
    }, { passive: false });
  });
}

// 处理移动端操作
function handleMobileAction(action) {
  if (gameOver) return;
  
  switch(action) {
    case 'up':
      if (!isPaused) rotate();
      break;
    case 'down':
      if (!isPaused) moveDown();
      break;
    case 'left':
      if (!isPaused) moveLeft();
      break;
    case 'right':
      if (!isPaused) moveRight();
      break;
    case 'rotate':
      if (!isPaused) rotate();
      break;
    case 'drop':
      if (!isPaused) hardDrop();
      break;
    case 'pause':
      togglePause();
      // 更新移动端暂停按钮状态
      updateMobilePauseButton();
      break;
  }
}

// 更新移动端暂停按钮状态
function updateMobilePauseButton() {
  var pauseBtn = document.querySelector('.btn-pause .btn-label');
  if (pauseBtn) {
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
  }
}

function createBoard() {
  board = [];
  for (var i = 0; i < ROWS; i++) {
    var row = [];
    for (var j = 0; j < COLS; j++) {
      row.push(null);
    }
    board.push(row);
  }
}

function resetGame() {
  createBoard();
  score = 0;
  level = 1;
  lines = 0;
  gameOver = false;
  isPaused = false;
  dropInterval = 1000;
  updateStats();
  clearNextBoard();
  currentPiece = null;
  nextPiece = null;
}

function startGame() {
  resetGame();
  spawnPiece();
  gameLoop();
}

function togglePause() {
  if (!gameOver && currentPiece) {
    isPaused = !isPaused;
    var pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
      pauseBtn.textContent = isPaused ? '继续' : '暂停';
    }
  }
}

function spawnPiece() {
  if (!nextPiece) {
    nextPiece = createPiece();
  }
  
  currentPiece = nextPiece;
  currentPiece.x = Math.floor((COLS - currentPiece.shape[0].length) / 2);
  currentPiece.y = 0;
  
  nextPiece = createPiece();
  drawNextPiece();
  
  if (checkCollision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
    gameOver = true;
    showGameOverScreen();
  }
}

function showGameOverScreen() {
  // 创建游戏结束覆盖层
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.9); display: flex; justify-content: center; align-items: center; z-index: 1000;';
  
  var modal = document.createElement('div');
  modal.style.cssText = 'background: white; padding: 40px; border-radius: 16px; text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-width: 400px;';
  
  var title = document.createElement('h2');
  title.textContent = '游戏结束';
  title.style.cssText = 'color: #0f172a; font-size: 2rem; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.02em;';
  
  var scoreText = document.createElement('p');
  scoreText.textContent = '最终得分: ' + score;
  scoreText.style.cssText = 'color: #475569; font-size: 1.25rem; font-family: "JetBrains Mono", monospace; margin-bottom: 24px; font-variant-numeric: tabular-nums;';
  
  var restartBtn = document.createElement('button');
  restartBtn.textContent = '重新开始';
  restartBtn.style.cssText = 'padding: 14px 32px; font-size: 1rem; font-weight: 600; border: none; border-radius: 12px; background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; cursor: pointer; transition: all 0.3s;';
  
  restartBtn.addEventListener('click', function() {
    document.body.removeChild(overlay);
    startGame();
  });
  
  modal.appendChild(title);
  modal.appendChild(scoreText);
  modal.appendChild(restartBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

function createPiece() {
  var nameIndex = Math.floor(Math.random() * TETROMINO_NAMES.length);
  var name = TETROMINO_NAMES[nameIndex];
  var tetromino = TETROMINOES[name];
  
  var shape = [];
  for (var i = 0; i < tetromino.shape.length; i++) {
    shape.push(tetromino.shape[i].slice());
  }
  
  return {
    shape: shape,
    color: tetromino.color,
    name: name
  };
}

function gameLoop(timestamp) {
  if (gameOver) return;
  
  if (!isPaused) {
    if (!lastDropTime) lastDropTime = timestamp;
    
    var deltaTime = timestamp - lastDropTime;
    
    if (deltaTime > dropInterval) {
      moveDown();
      lastDropTime = timestamp;
    }
    
    drawBoard();
    drawCurrentPiece();
  }
  
  requestAnimationFrame(gameLoop);
}

function handleKeyPress(event) {
  if (gameOver) return;
  
  switch(event.key) {
    case 'ArrowLeft':
      if (!isPaused) moveLeft();
      event.preventDefault();
      break;
    case 'ArrowRight':
      if (!isPaused) moveRight();
      event.preventDefault();
      break;
    case 'ArrowDown':
      if (!isPaused) moveDown();
      event.preventDefault();
      break;
    case 'ArrowUp':
      if (!isPaused) rotate();
      event.preventDefault();
      break;
    case ' ':
      if (!isPaused) hardDrop();
      event.preventDefault();
      break;
    case 'p':
    case 'P':
      togglePause();
      event.preventDefault();
      break;
  }
}

function moveLeft() {
  if (!checkCollision(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) {
    currentPiece.x--;
  }
}

function moveRight() {
  if (!checkCollision(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) {
    currentPiece.x++;
  }
}

function moveDown() {
  if (!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
    currentPiece.y++;
  } else {
    lockPiece();
    clearLines();
    spawnPiece();
  }
}

function hardDrop() {
  while (!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
    currentPiece.y++;
  }
  moveDown();
}

function rotate() {
  var rows = currentPiece.shape.length;
  var cols = currentPiece.shape[0].length;
  var rotated = [];
  
  for (var i = 0; i < cols; i++) {
    rotated[i] = [];
    for (var j = 0; j < rows; j++) {
      rotated[i][j] = currentPiece.shape[rows - 1 - j][i];
    }
  }
  
  if (!checkCollision(currentPiece.x, currentPiece.y, rotated)) {
    currentPiece.shape = rotated;
  } else if (!checkCollision(currentPiece.x + 1, currentPiece.y, rotated)) {
    currentPiece.x++;
    currentPiece.shape = rotated;
  } else if (!checkCollision(currentPiece.x - 1, currentPiece.y, rotated)) {
    currentPiece.x--;
    currentPiece.shape = rotated;
  }
}

function checkCollision(x, y, shape) {
  for (var row = 0; row < shape.length; row++) {
    for (var col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        var newX = x + col;
        var newY = y + row;
        
        if (newX < 0 || newX >= COLS || newY >= ROWS) {
          return true;
        }
        
        if (newY >= 0 && board[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

function lockPiece() {
  for (var row = 0; row < currentPiece.shape.length; row++) {
    for (var col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        var y = currentPiece.y + row;
        var x = currentPiece.x + col;
        if (y >= 0) {
          board[y][x] = currentPiece.color;
        }
      }
    }
  }
}

function clearLines() {
  var linesCleared = 0;
  var clearedRows = [];
  
  for (var row = ROWS - 1; row >= 0; row--) {
    var fullLine = true;
    for (var col = 0; col < COLS; col++) {
      if (!board[row][col]) {
        fullLine = false;
        break;
      }
    }
    if (fullLine) {
      clearedRows.push(row);
      board.splice(row, 1);
      var newRow = [];
      for (var j = 0; j < COLS; j++) {
        newRow.push(null);
      }
      board.unshift(newRow);
      linesCleared++;
      row++;
    }
  }
  
  if (linesCleared > 0) {
    // 显示连击提示
    showCombo(linesCleared);
    
    // 创建消除动画
    createClearEffects(clearedRows, linesCleared);
    
    updateScore(linesCleared);
  }
}

function updateScore(linesCleared) {
  var points = [0, 100, 300, 500, 800];
  score += points[linesCleared] * level;
  lines += linesCleared;
  
  if (lines >= level * 10) {
    level++;
    dropInterval = Math.max(100, 1000 - (level - 1) * 100);
  }
  
  updateStats();
}

function updateStats() {
  var scoreEl = document.getElementById('score');
  var levelEl = document.getElementById('level');
  var linesEl = document.getElementById('lines');
  
  if (scoreEl) scoreEl.textContent = score;
  if (levelEl) levelEl.textContent = level;
  if (linesEl) linesEl.textContent = lines;
  
  // 更新移动端分数显示
  var mobileScoreEl = document.getElementById('mobileScoreValue');
  var mobileLevelEl = document.getElementById('mobileLevelValue');
  
  if (mobileScoreEl) mobileScoreEl.textContent = score;
  if (mobileLevelEl) mobileLevelEl.textContent = level;
}

function drawBoard() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      if (board[row][col]) {
        drawBlock(ctx, col, row, board[row][col]);
      }
      drawGrid(ctx, col, row);
    }
  }
}

function drawCurrentPiece() {
  if (!currentPiece) return;
  
  for (var row = 0; row < currentPiece.shape.length; row++) {
    for (var col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        drawBlock(ctx, currentPiece.x + col, currentPiece.y + row, currentPiece.color);
      }
    }
  }
}

function drawNextPiece() {
  clearNextBoard();
  
  if (!nextPiece) return;
  
  var offsetX = Math.floor((4 - nextPiece.shape[0].length) / 2);
  var offsetY = Math.floor((4 - nextPiece.shape.length) / 2);
  
  for (var row = 0; row < nextPiece.shape.length; row++) {
    for (var col = 0; col < nextPiece.shape[row].length; col++) {
      if (nextPiece.shape[row][col]) {
        drawBlock(nextCtx, offsetX + col, offsetY + row, nextPiece.color);
      }
    }
  }
}

function drawBlock(context, x, y, color) {
  var blockSize = BLOCK_SIZE;
  
  context.fillStyle = color;
  context.fillRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, blockSize - 2);
  
  context.fillStyle = 'rgba(255, 255, 255, 0.3)';
  context.fillRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, 3);
  context.fillRect(x * blockSize + 1, y * blockSize + 1, 3, blockSize - 2);
  
  context.fillStyle = 'rgba(0, 0, 0, 0.3)';
  context.fillRect(x * blockSize + blockSize - 4, y * blockSize + 1, 3, blockSize - 2);
  context.fillRect(x * blockSize + 1, y * blockSize + blockSize - 4, blockSize - 2, 3);
}

function drawGrid(context, x, y) {
  context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function clearNextBoard() {
  nextCtx.fillStyle = '#1a1a2e';
  nextCtx.fillRect(0, 0, next.width, next.height);
}

// ========================================
// 连击提示系统
// ========================================

function showCombo(linesCleared) {
  var comboDisplay = document.getElementById('comboDisplay');
  if (!comboDisplay) return;
  
  var text = '';
  var subtext = '';
  
  switch(linesCleared) {
    case 1:
      text = 'SINGLE!';
      subtext = '消除 1 行';
      break;
    case 2:
      text = 'DOUBLE!!';
      subtext = '消除 2 行';
      break;
    case 3:
      text = 'TRIPLE!!!';
      subtext = '消除 3 行';
      break;
    case 4:
      text = 'TETRIS!!!!';
      subtext = '完美消除!';
      break;
    default:
      text = linesCleared + ' LINES!';
      subtext = '超级连击!';
  }
  
  comboDisplay.innerHTML = '';
  
  var textEl = document.createElement('div');
  textEl.className = 'combo-text';
  textEl.textContent = text;
  comboDisplay.appendChild(textEl);
  
  var subtextEl = document.createElement('div');
  subtextEl.className = 'combo-subtext';
  subtextEl.textContent = subtext;
  comboDisplay.appendChild(subtextEl);
  
  comboDisplay.style.display = 'block';
  comboDisplay.style.opacity = '1';
  comboDisplay.style.transform = 'translate(-50%, -50%) scale(1)';
  
  setTimeout(function() {
    comboDisplay.style.display = 'none';
  }, 1500);
}

// ========================================
// 消除动画效果系统
// ========================================

var effectsCanvas = null;
var effectsCtx = null;
var effects = [];

function initEffects() {
  effectsCanvas = document.getElementById('effectsCanvas');
  if (!effectsCanvas) return;
  
  effectsCtx = effectsCanvas.getContext('2d');
  effectsCanvas.width = window.innerWidth;
  effectsCanvas.height = window.innerHeight;
  
  window.addEventListener('resize', function() {
    effectsCanvas.width = window.innerWidth;
    effectsCanvas.height = window.innerHeight;
  });
  
  animateEffects();
}

function createClearEffects(rows, linesCleared) {
  if (!effectsCtx) return;
  
  rows.forEach(function(row) {
    for (var col = 0; col < COLS; col++) {
      var x = col * BLOCK_SIZE;
      var y = row * BLOCK_SIZE;
      var color = board[row] && board[row][col] ? board[row][col] : '#ffffff';
      
      // 创建粒子效果
      var particleCount = 8 + linesCleared * 4;  // 消除越多，粒子越多
      
      for (var i = 0; i < particleCount; i++) {
        effects.push({
          x: x + BLOCK_SIZE / 2,
          y: y + BLOCK_SIZE / 2,
          vx: (Math.random() - 0.5) * (8 + linesCleared * 2),  // 消除越多，速度越快
          vy: (Math.random() - 0.5) * (8 + linesCleared * 2),
          size: 3 + Math.random() * 5,
          color: color,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.02
        });
      }
      
      // 创建爆炸波纹效果
      if (linesCleared >= 2) {
        effects.push({
          type: 'ripple',
          x: x + BLOCK_SIZE / 2,
          y: y + BLOCK_SIZE / 2,
          radius: 0,
          maxRadius: BLOCK_SIZE * (1 + linesCleared * 0.5),  // 消除越多，波纹越大
          color: color,
          alpha: 0.8,
          lineWidth: 3 + linesCleared * 2
        });
      }
    }
  });
  
  // 消除4行时添加特殊效果
  if (linesCleared === 4) {
    createTetrisEffect();
  }
}

function createTetrisEffect() {
  // 添加闪光效果
  effects.push({
    type: 'flash',
    alpha: 0,
    maxAlpha: 0.3
  });
  
  // 添加大量粒子爆发
  for (var i = 0; i < 50; i++) {
    var angle = (Math.PI * 2 * i) / 50;
    var speed = 10 + Math.random() * 15;
    
    effects.push({
      type: 'spark',
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 4,
      color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)],
      alpha: 1,
      decay: 0.015
    });
  }
}

function animateEffects() {
  if (!effectsCtx) return;
  
  effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
  
  for (var i = effects.length - 1; i >= 0; i--) {
    var effect = effects[i];
    
    if (effect.type === 'ripple') {
      // 波纹效果
      effectsCtx.beginPath();
      effectsCtx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      effectsCtx.strokeStyle = effect.color;
      effectsCtx.lineWidth = effect.lineWidth;
      effectsCtx.globalAlpha = effect.alpha;
      effectsCtx.stroke();
      effectsCtx.globalAlpha = 1;
      
      effect.radius += 4;
      effect.alpha -= 0.03;
      effect.lineWidth *= 0.95;
      
      if (effect.alpha <= 0 || effect.lineWidth <= 0.5) {
        effects.splice(i, 1);
      }
    } else if (effect.type === 'flash') {
      // 闪光效果
      effectsCtx.fillStyle = 'rgba(255, 255, 255, ' + effect.alpha + ')';
      effectsCtx.fillRect(0, 0, effectsCanvas.width, effectsCanvas.height);
      
      if (effect.alpha < effect.maxAlpha) {
        effect.alpha += 0.05;
      } else {
        effect.alpha -= 0.05;
      }
      
      if (effect.alpha <= 0) {
        effects.splice(i, 1);
      }
    } else if (effect.type === 'spark') {
      // 火花效果
      effectsCtx.beginPath();
      effectsCtx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
      effectsCtx.fillStyle = effect.color;
      effectsCtx.globalAlpha = effect.alpha;
      effectsCtx.fill();
      effectsCtx.globalAlpha = 1;
      
      effect.x += effect.vx;
      effect.y += effect.vy;
      effect.vy += 0.3;  // 重力
      effect.alpha -= effect.decay;
      
      if (effect.alpha <= 0) {
        effects.splice(i, 1);
      }
    } else {
      // 普通粒子效果
      effectsCtx.beginPath();
      effectsCtx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
      effectsCtx.fillStyle = effect.color;
      effectsCtx.globalAlpha = effect.alpha;
      effectsCtx.fill();
      effectsCtx.globalAlpha = 1;
      
      effect.x += effect.vx;
      effect.y += effect.vy;
      effect.vy += 0.2;  // 重力
      effect.alpha -= effect.decay;
      effect.size *= 0.98;
      
      if (effect.alpha <= 0) {
        effects.splice(i, 1);
      }
    }
  }
  
  requestAnimationFrame(animateEffects);
}

// ========================================
// 开始提示系统
// ========================================

function showStartHint() {
  var hint = document.getElementById('startHint');
  if (!hint) return;
  
  hint.classList.add('show');
  
  // 点击开始按钮时隐藏提示
  var startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      hint.classList.remove('show');
      setTimeout(function() {
        hint.style.display = 'none';
      }, 300);
    });
  }
}

window.onload = init;
