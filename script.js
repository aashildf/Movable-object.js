// get html-elements
const player = document.getElementById("player");
const questionDisplay = document.getElementById("question");
const scoreDisplay = document.getElementById("score");
// Move feedback in to HUD if element exists:
const feedback = document.getElementById("feedback");

// HUD (Heads Up Element)
const hud = document.createElement("div");
hud.id = "hud-panel";
document.body.appendChild(hud);

// put existing elements in HUD
hud.appendChild(questionDisplay);
hud.appendChild(scoreDisplay);

// feedback-container in HUD

const feedbackArea = document.createElement("div");
feedbackArea.id = "feedback-area";
feedbackArea.appendChild(feedback);
hud.appendChild(feedbackArea);

// Player-variables(startingpoint, px.steps)
let score = 0;
let x = 100;
let y = 100;
const step = 20;
let currentCollision = null;
let correctAnswer = null;
let answers = [];

// keep player on play-area
function clampPosition(x, y) {
  const hudHeight = hud.offsetHeight; // height HUD-panelet
  const maxX = window.innerWidth - player.offsetWidth;
  const maxY = window.innerHeight - player.offsetHeight;

  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(hudHeight, Math.min(y, maxY)),
  };
}

//  create math question
function newQuestion() {
  // remove answer-boxes
  answers.forEach((a) => a.remove());
  answers = [];

  //   make new question
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  correctAnswer = a + b;

  questionDisplay.textContent = `Hva er ${a} + ${b}?`;
  feedback.textContent = "";
  feedback.className = "";

  //   make answers, one correct, two wrong
  const options = [correctAnswer];
  while (options.length < 3) {
    const wrong = Math.floor(Math.random() * 20) + 1;
    if (!options.includes(wrong)) options.push(wrong);
  }
  options.sort(() => Math.random() - 0.5);

  //   make boxes, no overlap
  options.forEach((opt) => {
    let box, rect, overlap;
    do {
      box = document.createElement("div");
      box.className = "answer";
      box.textContent = opt;

      /* random placement */
      const minY = hud.offsetHeight + 10; // start under panel
      box.style.top =
        minY +
        Math.floor(Math.random() * (window.innerHeight - minY - 100)) +
        "px";
      box.style.left =
        Math.floor(Math.random() * (window.innerWidth - 120)) + "px";

      document.body.appendChild(box);
      rect = box.getBoundingClientRect();

      /* check overlap*/
      overlap = answers.some((a) => {
        const r = a.getBoundingClientRect();
        return !(
          rect.right < r.left ||
          rect.left > r.right ||
          rect.bottom < r.top ||
          rect.top > r.bottom
        );
      });

      if (overlap) box.remove();
    } while (overlap);

    answers.push(box);

    // click on box
    box.addEventListener("click", () => {
      const r = box.getBoundingClientRect();

      //   move player to box
      x = r.left;
      y = r.top;
      player.style.left = x + "px";
      player.style.top = y + "px";
      handleAnswer(box);
    });
  });
}

// MAKE CONFETTI
function spawnConfetti() {
    const container = document.getElementById("confetti-container");
    const colors = ["#ff5e5e", "#ffd700", "#00ff99", "#00d4ff", "#ff66ff"];

    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + "px";
        confetti.style.animationDuration = (0.8 + Math.random() * 0.7) + "s";
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(confetti);

        confetti.addEventListener("animationend", () => confetti.remove());
    }
}


// handle answers
function handleAnswer(box) {
  const value = parseInt(box.textContent);

  if (value === correctAnswer) {
    score++;
    scoreDisplay.textContent = "Poeng: " + score;
    player.classList.add("celebrate");

   spawnConfetti();

  
    feedback.textContent = "HURRA! Riktig! ";
    feedback.className = "correct";

    // wait before new question
    setTimeout(() => {
      player.classList.remove("celebrate");
      feedback.textContent = "";
      feedback.className = ""; 
      newQuestion();
    }, 1500);
  } else {
    // When wrong answer:
    player.classList.add("wrongAnswer");
    player.style.transform = "translateX(-10px)";

    setTimeout(() => {
      player.classList.remove("wrongAnswer");
      player.style.transform = "translateX(0)";
    }, 500);

    feedback.textContent = " POP! Det var feil. Prøv igjen!";
    feedback.className = "wrong";
  }
}

// check player/box collision
function checkCollision() {
  const playerRect = player.getBoundingClientRect();
  let collided = null;

  answers.forEach((answer) => {
    const rect = answer.getBoundingClientRect();
    if (
      !(
        playerRect.right < rect.left ||
        playerRect.left > rect.right ||
        playerRect.bottom < rect.top ||
        playerRect.top > rect.bottom
      )
    ) {
      collided = answer;
    }
  });

  if (collided && collided !== currentCollision) {
    currentCollision = collided;
    handleAnswer(collided);
  }

  if (!collided) currentCollision = null;
}

// mooving with arrowkeys
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") y -= step;
  if (event.key === "ArrowDown") y += step;
  if (event.key === "ArrowLeft") x -= step;
  if (event.key === "ArrowRight") x += step;

  //   keep player inside screen
  const pos = clampPosition(x, y);
  x = pos.x;
  y = pos.y;

  player.style.left = x + "px";
  player.style.top = y + "px";

  checkCollision();
});

// Click to move
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("answer")) return;

  const pos = clampPosition(
    event.clientX - player.offsetWidth / 2,
    event.clientY - player.offsetHeight / 2
  );
  x = pos.x;
  y = pos.y;

  player.style.left = x + "px";
  player.style.top = y + "px";

  checkCollision();
});

// Start the game
newQuestion();
