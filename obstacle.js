// obstacle.js
  // contains the obstacle logic for the game -- ground and sky obstacles

import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

import { currImgIdx } from "./script.js"

const SPEED = 0.05
const OBSTACLE_INTERVAL_MIN = 550 // min time between obstacles
const OBSTACLE_INTERVAL_MAX = 2000 // max time between obstacles


const worldElem = document.querySelector("[data-world]")
const obstacleLvlFolders = ["imgs/Obstacles/Level1", "imgs/Obstacles/Level2", "imgs/Obstacles/Level3"]
let nextObstacleTime
export function setupObstacle() {
  nextObstacleTime = OBSTACLE_INTERVAL_MIN
  document.querySelectorAll("[data-obstacle]").forEach(obstacle => {
    obstacle.remove()
  })
}

export function updateObstacle(delta, speedScale) {
  document.querySelectorAll("[data-obstacle]").forEach(obstacle => {
    incrementCustomProperty(obstacle, "--left", delta * speedScale * SPEED * -1)
    if (getCustomProperty(obstacle, "--left") <= -100) {
      obstacle.remove()
    }
  })

  if (nextObstacleTime <= 0) {
    createObstacle()
    nextObstacleTime =
      randomNumberBetween(OBSTACLE_INTERVAL_MIN, OBSTACLE_INTERVAL_MAX) / speedScale
  }
  nextObstacleTime -= delta
}

// randomly displays obstacle
export function getObstacleRects() {
  return [...document.querySelectorAll("[data-obstacle]")].map(obstacle => {
    return obstacle.getBoundingClientRect()
  })
}

function createObstacle() {
  // create ground or sky obstacle -- ground more common
  const obstacleType = Math.random() < 0.75 ? "ground" : "air"; 

  const obstacle = document.createElement("img");
  obstacle.dataset.obstacle = true;

  // display ground or sky obstacle
  if (obstacleType === "ground") {
    obstacle.src = `${obstacleLvlFolders[currImgIdx]}/obstacle.png`;
    setCustomProperty(obstacle, "--top", 0);
    obstacle.style.height = "20%";
  } else {
    let isOpen = false;
    obstacle.style.top = "62%"; 
    obstacle.style.height = "14.5%";
    setInterval(() => {
      if (isOpen) {
        obstacle.src = `${obstacleLvlFolders[currImgIdx]}/obstacle-sky-0.png`;
      } else {
        obstacle.src = `${obstacleLvlFolders[currImgIdx]}/obstacle-sky-1.png`;
      }
      isOpen = !isOpen;
    }, 300); 
  }

  obstacle.classList.add("obstacle");
  setCustomProperty(obstacle, "--left", 100);
  worldElem.append(obstacle);
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
