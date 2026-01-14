const minutesDisplay = document.querySelector("#minutes");
const secondsDisplay = document.querySelector("#seconds");
const inputMinutes = document.querySelector("#input-minutes");
const inputSeconds = document.querySelector("#input-seconds");
const statusText = document.querySelector("#status-text");
const startButton = document.querySelector("#start");
const pauseButton = document.querySelector("#pause");
const resetButton = document.querySelector("#reset");

let totalSeconds = 0;
let timerId = null;

const formatTime = (value) => String(value).padStart(2, "0");

const updateDisplay = () => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  minutesDisplay.textContent = formatTime(minutes);
  secondsDisplay.textContent = formatTime(seconds);
};

const syncFromInputs = () => {
  const minutesValue = Math.min(Math.max(Number(inputMinutes.value) || 0, 0), 99);
  const secondsValue = Math.min(Math.max(Number(inputSeconds.value) || 0, 0), 59);
  inputMinutes.value = minutesValue;
  inputSeconds.value = secondsValue;
  totalSeconds = minutesValue * 60 + secondsValue;
  updateDisplay();
};

const setStatus = (message) => {
  statusText.textContent = message;
};

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

const tick = () => {
  if (totalSeconds <= 0) {
    stopTimer();
    setStatus("时间到！");
    return;
  }

  totalSeconds -= 1;
  updateDisplay();
};

const startTimer = () => {
  if (timerId) {
    return;
  }

  if (totalSeconds <= 0) {
    syncFromInputs();
  }

  if (totalSeconds <= 0) {
    setStatus("请先设置时间");
    return;
  }

  setStatus("计时中...");
  timerId = setInterval(tick, 1000);
};

const pauseTimer = () => {
  if (!timerId) {
    setStatus("已暂停");
    return;
  }
  stopTimer();
  setStatus("已暂停");
};

const resetTimer = () => {
  stopTimer();
  syncFromInputs();
  setStatus("已重置");
};

inputMinutes.addEventListener("change", syncFromInputs);
inputSeconds.addEventListener("change", syncFromInputs);
startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

syncFromInputs();
