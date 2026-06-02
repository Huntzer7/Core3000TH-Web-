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
let favorites = []; // เก็บ index ของคำศัพท์โปรด
let favoriteQuizMode = "answerMeaning"; // "answerMeaning" หรือ "meaningAnswer"
let isInFavoriteQuiz = false; // เพื่อรู้ว่าอยู่ใน Favorite Quiz
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
  loadFavorites();
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
  favorite: document.getElementById("favoritePage"), // เพิ่มบรรทัดนี้
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

// Hamburger & Sidebar
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const favoriteMenuBtn = document.getElementById("favoriteMenuBtn");
const restartMenuBtn = document.getElementById("restartMenuBtn");

// Favorite
const favoritePage = document.getElementById("favoritePage");
const favoriteList = document.getElementById("favoriteList");
const emptyFavorites = document.getElementById("emptyFavorites");
const favQuizBtn = document.getElementById("favQuizBtn");
const searchToggleBtn = document.getElementById("searchToggleBtn");
const favoriteSearch = document.getElementById("favoriteSearch");
const favQuizModeModal = document.getElementById("favQuizModeModal");
const modeAnswerMeaning = document.getElementById("modeAnswerMeaning");
const modeMeaningAnswer = document.getElementById("modeMeaningAnswer");
const favQuizStartBtn = document.getElementById("favQuizStartBtn");
const favQuizCancelBtn = document.getElementById("favQuizCancelBtn");
const quizLabel = document.getElementById("quizLabel");
const favoriteCount = document.getElementById("favoriteCount");

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

  updateFavoritesUI();

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

  isInFavoriteQuiz = false;
}

function displayWrongAnswers() {
  wrongAnswersListEl.innerHTML = "";

  wrongAnswers.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "wrong-answer-item";

    if (item.mode === "answerMeaning") {
      div.innerHTML = `
        <div class="question">ข้อที่ ${index + 1}: ${item.word}</div>
        <div class="your-answer">❌ คำตอบของคุณ: ${item.yourAnswer}</div>
        <div class="correct-answer">✅ คำตอบที่ถูกต้อง: ${item.correctAnswer}</div>
      `;
    } else {
      div.innerHTML = `
        <div class="question">ข้อที่ ${index + 1}: ${item.meaning}</div>
        <div class="your-answer">❌ คำตอบของคุณ: ${item.yourAnswer}</div>
        <div class="correct-answer">✅ คำตอบที่ถูกต้อง: ${item.correctAnswer}</div>
      `;
    }

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
// FAVORITES
// =========================

function loadFavorites() {
  try {
    const saved = localStorage.getItem("favorites");
    favorites = saved ? JSON.parse(saved) : [];
  } catch {
    favorites = [];
  }
}

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function toggleFavorite(index) {
  if (favorites.includes(index)) {
    favorites = favorites.filter((i) => i !== index);
  } else {
    favorites.push(index);
  }
  saveFavorites();
  updateFavoritesUI();
}

function isFavorite(index) {
  return favorites.includes(index);
}

function updateFavoritesUI() {
  // อัปเดตไอคอนหัวใจในการ์ดเรียน
  const favBtn = document.getElementById("favBtn");
  if (favBtn) {
    const currentWordIndex = currentIndex;
    if (isFavorite(currentWordIndex)) {
      favBtn.classList.add("active");
    } else {
      favBtn.classList.remove("active");
    }
  }
}

function displayFavorites() {
  if (!favorites.length) {
    favoriteList.innerHTML = "";
    emptyFavorites.style.display = "block";
    favoriteCount.textContent = "0 words";
    return;
  }

  emptyFavorites.style.display = "none";
  favoriteCount.textContent = `${favorites.length} words`;

  favoriteList.innerHTML = "";

  favorites.forEach((index) => {
    const word = words[index];
    if (!word) return;

    const div = document.createElement("div");
    div.className = "favorite-item";
    div.innerHTML = `
      <div class="favorite-item-word">
        <div class="favorite-word">${word.word}</div>
        <div class="favorite-type">${word.type || ""}</div>
        <div class="favorite-meaning">${word.meaning}</div>
      </div>
      <button class="btn btn-ghost favorite-delete-btn" data-index="${index}" title="Remove">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    `;
    favoriteList.appendChild(div);
  });

  // เพิ่ม Event Listener สำหรับปุ่มลบ
  document.querySelectorAll(".favorite-delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      toggleFavorite(index);
      displayFavorites();
      showToast("💔 ลบออกจากคลังโปรด");
    });
  });
}

