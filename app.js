const state = {
  rawQuestions: [],
  questions: [],
  practicePool: [],
  practiceSession: null,
  examSession: null,
  review: null,
  timerInterval: null,
  breakShownAt: new Set(),
  currentView: "home"
};

const VIEW_IDS = ["home", "practice", "exam", "review", "about"];

const els = {
  navButtons: Array.from(document.querySelectorAll(".nav-btn")),
  views: Object.fromEntries(
    VIEW_IDS.map((view) => [view, document.getElementById(`view-${view}`)])
  ),

  // Home
  startPracticeBtn: document.getElementById("startPracticeBtn"),
  startExamBtn: document.getElementById("startExamBtn"),
  statsTotalQuestions: document.getElementById("statsTotalQuestions"),
  recentResultSummary: document.getElementById("recentResultSummary"),

  // Practice filters
  practiceDomain: document.getElementById("practiceDomain"),
  practiceTask: document.getElementById("practiceTask"),
  practiceDifficulty: document.getElementById("practiceDifficulty"),
  practiceQuestionType: document.getElementById("practiceQuestionType"),
  practiceTag: document.getElementById("practiceTag"),
  practiceCount: document.getElementById("practiceCount"),
  practiceGenerateBtn: document.getElementById("practiceGenerateBtn"),
  practiceResetFiltersBtn: document.getElementById("practiceResetFiltersBtn"),
  practicePoolInfo: document.getElementById("practicePoolInfo"),

  // Practice session
  practiceSession: document.getElementById("practiceSession"),
  practiceProgressText: document.getElementById("practiceProgressText"),
  practiceProgressBar: document.getElementById("practiceProgressBar"),
  practiceAnsweredCount: document.getElementById("practiceAnsweredCount"),
  practiceUnansweredCount: document.getElementById("practiceUnansweredCount"),
  practiceQuestionNav: document.getElementById("practiceQuestionNav"),
  practiceFinishBtn: document.getElementById("practiceFinishBtn"),
  practiceMetaDomain: document.getElementById("practiceMetaDomain"),
  practiceMetaTask: document.getElementById("practiceMetaTask"),
  practiceMetaType: document.getElementById("practiceMetaType"),
  practiceMetaDifficulty: document.getElementById("practiceMetaDifficulty"),
  practiceCaseBlock: document.getElementById("practiceCaseBlock"),
  practiceCaseText: document.getElementById("practiceCaseText"),
  practiceExhibitBlock: document.getElementById("practiceExhibitBlock"),
  practiceExhibitContent: document.getElementById("practiceExhibitContent"),
  practiceQuestionTitle: document.getElementById("practiceQuestionTitle"),
  practiceQuestionInstruction: document.getElementById("practiceQuestionInstruction"),
  practiceQuestionText: document.getElementById("practiceQuestionText"),
  practiceOptions: document.getElementById("practiceOptions"),
  practicePrevBtn: document.getElementById("practicePrevBtn"),
  practiceMarkBtn: document.getElementById("practiceMarkBtn"),
  practiceNextBtn: document.getElementById("practiceNextBtn"),

  // Exam setup
  examShuffleQuestions: document.getElementById("examShuffleQuestions"),
  examShuffleOptions: document.getElementById("examShuffleOptions"),
  examEnableBreaks: document.getElementById("examEnableBreaks"),
  examStartBtn: document.getElementById("examStartBtn"),
  examSetup: document.getElementById("examSetup"),

  // Exam session
  examSession: document.getElementById("examSession"),
  examTimer: document.getElementById("examTimer"),
  examProgressText: document.getElementById("examProgressText"),
  examProgressBar: document.getElementById("examProgressBar"),
  examAnsweredCount: document.getElementById("examAnsweredCount"),
  examMarkedCount: document.getElementById("examMarkedCount"),
  examQuestionNav: document.getElementById("examQuestionNav"),
  examFinishBtn: document.getElementById("examFinishBtn"),
  examBreakNotice: document.getElementById("examBreakNotice"),
  examBreakText: document.getElementById("examBreakText"),
  examContinueAfterBreakBtn: document.getElementById("examContinueAfterBreakBtn"),
  examMetaDomain: document.getElementById("examMetaDomain"),
  examMetaTask: document.getElementById("examMetaTask"),
  examMetaType: document.getElementById("examMetaType"),
  examMetaDifficulty: document.getElementById("examMetaDifficulty"),
  examCaseBlock: document.getElementById("examCaseBlock"),
  examCaseText: document.getElementById("examCaseText"),
  examExhibitBlock: document.getElementById("examExhibitBlock"),
  examExhibitContent: document.getElementById("examExhibitContent"),
  examQuestionTitle: document.getElementById("examQuestionTitle"),
  examQuestionInstruction: document.getElementById("examQuestionInstruction"),
  examQuestionText: document.getElementById("examQuestionText"),
  examOptions: document.getElementById("examOptions"),
  examPrevBtn: document.getElementById("examPrevBtn"),
  examMarkBtn: document.getElementById("examMarkBtn"),
  examNextBtn: document.getElementById("examNextBtn"),

  // Review
  reviewEmpty: document.getElementById("reviewEmpty"),
  reviewContent: document.getElementById("reviewContent"),
  reviewScorePercent: document.getElementById("reviewScorePercent"),
  reviewCorrectCount: document.getElementById("reviewCorrectCount"),
  reviewIncorrectCount: document.getElementById("reviewIncorrectCount"),
  reviewMode: document.getElementById("reviewMode"),
  reviewDomainBreakdown: document.getElementById("reviewDomainBreakdown"),
  reviewFilterStatus: document.getElementById("reviewFilterStatus"),
  reviewFilterDomain: document.getElementById("reviewFilterDomain"),
  reviewQuestions: document.getElementById("reviewQuestions"),
  reviewItemTemplate: document.getElementById("reviewItemTemplate")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  restoreRecentResult();
  await loadQuestions();
  buildPracticeFilters();
  updateHomeStats();
  updatePracticePoolInfo();
  renderRecentResultSummary();
  renderReview();
}

