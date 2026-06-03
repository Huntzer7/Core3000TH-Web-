import { supabase } from "./supabase.js";

// ครอบโค้ดระบบล็อกอินไว้ เพื่อให้ระบบรอให้หน้าเว็บโหลดโครงสร้าง HTML เสร็จสมบูรณ์ก่อนเริ่มทำงาน
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const userInfo = document.getElementById("user-info");

  // ตรวจสอบเช็กสถานะการล็อกอิน
  async function checkUserStatus() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session && session.user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (userInfo) {
        userInfo.style.display = "inline";
        userInfo.textContent = session.user.user_metadata.full_name || "";
      } // ← เพิ่ม } ที่หายไป
      if (logoutBtn) logoutBtn.style.display = "inline";

      loadUserProgress(session.user.id);
    } else {
      if (loginBtn) loginBtn.style.display = "inline-flex";
      if (userInfo) userInfo.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  }

  // ผูกตัวแปรปุ่มกดเข้ากับระบบ Google Login
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      console.log("กำลังเชื่อมต่อไปยัง Google...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + window.location.pathname,
        },
      });
      if (error) alert("เกิดข้อผิดพลาดในการล็อกอิน: " + error.message);
    });
  }

  // ปุ่มออกจากระบบ
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      localStorage.removeItem("currentIndex");
      localStorage.removeItem("learnedWords");
      localStorage.removeItem("favorites");

      learnedWords = [];
      currentIndex = 0;
      favorites = [];

      updateHome();
      showWord();

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error.message);
      } else {
        window.location.reload();
      }
    });
  }

  // เรียกใช้ฟังก์ชันเช็กสถานะทันทีเมื่อหน้าเว็บพร้อม
  checkUserStatus();

  // ดัก event เมื่อ login/logout สำเร็จ
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      if (loginBtn) loginBtn.style.display = "none";
      if (userInfo) {
        userInfo.style.display = "inline";
        userInfo.textContent = session.user.user_metadata.full_name || "";
      } // ← เพิ่ม } ที่หายไป
      if (logoutBtn) logoutBtn.style.display = "inline";
      loadUserProgress(session.user.id);
      document.getElementById("sidebar")?.classList.remove("active");
      document.getElementById("sidebarOverlay")?.classList.remove("active");
      showPage("home");
      updateHome();
    } else if (event === "SIGNED_OUT") {
      if (loginBtn) loginBtn.style.display = "inline-flex";
      if (userInfo) userInfo.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  }); // ← เพิ่ม }); ปิด onAuthStateChange
}); // ← ปิด DOMContentLoaded

// =========================
// SUPABASE DATABASE SYNC
// =========================

async function loadUserProgress(userId) {
  console.log("กำลังโหลดข้อมูลผู้เรียน ID:", userId);

  const { data, error } = await supabase
    .from("user_progress")
    .select("word_id")
    .eq("status", "learned");

  if (error) {
    console.error("โหลดข้อมูลผิดพลาด:", error.message);
    return;
  }

  learnedWords = data.map((item) => Number(item.word_id));

  updateHome();
  showWord();
}

async function saveWordProgress(index) {
  console.log("บันทึกความคืบหน้าคำที่ index:", index);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return;
  }

  const userId = session.user.id;

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      word_id: index.toString(),
      status: "learned",
      updated_at: new Date(),
    },
    { onConflict: "user_id, word_id" },
  );

  if (error) {
    console.error("บันทึกข้อมูลขึ้นระบบไม่สำเร็จ:", error.message);
  }
}

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
let wrongAnswers = [];
let favorites = [];
let favoriteQuizMode = "answerMeaning";
let isInFavoriteQuiz = false;
let quizConfig = {
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
  const label = document.getElementById("darkModeLabel");
  if (label) label.textContent = isDark ? "Light Mode" : "Dark Mode";
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
  updateDarkModeIcon();
}

