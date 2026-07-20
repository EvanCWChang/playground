const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const MINI_BLOCK = 22;
const STORAGE_KEY = "blockAdventureStats";

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
  I: "#00c8ff",
  J: "#276ef1",
  L: "#f5a000",
  O: "#f2ea00",
  S: "#08e017",
  T: "#a800f2",
  Z: "#f00000",
};

const boardCanvas = document.querySelector("#board");
const boardContext = boardCanvas.getContext("2d");
const holdCanvas = document.querySelector("#hold");
const holdContext = holdCanvas.getContext("2d");
const nextCanvases = [...document.querySelectorAll(".next-board")];
const nextContexts = nextCanvases.map((canvas) => canvas.getContext("2d"));
const scoreEl = document.querySelector("#score");
const bestScoreEl = document.querySelector("#bestScore");
const todayBestEl = document.querySelector("#todayBest");
const levelEl = document.querySelector("#level");
const linesEl = document.querySelector("#lines");
const weeklyRankEl = document.querySelector("#weeklyRank");
const rankHintEl = document.querySelector("#rankHint");
const rankListEl = document.querySelector("#rankList");
const statusEl = document.querySelector("#status");
const pauseBtn = document.querySelector("#pauseBtn");
const restartBtn = document.querySelector("#restartBtn");
const helpBtn = document.querySelector("#helpBtn");
const themeBtn = document.querySelector("#themeBtn");
const rankBtn = document.querySelector("#rankBtn");
const helpDialog = document.querySelector("#helpDialog");
const rankDialog = document.querySelector("#rankDialog");

let board = createBoard();
let activePiece = createPiece();
let queue = createQueue();
let holdPiece = null;
let canHold = true;
let score = 0;
let lines = 0;
let level = 1;
let dropCounter = 0;
let lastTime = 0;
let isRunning = false;
let isPaused = false;
let animationId = null;
let stats = loadStats();

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function createPiece(type = randomType()) {
  const matrix = cloneMatrix(SHAPES[type]);
  return {
    type,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0,
  };
}

function randomType() {
  const types = Object.keys(SHAPES);
  return types[Math.floor(Math.random() * types.length)];
}

function createQueue() {
  return Array.from({ length: 4 }, () => createPiece());
}

function popNextPiece() {
  const nextPiece = queue.shift();
  queue.push(createPiece());
  nextPiece.x = Math.floor((COLS - nextPiece.matrix[0].length) / 2);
  nextPiece.y = 0;
  return nextPiece;
}

function loadStats() {
  const today = new Date().toISOString().slice(0, 10);
  const fallback = { best: 0, today, todayBest: 0, scores: [] };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || fallback;
    if (saved.today !== today) {
      saved.today = today;
      saved.todayBest = 0;
    }
    return { ...fallback, ...saved };
  } catch {
    return fallback;
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function drawGrid(context, width, height, size) {
  context.fillStyle = getCssVar("--board");
  context.fillRect(0, 0, width, height);
  context.strokeStyle = getCssVar("--grid");
  context.lineWidth = 2;

  for (let x = 0; x <= width; x += size) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += size) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function drawCell(context, x, y, size, color, alpha = 1) {
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
  context.globalAlpha = 1;
}

function drawBoard() {
  drawGrid(boardContext, boardCanvas.width, boardCanvas.height, BLOCK);

  board.forEach((row, y) => {
    row.forEach((type, x) => {
      if (type) {
        drawCell(boardContext, x, y, BLOCK, COLORS[type]);
      }
    });
  });

  drawGhostPiece();
  drawPiece(boardContext, activePiece, BLOCK);
}

function drawGhostPiece() {
  const ghost = {
    ...activePiece,
    matrix: cloneMatrix(activePiece.matrix),
  };

  while (!isColliding(ghost)) {
    ghost.y += 1;
  }

  ghost.y -= 1;
  ghost.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawCell(boardContext, ghost.x + x, ghost.y + y, BLOCK, COLORS[ghost.type], 0.28);
      }
    });
  });
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

function drawMiniPiece(context, canvas, piece) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = getCssVar("--board");
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (!piece) {
    return;
  }

  const matrix = piece.matrix;
  const offsetX = Math.floor((canvas.width / MINI_BLOCK - matrix[0].length) / 2);
  const offsetY = Math.floor((canvas.height / MINI_BLOCK - matrix.length) / 2);

  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawCell(context, offsetX + x, offsetY + y, MINI_BLOCK, COLORS[piece.type]);
      }
    });
  });
}