function bindEvents() {
  els.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  els.startPracticeBtn?.addEventListener("click", () => switchView("practice"));
  els.startExamBtn?.addEventListener("click", () => {
    switchView("exam");
    if (!state.examSession) {
      scrollToTop();
    }
  });

  els.practiceDomain?.addEventListener("change", handlePracticeDomainChange);
  els.practiceTask?.addEventListener("change", updatePracticePoolInfo);
  els.practiceDifficulty?.addEventListener("change", updatePracticePoolInfo);
  els.practiceQuestionType?.addEventListener("change", updatePracticePoolInfo);
  els.practiceTag?.addEventListener("change", updatePracticePoolInfo);

  els.practiceGenerateBtn?.addEventListener("click", startPracticeSession);
  els.practiceResetFiltersBtn?.addEventListener("click", resetPracticeFilters);

  els.practicePrevBtn?.addEventListener("click", () => movePractice(-1));
  els.practiceNextBtn?.addEventListener("click", () => movePractice(1));
  els.practiceMarkBtn?.addEventListener("click", togglePracticeMark);
  els.practiceFinishBtn?.addEventListener("click", finishPracticeSession);

  els.examStartBtn?.addEventListener("click", startExamSession);
  els.examPrevBtn?.addEventListener("click", () => moveExam(-1));
  els.examNextBtn?.addEventListener("click", () => moveExam(1));
  els.examMarkBtn?.addEventListener("click", toggleExamMark);
  els.examFinishBtn?.addEventListener("click", finishExamSession);
  els.examContinueAfterBreakBtn?.addEventListener("click", continueAfterBreak);

  els.reviewFilterStatus?.addEventListener("change", renderReviewQuestions);
  els.reviewFilterDomain?.addEventListener("change", renderReviewQuestions);
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
    } catch (error) {
      lastError = error;
    }
  }

  if (!loaded) {
    console.error(lastError);
    alert("Kunde inte läsa frågebanken. Kontrollera att questions.json finns i data/questions.json eller i samma mapp som index.html.");
    return;
  }

  state.rawQuestions = loaded;
  state.questions = loaded.map(normalizeQuestion).filter(Boolean);
}