function pronounceWord(word) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 0.9;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  let selectedVoice = voices.find(
    (voice) => voice.lang === "en-US" && voice.name.includes("Google"),
  );

  if (!selectedVoice) {
    selectedVoice = voices.find(
      (voice) => voice.lang === "en-US" && voice.name.length > 10,
    );
  }

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
  favorite: document.getElementById("favoritePage"),
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

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const favoriteMenuBtn = document.getElementById("favoriteMenuBtn");
const restartMenuBtn = document.getElementById("restartMenuBtn");

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
  Object.values(pages).forEach((p) => {
    if (p) p.classList.remove("active");
  });
  if (pages[name]) pages[name].classList.add("active");
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
  const totalWords = words.length > 0 ? words.length : 3000;
  const learned = learnedWords ? learnedWords.length : 0;
  const remaining = Math.max(totalWords - learned, 0);
  const pct = totalWords > 0 ? Math.round((learned / totalWords) * 100) : 0;

  if (learnedCountEl) learnedCountEl.textContent = learned;
  if (remainingCountEl) remainingCountEl.textContent = remaining;
  if (homeProgressEl) homeProgressEl.style.width = pct + "%";
  if (homePercentEl) homePercentEl.textContent = pct + "% Complete";
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

  if (wordEl) wordEl.textContent = w.word;
  if (wordTypeEl) wordTypeEl.textContent = w.type || "";
  if (meaningEl) meaningEl.textContent = w.meaning || "";

  if (wordProgressEl)
    wordProgressEl.textContent = `Word ${currentIndex + 1} / ${words.length}`;
  if (learnProgressEl)
    learnProgressEl.style.width =
      ((currentIndex + 1) / words.length) * 100 + "%";

  if (meaningBoxEl) meaningBoxEl.classList.add("hidden");
  if (meaningBtnEl) meaningBtnEl.textContent = "Show Meaning";

  updateFavoritesUI();

  if (backBtn) backBtn.disabled = currentIndex === 0;
}

// =========================
// QUIZ
// =========================

function openQuizSetup() {
  const learnedCount = learnedWords.length;

  if (learnedCount < 50) {
    showToast(
      `🔒 สะสมคำศัพท์ให้ครบ 50 คำ เพื่อปลดล็อค Quiz ขั้นสูง (ปัจจุบัน: ${learnedCount}/50)`,
    );
    startQuizNormal();
  } else {
    if (quizSetupModal) quizSetupModal.classList.add("active");
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
    const startIdx = Math.max(0, learnedWords.length - 50);
    selectedWordIndices = learnedWords.slice(startIdx);
  } else {
    selectedWordIndices = [...learnedWords];
  }

  for (let i = selectedWordIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedWordIndices[i], selectedWordIndices[j]] = [
      selectedWordIndices[j],
      selectedWordIndices[i],
    ];
  }

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

  if (quizWordEl) quizWordEl.textContent = q.word;
  if (quizProgressEl)
    quizProgressEl.textContent = `Question ${quizIndex + 1} / ${quizWords.length}`;
  if (quizProgressBarEl)
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

  if (quizChoicesEl) {
    quizChoicesEl.innerHTML = "";
    choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice;
      btn.addEventListener("click", () => checkAnswer(choice, q.meaning));
      quizChoicesEl.appendChild(btn);
    });
  }
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
    if (quizResultEl) {
      quizResultEl.textContent = "Correct";
      quizResultEl.className = "quiz-result correct";
    }
  } else {
    incorrect++;
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

    if (quizResultEl) {
      quizResultEl.textContent = `Incorrect — answer: ${correctAnswer}`;
      quizResultEl.className = "quiz-result incorrect";
    }
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

  if (correctCountEl) correctCountEl.textContent = correct;
  if (incorrectCountEl) incorrectCountEl.textContent = incorrect;
  if (scorePercentEl) scorePercentEl.textContent = score + "%";

  if (wrongAnswers.length > 0) {
    if (reviewToggleBtn) reviewToggleBtn.style.display = "block";
  } else {
    if (reviewToggleBtn) reviewToggleBtn.style.display = "none";
    if (reviewSection) reviewSection.style.display = "none";
  }

  isInFavoriteQuiz = false;
}

function displayWrongAnswers() {
  if (!wrongAnswersListEl) return;
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
        <div class="question">ข้อที่ ${index + 1}: ${item.meaning || item.word}</div>
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
  const favBtn = document.getElementById("favBtn");
  if (favBtn) {
    if (isFavorite(currentIndex)) {
      favBtn.classList.add("active");
    } else {
      favBtn.classList.remove("active");
    }
  }
}

function displayFavorites() {
  if (!favoriteList) return;

  if (!favorites.length) {
    favoriteList.innerHTML = "";
    if (emptyFavorites) emptyFavorites.style.display = "block";
    if (favoriteCount) favoriteCount.textContent = "0 words";
    return;
  }

  if (emptyFavorites) emptyFavorites.style.display = "none";
  if (favoriteCount) favoriteCount.textContent = `${favorites.length} words`;

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

  document.querySelectorAll(".favorite-delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      toggleFavorite(index);
      displayFavorites();
      showToast("💔 ลบออกจากคลังโปรด");
    });
  });
}

function filterFavorites(query) {
  if (!favoriteList) return;
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
  if (favQuizModeModal) favQuizModeModal.classList.add("active");
}

