const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const NEXT_BLOCK = 24;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
};

const COLORS = {
  I: "#30d5ff",
  J: "#3f7cff",
  L: "#ff9f3f",
  O: "#ffd84a",
  S: "#48d86f",
  T: "#b869ff",
  Z: "#ff5a74",
};

const boardCanvas = document.querySelector("#board");
const boardContext = boardCanvas.getContext("2d");
const nextCanvas = document.querySelector("#next");
const nextContext = nextCanvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const levelEl = document.querySelector("#level");
const linesEl = document.querySelector("#lines");
const statusEl = document.querySelector("#status");
const startBtn = document.querySelector("#startBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const restartBtn = document.querySelector("#restartBtn");

let board = createBoard();
let activePiece = createPiece();
let nextPiece = createPiece();
let score = 0;
let lines = 0;
let level = 1;
let dropCounter = 0;
let lastTime = 0;
let isRunning = false;
let isPaused = false;
let animationId = null;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function createPiece() {
  const types = Object.keys(SHAPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const matrix = SHAPES[type].map((row) => [...row]);

  return {
    type,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0,
  };
}

function drawCell(context, x, y, size, color) {
  context.fillStyle = color;
  context.fillRect(x * size, y * size, size, size);
  context.strokeStyle = "rgba(255, 255, 255, 0.18)";
  context.lineWidth = 2;
  context.strokeRect(x * size + 1, y * size + 1, size - 2, size - 2);
}

function drawBoard() {
  boardContext.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
  boardContext.fillStyle = "#0d1217";
  boardContext.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

  boardContext.strokeStyle = "rgba(255, 255, 255, 0.04)";
  boardContext.lineWidth = 1;

  for (let x = 1; x < COLS; x += 1) {
    boardContext.beginPath();
    boardContext.moveTo(x * BLOCK, 0);
    boardContext.lineTo(x * BLOCK, ROWS * BLOCK);
    boardContext.stroke();
  }

  for (let y = 1; y < ROWS; y += 1) {
    boardContext.beginPath();
    boardContext.moveTo(0, y * BLOCK);
    boardContext.lineTo(COLS * BLOCK, y * BLOCK);
    boardContext.stroke();
  }

  board.forEach((row, y) => {
    row.forEach((type, x) => {
      if (type) {
        drawCell(boardContext, x, y, BLOCK, COLORS[type]);
      }
    });
  });

  drawPiece(boardContext, activePiece, BLOCK);
}

function drawPiece(context, piece, size) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawCell(context, piece.x + x, piece.y + y, size, COLORS[piece.type]);
      }
    });
  });
}

function drawNext() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  nextContext.fillStyle = "#10161b";
  nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  const matrix = nextPiece.matrix;
  const offsetX = Math.floor((nextCanvas.width / NEXT_BLOCK - matrix[0].length) / 2);
  const offsetY = Math.floor((nextCanvas.height / NEXT_BLOCK - matrix.length) / 2);

  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawCell(nextContext, offsetX + x, offsetY + y, NEXT_BLOCK, COLORS[nextPiece.type]);
      }
    });
  });
}

function isColliding(piece) {
  return piece.matrix.some((row, y) =>
    row.some((value, x) => {
      if (!value) {
        return false;
      }

      const boardX = piece.x + x;
      const boardY = piece.y + y;
      return boardX < 0 || boardX >= COLS || boardY >= ROWS || Boolean(board[boardY]?.[boardX]);
    })
  );
}

function mergePiece() {
  activePiece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        board[activePiece.y + y][activePiece.x + x] = activePiece.type;
      }
    });
  });
}

function sweepLines() {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }

  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800][cleared] * level;
    score += points;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    updateHud();
  }
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
}

function rotatePiece() {
  if (!isRunning || isPaused) {
    return;
  }

  const originalMatrix = activePiece.matrix;
  const originalX = activePiece.x;
  activePiece.matrix = rotateMatrix(activePiece.matrix);

  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    activePiece.x = originalX + kick;
    if (!isColliding(activePiece)) {
      drawBoard();
      return;
    }
  }

  activePiece.matrix = originalMatrix;
  activePiece.x = originalX;
}

