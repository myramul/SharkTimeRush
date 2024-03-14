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
export function setupShark() {
  isJumping = false
  sharkFrame = 0
  currentFrameTime = 0
  yVelocity = 0
  setCustomProperty(sharkElem, "--bottom", 0)
  document.removeEventListener("keydown", onJump)
  document.addEventListener("keydown", onJump)
}

export function updateShark(delta, speedScale) {
  handleRun(delta, speedScale)
  handleJump(delta)
}

export function getSharkRect() {
  return sharkElem.getBoundingClientRect()
}

export function setSharkLose() {
  sharkElem.src = "imgs/shark-lose.png"
}

function handleRun(delta, speedScale) {
  if (isJumping) {
    sharkElem.src = `imgs/shark-stationary.png`
    return
  }

  if (currentFrameTime >= FRAME_TIME) {
    sharkFrame = (sharkFrame + 1) % SHARK_FRAME_COUNT
    sharkElem.src = `imgs/shark-run-${sharkFrame}.png`
    currentFrameTime -= FRAME_TIME
  }
  currentFrameTime += delta * speedScale
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

function onJump(e) {
  if (e.code !== "Space" || isJumping) return

  yVelocity = JUMP_SPEED
  isJumping = true
}
