const slingshot = document.getElementById("slingshot");
const bandHandle = document.getElementById("band-handle");
const rock = document.getElementById("rock");
const target = document.getElementById("target");
const winScreen = document.getElementById("win-screen");
const winImage = document.getElementById("win-image");
const winMessage = document.getElementById("win-message");
const hearts = document.querySelectorAll("#hearts img"); // All heart images
const scoreDisplay = document.getElementById("score"); // Score display
const backgroundSound = document.getElementById("background-sound");

let isAiming = false;
let startX, startY; // Starting position of the band handle
let endX, endY; // Ending position of the band handle (where the mouse/touch is)
let score = 0; // Track the score
const maxScore = 5; // Maximum score to win
const resetTimer = 5000; // Maximum score to win

// Sound for hitting the target
const hitSound = new Audio("/assets/sounds/hit.mp3");

// Sound for winning the game
const winSound = new Audio("/assets/sounds/win.mp3");

// Set background sound volume (0.5 = 50% volume)
backgroundSound.volume = 0.2; // Adjust this value as needed (0 to 1)

// Play the background sound in a loop
backgroundSound.play();

// Function to move the target smoothly to a new position
function moveTarget() {
  const newPos = getRandomPosition();
  const duration = 4000; // Increased duration for slower movement (4 seconds)

  // Animate the target using CSS transitions
  target.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
  target.style.left = `${newPos.x}px`;
  target.style.top = `${newPos.y}px`;

  // Wait for the animation to finish, then move again
  setTimeout(moveTarget, duration);
}

// Start the animation
moveTarget();

// Function to generate a random position within the screen bounds
function getRandomPosition() {
  const x = Math.random() * (window.innerWidth - target.offsetWidth);
  const y = Math.random() * (window.innerHeight - target.offsetHeight);
  return { x, y };
}

// Function to calculate the angle between two points
function calculateAngle(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.atan2(dy, dx); // Angle in radians
}

// Function to update the health bar (hearts)
function updateHearts() {
  hearts.forEach((heart, index) => {
    if (index < score) {
      heart.classList.add("grey"); // Grey out the heart
    } else {
      heart.classList.remove("grey"); // Restore the heart
    }
  });
}

// Function to update the score display
function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

// Function to fire the rock
function fireRock() {
  const angle = calculateAngle(startX, startY, endX, endY);
  const speed = 10; // Speed of the rock

  // Show the rock
  rock.classList.remove("hidden"); // Ensure the rock is visible
  rock.style.left = `${startX}px`;
  rock.style.top = `${startY}px`;

  // Move the rock in the direction of the angle
  const rockInterval = setInterval(() => {
    const rockX = parseFloat(rock.style.left) + Math.cos(angle) * speed;
    const rockY = parseFloat(rock.style.top) + Math.sin(angle) * speed;

    rock.style.left = `${rockX}px`;
    rock.style.top = `${rockY}px`;

    // Check if the rock hits the target
    const rockRect = rock.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    if (
      rockX < targetRect.left + targetRect.width &&
      rockX + rock.offsetWidth > targetRect.left &&
      rockY < targetRect.top + targetRect.height &&
      rockY + rock.offsetHeight > targetRect.top
    ) {
      hitSound.play(); // Play hit sound
      score++; // Increase score
      updateHearts(); // Update the hearts
      updateScore(); // Update the score display

      if (score >= maxScore) {
        winSound.play(); // Play win sound
        winScreen.classList.remove("hidden"); // Show win screen
        target.classList.add("hidden"); // Hide the target
        setTimeout(resetGame, resetTimer); // Restart the game
      } else {
        // Change the target image
        target.src = "/assets/images/target-hit.png"; // Change to hit image
        setTimeout(() => {
          target.src = "/assets/images/target.png"; // Revert to the original image
        }, 500); // Change back after 0.5 seconds
      }
      rock.classList.add("hidden"); // Hide the rock after hitting
      clearInterval(rockInterval); // Stop the rock's movement
      moveTarget(); // Move the target to a new random position
    }

    // Stop the rock if it goes off-screen
    if (
      rockX < 0 ||
      rockX > window.innerWidth ||
      rockY < 0 ||
      rockY > window.innerHeight
    ) {
      rock.classList.add("hidden"); // Hide the rock
      clearInterval(rockInterval); // Stop the rock's movement
    }
  }, 20);
}

// Function to reset the game
function resetGame() {
  score = 0; // Reset score
  winScreen.classList.add("hidden"); // Hide win screen
  target.classList.remove("hidden"); // Show the target
  target.src = "/assets/images/target.png"; // Reset target image
  updateHearts(); // Reset hearts
  updateScore(); // Reset score display
  moveTarget(); // Restart target movement
}

// Event listeners for aiming and firing
bandHandle.addEventListener("mousedown", (e) => {
  isAiming = true;
  startX = e.clientX;
  startY = e.clientY;
});

window.addEventListener("mousemove", (e) => {
  if (isAiming) {
    endX = e.clientX;
    endY = e.clientY;
  }
});

window.addEventListener("mouseup", () => {
  if (isAiming) {
    isAiming = false;
    fireRock();
  }
});

// Touch support for mobile devices
bandHandle.addEventListener("touchstart", (e) => {
  isAiming = true;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

window.addEventListener("touchmove", (e) => {
  if (isAiming) {
    endX = e.touches[0].clientX;
    endY = e.touches[0].clientY;
  }
});

window.addEventListener("touchend", () => {
  if (isAiming) {
    isAiming = false;
    fireRock();
  }
});
