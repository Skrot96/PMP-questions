const state = {
  rawQuestions: [],
  questions: [],
  filteredQuestions: [],
  currentSession: null,
  currentIndex: 0,
  answers: {},
  flagged: new Set(),
  reviewMode: false,
  timerInterval: null,
  examMode: false
};

const DIFFICULTY_MAP = {
  "lätt": "easy",
  "medel": "medium",
  "svår": "hard",
  "easy": "easy",
  "medium": "medium",
  "hard": "hard"
};

const els = {
  totalQuestions: document.getElementById("totalQuestions"),
  domainFilter: document.getElementById("domainFilter"),
  taskFilter: document.getElementById("taskFilter"),
  difficultyFilter: document.getElementById("difficultyFilter"),
  typeFilter: document.getElementById("typeFilter"),
  searchInput: document.getElementById("searchInput"),
  questionCount: document.getElementById("questionCount"),

  startPracticeBtn: document.getElementById("startPracticeBtn"),
  startExamBtn: document.getElementById("startExamBtn"),
  random20Btn: document.getElementById("random20Btn"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),

  setupSection: document.getElementById("setupSection"),
  quizSection: document.getElementById("quizSection"),
  resultsSection: document.getElementById("resultsSection"),

  sessionTitle: document.getElementById("sessionTitle"),
  sessionMeta: document.getElementById("sessionMeta"),
  timer: document.getElementById("timer"),
  progressText: document.getElementById("progressText"),
  progressBar: document.getElementById("progressBar"),

  questionCard: document.getElementById("questionCard"),
  questionText: document.getElementById("questionText"),
  questionTags: document.getElementById("questionTags"),
  answerOptions: document.getElementById("answerOptions"),
  explanationBox: document.getElementById("explanationBox"),

  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  flagBtn: document.getElementById("flagBtn"),
  finishBtn: document.getElementById("finishBtn"),

  resultsSummary: document.getElementById("resultsSummary"),
  resultsDetails: document.getElementById("resultsDetails"),
  restartBtn: document.getElementById("restartBtn")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  await loadQuestions();
  buildFilters();
  applyFilters();
  renderSetupStats();
}

function bindEvents() {
  els.domainFilter?.addEventListener("change", onDomainChange);
  els.taskFilter?.addEventListener("change", applyFilters);
  els.difficultyFilter?.addEventListener("change", applyFilters);
  els.typeFilter?.addEventListener("change", applyFilters);
  els.searchInput?.addEventListener("input", applyFilters);

  els.startPracticeBtn?.addEventListener("click", () => startPracticeSession());
  els.startExamBtn?.addEventListener("click", () => startExamSession());
  els.random20Btn?.addEventListener("click", () => startPracticeSession(20));
  els.resetFiltersBtn?.addEventListener("click", resetFilters);

  els.prevBtn?.addEventListener("click", prevQuestion);
  els.nextBtn?.addEventListener("click", nextQuestion);
  els.flagBtn?.addEventListener("click", toggleFlag);
  els.finishBtn?.addEventListener("click", finishSession);
  els.restartBtn?.addEventListener("click", restartApp);
}

async function loadQuestions() {
  const candidatePaths = ["./data/questions.json", "./questions.json"];
  let loaded = null;
  let lastError = null;

  for (const path of candidatePaths) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} för ${path}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error(`Filen ${path} innehåller inte en lista`);
      }
      loaded = data;
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!loaded) {
    console.error(lastError);
    alert("Kunde inte läsa frågebanken. Kontrollera att questions.json finns i samma mapp som index.html eller i data/questions.json.");
    return;
  }

  state.rawQuestions = loaded;
  state.questions = loaded.map(normalizeQuestion).filter(Boolean);
}

function normalizeQuestion(q, idx) {
  if (!q || typeof q !== "object") return null;

  const options = normalizeOptions(q.options || []);
  const correctAnswers = normalizeCorrectAnswers(q.correctAnswers || [], options);

  return {
    id: q.id || `Q-${idx + 1}`,
    domain: q.domain || "Okänd",
    taskCode: q.taskCode || "",
    task: q.task || "",
    tags: Array.isArray(q.tags) ? q.tags : [],
    difficulty: normalizeDifficulty(q.difficulty),
    difficultyLabel: q.difficulty || "",
    type: q.type === "multiple" ? "multiple" : "single",
    question: q.question || "",
    options,
    correctAnswers,
    explanation: q.explanation || ""
  };
}

function normalizeDifficulty(value) {
  const key = String(value || "").trim().toLowerCase();
  return DIFFICULTY_MAP[key] || "medium";
}