function normalizeQuestion(q, index) {
  if (!q || typeof q !== "object") return null;

  const options = normalizeOptions(q.options || []);
  const normalizedType = normalizeQuestionType(q.type, options);
  const normalizedOptions =
    (normalizedType === "case" || normalizedType === "exhibit") && options.length === 0
      ? []
      : options;

  const correctAnswers = normalizeCorrectAnswers(q.correctAnswers || [], normalizedOptions);

  return {
    id: q.id || `Q-${index + 1}`,
    domain: q.domain || "Okänd",
    taskCode: q.taskCode || "",
    task: q.task || "",
    tags: Array.isArray(q.tags) ? q.tags : [],
    difficulty: normalizeDifficulty(q.difficulty),
    difficultyLabel: q.difficulty || difficultyLabelFromValue(normalizeDifficulty(q.difficulty)),
    type: normalizedType,
    question: q.question || "",
    options: normalizedOptions,
    correctAnswers,
    explanation: q.explanation || "",
    caseText: q.caseText || q.case || "",
    exhibitContent: q.exhibitContent || q.exhibit || ""
  };
}

function normalizeQuestionType(type, options) {
  const t = String(type || "").trim().toLowerCase();
  if (t === "multiple") return "multiple";
  if (t === "case") return "case";
  if (t === "exhibit") return "exhibit";
  if (t === "single") return "single";
  return options.length > 1 ? "single" : "single";
}

function normalizeDifficulty(value) {
  const map = {
    "lätt": "easy",
    "medel": "medium",
    "svår": "hard",
    "easy": "easy",
    "medium": "medium",
    "hard": "hard"
  };
  const key = String(value || "").trim().toLowerCase();
  return map[key] || "medium";
}

function difficultyLabelFromValue(value) {
  if (value === "easy") return "Lätt";
  if (value === "hard") return "Svår";
  return "Medel";
}

function normalizeOptions(options) {
  return options.map((opt, index) => {
    if (typeof opt === "string") {
      return { id: optionIdFromIndex(index), text: opt };
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
    .map((answer) => {
      if (typeof answer === "number") {
        return options[answer]?.id || null;
      }

      const str = String(answer || "").trim();
      if (/^\d+$/.test(str)) {
        return options[Number(str)]?.id || null;
      }

      const byId = options.find((o) => o.id === str);
      if (byId) return byId.id;

      const byText = options.find((o) => o.text === str);
      if (byText) return byText.id;

      return null;
    })
    .filter(Boolean)
    .sort();
}

function optionIdFromIndex(index) {
  return String.fromCharCode(65 + index);
}

function switchView(viewName) {
  if (!VIEW_IDS.includes(viewName)) return;
  state.currentView = viewName;

  els.navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  VIEW_IDS.forEach((view) => {
    els.views[view]?.classList.toggle("active", view === viewName);
  });

  scrollToTop();
}

function updateHomeStats() {
  if (els.statsTotalQuestions) {
    els.statsTotalQuestions.textContent = String(state.questions.length);
  }
}

function buildPracticeFilters() {
  populateSelect(els.practiceDomain, uniqueSorted(state.questions.map((q) => q.domain)), "Alla domäner");
  populateSelect(els.practiceTag, uniqueSorted(state.questions.flatMap((q) => q.tags || [])), "Alla taggar");
  handlePracticeDomainChange();
  populateReviewDomainFilter();
}

function handlePracticeDomainChange() {
  const domain = els.practiceDomain?.value || "";
  const tasks = uniqueSorted(
    state.questions
      .filter((q) => !domain || q.domain === domain)
      .map((q) => formatTaskLabel(q))
  );
  populateSelect(els.practiceTask, tasks, "Alla tasks");
  updatePracticePoolInfo();
}

function populateReviewDomainFilter() {
  populateSelect(els.reviewFilterDomain, uniqueSorted(state.questions.map((q) => q.domain)), "Alla domäner");
}

function populateSelect(selectEl, values, defaultLabel) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = defaultLabel;
  selectEl.appendChild(defaultOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectEl.appendChild(option);
  });
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "sv")
  );
}

function formatTaskLabel(question) {
  return question.taskCode ? `${question.taskCode} — ${question.task}` : question.task;
}

