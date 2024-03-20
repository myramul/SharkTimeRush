import {
  incrementCustomProperty,
  setCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

const sharkElem = document.querySelector("[data-shark]")
const JUMP_SPEED = 0.45
const GRAVITY = 0.0015
const SHARK_FRAME_COUNT = 4
const FRAME_TIME = 100

let isJumping
let sharkFrame
let currentFrameTime
let yVelocity
let isDucking
let isArrowDownPressed

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowDown") {
    isArrowDownPressed = true
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown") {
    isArrowDownPressed = false
  }
});
export function setupShark() {
  isJumping = false
  sharkFrame = 0
  currentFrameTime = 0
  yVelocity = 0
  isDucking = false
  isArrowDownPressed = false
  sharkElem.style.height = "30%";
  setCustomProperty(sharkElem, "--bottom", 0)
  document.removeEventListener("keydown", onMovement)
  document.addEventListener("keydown", onMovement)
}

export function updateShark(delta, speedScale) {
  handleRun(delta, speedScale)
  handleJump(delta)
}

export function getSharkRect() {
  return sharkElem.getBoundingClientRect()
}

export function setSharkLose() {
  if (isDucking && isArrowDownPressed) {
    sharkElem.src = "imgs/shark-duck-lose.png";
    sharkElem.style.height = "20%";
    return;
  }
  sharkElem.src = "imgs/shark-lose.png";
  sharkElem.style.height = "30%";
}

function handleRun(delta, speedScale) {
  if (isJumping) {
    sharkElem.src = `imgs/shark-stationary.png`;
    sharkElem.style.height = "30%";
    return;
  }

  if (isDucking && !isArrowDownPressed) {
    sharkElem.src = `imgs/shark-run-${sharkFrame}.png`;
    sharkElem.style.height = "30%";
    isDucking = false;
  }

  if (isDucking) {
    sharkElem.src = `imgs/shark-duck-1.png`;
    sharkElem.style.height = "20%";
    return;
  }

  if (currentFrameTime >= FRAME_TIME) {
    sharkFrame = (sharkFrame + 1) % SHARK_FRAME_COUNT;
    sharkElem.src = `imgs/shark-run-${sharkFrame}.png`;
    sharkElem.style.height = "30%";
    currentFrameTime -= FRAME_TIME;
  }
  currentFrameTime += delta * speedScale;
}

function handleJump(delta) {
  if (!isJumping) return

  incrementCustomProperty(sharkElem, "--bottom", yVelocity * delta)

  if (getCustomProperty(sharkElem, "--bottom") <= 0) {
    setCustomProperty(sharkElem, "--bottom", 0)
    isJumping = false
  }

  yVelocity -= GRAVITY * delta
}

function onMovement(e) {
  if (e.code === "ArrowDown" && e.type === "keydown") {
    isDucking = true;
  } else if (e.code === "ArrowDown" && e.type === "keyup") {
    isDucking = false;
  }

  if (e.code !== "Space" || isJumping) return;

  yVelocity = JUMP_SPEED;
  isJumping = true;
}