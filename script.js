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
        }, 2300);
      }, 2300);
    }, 1500);
  }, 1500); 
});


const WORLD_WIDTH = 100
const WORLD_HEIGHT = 40
const SPEED_SCALE_INCREASE = 0.00001
const LEADERBOARD_MAX_ENTRIES = 10

const worldElem = document.querySelector("[data-world]")
const scoreElem = document.querySelector("[data-score]")
const startScreenElem = document.querySelector("[data-start-screen]")
const highScoreElem = document.querySelector("[data-high]")
const usernameEntryModal = document.getElementById("username-entry-modal");
const usernameForm = document.getElementById("username-form");
const modalCloseBtn = document.getElementsByClassName("close")[0];
const modalScore = document.getElementById("new-leaderboard-score");
const menuButton = document.getElementById("menu-btn");
const leaderboardModal = document.getElementById("leaderboard-modal");
const leaderboardCloseBtn = document.getElementsByClassName("close")[1];
const popupMenu = document.getElementById('popup-menu');
const helpModal = document.getElementById('help-modal');
const closeHelp = document.querySelector('.helpclose');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.querySelector('.settingsclose');
const spaceDownRadio = document.getElementById("SpaceDown");
const WSADRadio = document.getElementById("WSAD");
const hideCheckbox = document.getElementById("hidecheck");
const backgroundMusic = document.getElementById('backgroundMusic');
const soundBtn = document.getElementById('sound-btn');
const wardrobeModal = document.getElementById('wardrobe-modal');

export let isPaused = false;
export let keySelection = 0;
export let sharkSelectionIdx = 0;
let levelForMsg = 1;
let hideUI = false;
export let soundsMuted = false;
let scoreToDisplay = 0;

const bgImages = ['url(imgs/Backgrounds/bg1.gif)', 'url(imgs/Backgrounds/bg2.gif)', 'url(imgs/Backgrounds/bg3.gif)'];

function pauseGame() {
  cancelAnimationFrame(lastTime);
  backgroundMusic.pause();
}

document.addEventListener("keydown", (e) => {
  if (e.keyCode === 32) {
    e.preventDefault();
  }
})

function resumeGame() {
  if (!soundsMuted){
    backgroundMusic.play();
  }
  lastTime = null;
  window.requestAnimationFrame(update);
  if (!isGameStarted) {
    isGameStarted = true;
    handleStart();
  }
}

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)
export let isGameStarted = false

// adds space button to start
const spaceKeyHandler = (e) => {
  if (e.keyCode === 32 && !isGameStarted) {
    e.preventDefault();
    isGameStarted = true;
    handleStart();
  }
};

const WSADKeyHandler = (e) => {
  if (e.keyCode === 87 && !isGameStarted) {
    e.preventDefault();
    isGameStarted = true;
    handleStart();
  }
  if (e.keyCode === 32){
    e.preventDefault();
  }
}

// wait for intro screen to finish before game can start
setTimeout(function(){
  if (keySelection === 0) {
    document.addEventListener("keydown", spaceKeyHandler);
  } else if (keySelection === 1) {
    document.addEventListener("keydown", WSADKeyHandler);
  }},7150);

let lastTime
let speedScale
let score
let leaderboard
let currHighScore = 0
export let currImgIdx = 0

// gets leaderboard from local storage and sets high score
leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || []
if (leaderboard.length > 0) {
  currHighScore = leaderboard[0].score
  highScoreElem.innerText = `HIGH: ${currHighScore}`;
} 

