// shark.js
  // contains the logic for the shark character

import {
  incrementCustomProperty,
  setCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

import {keySelection} from "./script.js"

const sharkElem = document.querySelector("[data-shark]")
const JUMP_SPEED = 0.45
const GRAVITY = 0.0015
const SHARK_FRAME_COUNT = 4 // number of frames in the animation of shark running
const FRAME_TIME = 100 // how many milliseconds each frame takes

let isJumping
let sharkFrame
let currentFrameTime
let yVelocity
let isDucking
let isArrowDownPressed


document.addEventListener("keydown", (e) => {
  if ((keySelection === 0 && e.code === "ArrowDown") || (keySelection === 1 && e.keyCode === 83)) {
    isArrowDownPressed = true
  }
});

document.addEventListener("keyup", (e) => {
  if ((keySelection === 0 && e.code === "ArrowDown") || (keySelection === 1 && e.keyCode === 83)){
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
  sharkElem.style.height = "25%";
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

// sets the shark lose sprite depending on if ducking or running
export function setSharkLose() {
  if (isDucking && isArrowDownPressed) {
    sharkElem.src = "imgs/Shark/shark-duck-lose.png";
    sharkElem.style.height = "17%";
    return;
  }
  sharkElem.src = "imgs/Shark/shark-lose.png";
  sharkElem.style.height = "25%";
}

// handles the movement of the shark -- changes imgs according to if ducking or running or jumping
function handleRun(delta, speedScale) {
  if (isJumping) {
    sharkElem.src = `imgs/Shark/shark-stationary.png`;
    sharkElem.style.height = "30%";
    return;
  }

  if (isDucking && !isArrowDownPressed) {
    sharkElem.src = `imgs/Shark/shark-run-${sharkFrame}.png`;
    sharkElem.style.height = "30%";
    isDucking = false;
  }

  if (isDucking) {
    sharkElem.src = `imgs/Shark/shark-duck-1.png`;
    sharkElem.style.height = "17%";
    return;
  }

  if (currentFrameTime >= FRAME_TIME) {
    sharkFrame = (sharkFrame + 1) % SHARK_FRAME_COUNT;
    sharkElem.src = `imgs/Shark/shark-run-${sharkFrame}.png`;
    sharkElem.style.height = "30%";
    currentFrameTime -= FRAME_TIME;
  }
  currentFrameTime += delta * speedScale;
}

// handles the jump of the shark
function handleJump(delta) {
  if (!isJumping) return

  incrementCustomProperty(sharkElem, "--bottom", yVelocity * delta)

  if (getCustomProperty(sharkElem, "--bottom") <= 0) {
    setCustomProperty(sharkElem, "--bottom", 0)
    isJumping = false
  }

  yVelocity -= GRAVITY * delta
}

// handles controls for the shark -- jumping and ducking -- space or arrow down
function onMovement(e) {
  if ((keySelection === 0 && e.code === "ArrowDown" && e.type === "keydown") || (keySelection === 1 && e.keyCode === 83 && e.type === "keydown")) {
    isDucking = true;
  } else if ((keySelection === 0 && e.code === "ArrowDown" && e.type === "keyup") || (keySelection === 1 && e.keyCode === 83 && e.type === "keyup")) {
    isDucking = false;
  }

  if ((keySelection === 0 && e.code === "Space" && !isJumping && !isDucking) || (keySelection === 1 && e.keyCode === 87 && !isJumping && !isDucking)){
    e.preventDefault();
    yVelocity = JUMP_SPEED;
    isJumping = true;
  }
}