function drawPreviews() {
  drawMiniPiece(holdContext, holdCanvas, holdPiece);
  nextContexts.forEach((context, index) => {
    drawMiniPiece(context, nextCanvases[index], queue[index]);
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
    lockPiece();
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
    score += 1;
  }

  activePiece.y -= 1;
  lockPiece();
  updateHud();
  drawBoard();
}

function holdCurrentPiece() {
  if (!isRunning || isPaused || !canHold) {
    return;
  }

  const currentType = activePiece.type;
  if (!holdPiece) {
    holdPiece = createPiece(currentType);
    activePiece = popNextPiece();
  } else {
    const heldType = holdPiece.type;
    holdPiece = createPiece(currentType);
    activePiece = createPiece(heldType);
  }

  canHold = false;
  drawPreviews();
  drawBoard();
}

function lockPiece() {
  mergePiece();
  sweepLines();
  spawnPiece();
}

function spawnPiece() {
  activePiece = popNextPiece();
  canHold = true;
  drawPreviews();

  if (isColliding(activePiece)) {
    endGame();
  }
}

function updateHud() {
  scoreEl.textContent = score.toLocaleString("zh-TW");
  levelEl.textContent = level;
  linesEl.textContent = lines;
  bestScoreEl.textContent = stats.best.toLocaleString("zh-TW");
  todayBestEl.textContent = stats.todayBest.toLocaleString("zh-TW");

  const rank = calculateRank(score);
  weeklyRankEl.textContent = `第 ${rank} 名`;
  rankHintEl.textContent = rank === 1 ? "目前排名第一！" : `距離第 1 名還差 ${Math.max(0, stats.best - score).toLocaleString("zh-TW")} 分`;
}

function calculateRank(currentScore) {
  const scores = [...stats.scores.map((item) => item.score), currentScore].sort((a, b) => b - a);
  return scores.indexOf(currentScore) + 1;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function getDropInterval() {
  return Math.max(110, 760 - (level - 1) * 58);
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
  resetGame();
  isRunning = true;
  isPaused = false;
  setStatus("遊戲中");
  animationId = requestAnimationFrame(update);
}

function togglePause() {
  if (!isRunning) {
    startGame();
    return;
  }

  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "▶" : "Ⅱ";
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
  queue = createQueue();
  activePiece = popNextPiece();
  holdPiece = null;
  canHold = true;
  score = 0;
  lines = 0;
  level = 1;
  dropCounter = 0;
  lastTime = 0;
  isRunning = false;
  isPaused = false;
  pauseBtn.textContent = "Ⅱ";
  updateHud();
  drawPreviews();
  drawBoard();
  setStatus("準備開始");
}

function endGame() {
  isRunning = false;
  isPaused = false;
  setStatus("遊戲結束");
  recordScore();

  boardContext.fillStyle = "rgba(247, 245, 249, 0.76)";
  boardContext.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  boardContext.fillStyle = getCssVar("--ink");
  boardContext.font = "800 28px system-ui";
  boardContext.textAlign = "center";
  boardContext.fillText("遊戲結束", boardCanvas.width / 2, boardCanvas.height / 2 - 12);
  boardContext.font = "700 16px system-ui";
  boardContext.fillText("按 ↻ 重新開始", boardCanvas.width / 2, boardCanvas.height / 2 + 22);
}

function recordScore() {
  stats.best = Math.max(stats.best, score);
  stats.todayBest = Math.max(stats.todayBest, score);
  stats.scores = [
    { score, date: new Date().toISOString() },
    ...stats.scores,
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  saveStats();
  updateHud();
  renderRanks();
}

function renderRanks() {
  const scores = stats.scores.length ? stats.scores : [{ score: 16050, date: "示範紀錄" }];
  rankListEl.innerHTML = scores
    .slice(0, 5)
    .map((item, index) => `<li>第 ${index + 1} 名：${item.score.toLocaleString("zh-TW")} 分</li>`)
    .join("");
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  themeBtn.textContent = document.documentElement.classList.contains("dark") ? "☾" : "☀";
  drawBoard();
  drawPreviews();
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

  if (event.key.toLowerCase() === "c" || event.key === "Shift") {
    event.preventDefault();
    holdCurrentPiece();
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
    if (action === "hold") {
      holdCurrentPiece();
    }
  });
});

pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", startGame);
helpBtn.addEventListener("click", () => helpDialog.showModal());
rankBtn.addEventListener("click", () => {
  renderRanks();
  rankDialog.showModal();
});
themeBtn.addEventListener("click", toggleTheme);

renderRanks();
resetGame();