function startFavoriteQuiz() {
  isInFavoriteQuiz = true;
  let selectedWordIndices = [...favorites];

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

  if (quizProgressEl)
    quizProgressEl.textContent = `Question ${quizIndex + 1} / ${quizWords.length}`;
  if (quizProgressBarEl)
    quizProgressBarEl.style.width =
      ((quizIndex + 1) / quizWords.length) * 100 + "%";

  let correctAnswer = "";
  let choices = [];

  if (favoriteQuizMode === "answerMeaning") {
    if (quizLabel) quizLabel.textContent = "เลือกความหมายที่ถูกต้อง";
    if (quizWordEl) quizWordEl.textContent = q.word;
    correctAnswer = q.meaning;

    choices = [q.meaning];
    const pool = words.filter((w) => w.meaning && w.meaning !== q.meaning);

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    pool.slice(0, 3).forEach((w) => choices.push(w.meaning));
  } else {
    if (quizLabel) quizLabel.textContent = "เลือกคำศัพท์ที่ถูกต้อง";
    if (quizWordEl) quizWordEl.textContent = q.meaning;
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

  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  if (quizChoicesEl) {
    quizChoicesEl.innerHTML = "";
    choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice;
      btn.addEventListener("click", () =>
        checkFavAnswer(choice, correctAnswer),
      );
      quizChoicesEl.appendChild(btn);
    });
  }
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
    if (quizResultEl) {
      quizResultEl.textContent = "Correct";
      quizResultEl.className = "quiz-result correct";
    }
  } else {
    incorrect++;
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

    if (quizResultEl) {
      quizResultEl.textContent = `Incorrect — answer: ${correctAnswer}`;
      quizResultEl.className = "quiz-result incorrect";
    }
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
// EVENT LISTENERS
// =========================

if (homeBtn) {
  homeBtn.addEventListener("click", () => {
    if (sidebar) sidebar.classList.remove("active");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    showPage("home");
    updateHome();
  });
}

const favBtn = document.getElementById("favBtn");
if (favBtn) {
  favBtn.addEventListener("click", () => {
    toggleFavorite(currentIndex);
    showToast(
      isFavorite(currentIndex) ? "❤️ เพิ่มลงคลังโปรด" : "💔 ลบออกจากคลังโปรด",
    );
  });
}

if (hamburgerBtn) {
  hamburgerBtn.addEventListener("click", () => {
    if (sidebar) sidebar.classList.add("active");
    if (sidebarOverlay) sidebarOverlay.classList.add("active");
  });
}

if (closeSidebarBtn) {
  closeSidebarBtn.addEventListener("click", () => {
    if (sidebar) sidebar.classList.remove("active");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", () => {
    if (sidebar) sidebar.classList.remove("active");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
  });
}

if (favoriteMenuBtn) {
  favoriteMenuBtn.addEventListener("click", () => {
    if (sidebar) sidebar.classList.remove("active");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    showPage("favorite");
    displayFavorites();
  });
}

if (restartMenuBtn) {
  restartMenuBtn.addEventListener("click", () => {
    const confirmed = confirm(
      "⚠️ คุณต้องการเริ่มต้นการเรียนใหม่จริงใช่ไหม?\n\nข้อมูลทั้งหมดจะถูกลบ",
    );
    if (confirmed) {
      localStorage.clear();
      location.reload();
    }
  });
}

if (favQuizBtn) {
  favQuizBtn.addEventListener("click", () => {
    if (favorites.length < 1) {
      alert("เพิ่มคำศัพท์โปรดก่อนสำหรับทำควิซ");
      return;
    }
    openFavQuizSetup();
  });
}

if (modeAnswerMeaning) {
  modeAnswerMeaning.addEventListener("click", () => {
    favoriteQuizMode = "answerMeaning";
    document
      .querySelectorAll(".mode-card")
      .forEach((btn) => btn.classList.remove("selected"));
    modeAnswerMeaning.classList.add("selected");
  });
}

if (modeMeaningAnswer) {
  modeMeaningAnswer.addEventListener("click", () => {
    favoriteQuizMode = "meaningAnswer";
    document
      .querySelectorAll(".mode-card")
      .forEach((btn) => btn.classList.remove("selected"));
    modeMeaningAnswer.classList.add("selected");
  });
}

if (favQuizStartBtn) {
  favQuizStartBtn.addEventListener("click", () => {
    if (favQuizModeModal) favQuizModeModal.classList.remove("active");
    startFavoriteQuiz();
  });
}

if (favQuizCancelBtn) {
  favQuizCancelBtn.addEventListener("click", () => {
    if (favQuizModeModal) favQuizModeModal.classList.remove("active");
  });
}

if (searchToggleBtn) {
  searchToggleBtn.addEventListener("click", () => {
    if (!favoriteSearch) return;
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
}

if (favoriteSearch) {
  favoriteSearch.addEventListener("input", (e) => {
    filterFavorites(e.target.value);
  });
}

if (darkModeBtn) darkModeBtn.addEventListener("click", toggleDarkMode);

if (soundBtn) {
  soundBtn.addEventListener("click", () => {
    const word = wordEl ? wordEl.textContent : "";
    if (word) pronounceWord(word);
  });
}

if (startBtn) {
  startBtn.addEventListener("click", () => {
    showPage("learning");
    showWord();
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    markLearned(currentIndex);
    saveWordProgress(currentIndex);

    if (currentIndex < words.length - 1) {
      currentIndex++;
    }

    saveProgress();
    updateHome();
    showWord();
  });
}

if (backBtn) {
  backBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      saveProgress();
      showWord();
    }
  });
}

