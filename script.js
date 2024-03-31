// script.js
  // contains the main game logic

import { updateGround, setupGround } from "./ground.js"
import { updateShark, setupShark, getSharkRect, setSharkLose } from "./shark.js"
import { updateObstacle, setupObstacle, getObstacleRects } from "./obstacle.js"

// intro screen
document.addEventListener("DOMContentLoaded", () => {
  const logoScreenElem = document.querySelector("[data-logo-screen]");
  const creditsScreenElem = document.querySelector("[data-credits-screen]");
  const worldElem = document.querySelector("[data-world]");
  const startScreenElem = document.querySelector("[data-start-screen]");

  logoScreenElem.classList.add("visible");
  setTimeout(() => {
    logoScreenElem.classList.remove("visible");
    setTimeout(() => {
      creditsScreenElem.classList.add("visible");
      setTimeout(() => {
        creditsScreenElem.classList.remove("visible");
        worldElem.classList.add("grow");
        setTimeout(() => {
          startScreenElem.classList.remove("hide");
        }, 2000);
      }, 2000);
    }, 1500);
  }, 1500); 
});

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001

const worldElem = document.querySelector("[data-world]")
const scoreElem = document.querySelector("[data-score]")
const startScreenElem = document.querySelector("[data-start-screen]")
const highScoreElem = document.querySelector("[data-high]")
const usernameEntryModal = document.getElementById("username-entry-modal");
const usernameForm = document.getElementById("username-form");
const modalCloseBtn = document.getElementsByClassName("close")[0];
const modalScore = document.getElementById("new-leaderboard-score");

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)
let isGameStarted = false

// adds space button to start
const spaceKeyHandler = (e) => {
  if (e.keyCode === 32 && !isGameStarted) {
    isGameStarted = true;
    handleStart();
  }
};
document.addEventListener("keydown", spaceKeyHandler);

let lastTime
let speedScale
let score
let leaderboard
let currHighScore = 0

// gets leaderboard from local storage and sets high score
leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || []
if (leaderboard.length > 0) {
  currHighScore = leaderboard[0].score
  highScoreElem.innerText = `HIGH: ${currHighScore}`;
} 

// updates game elements based on time passed since last update. 
function update(time) {
  if (lastTime == null) {
    lastTime = time
    window.requestAnimationFrame(update)
    return
  }
  const delta = time - lastTime

  updateGround(delta, speedScale)
  updateShark(delta, speedScale)
  updateObstacle(delta, speedScale)
  updateSpeedScale(delta)
  updateScore(delta)
  if (checkLose()) return handleLose()

  lastTime = time
  window.requestAnimationFrame(update)
}

function checkLose() {
  const sharkRect = getSharkRect()
  return getObstacleRects().some(rect => isCollision(rect, sharkRect))
}

// checks if shark and obstacle collide
function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  )
}

// increases speed scale - -game gets faster as it progresses
function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE
}

// updates score based on time passed
function updateScore(delta) {
  score += delta * 0.01
  scoreElem.textContent = Math.floor(score)
}

// takes a score and username and adds them to leaderboard
function updateLeaderboard(sc, user){
  leaderboard.push({score: sc, user: user.toUpperCase()})
  leaderboard.sort((a,b) => b.score - a.score)
  leaderboard = leaderboard.slice(0, 5) // only top 5 scores stored
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard))
}

// handles start of game, sets variables
function handleStart() {
  lastTime = null
  speedScale = 1
  score = 0
  leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || []
  setupGround()
  setupShark()
  setupObstacle()
  startScreenElem.classList.add("hide")
  window.requestAnimationFrame(update)

  if (leaderboard.length > 0) {
    currHighScore = leaderboard[0].score
    highScoreElem.innerText = `HIGH: ${currHighScore}`;
  } 
}

// handles loss of game
async function handleLose() {
  setSharkLose()
  isGameStarted = false

  // displays game over screen depending on score
  if (score > currHighScore){
    startScreenElem.innerText = "game over \n NEW HIGH SCORE: " + Math.floor(score) + "\npress space to play again"
  }else{
    startScreenElem.innerText = "game over \n SCORE: " + Math.floor(score) + "  HIGH: " + currHighScore + "\npress space to play again"
  }
  startScreenElem.classList.remove("hide")

  // if score is high enough to add to leaderboard, it adds it
  if (leaderboard.length < 5|| score >= leaderboard[leaderboard.length - 1].score) {
    modalScore.innerText = 'SCORE: ' + Math.floor(score);
    usernameEntryModal.style.display = "block";

    // disables space bar from restarting the game while user is typing
    document.removeEventListener('keydown', spaceKeyHandler);
    modalCloseBtn.onclick = function() { 
      usernameEntryModal.style.display = "none";
      document.addEventListener('keydown', spaceKeyHandler);
    }
    
    window.onclick = function(event) {
      if (event.target == modal) {
        usernameEntryModal.style.display = "none";
        document.addEventListener('keydown', spaceKeyHandler);
      }
    }
    // makes rest of function wait for user to finish typing username
     await new Promise((resolve, reject) => {
      usernameForm.addEventListener("submit", function(event) {
        event.preventDefault();
        var username = document.getElementById("username").value;
        if (username !== "") {
          updateLeaderboard(Math.floor(score), username);
        }
        usernameEntryModal.style.display = "none";
        document.getElementById("username").value = "";
        resolve();
      });
    });
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  // displays the leaderboard and the space button is used to restart the game
  document.addEventListener('keydown', spaceKeyHandler);
  window.alert("LEADERBOARD\n" + leaderboard.map((entry, i) => `${i + 1}. ${entry.user} - ${entry.score}`).join("\n"))
}

// sets the width and height of the world element
function setPixelToWorldScale() {
  let worldToPixelScale
  if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
    worldToPixelScale = window.innerWidth / WORLD_WIDTH
  } else {
    worldToPixelScale = window.innerHeight / WORLD_HEIGHT
  }

  worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
  worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}