function getPracticeFilteredQuestions() {
  const domain = els.practiceDomain?.value || "";
  const task = els.practiceTask?.value || "";
  const difficulty = els.practiceDifficulty?.value || "";
  const type = els.practiceQuestionType?.value || "";
  const tag = els.practiceTag?.value || "";

  return state.questions.filter((q) => {
    const matchesDomain = !domain || q.domain === domain;
    const matchesTask = !task || formatTaskLabel(q) === task;
    const matchesDifficulty = !difficulty || q.difficulty === difficulty;
    const matchesType = !type || q.type === type;
    const matchesTag = !tag || (q.tags || []).includes(tag);
    return matchesDomain && matchesTask && matchesDifficulty && matchesType && matchesTag;
  });
}

function updatePracticePoolInfo() {
  const filtered = getPracticeFilteredQuestions();
  state.practicePool = filtered;
  if (!els.practicePoolInfo) return;

  if (!filtered.length) {
    els.practicePoolInfo.textContent = "Inga frågor matchar nuvarande filter.";
    return;
  }

  const count = Number(els.practiceCount?.value || 20);
  els.practicePoolInfo.textContent = `${filtered.length} frågor matchar filtren. Passet kommer att använda upp till ${Math.min(count, filtered.length)} frågor.`;
}

function resetPracticeFilters() {
  if (els.practiceDomain) els.practiceDomain.value = "";
  handlePracticeDomainChange();
  if (els.practiceTask) els.practiceTask.value = "";
  if (els.practiceDifficulty) els.practiceDifficulty.value = "";
  if (els.practiceQuestionType) els.practiceQuestionType.value = "";
  if (els.practiceTag) els.practiceTag.value = "";
  if (els.practiceCount) els.practiceCount.value = "20";
  updatePracticePoolInfo();
}

function startPracticeSession() {
  const pool = shuffle([...state.practicePool]);
  if (!pool.length) {
    alert("Det finns inga frågor som matchar filtren.");
    return;
  }

  const count = Math.min(Number(els.practiceCount?.value || 20), pool.length);
  const selected = pool.slice(0, count);

  state.practiceSession = createSession({
    mode: "Övningsläge",
    questions: selected,
    totalSeconds: null,
    shuffleOptions: false
  });

  els.practiceSession?.classList.remove("hidden");
  renderPractice();
}

function createSession({ mode, questions, totalSeconds, shuffleOptions }) {
  const normalizedQuestions = questions.map((q) => {
    const clone = {
      ...q,
      options: q.options.map((o) => ({ ...o })),
      correctAnswers: [...q.correctAnswers]
    };

    if (shuffleOptions && clone.options.length > 1) {
      const originalById = new Map(clone.options.map((o) => [o.id, o]));
      clone.options = shuffle([...clone.options]);
      clone.correctAnswers = clone.correctAnswers.filter((id) => originalById.has(id)).sort();
    }

    return clone;
  });

  return {
    mode,
    questions: normalizedQuestions,
    currentIndex: 0,
    answers: {},
    marked: new Set(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    completed: false
  };
}

function renderPractice() {
  const session = state.practiceSession;
  if (!session) return;

  const question = session.questions[session.currentIndex];
  const answeredCount = getAnsweredCount(session);
  const total = session.questions.length;

  setText(els.practiceProgressText, `Fråga ${session.currentIndex + 1} av ${total}`);
  setWidth(els.practiceProgressBar, ((session.currentIndex + 1) / total) * 100);
  setText(els.practiceAnsweredCount, String(answeredCount));
  setText(els.practiceUnansweredCount, String(total - answeredCount));

  setText(els.practiceMetaDomain, question.domain);
  setText(els.practiceMetaTask, formatTaskLabel(question));
  setText(els.practiceMetaType, questionTypeLabel(question.type));
  setText(els.practiceMetaDifficulty, question.difficultyLabel);

  renderCaseAndExhibit(
    question,
    els.practiceCaseBlock,
    els.practiceCaseText,
    els.practiceExhibitBlock,
    els.practiceExhibitContent
  );

  setText(els.practiceQuestionTitle, `Fråga ${session.currentIndex + 1}`);
  setText(els.practiceQuestionInstruction, instructionText(question.type));
  setHtml(els.practiceQuestionText, escapeHtml(question.question).replace(/\n/g, "<br>"));

  renderOptions({
    container: els.practiceOptions,
    question,
    selectedAnswers: session.answers[question.id] || [],
    disabled: false,
    onChange: (value, checked) => updateSessionAnswer(session, question, value, checked)
  });

  renderQuestionNav({
    container: els.practiceQuestionNav,
    session,
    onClick: (index) => {
      session.currentIndex = index;
      renderPractice();
    }
  });

  updateButtonState(els.practicePrevBtn, session.currentIndex === 0);
  updateButtonState(els.practiceNextBtn, session.currentIndex === total - 1);
  if (els.practiceMarkBtn) {
    els.practiceMarkBtn.textContent = session.marked.has(question.id) ? "Avmarkera" : "Markera";
  }
}

function movePractice(direction) {
  const session = state.practiceSession;
  if (!session) return;
  const nextIndex = session.currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= session.questions.length) return;
  session.currentIndex = nextIndex;
  renderPractice();
}