emptyFavorites.style.display = "none";
favoriteCount.textContent = `${favorites.length} words`;

favoriteList.innerHTML = "";

favorites.forEach((index) => {
  const word = words[index];
  if (!word) return;

  const div = document.createElement("div");
  div.className = "favorite-item";
  div.innerHTML = `
      <div class="favorite-item-word">
        <div class="favorite-word">${word.word}</div>
        <div class="favorite-type">${word.type || ""}</div>
        <div class="favorite-meaning">${word.meaning}</div>
      </div>
      <button class="btn btn-ghost" onclick="toggleFavorite(${index})" title="Remove">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    `;
  favoriteList.appendChild(div);
});

function filterFavorites(query) {
  const items = favoriteList.querySelectorAll(".favorite-item");
  const searchLower = query.toLowerCase();

  items.forEach((item) => {
    const word = item.querySelector(".favorite-word").textContent.toLowerCase();
    const meaning = item
      .querySelector(".favorite-meaning")
      .textContent.toLowerCase();

    if (word.includes(searchLower) || meaning.includes(searchLower)) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });
}

function openFavQuizSetup() {
  if (favorites.length < 1) {
    showToast("เพิ่มคำศัพท์โปรดก่อน");
    return;
  }
  favQuizModeModal.classList.add("active");
}

function startFavoriteQuiz() {
  isInFavoriteQuiz = true;

  // เอาคำจาก favorites
  let selectedWordIndices = [...favorites];

  // Shuffle
  for (let i = selectedWordIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedWordIndices[i], selectedWordIndices[j]] = [
      selectedWordIndices[j],
      selectedWordIndices[i],
    ];
  }

  quizWords = selectedWordIndices.map((i) => words[i]).filter(Boolean);

  quizIndex = 0;
  correct = 0;
  incorrect = 0;
  wrongAnswers = [];

  showPage("quiz");
  showFavQuiz();
}

function showFavQuiz() {
  quizAnswered = false;

  const q = quizWords[quizIndex];
  if (!q) return;

  quizProgressEl.textContent = `Question ${quizIndex + 1} / ${quizWords.length}`;
  quizProgressBarEl.style.width =
    ((quizIndex + 1) / quizWords.length) * 100 + "%";

  let question = "";
  let correctAnswer = "";
  let choices = [];

  if (favoriteQuizMode === "answerMeaning") {
    // แสดงคำอังกฤษ เลือกความหมายไทย
    quizLabel.textContent = "เลือกความหมายที่ถูกต้อง";
    quizWord.textContent = q.word;
    correctAnswer = q.meaning;

    choices = [q.meaning];
    const pool = words.filter((w) => w.meaning && w.meaning !== q.meaning);

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    pool.slice(0, 3).forEach((w) => choices.push(w.meaning));
  } else {
    // แสดงความหมายไทย เลือกคำอังกฤษ
    quizLabel.textContent = "เลือกคำศัพท์ที่ถูกต้อง";
    quizWord.textContent = q.meaning;
    correctAnswer = q.word;

    choices = [q.word];
    const pool = favorites
      .map((i) => words[i])
      .filter((w) => w && w.word !== q.word);

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    pool.slice(0, 3).forEach((w) => choices.push(w.word));
  }

  // Shuffle choices
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  quizChoicesEl.innerHTML = "";

  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.addEventListener("click", () => checkFavAnswer(choice, correctAnswer));
    quizChoicesEl.appendChild(btn);
  });
}

function checkFavAnswer(selected, correctAnswer) {
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
      meaning: quizWords[quizIndex].meaning,
      yourAnswer: selected,
      correctAnswer: correctAnswer,
      mode: favoriteQuizMode,
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
      showFavQuiz();
    }
  }, 1200);
}

// =========================
// EVENTS
// =========================

homeBtn.addEventListener("click", () => {
  showPage("home");
  updateHome();
});

const favBtn = document.getElementById("favBtn");

favBtn.addEventListener("click", () => {
  toggleFavorite(currentIndex);
  showToast(
    isFavorite(currentIndex) ? "❤️ เพิ่มลงคลังโปรด" : "💔 ลบออกจากคลังโปรด",
  );
});

// Hamburger Menu
hamburgerBtn.addEventListener("click", () => {
  sidebar.classList.add("active");
  sidebarOverlay.classList.add("active");
});

closeSidebarBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
});

// Favorite Menu
favoriteMenuBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
  showPage("favorite");
  displayFavorites();
});