if (keySelection === 0) {
  startScreenElem.innerHTML = `<span style="font-size: 6vmin;">SHARK TIME RUSH<span><br><br><span style="font-family: 'Jersey10', monospace; font-size: 5vmin; letter-spacing: 0.15rem; color: #484b8a; text-shadow: 0.5px 0.5px 1.3px #31346e;">Press SPACE to start</span><br><span style="font-family: 'Jersey10', monospace; font-size: 3.3vmin; letter-spacing: 0.15rem; color: #484b8a; text-shadow: 0.5px 0.5px 1.3px #31346e;">[SPACE]: JUMP &nbsp; [DOWN]: DUCK &nbsp; [X]: PAUSE(MENU)</span>`;
}else{
  startScreenElem.innerHTML = `<span style="font-size: 6vmin;">SHARK TIME RUSH<span><br><br><span style="font-family: 'Jersey10', monospace; font-size: 5vmin; letter-spacing: 0.15rem; color: #484b8a; text-shadow: 0.5px 0.5px 1.3px #31346e;">Press W to start</span><br><span style="font-family: 'Jersey10', monospace; font-size: 3.3vmin; letter-spacing: 0.15rem; color: #484b8a; text-shadow: 0.5px 0.5px 1.3px #31346e;">[W]: JUMP &nbsp; [S]: DUCK &nbsp; [X]: PAUSE(MENU)</span>`;
}
// updates game elements based on time passed since last update. 
function update(time) {
  if (!isPaused && isGameStarted) {
    if (lastTime == null) {
      lastTime = time;
    }
    const delta = time - lastTime;

    // Only update game elements if the game is not paused
    updateGround(delta, speedScale);
    updateShark(delta, speedScale);
    updateObstacle(delta, speedScale);
    updateSpeedScale(delta);
    updateScore(delta);
    if (checkLose()) {
      return handleLose();
    }

    lastTime = time;
  }
  window.requestAnimationFrame(update);
}

// Function to pause the game and toggle menu state
function toggleMenu() {
  if (!isPaused) {
    isPaused = true;
    pauseGame();
    menuButton.textContent = "Resume";
    popupMenu.style.display = "flex";
    startScreenElem.innerText = '';

    document.removeEventListener("keydown", spaceKeyHandler);
    document.removeEventListener("keydown", WSADKeyHandler);
  } else {
    isPaused = false;
    resumeGame();
    menuButton.textContent = "Menu";
    popupMenu.style.display = "none";
    
    if (keySelection === 0) {
      document.addEventListener("keydown", spaceKeyHandler);
    } else if (keySelection === 1) {
      document.addEventListener("keydown", WSADKeyHandler);
    }
  }
} 

const menuKeyHandler = (e) => {
  if (e.keyCode === 88) { // Check if 'X' key was pressed
    e.preventDefault();
    // Check if any modals are currently visible
    if (!leaderboardModal.style.display.includes('block') && 
        !usernameEntryModal.style.display.includes('block') && 
        !helpModal.style.display.includes('block') && 
        !settingsModal.style.display.includes('block')) {
      toggleMenu(); // Toggle menu only if no modals are displayed
    }
  }
}

// X key to pause/toggle menu and menu button does the same
menuButton.addEventListener("click", toggleMenu);
document.addEventListener("keydown", menuKeyHandler);


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

  updateBackgroundImage();
}

// takes a score and username and adds them to leaderboard
function updateLeaderboard(sc, user){
  leaderboard.push({score: sc, user: user.toUpperCase()})
  leaderboard.sort((a,b) => b.score - a.score)
  leaderboard = leaderboard.slice(0, LEADERBOARD_MAX_ENTRIES)
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard))
}

// handles start of game, sets variables
function handleStart() {
  lastTime = null
  speedScale = 1
  score = 0
  levelForMsg = 1
  leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || []
  setupGround()
  setupShark()
  setupObstacle()
  startScreenElem.classList.add("hide")
  leaderboardModal.style.display = "none";
  popupMenu.style.display = "none";
  usernameEntryModal.style.display = "none";
  helpModal.style.display = "none";
  settingsModal.style.display = "none";

  scoreElem.style.opacity = "1"
  highScoreElem.style.opacity = "1"
  window.requestAnimationFrame(update)

  if (leaderboard.length > 0) {
    currHighScore = leaderboard[0].score
    highScoreElem.innerText = `HIGH: ${currHighScore}`;
  } 

  updateBackgroundImage();
  if (!soundsMuted){
    backgroundMusic.play();
  }
}

