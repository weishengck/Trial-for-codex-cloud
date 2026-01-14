const words = [
  "向日葵",
  "火山",
  "宇航员",
  "竹子",
  "外卖骑手",
  "咖啡拉花",
  "热气球",
  "龙卷风",
  "大熊猫",
  "魔法师",
  "汉堡",
  "地铁站",
  "彩虹",
  "冲浪",
  "雨伞",
  "机器人",
  "灯塔",
  "冰淇淋",
  "跳绳",
  "灯泡",
  "潜水",
  "寿司",
  "长颈鹿",
  "乐高积木"
];

const paletteColors = [
  "#111827",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#0ea5e9",
  "#f97316",
  "#e5e7eb",
  "#ffffff"
];

const state = {
  word: "",
  hidden: true,
  color: paletteColors[0],
  size: 8,
  erasing: false
};

const TIMER_DURATION = 60;
let timerRemaining = TIMER_DURATION;
let timerId = null;

const board = document.getElementById("board");
const ctx = board.getContext("2d");
const statusEl = document.getElementById("status");
const historyEl = document.getElementById("history");
const sizeControl = document.getElementById("sizeControl");
const sizeValue = document.getElementById("sizeValue");
const timerDisplay = document.getElementById("timerDisplay");
const timerToggleBtn = document.getElementById("timerToggle");
const timerResetBtn = document.getElementById("timerReset");

const palette = document.getElementById("palette");
const newWordBtn = document.getElementById("newWord");
const toggleWordBtn = document.getElementById("toggleWord");
const revealWordBtn = document.getElementById("revealWord");
const clearBtn = document.getElementById("clear");
const eraserBtn = document.getElementById("eraser");

let drawing = false;
let lastPoint = null;
let deviceRatio = 1;

function randomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function setWord(word = randomWord()) {
  state.word = word;
  renderWord();
  statusEl.textContent = "已抽取新词，请开始绘画。";
}

function renderWord() {
  const wordDisplay = document.getElementById("wordDisplay");
  wordDisplay.textContent = state.hidden ? "****" : state.word;
  toggleWordBtn.textContent = state.hidden ? "显示词语" : "遮住词语";
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timerRemaining);
  timerToggleBtn.textContent = timerId ? "暂停" : "开始";
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function tickTimer() {
  timerRemaining = Math.max(timerRemaining - 1, 0);
  renderTimer();
  if (timerRemaining === 0) {
    stopTimer();
    statusEl.textContent = "时间到，请揭晓答案！";
  }
}

function toggleTimer() {
  if (timerId) {
    stopTimer();
    renderTimer();
    return;
  }

  if (timerRemaining === 0) {
    timerRemaining = TIMER_DURATION;
  }
  timerId = setInterval(tickTimer, 1000);
  renderTimer();
}

function resetTimer() {
  stopTimer();
  timerRemaining = TIMER_DURATION;
  renderTimer();
}

function buildPalette() {
  paletteColors.forEach((color, idx) => {
    const swatch = document.createElement("button");
    swatch.className = "swatch";
    swatch.style.background = color;
    if (idx === 0) swatch.classList.add("active");
    swatch.addEventListener("click", () => {
      state.color = color;
      state.erasing = false;
      eraserBtn.classList.remove("primary");
      Array.from(palette.children).forEach((c) => c.classList.remove("active"));
      swatch.classList.add("active");
    });
    palette.appendChild(swatch);
  });
}

function resizeCanvas() {
  const { clientWidth, clientHeight } = board;
  deviceRatio = Math.max(window.devicePixelRatio || 1, 1);
  board.width = clientWidth * deviceRatio;
  board.height = clientHeight * deviceRatio;
  ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.imageSmoothingEnabled = true;
  clearCanvas();
}

function clearCanvas() {
  const width = board.width / deviceRatio;
  const height = board.height / deviceRatio;
  ctx.save();
  ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function getPoint(evt) {
  const rect = board.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function startDraw(evt) {
  drawing = true;
  lastPoint = getPoint(evt);
  drawLine(lastPoint, lastPoint);
}

function endDraw() {
  drawing = false;
  lastPoint = null;
}

function draw(evt) {
  if (!drawing) return;
  const point = getPoint(evt);
  drawLine(lastPoint, point);
  lastPoint = point;
}

function drawLine(from, to) {
  ctx.save();
  ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
  ctx.strokeStyle = state.erasing ? "#ffffff" : state.color;
  ctx.lineWidth = state.size;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function submitGuess() {
  const guessInput = document.getElementById("guessInput");
  const playerInput = document.getElementById("playerName");
  const guess = guessInput.value.trim();
  if (!guess) return;

  const player = playerInput.value.trim() || "队友";
  const correct = guess.toLowerCase() === state.word.toLowerCase();
  const item = document.createElement("li");

  const left = document.createElement("div");
  const guessSpan = document.createElement("span");
  guessSpan.className = "guess";
  guessSpan.textContent = guess;

  const meta = document.createElement("div");
  meta.className = "meta";
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  meta.textContent = `${player} · ${time}`;

  left.appendChild(guessSpan);
  left.appendChild(meta);

  const tag = document.createElement("span");
  tag.className = `tag ${correct ? "ok" : "no"}`;
  tag.textContent = correct ? "答对了" : "未命中";

  item.appendChild(left);
  item.appendChild(tag);
  historyEl.prepend(item);

  statusEl.textContent = correct ? "恭喜，猜对了！" : "再试试别的线索吧。";
  guessInput.value = "";
  guessInput.focus();
}

function bindEvents() {
  board.addEventListener("pointerdown", startDraw);
  board.addEventListener("pointermove", draw);
  board.addEventListener("pointerup", endDraw);
  board.addEventListener("pointerleave", endDraw);

  sizeControl.addEventListener("input", (e) => {
    state.size = Number(e.target.value);
    sizeValue.textContent = `${state.size}px`;
  });

  eraserBtn.addEventListener("click", () => {
    state.erasing = !state.erasing;
    eraserBtn.classList.toggle("primary", state.erasing);
  });

  clearBtn.addEventListener("click", clearCanvas);

  newWordBtn.addEventListener("click", () => {
    state.hidden = false;
    setWord();
    resetTimer();
  });

  toggleWordBtn.addEventListener("click", () => {
    state.hidden = !state.hidden;
    renderWord();
  });

  revealWordBtn.addEventListener("click", () => {
    state.hidden = false;
    renderWord();
  });

  timerToggleBtn.addEventListener("click", toggleTimer);
  timerResetBtn.addEventListener("click", resetTimer);

  document.getElementById("submitGuess").addEventListener("click", submitGuess);
  document.getElementById("guessInput").addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") submitGuess();
  });

  document.getElementById("clearHistory").addEventListener("click", () => {
    historyEl.innerHTML = "";
  });

  window.addEventListener("resize", resizeCanvas);
}

function init() {
  buildPalette();
  bindEvents();
  resizeCanvas();
  setWord();
  renderWord();
  resetTimer();
}

document.addEventListener("DOMContentLoaded", init);
