// =========================
// STATE
// =========================

let words = [];
let currentIndex = 0;
let learnedWords = [];

let quizWords = [];
let quizIndex = 0;
let correct = 0;
let incorrect = 0;
let quizAnswered = false;

// =========================
// LOAD LOCAL STORAGE (SAFE)
// =========================

function loadState() {
  const savedIndex = Number(localStorage.getItem("currentIndex"));
  currentIndex = isNaN(savedIndex) ? 0 : savedIndex;

  try {
    const lw = JSON.parse(localStorage.getItem("learnedWords"));
    learnedWords = Array.isArray(lw) ? lw : [];
  } catch {
    learnedWords = [];
  }
}

function saveProgress() {
  localStorage.setItem("currentIndex", currentIndex);
  localStorage.setItem("learnedWords", JSON.stringify(learnedWords));
}

// =========================
// ELEMENTS
// =========================

const pages = {
  home: document.getElementById("homePage"),
  learning: document.getElementById("learningPage"),
  quiz: document.getElementById("quizPage"),
  result: document.getElementById("resultPage"),
};

const learnedCountEl = document.getElementById("learnedCount");
const remainingCountEl = document.getElementById("remainingCount");
const homeProgressEl = document.getElementById("homeProgress");
const homePercentEl = document.getElementById("homePercent");

const wordEl = document.getElementById("word");
const wordTypeEl = document.getElementById("wordType");
const meaningEl = document.getElementById("meaning");
const meaningBtnEl = document.getElementById("meaningBtn");
const meaningBoxEl = document.getElementById("meaningBox");
const wordProgressEl = document.getElementById("wordProgress");
const learnProgressEl = document.getElementById("learnProgress");

const quizWordEl = document.getElementById("quizWord");
const quizChoicesEl = document.getElementById("quizChoices");
const quizResultEl = document.getElementById("quizResult");
const quizProgressEl = document.getElementById("quizProgress");
const quizProgressBarEl = document.getElementById("quizProgressBar");

const correctCountEl = document.getElementById("correctCount");
const incorrectCountEl = document.getElementById("incorrectCount");
const scorePercentEl = document.getElementById("scorePercent");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const modeBtn = document.getElementById("modeBtn");
const quizBackBtn = document.getElementById("quizBackBtn");
const restartBtn = document.getElementById("restartBtn");
const newWordBtn = document.getElementById("newWordBtn");

// =========================
// HELPERS
// =========================

function showPage(name) {
  Object.values(pages).forEach((p) => p.classList.remove("active"));
  pages[name].classList.add("active");
}

function markLearned(index) {
  if (!learnedWords.includes(index)) {
    learnedWords.push(index);
  }
}

// =========================
// HOME
// =========================

function updateHome() {
  if (!words.length) return;

  const learned = learnedWords.length;
  const remaining = Math.max(words.length - learned, 0);
  const pct = Math.round((learned / words.length) * 100);

  learnedCountEl.textContent = learned;
  remainingCountEl.textContent = remaining;
  homeProgressEl.style.width = pct + "%";
  homePercentEl.textContent = pct + "% Complete";
}

// =========================
// LEARNING
// =========================

function showWord() {
  if (!words.length) return;

  if (currentIndex >= words.length) {
    currentIndex = 0;
  }

  const w = words[currentIndex];

  wordEl.textContent = w.word;
  wordTypeEl.textContent = w.type || "";
  meaningEl.textContent = w.meaning || "";

  wordProgressEl.textContent = `Word ${currentIndex + 1} / ${words.length}`;

  learnProgressEl.style.width = ((currentIndex + 1) / words.length) * 100 + "%";

  meaningBoxEl.classList.add("hidden");
  meaningBtnEl.textContent = "Show Meaning";

  backBtn.disabled = currentIndex === 0;
}

// =========================
// QUIZ
// =========================

function startQuiz() {
  if (!learnedWords.length) {
    alert("Learn some words first!");
    return;
  }

  quizWords = learnedWords.map((i) => words[i]).filter(Boolean);

  // shuffle
  for (let i = quizWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quizWords[i], quizWords[j]] = [quizWords[j], quizWords[i]];
  }

  quizIndex = 0;
  correct = 0;
  incorrect = 0;

  showPage("quiz");
  showQuiz();
}

function showQuiz() {
  quizAnswered = false;

  const q = quizWords[quizIndex];
  if (!q) return;

  quizWordEl.textContent = q.word;

  quizProgressEl.textContent = `Question ${quizIndex + 1} / ${quizWords.length}`;

  quizProgressBarEl.style.width =
    ((quizIndex + 1) / quizWords.length) * 100 + "%";

  const choices = [q.meaning];

  const pool = words.filter((w) => w.meaning && w.meaning !== q.meaning);

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  pool.slice(0, 3).forEach((w) => choices.push(w.meaning));

  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  quizChoicesEl.innerHTML = "";

  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;

    btn.addEventListener("click", () => checkAnswer(choice, q.meaning));

    quizChoicesEl.appendChild(btn);
  });
}

function checkAnswer(selected, correctAnswer) {
  if (quizAnswered) return;
  quizAnswered = true;

  const buttons = quizChoicesEl.querySelectorAll(".choice-btn");

  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) {
      btn.classList.add("correct");
    }
  });

  if (selected === correctAnswer) {
    correct++;
    quizResultEl.textContent = "Correct";
    quizResultEl.className = "quiz-result correct";
  } else {
    incorrect++;

    buttons.forEach((btn) => {
      if (btn.textContent === selected) {
        btn.classList.add("incorrect");
      }
    });

    quizResultEl.textContent = `Incorrect — answer: ${correctAnswer}`;
    quizResultEl.className = "quiz-result incorrect";
  }

  setTimeout(() => {
    quizIndex++;
    if (quizIndex >= quizWords.length) {
      showResult();
    } else {
      showQuiz();
    }
  }, 1200);
}

// =========================
// RESULT
// =========================

function showResult() {
  showPage("result");

  const total = correct + incorrect;
  const score = total ? Math.round((correct / total) * 100) : 0;

  correctCountEl.textContent = correct;
  incorrectCountEl.textContent = incorrect;
  scorePercentEl.textContent = score + "%";
}

// =========================
// EVENTS
// =========================

startBtn.addEventListener("click", () => {
  showPage("learning");
  showWord();
});

nextBtn.addEventListener("click", () => {
  markLearned(currentIndex);

  if (currentIndex < words.length - 1) {
    currentIndex++;
  }

  saveProgress();
  updateHome();
  showWord();
});

backBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    saveProgress();
    showWord();
  }
});

meaningBtnEl.addEventListener("click", () => {
  const hidden = meaningBoxEl.classList.toggle("hidden");
  meaningBtnEl.textContent = hidden ? "Show Meaning" : "Hide Meaning";
});

modeBtn.addEventListener("click", startQuiz);

quizBackBtn.addEventListener("click", () => {
  showPage("learning");
  showWord();
});

restartBtn.addEventListener("click", () => {
  quizIndex = 0;
  correct = 0;
  incorrect = 0;
  showPage("quiz");
  showQuiz();
});

newWordBtn.addEventListener("click", () => {
  showPage("learning");
  showWord();
});

// =========================
// INIT
// =========================

loadState();

fetch("/words.json")
  .then((r) => r.json())
  .then((data) => {
    words = data;

    if (currentIndex >= words.length) {
      currentIndex = 0;
    }

    updateHome();
    showWord();
  })
  .catch((err) => {
    console.error("Failed to load words.json", err);
  });