// handles loss of game
async function handleLose() {
  isGameStarted = false
  setSharkLose()
  if (!soundsMuted){
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
  if (keySelection === 0) {
    document.removeEventListener("keydown", spaceKeyHandler);
  } else if (keySelection === 1) {
    document.removeEventListener("keydown", WSADKeyHandler);
  }
  document.removeEventListener("keydown", menuKeyHandler);
  scoreElem.style.opacity = "0"
  highScoreElem.style.opacity = "0"
  // displays game over screen depending on score
  if (score > currHighScore){
    if (keySelection === 0) {
      startScreenElem.innerHTML = `
        <span style="color: #f05a4f; text-shadow: 2px 2px 3px #c43d33;">game over</span>
        <br><br>
        <span style="color: #ffda41; text-shadow: 2px 2px 3.5px darkorange;">NEW HIGH SCORE: ${Math.floor(score)}</span>
        <br><br>
        <span style="color: #92cc41; text-shadow: 2px 2px 3px #738834;">press space to play again</span>
      `;
    }else{
      startScreenElem.innerHTML = `
        <span style="color: #f05a4f; text-shadow: 2px 2px 3px #c43d33;">game over</span>
        <br><br>
        <span style="color: #ffda41; text-shadow: 2px 2px 3.5px darkorange;">NEW HIGH SCORE: ${Math.floor(score)}</span>
        <br><br>
        <span style="color:  #92cc41; text-shadow: 2px 2px 3px #738834;">press W to play again</span>
      `;
    }
  }else{
    if (keySelection === 0) {
      startScreenElem.innerHTML = `
        <span style="color: #f05a4f; text-shadow: 2px 2px 3px #c43d33;">game over</span>
        <br><br>
        <span style="color: #ffda41; text-shadow: 2px 2px 3.5px darkorange;">YOUR SCORE: ${Math.floor(score)}</span>
        <br>
        <span style="color: #ffda41; text-shadow: 2px 2px 3.5px darkorange;">HIGH SCORE: ${currHighScore}</span>
        <br><br>
        <span style="color: #92cc41; text-shadow: 2px 2px 3px #738834;">press space to play again</span>
      `;
    }else{
      startScreenElem.innerHTML = `
        <span style="color: #f05a4f; text-shadow: 2px 2px 3px #c43d33;">game over</span>
        <br><br>
        <span style="color: #ffda41; text-shadow: 2px 2px 3.5px darkorange;">YOUR SCORE: ${Math.floor(score)}</span>
        <br>
        <span style="color: #ffda41; text-shadow: 2px 2px 3.5px darkorange;">HIGH SCORE: ${currHighScore}</span>
        <br><br>
        <span style="color:  #92cc41; text-shadow: 2px 2px 3px #738834;">press W to play again</span>
      `;
    }
  }
  startScreenElem.classList.remove("hide")

  // if score is high enough to add to leaderboard, it adds it
  if (leaderboard.length < LEADERBOARD_MAX_ENTRIES || score > leaderboard[leaderboard.length - 1].score) {
    modalScore.innerText = 'SCORE: ' + Math.floor(score);
    if (!isGameStarted){
      usernameEntryModal.style.display = "block";
    }

    modalCloseBtn.onclick = function() { 
      usernameEntryModal.style.display = "none";
      if (keySelection === 0) {
        document.addEventListener("keydown", spaceKeyHandler);
      } else if (keySelection === 1) {
        document.addEventListener("keydown", WSADKeyHandler);
      }
      document.addEventListener("keydown", menuKeyHandler);
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
  
  setTimeout(function() {
    leaderboardModal.style.display = "block";
    const leaderboardEntries = document.querySelectorAll("#leaderboard-modal .lead-entry");
    leaderboard.forEach((entry, i) => {
    leaderboardEntries[i].textContent = `${entry.user} - ${entry.score}`;
    });
    leaderboardCloseBtn.onclick = function() { 
      leaderboardModal.style.display = "none";
      if (keySelection === 0) {
        document.addEventListener("keydown", spaceKeyHandler);
      } else if (keySelection === 1) {
        document.addEventListener("keydown", WSADKeyHandler);
      }
      document.addEventListener("keydown", menuKeyHandler);
    }
  }, 150);
}

document.getElementById('leaderboard-btn').addEventListener('click', () => {
  leaderboardModal.style.display = "block";
    const leaderboardEntries = document.querySelectorAll("#leaderboard-modal .lead-entry");
    leaderboard.forEach((entry, i) => {
    leaderboardEntries[i].textContent = `${entry.user} - ${entry.score}`;
    });
    leaderboardCloseBtn.onclick = function() { 
      leaderboardModal.style.display = "none";
    }
});

document.getElementById('help-btn').addEventListener('click', () => {
  helpModal.style.display = "block";
  closeHelp.onclick = function() {
    helpModal.style.display = "none";
}
});

document.getElementById('wardrobe-btn').addEventListener('click', () => {
  document.getElementById('close-wardrobe').addEventListener('click', () => {
    wardrobeModal.style.display = "none";
  });
  wardrobeModal.style.display = "block";

  document.getElementById('normalShark').addEventListener('change', () => {
    sharkSelectionIdx = 0;
  });

  document.getElementById('fancyShark').addEventListener('change', () => {
    sharkSelectionIdx = 1;
  });

  document.getElementById('beanieShark').addEventListener('change', () => {
    sharkSelectionIdx = 2;
  });
});

settingsBtn.addEventListener('click', () => {
  settingsModal.style.display = "block";
  closeSettings.onclick = function() {
    settingsModal.style.display = "none";
  }
  
  spaceDownRadio.addEventListener("change", () => {
    keySelection = 0;
    document.removeEventListener("keydown", WSADKeyHandler);
    document.addEventListener("keydown", spaceKeyHandler);
  });
  
  WSADRadio.addEventListener("change", () => {
    keySelection = 1;
    document.removeEventListener("keydown", spaceKeyHandler);
    document.addEventListener("keydown", WSADKeyHandler);
  });
  
  hideCheckbox.addEventListener("change", () => {
    hideUI = hideCheckbox.checked;
    if (hideUI) {
      scoreElem.style.display = "none";
      highScoreElem.style.display = "none";
    } else {
      scoreElem.style.display = "block";
      highScoreElem.style.display = "block";
    }
  });

});

soundBtn.addEventListener("click", () => {
  if (soundsMuted){
    soundBtn.innerText = "Sound: On";
    soundsMuted = false;
  }else{
    soundBtn.innerText = "Sound: Off";
    soundsMuted = true;
  }
});

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

function updateBackgroundImage() {
  if (currImgIdx === undefined) {
    currImgIdx = Math.floor(score / 150); // Initialize currImgIdx based on score
    document.body.style.backgroundImage = bgImages[currImgIdx];
  }

  // Check if the score has increased by a multiple of 150
  if (Math.floor(score) % 150 === 0) {
    currImgIdx = Math.floor(score / 150) % bgImages.length; // Update currImgIdx
    document.body.style.backgroundImage = bgImages[currImgIdx];

    if (score > 149.999) {
      startScreenElem.innerText = `${Math.floor(score)}! NEW LEVEL!`;
      startScreenElem.classList.remove('hide');

      if (isGameStarted){
      // Hide the message after 1500ms
      setTimeout(() => {
        startScreenElem.classList.add('hide');
      }, 1100);
      }
    }
  }
}