if (meaningBtnEl) {
  meaningBtnEl.addEventListener("click", () => {
    if (!meaningBoxEl) return;
    const hidden = meaningBoxEl.classList.toggle("hidden");
    meaningBtnEl.textContent = hidden ? "Show Meaning" : "Hide Meaning";
  });
}

if (modeBtn) modeBtn.addEventListener("click", openQuizSetup);

if (setupStartBtn) {
  setupStartBtn.addEventListener("click", () => {
    const checkedCount = document.querySelector(
      'input[name="quizCount"]:checked',
    );
    const checkedMode = document.querySelector(
      'input[name="quizMode"]:checked',
    );

    if (checkedCount) quizConfig.count = parseInt(checkedCount.value);
    if (checkedMode) quizConfig.mode = checkedMode.value;

    if (quizSetupModal) quizSetupModal.classList.remove("active");
    initQuiz();
  });
}

if (setupCancelBtn) {
  setupCancelBtn.addEventListener("click", () => {
    if (quizSetupModal) quizSetupModal.classList.remove("active");
  });
}

if (reviewToggleBtn) {
  reviewToggleBtn.addEventListener("click", () => {
    if (!reviewSection) return;
    const isHidden = reviewSection.style.display === "none";
    reviewSection.style.display = isHidden ? "block" : "none";
    reviewToggleBtn.textContent = isHidden
      ? "📋 ซ่อนข้อที่ผิด"
      : "📋 ดูข้อที่ผิด";

    if (isHidden) {
      displayWrongAnswers();
    }
  });
}

if (quizBackBtn) {
  quizBackBtn.addEventListener("click", () => {
    showPage("learning");
    showWord();
  });
}

if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    quizIndex = 0;
    correct = 0;
    incorrect = 0;
    showPage("quiz");
    showQuiz();
  });
}

if (newWordBtn) {
  newWordBtn.addEventListener("click", () => {
    showPage("learning");
    showWord();
  });
}

// =========================
// DONATE FEATURE
// =========================
const donateMenuBtn = document.getElementById("donateMenuBtn");
const donateModal = document.getElementById("donateModal");
const closeDonateTopBtn = document.getElementById("closeDonateTopBtn");
const copyAccBtn = document.getElementById("copyAccBtn");
const accountNumber = document.getElementById("accountNumber");

if (donateMenuBtn) {
  donateMenuBtn.addEventListener("click", () => {
    if (sidebar) sidebar.classList.remove("active");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    if (donateModal) donateModal.style.display = "flex";
  });
}

if (closeDonateTopBtn) {
  closeDonateTopBtn.addEventListener("click", () => {
    if (donateModal) donateModal.style.display = "none";
  });
}

if (copyAccBtn && accountNumber) {
  copyAccBtn.addEventListener("click", () => {
    const accText = accountNumber.innerText.replace(/-/g, "");
    navigator.clipboard
      .writeText(accText)
      .then(() => {
        copyAccBtn.textContent = "Copied!";
        copyAccBtn.classList.add("copied");

        setTimeout(() => {
          copyAccBtn.textContent = "Copy";
          copyAccBtn.classList.remove("copied");
        }, 2000);
      })
      .catch((err) => {
        console.error("ไม่สามารถคัดลอกได้:", err);
      });
  });
}

if (donateModal) {
  donateModal.addEventListener("click", (e) => {
    if (e.target === donateModal) {
      donateModal.style.display = "none";
    }
  });
}

// =========================
// INIT SYSTEM
// =========================

loadState();
loadFavorites();
initDarkMode();

updateHome();

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