function normalizeOptions(options) {
  return options.map((opt, index) => {
    if (typeof opt === "string") {
      return {
        id: optionIdFromIndex(index),
        text: opt
      };
    }

    if (opt && typeof opt === "object") {
      return {
        id: opt.id || optionIdFromIndex(index),
        text: opt.text || opt.label || String(opt)
      };
    }

    return {
      id: optionIdFromIndex(index),
      text: String(opt)
    };
  });
}

function normalizeCorrectAnswers(correctAnswers, options) {
  return correctAnswers
    .map((ans) => {
      if (typeof ans === "number") {
        return options[ans]?.id || null;
      }

      if (typeof ans === "string") {
        const trimmed = ans.trim();

        if (/^\d+$/.test(trimmed)) {
          const numericIndex = Number(trimmed);
          return options[numericIndex]?.id || null;
        }

        const byId = options.find((o) => o.id === trimmed);
        if (byId) return byId.id;

        const byText = options.find((o) => o.text === trimmed);
        if (byText) return byText.id;
      }

      return null;
    })
    .filter(Boolean)
    .sort();
}

function optionIdFromIndex(index) {
  return String.fromCharCode(65 + index);
}

function buildFilters() {
  populateSelect(
    els.domainFilter,
    uniqueSorted(state.questions.map((q) => q.domain)),
    "Alla domäner"
  );

  populateSelect(
    els.difficultyFilter,
    [
      { value: "", label: "Alla svårighetsgrader" },
      { value: "easy", label: "Lätt" },
      { value: "medium", label: "Medel" },
      { value: "hard", label: "Svår" }
    ],
    null,
    true
  );

  populateSelect(
    els.typeFilter,
    [
      { value: "", label: "Alla frågetyper" },
      { value: "single", label: "Ett svar" },
      { value: "multiple", label: "Flera svar" }
    ],
    null,
    true
  );

  onDomainChange();
}

function onDomainChange() {
  const selectedDomain = els.domainFilter?.value || "";
  const tasks = uniqueSorted(
    state.questions
      .filter((q) => !selectedDomain || q.domain === selectedDomain)
      .map((q) => `${q.taskCode} — ${q.task}`)
  );

  populateSelect(els.taskFilter, tasks, "Alla tasks");
  applyFilters();
}

function populateSelect(selectEl, items, defaultLabel, itemsAreObjects = false) {
  if (!selectEl) return;

  selectEl.innerHTML = "";

  if (defaultLabel !== null) {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = defaultLabel;
    selectEl.appendChild(defaultOption);
  }

  items.forEach((item) => {
    const option = document.createElement("option");
    if (itemsAreObjects) {
      option.value = item.value;
      option.textContent = item.label;
    } else {
      option.value = item;
      option.textContent = item;
    }
    selectEl.appendChild(option);
  });
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "sv")
  );
}