function togglePracticeMark() {
  const session = state.practiceSession;
  if (!session) return;
  const q = session.questions[session.currentIndex];
  toggleMarked(session, q.id);
  renderPractice();
}

function finishPracticeSession() {
  const session = state.practiceSession;
  if (!session) return;
  const result = buildResult(session);
  saveResult(result);
  renderReview();
  switchView("review");
}

function startExamSession() {
  const source = [...state.questions];
  if (!source.length) {
    alert("Frågebanken är tom.");
    return;
  }

  const selected = buildExamQuestionSet(source, 180);
  const shuffleQuestions = !!els.examShuffleQuestions?.checked;
  const shuffleOptions = !!els.examShuffleOptions?.checked;

  const questions = shuffleQuestions ? shuffle(selected) : selected;

  state.examSession = createSession({
    mode: "Simulerat prov",
    questions,
    totalSeconds: 230 * 60,
    shuffleOptions
  });

  state.breakShownAt = new Set();

  els.examSetup?.classList.add("hidden");
  els.examSession?.classList.remove("hidden");
  els.examBreakNotice?.classList.add("hidden");

  startExamTimer();
  renderExam();
}

function buildExamQuestionSet(source, count) {
  const shuffled = shuffle([...source]);
  if (shuffled.length <= count) return shuffled;

  const target = {
    people: Math.round(count * 0.33),
    process: Math.round(count * 0.41),
    business: count - Math.round(count * 0.33) - Math.round(count * 0.41)
  };

  const buckets = {
    people: shuffled.filter((q) => q.domain.toLowerCase() === "people"),
    process: shuffled.filter((q) => q.domain.toLowerCase() === "process"),
    business: shuffled.filter((q) => q.domain.toLowerCase().includes("business"))
  };

  let result = [];
  result = result.concat(shuffle(buckets.people).slice(0, target.people));
  result = result.concat(shuffle(buckets.process).slice(0, target.process));
  result = result.concat(shuffle(buckets.business).slice(0, target.business));

  if (result.length < count) {
    const used = new Set(result.map((q) => q.id));
    const fillers = shuffled.filter((q) => !used.has(q.id));
    result = result.concat(fillers.slice(0, count - result.length));
  }

  return shuffle(result).slice(0, count);
}

function startExamTimer() {
  clearExamTimer();
  renderExamTimer();

  state.timerInterval = setInterval(() => {
    if (!state.examSession || state.examSession.completed) return;
    state.examSession.remainingSeconds -= 1;
    renderExamTimer();

    if (state.examSession.remainingSeconds <= 0) {
      clearExamTimer();
      finishExamSession();
    }
  }, 1000);
}

function clearExamTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function renderExamTimer() {
  if (!els.examTimer || !state.examSession) return;
  const sec = Math.max(0, state.examSession.remainingSeconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  els.examTimer.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function renderExam() {
  const session = state.examSession;
  if (!session) return;

  maybeShowBreakNotice(session);

  const question = session.questions[session.currentIndex];
  const answeredCount = getAnsweredCount(session);
  const total = session.questions.length;

  setText(els.examProgressText, `Fråga ${session.currentIndex + 1} av ${total}`);
  setWidth(els.examProgressBar, ((session.currentIndex + 1) / total) * 100);
  setText(els.examAnsweredCount, String(answeredCount));
  setText(els.examMarkedCount, String(session.marked.size));

  setText(els.examMetaDomain, question.domain);
  setText(els.examMetaTask, formatTaskLabel(question));
  setText(els.examMetaType, questionTypeLabel(question.type));
  setText(els.examMetaDifficulty, question.difficultyLabel);

  renderCaseAndExhibit(
    question,
    els.examCaseBlock,
    els.examCaseText,
    els.examExhibitBlock,
    els.examExhibitContent
  );

  setText(els.examQuestionTitle, `Fråga ${session.currentIndex + 1}`);
  setText(els.examQuestionInstruction, instructionText(question.type));
  setHtml(els.examQuestionText, escapeHtml(question.question).replace(/\n/g, "<br>"));

  renderOptions({
    container: els.examOptions,
    question,
    selectedAnswers: session.answers[question.id] || [],
    disabled: false,
    onChange: (value, checked) => updateSessionAnswer(session, question, value, checked)
  });

  renderQuestionNav({
    container: els.examQuestionNav,
    session,
    onClick: (index) => {
      session.currentIndex = index;
      renderExam();
    }
  });

  updateButtonState(els.examPrevBtn, session.currentIndex === 0);
  updateButtonState(els.examNextBtn, session.currentIndex === total - 1);
  if (els.examMarkBtn) {
    els.examMarkBtn.textContent = session.marked.has(question.id) ? "Avmarkera" : "Markera";
  }
}

function maybeShowBreakNotice(session) {
  const breaksEnabled = !!els.examEnableBreaks?.checked;
  if (!breaksEnabled) {
    els.examBreakNotice?.classList.add("hidden");
    return;
  }

  const currentHumanIndex = session.currentIndex + 1;
  const breakPoints = [61, 121];

  if (breakPoints.includes(currentHumanIndex) && !state.breakShownAt.has(currentHumanIndex)) {
    state.breakShownAt.add(currentHumanIndex);
    if (els.examBreakText) {
      const previousBlockEnd = currentHumanIndex - 1;
      els.examBreakText.textContent = `Du har nu passerat fråga ${previousBlockEnd}. Det här är en rekommenderad paus innan du fortsätter.`;
    }
    els.examBreakNotice?.classList.remove("hidden");
  }
}

function continueAfterBreak() {
  els.examBreakNotice?.classList.add("hidden");
}

function moveExam(direction) {
  const session = state.examSession;
  if (!session) return;
  const nextIndex = session.currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= session.questions.length) return;
  session.currentIndex = nextIndex;
  renderExam();
}

function toggleExamMark() {
  const session = state.examSession;
  if (!session) return;
  const q = session.questions[session.currentIndex];
  toggleMarked(session, q.id);
  renderExam();
}

function finishExamSession() {
  const session = state.examSession;
  if (!session) return;
  clearExamTimer();
  const result = buildResult(session);
  saveResult(result);
  renderReview();
  switchView("review");
}

function updateSessionAnswer(session, question, value, checked) {
  let answers = session.answers[question.id] || [];

  if (question.type === "multiple") {
    const set = new Set(answers);
    if (checked) set.add(value);
    else set.delete(value);
    answers = [...set].sort();
  } else {
    answers = checked ? [value] : [];
  }

  session.answers[question.id] = answers;
  if (session === state.practiceSession) {
    renderPractice();
  } else if (session === state.examSession) {
    renderExam();
  }
}

function toggleMarked(session, questionId) {
  if (session.marked.has(questionId)) session.marked.delete(questionId);
  else session.marked.add(questionId);
}

function renderOptions({ container, question, selectedAnswers, disabled, onChange }) {
  if (!container) return;
  container.innerHTML = "";

  question.options.forEach((option) => {
    const label = document.createElement("label");
    label.className = "option-item";

    const input = document.createElement("input");
    input.type = question.type === "multiple" ? "checkbox" : "radio";
    input.name = `question-${question.id}`;
    input.value = option.id;
    input.checked = selectedAnswers.includes(option.id);
    input.disabled = disabled;
    input.addEventListener("change", () => onChange(option.id, input.checked));

    const bubble = document.createElement("span");
    bubble.className = "option-badge";
    bubble.textContent = option.id;

    const text = document.createElement("span");
    text.className = "option-text";
    text.textContent = option.text;

    label.appendChild(input);
    label.appendChild(bubble);
    label.appendChild(text);

    container.appendChild(label);
  });
}

function renderQuestionNav({ container, session, onClick }) {
  if (!container) return;
  container.innerHTML = "";

  session.questions.forEach((question, index) => {
    const btn = document.createElement("button");
    btn.className = "question-nav-btn";
    btn.textContent = String(index + 1);

    if (index === session.currentIndex) btn.classList.add("active");
    if ((session.answers[question.id] || []).length) btn.classList.add("answered");
    if (session.marked.has(question.id)) btn.classList.add("marked");

    btn.addEventListener("click", () => onClick(index));
    container.appendChild(btn);
  });
}

function getAnsweredCount(session) {
  return session.questions.filter((q) => (session.answers[q.id] || []).length > 0).length;
}

function buildResult(session) {
  session.completed = true;

  const details = session.questions.map((q, index) => {
    const userAnswer = (session.answers[q.id] || []).slice().sort();
    const correctAnswer = q.correctAnswers.slice().sort();
    const isCorrect = arraysEqual(userAnswer, correctAnswer);

    return {
      index: index + 1,
      question: q,
      userAnswer,
      correctAnswer,
      isCorrect
    };
  });

  const correctCount = details.filter((d) => d.isCorrect).length;
  const incorrectCount = details.length - correctCount;
  const scorePercent = details.length ? Math.round((correctCount / details.length) * 100) : 0;

  const domainBreakdownMap = new Map();
  details.forEach((detail) => {
    const domain = detail.question.domain || "Okänd";
    if (!domainBreakdownMap.has(domain)) {
      domainBreakdownMap.set(domain, { domain, total: 0, correct: 0 });
    }
    const entry = domainBreakdownMap.get(domain);
    entry.total += 1;
    if (detail.isCorrect) entry.correct += 1;
  });

  const domainBreakdown = [...domainBreakdownMap.values()].map((entry) => ({
    ...entry,
    percent: entry.total ? Math.round((entry.correct / entry.total) * 100) : 0
  }));

  return {
    mode: session.mode,
    total: details.length,
    correctCount,
    incorrectCount,
    scorePercent,
    details,
    domainBreakdown,
    completedAt: new Date().toISOString()
  };
}

function saveResult(result) {
  state.review = result;

  try {
    localStorage.setItem("pmpTrainerLastResult", JSON.stringify(result));
  } catch (error) {
    console.warn("Kunde inte spara senaste resultat lokalt.", error);
  }

  renderRecentResultSummary();
}

function restoreRecentResult() {
  try {
    const raw = localStorage.getItem("pmpTrainerLastResult");
    if (!raw) return;
    state.review = JSON.parse(raw);
  } catch (error) {
    console.warn("Kunde inte läsa senaste resultat lokalt.", error);
  }
}

function renderRecentResultSummary() {
  if (!els.recentResultSummary) return;
  if (!state.review) {
    els.recentResultSummary.textContent = "Inga sparade resultat ännu.";
    return;
  }

  els.recentResultSummary.innerHTML = `
    <strong>${escapeHtml(state.review.mode)}</strong><br>
    Resultat: ${state.review.scorePercent}%<br>
    Rätt: ${state.review.correctCount} av ${state.review.total}
  `;
}

function renderReview() {
  if (!state.review) {
    els.reviewEmpty?.classList.remove("hidden");
    els.reviewContent?.classList.add("hidden");
    return;
  }

  els.reviewEmpty?.classList.add("hidden");
  els.reviewContent?.classList.remove("hidden");

  setText(els.reviewScorePercent, `${state.review.scorePercent}%`);
  setText(els.reviewCorrectCount, String(state.review.correctCount));
  setText(els.reviewIncorrectCount, String(state.review.incorrectCount));
  setText(els.reviewMode, state.review.mode);

  renderDomainBreakdown();
  renderReviewQuestions();
}

function renderDomainBreakdown() {
  if (!els.reviewDomainBreakdown || !state.review) return;
  els.reviewDomainBreakdown.innerHTML = "";

  state.review.domainBreakdown.forEach((item) => {
    const row = document.createElement("div");
    row.className = "domain-breakdown-row";
    row.innerHTML = `
      <div class="domain-breakdown-top">
        <span>${escapeHtml(item.domain)}</span>
        <span>${item.correct}/${item.total} (${item.percent}%)</span>
      </div>
      <div class="bar">
        <div class="fill fill-generic" style="width:${item.percent}%"></div>
      </div>
    `;
    els.reviewDomainBreakdown.appendChild(row);
  });
}

function renderReviewQuestions() {
  if (!els.reviewQuestions || !state.review || !els.reviewItemTemplate) return;

  const statusFilter = els.reviewFilterStatus?.value || "all";
  const domainFilter = els.reviewFilterDomain?.value || "";

  const filtered = state.review.details.filter((item) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "correct" && item.isCorrect) ||
      (statusFilter === "incorrect" && !item.isCorrect);

    const matchesDomain = !domainFilter || item.question.domain === domainFilter;

    return matchesStatus && matchesDomain;
  });

  els.reviewQuestions.innerHTML = "";

  filtered.forEach((item) => {
    const clone = els.reviewItemTemplate.content.cloneNode(true);
    const root = clone.querySelector(".review-item");

    clone.querySelector(".review-domain").textContent = item.question.domain;
    clone.querySelector(".review-task").textContent = formatTaskLabel(item.question);
    clone.querySelector(".review-type").textContent = questionTypeLabel(item.question.type);
    clone.querySelector(".review-difficulty").textContent = item.question.difficultyLabel;

    const statusEl = clone.querySelector(".review-status");
    statusEl.textContent = item.isCorrect ? "Rätt" : "Fel";
    statusEl.classList.add(item.isCorrect ? "status-correct" : "status-incorrect");

    const caseBlock = clone.querySelector(".review-case");
    const caseText = clone.querySelector(".review-case-text");
    const exhibitBlock = clone.querySelector(".review-exhibit");
    const exhibitContent = clone.querySelector(".review-exhibit-content");
    renderCaseAndExhibit(item.question, caseBlock, caseText, exhibitBlock, exhibitContent);

    clone.querySelector(".review-question-title").textContent = `${item.index}. Fråga`;
    clone.querySelector(".review-question-text").textContent = item.question.question;
    clone.querySelector(".review-user-answer").textContent = formatAnswerForDisplay(item.question, item.userAnswer);
    clone.querySelector(".review-correct-answer").textContent = formatAnswerForDisplay(item.question, item.correctAnswer);
    clone.querySelector(".review-explanation-text").textContent = item.question.explanation || "Ingen förklaring tillgänglig.";

    if (root) {
      root.classList.add(item.isCorrect ? "review-correct" : "review-incorrect");
    }

    els.reviewQuestions.appendChild(clone);
  });
}