// Restart Menu
restartMenuBtn.addEventListener("click", () => {
  const confirmed = confirm(
    "⚠️ คุณต้องการเริ่มต้นการเรียนใหม่จริงใช่ไหม?\n\nข้อมูลทั้งหมดจะถูกลบ",
  );
  if (confirmed) {
    localStorage.clear();
    location.reload();
  }
});

// Favorite Quiz
favQuizBtn.addEventListener("click", () => {
  if (favorites.length < 1) {
    alert("เพิ่มคำศัพท์โปรดก่อนสำหรับทำควิซ");
    return;
  }
  openFavQuizSetup();
});

// Favorite Quiz Mode Selection
modeAnswerMeaning.addEventListener("click", () => {
  favoriteQuizMode = "answerMeaning";
  document
    .querySelectorAll(".mode-card")
    .forEach((btn) => btn.classList.remove("selected"));
  modeAnswerMeaning.classList.add("selected");
});

modeMeaningAnswer.addEventListener("click", () => {
  favoriteQuizMode = "meaningAnswer";
  document
    .querySelectorAll(".mode-card")
    .forEach((btn) => btn.classList.remove("selected"));
  modeMeaningAnswer.classList.add("selected");
});

favQuizStartBtn.addEventListener("click", () => {
  favQuizModeModal.classList.remove("active");
  startFavoriteQuiz();
});

favQuizCancelBtn.addEventListener("click", () => {
  favQuizModeModal.classList.remove("active");
});

// Update Favorite Quiz Button
favQuizBtn.addEventListener("click", openFavQuizSetup);

// Search in Favorite
searchToggleBtn.addEventListener("click", () => {
  const isHidden = favoriteSearch.style.display === "none";
  favoriteSearch.style.display = isHidden ? "block" : "none";
  if (isHidden) {
    favoriteSearch.focus();
  } else {
    favoriteSearch.value = "";
    filterFavorites("");
    displayFavorites();
  }
});

favoriteSearch.addEventListener("input", (e) => {
  filterFavorites(e.target.value);
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
loadFavorites();
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

// =========================
// DONATE FEATURE (ระบบสนับสนุน)
// =========================
const donateMenuBtn = document.getElementById("donateMenuBtn");
const donateModal = document.getElementById("donateModal");
const closeDonateTopBtn = document.getElementById("closeDonateTopBtn");
const copyAccBtn = document.getElementById("copyAccBtn");
const accountNumber = document.getElementById("accountNumber");

// 1. เปิด Pop-up เมื่อกดจาก Sidebar
donateMenuBtn.addEventListener("click", () => {
  // สั่งปิดเมนู Sidebar (ถ้าเปิดค้างไว้)
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  if (sidebar && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
  }

  // เปิดโชว์ Modal
  donateModal.style.display = "flex";
});

// 2. ปิด Pop-up เมื่อกดปุ่มกากบาท X
closeDonateTopBtn.addEventListener("click", () => {
  donateModal.style.display = "none";
});

// 3. ปิด Pop-up เมื่อคลิกพื้นที่ว่างรอบๆ กล่อง
donateModal.addEventListener("click", (e) => {
  if (e.target === donateModal) {
    donateModal.style.display = "none";
  }
});

// 4. ฟังก์ชันกด Copy เลขบัญชี
copyAccBtn.addEventListener("click", () => {
  // ดึงเลขบัญชีตัดขีดออกหรือคงไว้ตามข้อความใน HTML
  const accText = accountNumber.innerText.replace(/-/g, ""); // เอาเครื่องหมายขีดออกเพื่อให้โอนง่าย หรือถ้าจะเอาขีดไว้ให้ลบ .replace(/-/g, "") ออกครับ

  // คัดลอกลง Clipboard
  navigator.clipboard
    .writeText(accText)
    .then(() => {
      // เปลี่ยนสถานะปุ่มชั่วคราวเพื่อบอกผู้ใช้ว่าก๊อบปี้แล้ว
      const originalText = copyAccBtn.innerText;
      copyAccBtn.innerText = "Copied!";
      copyAccBtn.classList.add("copied");

      // เปลี่ยนกลับเป็นแบบเดิมหลังจากผ่านไป 2 วินาที
      setTimeout(() => {
        copyAccBtn.innerText = originalText;
        copyAccBtn.classList.remove("copied");
      }, 2000);
    })
    .catch((err) => {
      console.error("ไม่สามารถคัดลอกได้: ", err);
    });
});