function movePiece(direction) {
  if (!isRunning || isPaused) {
    return;
  }

  activePiece.x += direction;
  if (isColliding(activePiece)) {
    activePiece.x -= direction;
  }
  drawBoard();
}

function dropPiece() {
  if (!isRunning || isPaused) {
    return;
  }

  activePiece.y += 1;

  if (isColliding(activePiece)) {
    activePiece.y -= 1;
    mergePiece();
    sweepLines();
    spawnPiece();
  }

  dropCounter = 0;
  drawBoard();
}

function hardDrop() {
  if (!isRunning || isPaused) {
    return;
  }

  while (!isColliding(activePiece)) {
    activePiece.y += 1;
  }

  activePiece.y -= 1;
  mergePiece();
  score += 2;
  sweepLines();
  spawnPiece();
  updateHud();
  drawBoard();
}

function spawnPiece() {
  activePiece = nextPiece;
  activePiece.x = Math.floor((COLS - activePiece.matrix[0].length) / 2);
  activePiece.y = 0;
  nextPiece = createPiece();
  drawNext();

  if (isColliding(activePiece)) {
    endGame();
  }
}

function updateHud() {
  scoreEl.textContent = score.toLocaleString("zh-TW");
  levelEl.textContent = level;
  linesEl.textContent = lines;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function getDropInterval() {
  return Math.max(120, 780 - (level - 1) * 62);
}

function update(time = 0) {
  if (!isRunning || isPaused) {
    return;
  }

  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > getDropInterval()) {
    dropPiece();
  }

  drawBoard();
  animationId = requestAnimationFrame(update);
}

function startGame() {
  if (isRunning && isPaused) {
    isPaused = false;
    lastTime = 0;
    setStatus("遊戲中");
    animationId = requestAnimationFrame(update);
    return;
  }

  if (isRunning) {
    return;
  }

  resetGame();
  isRunning = true;
  isPaused = false;
  setStatus("遊戲中");
  animationId = requestAnimationFrame(update);
}

function pauseGame() {
  if (!isRunning) {
    return;
  }

  isPaused = !isPaused;
  setStatus(isPaused ? "已暫停" : "遊戲中");

  if (!isPaused) {
    lastTime = 0;
    animationId = requestAnimationFrame(update);
  }
}

function resetGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  board = createBoard();
  activePiece = createPiece();
  nextPiece = createPiece();
  score = 0;
  lines = 0;
  level = 1;
  dropCounter = 0;
  lastTime = 0;
  isRunning = false;
  isPaused = false;
  updateHud();
  drawNext();
  drawBoard();
  setStatus("準備開始");
}

function endGame() {
  isRunning = false;
  isPaused = false;
  setStatus("遊戲結束");

  boardContext.fillStyle = "rgba(13, 18, 23, 0.74)";
  boardContext.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  boardContext.fillStyle = "#f4f7fb";
  boardContext.font = "700 26px system-ui";
  boardContext.textAlign = "center";
  boardContext.fillText("遊戲結束", boardCanvas.width / 2, boardCanvas.height / 2 - 8);
  boardContext.font = "600 15px system-ui";
  boardContext.fillText("按重新開始再挑戰一次", boardCanvas.width / 2, boardCanvas.height / 2 + 22);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    movePiece(-1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    movePiece(1);
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    dropPiece();
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    rotatePiece();
  }

  if (event.code === "Space") {
    event.preventDefault();
    hardDrop();
  }
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "left") {
      movePiece(-1);
    }
    if (action === "right") {
      movePiece(1);
    }
    if (action === "rotate") {
      rotatePiece();
    }
    if (action === "down") {
      dropPiece();
    }
    if (action === "drop") {
      hardDrop();
    }
  });
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

resetGame();
