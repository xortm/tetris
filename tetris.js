// Tetris Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const BLOCK_SIZE = 30;
const COLS = 10;
const ROWS = 20;
const NEXT_COLS = 4;
const NEXT_ROWS = 4;

// Tetromino shapes and colors
const TETROMINOES = {
    I: {
        shape: [[1, 1, 1, 1]],
        color: '#00f0f0'
    },
    J: {
        shape: [[1, 0, 0], [1, 1, 1]],
        color: '#0000f0'
    },
    L: {
        shape: [[0, 0, 1], [1, 1, 1]],
        color: '#f0a000'
    },
    O: {
        shape: [[1, 1], [1, 1]],
        color: '#f0f000'
    },
    S: {
        shape: [[0, 1, 1], [1, 1, 0]],
        color: '#00f000'
    },
    T: {
        shape: [[0, 1, 0], [1, 1, 1]],
        color: '#a000f0'
    },
    Z: {
        shape: [[1, 1, 0], [0, 1, 1]],
        color: '#f00000'
    }
};

const TETROMINO_NAMES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

');

let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let isPaused = false;
let dropInterval = 1000;
let lastDropTime = 0;

// Initialize game
function init() {
    createBoard();
    resetGame();
    drawBoard();
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.addEventListener('keydown', handleKeyPress);
}

function createBoard() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
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
    clearCurrentPiece();
    clearNextPiece();
}

function startGame() {
    resetGame();
    spawnPiece();
    gameLoop();
}

function togglePause() {
    if (!gameOver && currentPiece) {
        isPaused = !isPaused;
        document.getElementById('pauseBtn').textContent = isPaused ? '继续' : '暂停';
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
        alert('游戏结束！得分：' + score);
    }
}

function createPiece() {
    const name = TETROMINO_NAMES[Math.floor(Math.random() * TETROMINO_NAMES.length)];
    return {
        shape: TETROMINOES[name].shape.map(row => [...row]),
        color: TETROMINOES[name].color,
        name: name
    };
}

function gameLoop(timestamp = 0) {
    if (gameOver) return;
    
    if (!isPaused) {
        const deltaTime = timestamp - lastDropTime;
        
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
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
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
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                
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
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const y = currentPiece.y + row;
                const x = currentPiece.x + col;
                if (y >= 0) {
                    board[y][x] = currentPiece.color;
                }
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== null)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(null));
            linesCleared++;
            row++;
        }
    }
    
    if (linesCleared > 0) {
        updateScore(linesCleared);
    }
}

function updateScore(linesCleared) {
    const points = [0, 100, 300, 500, 800];
    score += points[linesCleared] * level;
    lines += linesCleared;
    
    if (lines >= level * 10) {
        level++;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    }
    
    updateStats();
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// Drawing functions
function drawBoard() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                drawBlock(ctx, col, row, board[row][col]);
            }
            drawGrid(ctx, col, row);
        }
    }
}

function drawCurrentPiece() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                drawBlock(ctx, currentPiece.x + col, currentPiece.y + row, currentPiece.color);
            }
        }
    }
}

function drawNextPiece() {
    clearNextBoard();
    
    if (nextPiece) {
        const offsetX = (NEXT_COLS - nextPiece.shape[0].length) / 2;
        const offsetY = (NEXT_ROWS - nextPiece.shape.length) / 2;
        
        for (let row = 0; row < nextPiece.shape.length; row++) {
            for (let col = 0; col < nextPiece.shape[row].length; col++) {
                if (nextPiece.shape[row][col]) {
                    drawBlock(nextCtx, offsetX + col, offsetY + row, nextPiece.color, NEXT_COLS);
                }
            }
        }
    }
}

function drawBlock(context, x, y, color, cols = COLS) {
    const blockSize = cols === COLS ? BLOCK_SIZE : BLOCK_SIZE * 0.7;
    
    context.fillStyle = color;
    context.fillRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, blockSize - 2);
    
    // Add 3D effect
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, 3);
    context.fillRect(x * blockSize + 1, y * blockSize + 1, 3, blockSize - 2);
    
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(x * blockSize + blockSize - 4, y * blockSize + 1, 3, blockSize - 2);
    context.fillRect(x * blockSize + 1, y * blockSize + blockSize - 4, blockSize - 2, 3);
}

function drawGrid(context, x, y, cols = COLS) {
    const blockSize = cols === COLS ? BLOCK_SIZE : BLOCK_SIZE * 0.7;
    
    context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function clearNextBoard() {
    nextCtx.fillStyle = '#1a1a2e';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
}

// Initialize game when page loads
window.onload = init;