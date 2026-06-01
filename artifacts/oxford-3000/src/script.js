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
let wrongAnswers = []; // เก็บข้อที่ผิด
let quizConfig = {
  // ตั้งค่า Quiz
  count: 10,
  mode: "latest",
};

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

// Dark Mode
const homeBtn = document.getElementById("homeBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");
const soundBtn = document.getElementById("soundBtn");

function initDarkMode() {
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) {
    document.body.classList.add("dark-mode");
    updateDarkModeIcon();
  }
}

function updateDarkModeIcon() {
  const isDark = document.body.classList.contains("dark-mode");
  sunIcon.style.display = isDark ? "block" : "none";
  moonIcon.style.display = isDark ? "none" : "block";
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
  updateDarkModeIcon();
}

// Pronunciation
function pronounceWord(word) {
  // หยุดเสียงที่กำลังเล่นอยู่
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);

  // ตั้งค่าเสียง British English
  utterance.lang = "en-US";
  utterance.rate = 0.9; // ความเร็ว (0.1 - 10)
  utterance.pitch = 0.9; // ระดับเสียง (0.1 - 2)
  utterance.volume = 1.0; // ระดับเสียง (0 - 1)

  // เลือก voice ที่ดีที่สุด
  const voices = window.speechSynthesis.getVoices();

  // หาเสียง British English ที่ดี
  let selectedVoice = voices.find(
    (voice) => voice.lang === "en-US" && voice.name.includes("Google"),
  );

  // ถ้าไม่มี Google voice ให้หา voice ที่ยาว (ปกติเสียงดี)
  if (!selectedVoice) {
    selectedVoice = voices.find(
      (voice) => voice.lang === "en-US" && voice.name.length > 10,
    );
  }

  // ถ้ายังไม่มี ให้ใช้ en-GB ตัวแรกที่เจอ
  if (!selectedVoice) {
    selectedVoice = voices.find((voice) => voice.lang === "en-US");
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

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

const quizSetupModal = document.getElementById("quizSetupModal");
const setupStartBtn = document.getElementById("setupStartBtn");
const setupCancelBtn = document.getElementById("setupCancelBtn");
const reviewToggleBtn = document.getElementById("reviewToggleBtn");
const reviewSection = document.getElementById("reviewSection");
const wrongAnswersListEl = document.getElementById("wrongAnswersList");
const unlockMessage = document.getElementById("unlockMessage");

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

function openQuizSetup() {
  const learnedCount = learnedWords.length;

  if (learnedCount < 50) {
    showToast(
      `🔒 สะสมคำศัพท์ให้ครบ 50 คำ เพื่อปลดล็อค Quiz ขั้นสูง(ปัจจุบัน: ${learnedCount}/50)`,
    );
    startQuizNormal();
  } else {
    quizSetupModal.classList.add("active");
  }
}

function startQuizNormal() {
  if (!learnedWords.length) {
    alert("Learn some words first!");
    return;
  }

  quizConfig.count = Math.min(10, learnedWords.length);
  quizConfig.mode = "latest";
  initQuiz();
}

function initQuiz() {
  let selectedWordIndices = [];

  if (quizConfig.mode === "latest") {
    // เอา 50 คำล่าสุด
    const startIdx = Math.max(0, learnedWords.length - 50);
    selectedWordIndices = learnedWords.slice(startIdx);
  } else {
    // Random จากทั้งหมด
    selectedWordIndices = [...learnedWords];
  }

  // Shuffle
  for (let i = selectedWordIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedWordIndices[i], selectedWordIndices[j]] = [
      selectedWordIndices[j],
      selectedWordIndices[i],
    ];
  }

  // เอาเฉพาะจำนวนที่เลือก
  selectedWordIndices = selectedWordIndices.slice(0, quizConfig.count);

  quizWords = selectedWordIndices.map((i) => words[i]).filter(Boolean);

  quizIndex = 0;
  correct = 0;
  incorrect = 0;
  wrongAnswers = [];

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

    // เก็บข้อที่ผิด
    wrongAnswers.push({
      word: quizWords[quizIndex].word,
      yourAnswer: selected,
      correctAnswer: correctAnswer,
    });

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

  // แสดงปุ่ม Review ถ้ามีข้อที่ผิด
  if (wrongAnswers.length > 0) {
    reviewToggleBtn.style.display = "block";
  } else {
    reviewToggleBtn.style.display = "none";
    reviewSection.style.display = "none";
  }
}

function displayWrongAnswers() {
  wrongAnswersListEl.innerHTML = "";

  wrongAnswers.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "wrong-answer-item";
    div.innerHTML = `
      <div class="question">ข้อที่ ${index + 1}: ${item.word}</div>
      <div class="your-answer">❌ คำตอบของคุณ: ${item.yourAnswer}</div>
      <div class="correct-answer">✅ คำตอบที่ถูกต้อง: ${item.correctAnswer}</div>
    `;
    wrongAnswersListEl.appendChild(div);
  });
}

function showToast(message, duration = 5000) {
  let toast = document.querySelector(".toast");

  if (toast) {
    toast.remove();
  }

  toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// =========================
// EVENTS
// =========================

homeBtn.addEventListener("click", () => {
  showPage("home");
  updateHome();
});

darkModeBtn.addEventListener("click", toggleDarkMode);

soundBtn.addEventListener("click", () => {
  const word = wordEl.textContent;
  if (word) pronounceWord(word);
});

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

// Quiz Setup
modeBtn.addEventListener("click", openQuizSetup);

setupStartBtn.addEventListener("click", () => {
  quizConfig.count = parseInt(
    document.querySelector('input[name="quizCount"]:checked').value,
  );
  quizConfig.mode = document.querySelector(
    'input[name="quizMode"]:checked',
  ).value;

  quizSetupModal.classList.remove("active");
  initQuiz();
});

setupCancelBtn.addEventListener("click", () => {
  quizSetupModal.classList.remove("active");
});

// Review Wrong Answers
reviewToggleBtn.addEventListener("click", () => {
  const isHidden = reviewSection.style.display === "none";
  reviewSection.style.display = isHidden ? "block" : "none";
  reviewToggleBtn.textContent = isHidden
    ? "📋 ซ่อนข้อที่ผิด"
    : "📋 ดูข้อที่ผิด";

  if (isHidden) {
    displayWrongAnswers();
  }
});

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
initDarkMode();

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