function applyFilters() {
  const domain = els.domainFilter?.value || "";
  const task = els.taskFilter?.value || "";
  const difficulty = els.difficultyFilter?.value || "";
  const type = els.typeFilter?.value || "";
  const search = (els.searchInput?.value || "").trim().toLowerCase();

  state.filteredQuestions = state.questions.filter((q) => {
    const taskLabel = `${q.taskCode} — ${q.task}`;

    const matchesDomain = !domain || q.domain === domain;
    const matchesTask = !task || taskLabel === task;
    const matchesDifficulty = !difficulty || q.difficulty === difficulty;
    const matchesType = !type || q.type === type;

    const haystack = [
      q.id,
      q.domain,
      q.taskCode,
      q.task,
      q.question,
      q.explanation,
      ...(q.tags || []),
      ...(q.options || []).map((o) => o.text)
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !search || haystack.includes(search);

    return matchesDomain && matchesTask && matchesDifficulty && matchesType && matchesSearch;
  });

  renderSetupStats();
}

function renderSetupStats() {
  if (els.totalQuestions) els.totalQuestions.textContent = String(state.questions.length);
  if (els.questionCount) els.questionCount.textContent = String(state.filteredQuestions.length);
}

function resetFilters() {
  if (els.domainFilter) els.domainFilter.value = "";
  onDomainChange();
  if (els.taskFilter) els.taskFilter.value = "";
  if (els.difficultyFilter) els.difficultyFilter.value = "";
  if (els.typeFilter) els.typeFilter.value = "";
  if (els.searchInput) els.searchInput.value = "";
  applyFilters();
}

function startPracticeSession(limit = null) {
  const pool = [...state.filteredQuestions];
  if (!pool.length) {
    alert("Det finns inga frågor som matchar filtren.");
    return;
  }

  let selected = shuffle(pool);
  if (limit) selected = selected.slice(0, Math.min(limit, selected.length));

  startSession({
    title: limit ? `Övningspass (${selected.length} frågor)` : `Övningspass (${selected.length} frågor)`,
    questions: selected,
    examMode: false,
    totalSeconds: null
  });
}

function startExamSession() {
  let selected = smartPickQuestions(state.filteredQuestions.length ? state.filteredQuestions : state.questions, 180);

  if (selected.length < 180) {
    alert(`Frågebanken innehåller bara ${selected.length} tillgängliga frågor för provet.`);
  }

  startSession({
    title: "Simulerad PMP-examen",
    questions: selected,
    examMode: true,
    totalSeconds: 230 * 60
  });
}

function smartPickQuestions(source, targetCount) {
  const shuffled = shuffle([...source]);
  if (shuffled.length <= targetCount) return shuffled;

  const buckets = {
    easy: shuffled.filter((q) => q.difficulty === "easy"),
    medium: shuffled.filter((q) => q.difficulty === "medium"),
    hard: shuffled.filter((q) => q.difficulty === "hard")
  };

  const targets = {
    easy: Math.round(targetCount * 0.2),
    medium: Math.round(targetCount * 0.5),
    hard: targetCount - Math.round(targetCount * 0.2) - Math.round(targetCount * 0.5)
  };

  let result = [];
  for (const level of ["easy", "medium", "hard"]) {
    result = result.concat(shuffle(buckets[level]).slice(0, targets[level]));
  }

  if (result.length < targetCount) {
    const usedIds = new Set(result.map((q) => q.id));
    const fillers = shuffled.filter((q) => !usedIds.has(q.id));
    result = result.concat(fillers.slice(0, targetCount - result.length));
  }

  return shuffle(result).slice(0, targetCount);
}

function startSession({ title, questions, examMode, totalSeconds }) {
  state.currentSession = {
    title,
    questions,
    totalSeconds,
    remainingSeconds: totalSeconds
  };
  state.currentIndex = 0;
  state.answers = {};
  state.flagged = new Set();
  state.reviewMode = false;
  state.examMode = examMode;

  if (els.setupSection) els.setupSection.hidden = true;
  if (els.resultsSection) els.resultsSection.hidden = true;
  if (els.quizSection) els.quizSection.hidden = false;

  if (els.sessionTitle) els.sessionTitle.textContent = title;
  if (els.sessionMeta) {
    els.sessionMeta.textContent = examMode
      ? `${questions.length} frågor • 230 minuter`
      : `${questions.length} frågor`;
  }

  clearTimer();
  if (examMode && totalSeconds) startTimer();

  renderQuestion();
}

function startTimer() {
  updateTimerDisplay();
  state.timerInterval = setInterval(() => {
    if (!state.currentSession) return;
    state.currentSession.remainingSeconds -= 1;
    updateTimerDisplay();

    if (state.currentSession.remainingSeconds <= 0) {
      clearTimer();
      finishSession();
    }
  }, 1000);
}

function clearTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerDisplay() {
  if (!els.timer) return;
  const sec = state.currentSession?.remainingSeconds;
  if (sec == null) {
    els.timer.textContent = "";
    return;
  }
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  els.timer.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function renderQuestion() {
  const q = getCurrentQuestion();
  if (!q) return;

  const total = state.currentSession.questions.length;
  const current = state.currentIndex + 1;

  if (els.progressText) els.progressText.textContent = `Fråga ${current} av ${total}`;
  if (els.progressBar) els.progressBar.style.width = `${(current / total) * 100}%`;

  if (els.questionText) els.questionText.textContent = q.question;

  if (els.questionTags) {
    const meta = [
      q.domain,
      q.taskCode ? `${q.taskCode}` : "",
      q.task,
      q.difficultyLabel || q.difficulty,
      q.type === "multiple" ? "Flera svar" : "Ett svar"
    ].filter(Boolean);
    els.questionTags.textContent = meta.join(" • ");
  }

  if (els.answerOptions) {
    els.answerOptions.innerHTML = "";
    const saved = state.answers[q.id] || [];

    q.options.forEach((opt) => {
      const wrapper = document.createElement("label");
      wrapper.className = "answer-option";

      const input = document.createElement("input");
      input.type = q.type === "multiple" ? "checkbox" : "radio";
      input.name = `question-${q.id}`;
      input.value = opt.id;
      input.checked = saved.includes(opt.id);
      input.disabled = state.reviewMode;
      input.addEventListener("change", () => handleAnswerChange(q, opt.id, input.checked));

      const text = document.createElement("span");
      text.textContent = `${opt.id}. ${opt.text}`;

      wrapper.appendChild(input);
      wrapper.appendChild(text);

      if (state.reviewMode) {
        const correct = q.correctAnswers.includes(opt.id);
        const chosen = saved.includes(opt.id);
        if (correct) wrapper.classList.add("is-correct");
        if (chosen && !correct) wrapper.classList.add("is-wrong");
      }

      els.answerOptions.appendChild(wrapper);
    });
  }

  if (els.explanationBox) {
    if (state.reviewMode) {
      const user = (state.answers[q.id] || []).slice().sort();
      const correct = q.correctAnswers.slice().sort();
      const isCorrect = arraysEqual(user, correct);

      els.explanationBox.hidden = false;
      els.explanationBox.innerHTML = `
        <div><strong>Resultat:</strong> ${isCorrect ? "Rätt" : "Fel"}</div>
        <div><strong>Rätt svar:</strong> ${correct.join(", ")}</div>
        <div><strong>Din markering:</strong> ${user.length ? user.join(", ") : "Inget svar"}</div>
        <div style="margin-top:8px;"><strong>Förklaring:</strong> ${escapeHtml(q.explanation || "")}</div>
      `;
    } else {
      els.explanationBox.hidden = true;
      els.explanationBox.innerHTML = "";
    }
  }

  if (els.prevBtn) els.prevBtn.disabled = state.currentIndex === 0;
  if (els.nextBtn) els.nextBtn.disabled = state.currentIndex >= total - 1;
  if (els.flagBtn) els.flagBtn.textContent = state.flagged.has(q.id) ? "Avmarkera flagga" : "Flagga";
}

function handleAnswerChange(question, optionId, checked) {
  let current = state.answers[question.id] || [];

  if (question.type === "single") {
    current = checked ? [optionId] : [];
  } else {
    const set = new Set(current);
    if (checked) set.add(optionId);
    else set.delete(optionId);
    current = [...set].sort();
  }

  state.answers[question.id] = current;
}

function getCurrentQuestion() {
  return state.currentSession?.questions?.[state.currentIndex] || null;
}

function prevQuestion() {
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    renderQuestion();
  }
}

function nextQuestion() {
  if (state.currentIndex < state.currentSession.questions.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
  }
}

function toggleFlag() {
  const q = getCurrentQuestion();
  if (!q) return;
  if (state.flagged.has(q.id)) state.flagged.delete(q.id);
  else state.flagged.add(q.id);
  renderQuestion();
}

function finishSession() {
  clearTimer();
  state.reviewMode = true;

  const results = calculateResults();

  if (els.quizSection) els.quizSection.hidden = true;
  if (els.resultsSection) els.resultsSection.hidden = false;

  renderResults(results);
}

function calculateResults() {
  const details = state.currentSession.questions.map((q) => {
    const userAnswer = (state.answers[q.id] || []).slice().sort();
    const correctAnswer = q.correctAnswers.slice().sort();
    const isCorrect = arraysEqual(userAnswer, correctAnswer);

    return {
      question: q,
      userAnswer,
      correctAnswer,
      isCorrect
    };
  });

  const correctCount = details.filter((d) => d.isCorrect).length;
  const total = details.length;
  const incorrectCount = total - correctCount;
  const score = total ? Math.round((correctCount / total) * 100) : 0;

  return {
    total,
    correctCount,
    incorrectCount,
    score,
    details
  };
}

function renderResults(results) {
  if (els.resultsSummary) {
    els.resultsSummary.innerHTML = `
      <div><strong>Poäng:</strong> ${results.score}%</div>
      <div><strong>Rätt:</strong> ${results.correctCount} av ${results.total}</div>
      <div><strong>Fel:</strong> ${results.incorrectCount}</div>
    `;
  }

  if (els.resultsDetails) {
    els.resultsDetails.innerHTML = "";

    const correctBlock = document.createElement("div");
    const incorrectBlock = document.createElement("div");

    correctBlock.innerHTML = `<h3>Rätt besvarade frågor</h3>`;
    incorrectBlock.innerHTML = `<h3>Fel besvarade frågor</h3>`;

    results.details.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
        <div><strong>${index + 1}. ${escapeHtml(item.question.question)}</strong></div>
        <div><strong>Rätt svar:</strong> ${item.correctAnswer.join(", ")}</div>
        <div><strong>Ditt svar:</strong> ${item.userAnswer.length ? item.userAnswer.join(", ") : "Inget svar"}</div>
        <div style="margin-top:6px;"><strong>Förklaring:</strong> ${escapeHtml(item.question.explanation || "")}</div>
      `;

      if (item.isCorrect) {
        correctBlock.appendChild(card);
      } else {
        incorrectBlock.appendChild(card);
      }
    });

    els.resultsDetails.appendChild(incorrectBlock);
    els.resultsDetails.appendChild(correctBlock);
  }
}

function restartApp() {
  clearTimer();
  state.currentSession = null;
  state.currentIndex = 0;
  state.answers = {};
  state.flagged = new Set();
  state.reviewMode = false;
  state.examMode = false;

  if (els.resultsSection) els.resultsSection.hidden = true;
  if (els.quizSection) els.quizSection.hidden = true;
  if (els.setupSection) els.setupSection.hidden = false;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}