function formatAnswerForDisplay(question, answerIds) {
  if (!answerIds || !answerIds.length) return "Inget svar";
  return answerIds
    .map((id) => {
      const option = question.options.find((o) => o.id === id);
      return option ? `${id}. ${option.text}` : id;
    })
    .join(" | ");
}

function renderCaseAndExhibit(question, caseBlock, caseText, exhibitBlock, exhibitContent) {
  const hasCase = !!question.caseText;
  const hasExhibit = !!question.exhibitContent;

  if (caseBlock) caseBlock.classList.toggle("hidden", !hasCase);
  if (caseText) caseText.innerHTML = hasCase ? escapeHtml(question.caseText).replace(/\n/g, "<br>") : "";

  if (exhibitBlock) exhibitBlock.classList.toggle("hidden", !hasExhibit);
  if (exhibitContent) {
    exhibitContent.innerHTML = hasExhibit ? escapeHtml(question.exhibitContent).replace(/\n/g, "<br>") : "";
  }
}

function questionTypeLabel(type) {
  if (type === "multiple") return "Multiple";
  if (type === "case") return "Case";
  if (type === "exhibit") return "Exhibit";
  return "Single";
}

function instructionText(type) {
  if (type === "multiple") return "Välj alla alternativ som är korrekta.";
  return "Välj det bästa svaret.";
}

function updateButtonState(button, disabled) {
  if (button) button.disabled = !!disabled;
}

function setText(el, text) {
  if (el) el.textContent = text;
}

function setHtml(el, html) {
  if (el) el.innerHTML = html;
}

function setWidth(el, percent) {
  if (el) el.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}