const APP_STATE = {
  questions: [],
  filteredPracticePool: [],
  practiceSession: null,
  examSession: null,
  lastReview: null,
  currentView: "home",
  timerInterval: null
};

const DOMAIN_CONFIG = {
  People: {
    label: "People",
    weight: 0.33,
    colorClass: "fill-people"
  },
  Process: {
    label: "Process",
    weight: 0.41,
    colorClass: "fill-process"
  },
  "Business Environment": {
    label: "Business Environment",
    weight: 0.26,
    colorClass: "fill-business"
  }
};

const DIFFICULTY_LABELS = {
  easy: "Lätt",
  medium: "Medel",
  hard: "Svår"
};

const QUESTION_TYPE_LABELS = {
  single: "Single response",
  multiple: "Multiple response",
  case: "Case set",
  exhibit: "Exhibit"
};

document.addEventListener("DOMContentLoaded", async () => {
  bindNavigation();
  bindHomeActions();
  bindPracticeActions();
  bindExamActions();
  bindReviewActions();
  restoreLastReview();

  try {
    const questions = await loadQuestions();
    APP_STATE.questions = normalizeQuestions(questions);
    initializeFilters(APP_STATE.questions);
    updateHomeStats();
    renderRecentResultSummary();
  } catch (error) {
    console.error(error);
    alert(
      "Kunde inte läsa frågebanken. Kontrollera att data/questions.json finns och att appen körs via lokal server om webbläsaren blockerar lokala filer."
    );
  }
});

async function loadQuestions() {
  const response = await fetch("./data/questions.json");
  if (!response.ok) {
    throw new Error(`Misslyckades att läsa questions.json: ${response.status}`);
  }
  return response.json();
}

function normalizeQuestions(rawQuestions) {
  return rawQuestions.map((question, index) => {
    const normalized = {
      id: question.id || `Q${String(index + 1).padStart(4, "0")}`,
      title: question.title || `Fråga ${index + 1}`,
      domain: question.domain || "Process",
      task: question.task || "General",
      difficulty: question.difficulty || "medium",
      questionType: question.questionType || question.type || "single",
      tags: Array.isArray(question.tags) ? question.tags : [],
      stem: question.stem || question.question || "",
      instruction:
        question.instruction ||
        buildInstruction(question.questionType || question.type || "single", question.correctAnswers),
      options: normalizeOptions(question.options || []),
      correctAnswers: normalizeCorrectAnswers(question.correctAnswers, question.correctAnswer),
      explanation: question.explanation || "Ingen förklaring tillgänglig.",
      caseText: question.caseText || question.case || "",
      exhibit: normalizeExhibit(question.exhibit || null)
    };

    return normalized;
  });
}

function normalizeOptions(options) {
  return options.map((option, index) => {
    if (typeof option === "string") {
      return {
        id: String.fromCharCode(65 + index),
        text: option
      };
    }
    return {
      id: option.id || String.fromCharCode(65 + index),
      text: option.text || ""
    };
  });
}

function normalizeCorrectAnswers(correctAnswers, fallbackCorrectAnswer) {
  if (Array.isArray(correctAnswers)) {
    return [...correctAnswers];
  }
  if (typeof correctAnswers === "string") {
    return [correctAnswers];
  }
  if (Array.isArray(fallbackCorrectAnswer)) {
    return [...fallbackCorrectAnswer];
  }
  if (typeof fallbackCorrectAnswer === "string") {
    return [fallbackCorrectAnswer];
  }
  return [];
}

function normalizeExhibit(exhibit) {
  if (!exhibit) return null;
  if (typeof exhibit === "string") {
    return {
      type: "text",
      content: exhibit
    };
  }
  return {
    type: exhibit.type || "text",
    content: exhibit.content || exhibit.text || "",
    headers: exhibit.headers || [],
    rows: exhibit.rows || []
  };
}

function buildInstruction(questionType, correctAnswers = []) {
  if (questionType === "multiple") {
    const count = Array.isArray(correctAnswers) ? correctAnswers.length : 2;
    return `Välj ${count} svarsalternativ.`;
  }
  return "Välj ett svarsalternativ.";
}

function bindNavigation() {
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.view);
    });
  });
}

function bindHomeActions() {
  document.getElementById("startPracticeBtn").addEventListener("click", () => {
    setView("practice");
  });

  document.getElementById("startExamBtn").addEventListener("click", () => {
    setView("exam");
  });
}

function setView(viewName) {
  APP_STATE.currentView = viewName;

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === `view-${viewName}`);
  });

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  if (viewName === "review") {
    renderReview();
  }
}

function initializeFilters(questions) {
  populateDomainSelects(questions);
  populateTaskSelects(questions);
  populateTagSelects(questions);
}

function populateDomainSelects(questions) {
  const domains = [...new Set(questions.map((q) => q.domain))].sort();
  const domainSelects = [
    document.getElementById("practiceDomain"),
    document.getElementById("reviewFilterDomain")
  ];

  domainSelects.forEach((select) => {
    if (!select) return;
    clearSelectOptions(select, select.id === "reviewFilterDomain" ? "Alla domäner" : "Alla domäner");
    domains.forEach((domain) => {
      const option = document.createElement("option");
      option.value = domain;
      option.textContent = domain;
      select.appendChild(option);
    });
  });
}

function populateTaskSelects(questions, selectedDomain = "") {
  const taskSelect = document.getElementById("practiceTask");
  const tasks = [...new Set(
    questions
      .filter((q) => !selectedDomain || q.domain === selectedDomain)
      .map((q) => q.task)
  )].sort();

  clearSelectOptions(taskSelect, "Alla tasks");
  tasks.forEach((task) => {
    const option = document.createElement("option");
    option.value = task;
    option.textContent = task;
    taskSelect.appendChild(option);
  });
}

function populateTagSelects(questions, selectedDomain = "", selectedTask = "") {
  const tagSelect = document.getElementById("practiceTag");
  const tags = [...new Set(
    questions
      .filter((q) => (!selectedDomain || q.domain === selectedDomain) && (!selectedTask || q.task === selectedTask))
      .flatMap((q) => q.tags)
  )].sort();

  clearSelectOptions(tagSelect, "Alla taggar");
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagSelect.appendChild(option);
  });
}

function clearSelectOptions(select, firstLabel) {
  select.innerHTML = "";
  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = firstLabel;
  select.appendChild(firstOption);
}

function updateHomeStats() {
  document.getElementById("statsTotalQuestions").textContent = APP_STATE.questions.length;
}

function bindPracticeActions() {
  const practiceDomain = document.getElementById("practiceDomain");
  const practiceTask = document.getElementById("practiceTask");

  practiceDomain.addEventListener("change", () => {
    populateTaskSelects(APP_STATE.questions, practiceDomain.value);
    populateTagSelects(APP_STATE.questions, practiceDomain.value, practiceTask.value);
  });

  practiceTask.addEventListener("change", () => {
    populateTagSelects(APP_STATE.questions, practiceDomain.value, practiceTask.value);
  });

  document.getElementById("practiceGenerateBtn").addEventListener("click", startPracticeSession);
  document.getElementById("practiceResetFiltersBtn").addEventListener("click", resetPracticeFilters);
  document.getElementById("practicePrevBtn").addEventListener("click", () => moveInSession("practice", -1));
  document.getElementById("practiceNextBtn").addEventListener("click", () => moveInSession("practice", 1));
  document.getElementById("practiceMarkBtn").addEventListener("click", () => toggleMark("practice"));
  document.getElementById("practiceFinishBtn").addEventListener("click", finishPracticeSession);
}

function resetPracticeFilters() {
  document.getElementById("practiceDomain").value = "";
  document.getElementById("practiceTask").value = "";
  document.getElementById("practiceDifficulty").value = "";
  document.getElementById("practiceQuestionType").value = "";
  document.getElementById("practiceTag").value = "";
  document.getElementById("practiceCount").value = "20";
  populateTaskSelects(APP_STATE.questions, "");
  populateTagSelects(APP_STATE.questions, "", "");
  document.getElementById("practicePoolInfo").textContent = "Filter återställda.";
}

function getPracticeFilters() {
  return {
    domain: document.getElementById("practiceDomain").value,
    task: document.getElementById("practiceTask").value,
    difficulty: document.getElementById("practiceDifficulty").value,
    questionType: document.getElementById("practiceQuestionType").value,
    tag: document.getElementById("practiceTag").value,
    count: Number(document.getElementById("practiceCount").value)
  };
}

function filterQuestionsForPractice(filters) {
  return APP_STATE.questions.filter((question) => {
    if (filters.domain && question.domain !== filters.domain) return false;
    if (filters.task && question.task !== filters.task) return false;
    if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
    if (filters.questionType && question.questionType !== filters.questionType) return false;
    if (filters.tag && !question.tags.includes(filters.tag)) return false;
    return true;
  });
}

function startPracticeSession() {
  const filters = getPracticeFilters();
  const pool = filterQuestionsForPractice(filters);
  APP_STATE.filteredPracticePool = pool;

  const infoBox = document.getElementById("practicePoolInfo");
  if (pool.length === 0) {
    infoBox.textContent = "Inga frågor matchar valda filter.";
    document.getElementById("practiceSession").classList.add("hidden");
    return;
  }

  const selectedQuestions = shuffleArray([...pool]).slice(0, Math.min(filters.count, pool.length));
  APP_STATE.practiceSession = createSession("practice", selectedQuestions, {
    shuffleOptions: false,
    timed: false
  });

  infoBox.textContent = `${pool.length} frågor matchade filtret. Passet innehåller ${selectedQuestions.length} frågor.`;
  document.getElementById("practiceSession").classList.remove("hidden");
  renderSession("practice");
}

function createSession(mode, questions, options = {}) {
  return {
    mode,
    questions: questions.map((question) => prepareQuestionForSession(question, !!options.shuffleOptions)),
    currentIndex: 0,
    answers: {},
    marked: {},
    startedAt: new Date().toISOString(),
    submittedAt: null,
    shuffleOptions: !!options.shuffleOptions,
    totalSeconds: options.totalSeconds || null,
    remainingSeconds: options.totalSeconds || null,
    breaksEnabled: !!options.breaksEnabled,
    pendingBreakAt: null
  };
}

function prepareQuestionForSession(question, shuffleOptionsEnabled) {
  const clonedQuestion = deepClone(question);

  if (!shuffleOptionsEnabled) {
    return clonedQuestion;
  }

  const originalOptions = [...clonedQuestion.options];
  const shuffledOptions = shuffleArray([...originalOptions]);

  clonedQuestion.options = shuffledOptions;
  return clonedQuestion;
}

function moveInSession(mode, delta) {
  const session = getSession(mode);
  if (!session) return;

  const nextIndex = session.currentIndex + delta;
  if (nextIndex < 0 || nextIndex >= session.questions.length) return;

  session.currentIndex = nextIndex;

  if (mode === "exam") {
    maybeTriggerBreak(session);
  }

  renderSession(mode);
}

function toggleMark(mode) {
  const session = getSession(mode);
  if (!session) return;

  const question = session.questions[session.currentIndex];
  session.marked[question.id] = !session.marked[question.id];
  renderSession(mode);
}

function finishPracticeSession() {
  const session = APP_STATE.practiceSession;
  if (!session) return;

  if (!confirm("Vill du avsluta övningspasset och rätta dina svar?")) {
    return;
  }

  session.submittedAt = new Date().toISOString();
  const reviewData = buildReviewData(session);
  APP_STATE.lastReview = reviewData;
  persistLastReview();
  renderRecentResultSummary();
  setView("review");
}

function getSession(mode) {
  return mode === "practice" ? APP_STATE.practiceSession : APP_STATE.examSession;
}

function renderSession(mode) {
  const session = getSession(mode);
  if (!session || !session.questions.length) return;

  const question = session.questions[session.currentIndex];
  const prefix = mode === "practice" ? "practice" : "exam";

  renderQuestionMeta(prefix, question);
  renderQuestionBody(prefix, question);
  renderQuestionOptions(prefix, question, session);
  renderQuestionNavigation(prefix, session);
  renderSessionStatus(prefix, session);

  document.getElementById(`${prefix}PrevBtn`).disabled = session.currentIndex === 0;
  document.getElementById(`${prefix}NextBtn`).disabled = session.currentIndex === session.questions.length - 1;

  const markBtn = document.getElementById(`${prefix}MarkBtn`);
  markBtn.textContent = session.marked[question.id] ? "Avmarkera" : "Markera";
}

function renderQuestionMeta(prefix, question) {
  document.getElementById(`${prefix}MetaDomain`).textContent = question.domain;
  document.getElementById(`${prefix}MetaTask`).textContent = question.task;
  document.getElementById(`${prefix}MetaType`).textContent = QUESTION_TYPE_LABELS[question.questionType] || question.questionType;
  document.getElementById(`${prefix}MetaDifficulty`).textContent = DIFFICULTY_LABELS[question.difficulty] || question.difficulty;

  document.getElementById(`${prefix}QuestionTitle`).textContent = question.title;
  document.getElementById(`${prefix}QuestionInstruction`).textContent = question.instruction || "";
}

function renderQuestionBody(prefix, question) {
  const questionText = document.getElementById(`${prefix}QuestionText`);
  questionText.innerHTML = formatText(question.stem);

  const caseBlock = document.getElementById(`${prefix}CaseBlock`);
  const caseText = document.getElementById(`${prefix}CaseText`);
  if (question.caseText) {
    caseBlock.classList.remove("hidden");
    caseText.innerHTML = formatText(question.caseText);
  } else {
    caseBlock.classList.add("hidden");
    caseText.innerHTML = "";
  }

  const exhibitBlock = document.getElementById(`${prefix}ExhibitBlock`);
  const exhibitContent = document.getElementById(`${prefix}ExhibitContent`);
  if (question.exhibit) {
    exhibitBlock.classList.remove("hidden");
    exhibitContent.innerHTML = renderExhibit(question.exhibit);
  } else {
    exhibitBlock.classList.add("hidden");
    exhibitContent.innerHTML = "";
  }
}

function renderQuestionOptions(prefix, question, session) {
  const optionsContainer = document.getElementById(`${prefix}Options`);
  optionsContainer.innerHTML = "";

  const selectedAnswers = session.answers[question.id] || [];
  const inputType = question.questionType === "multiple" ? "checkbox" : "radio";
  const inputName = `${prefix}-${question.id}`;

  question.options.forEach((option) => {
    const optionEl = document.createElement("label");
    optionEl.className = "option";
    if (selectedAnswers.includes(option.id)) {
      optionEl.classList.add("selected");
    }

    const input = document.createElement("input");
    input.type = inputType;
    input.name = inputName;
    input.value = option.id;
    input.checked = selectedAnswers.includes(option.id);

    input.addEventListener("change", () => {
      updateAnswerForQuestion(session, question, option.id, input.checked);
      renderQuestionOptions(prefix, question, session);
      renderSessionStatus(prefix, session);
      renderQuestionNavigation(prefix, session);
    });

    const label = document.createElement("div");
    label.className = "option-label";
    label.textContent = option.id;

    const text = document.createElement("div");
    text.className = "option-text";
    text.innerHTML = formatText(option.text);

    optionEl.appendChild(input);
    optionEl.appendChild(label);
    optionEl.appendChild(text);
    optionsContainer.appendChild(optionEl);
  });
}

function updateAnswerForQuestion(session, question, optionId, isChecked) {
  const current = session.answers[question.id] ? [...session.answers[question.id]] : [];

  if (question.questionType === "multiple") {
    if (isChecked) {
      if (!current.includes(optionId)) {
        current.push(optionId);
      }
    } else {
      const index = current.indexOf(optionId);
      if (index >= 0) {
        current.splice(index, 1);
      }
    }
  } else {
    current.length = 0;
    if (isChecked) {
      current.push(optionId);
    }
  }

  session.answers[question.id] = current;
}

function renderQuestionNavigation(prefix, session) {
  const navContainer = document.getElementById(`${prefix}QuestionNav`);
  navContainer.innerHTML = "";

  session.questions.forEach((question, index) => {
    const button = document.createElement("button");
    button.className = "qnav-btn";
    button.textContent = String(index + 1);
    if (index === session.currentIndex) button.classList.add("current");
    if ((session.answers[question.id] || []).length > 0) button.classList.add("answered");
    if (session.marked[question.id]) button.classList.add("marked");

    button.addEventListener("click", () => {
      session.currentIndex = index;
      if (session.mode === "exam") {
        maybeTriggerBreak(session);
      }
      renderSession(session.mode);
    });

    navContainer.appendChild(button);
  });
}

function renderSessionStatus(prefix, session) {
  const answeredCount = session.questions.filter((q) => (session.answers[q.id] || []).length > 0).length;
  const unansweredCount = session.questions.length - answeredCount;
  const markedCount = session.questions.filter((q) => !!session.marked[q.id]).length;
  const currentPosition = session.currentIndex + 1;
  const totalCount = session.questions.length;
  const progressPercent = Math.round((currentPosition / totalCount) * 100);

  document.getElementById(`${prefix}ProgressText`).textContent = `Fråga ${currentPosition} av ${totalCount}`;
  document.getElementById(`${prefix}ProgressBar`).style.width = `${progressPercent}%`;
  document.getElementById(`${prefix}AnsweredCount`).textContent = String(answeredCount);

  const unansweredEl = document.getElementById(`${prefix}UnansweredCount`);
  if (unansweredEl) {
    unansweredEl.textContent = String(unansweredCount);
  }

  const markedEl = document.getElementById(`${prefix}MarkedCount`);
  if (markedEl) {
    markedEl.textContent = String(markedCount);
  }
}

function bindExamActions() {
  document.getElementById("examStartBtn").addEventListener("click", startExamSession);
  document.getElementById("examPrevBtn").addEventListener("click", () => moveInSession("exam", -1));
  document.getElementById("examNextBtn").addEventListener("click", () => moveInSession("exam", 1));
  document.getElementById("examMarkBtn").addEventListener("click", () => toggleMark("exam"));
  document.getElementById("examFinishBtn").addEventListener("click", finishExamSession);
  document.getElementById("examContinueAfterBreakBtn").addEventListener("click", continueAfterBreak);
}

function startExamSession() {
  stopTimer();

  const shuffleQuestions = document.getElementById("examShuffleQuestions").checked;
  const shuffleOptions = document.getElementById("examShuffleOptions").checked;
  const breaksEnabled = document.getElementById("examEnableBreaks").checked;

  const examQuestions = buildExamQuestionSet(APP_STATE.questions);
  const finalQuestions = shuffleQuestions ? shuffleArray(examQuestions) : examQuestions;

  APP_STATE.examSession = createSession("exam", finalQuestions, {
    shuffleOptions,
    timed: true,
    totalSeconds: 240 * 60,
    breaksEnabled
  });

  document.getElementById("examSetup").classList.add("hidden");
  document.getElementById("examSession").classList.remove("hidden");
  document.getElementById("examBreakNotice").classList.add("hidden");

  renderSession("exam");
  renderExamTimer();
  startTimer();
}

function buildExamQuestionSet(allQuestions) {
  const total = 180;
  const targetByDomain = {
    People: 59,
    Process: 74,
    "Business Environment": 47
  };

  const selected = [];

  Object.entries(targetByDomain).forEach(([domain, count]) => {
    const domainQuestions = allQuestions.filter((q) => q.domain === domain);
    const picked = smartPickQuestions(domainQuestions, count);
    selected.push(...picked);
  });

  if (selected.length < total) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const fillers = shuffleArray(allQuestions.filter((q) => !selectedIds.has(q.id))).slice(0, total - selected.length);
    selected.push(...fillers);
  }

  return selected.slice(0, total);
}

function smartPickQuestions(pool, count) {
  if (pool.length <= count) {
    return shuffleArray([...pool]);
  }

  const byType = groupBy(pool, (q) => q.questionType);
  const byDifficulty = groupBy(pool, (q) => q.difficulty);

  const desiredTypeRatios = {
    single: 0.55,
    multiple: 0.18,
    case: 0.15,
    exhibit: 0.12
  };

  const desiredDifficultyRatios = {
    easy: 0.18,
    medium: 0.56,
    hard: 0.26
  };

  const selectedMap = new Map();

  Object.entries(desiredTypeRatios).forEach(([type, ratio]) => {
    const target = Math.round(count * ratio);
    const candidates = shuffleArray([...(byType[type] || [])]).slice(0, target);
    candidates.forEach((q) => selectedMap.set(q.id, q));
  });

  if (selectedMap.size < count) {
    Object.entries(desiredDifficultyRatios).forEach(([difficulty, ratio]) => {
      const target = Math.round(count * ratio);
      const candidates = shuffleArray([...(byDifficulty[difficulty] || [])]);
      for (const q of candidates) {
        if (selectedMap.size >= count) break;
        selectedMap.set(q.id, q);
      }
      while (selectedMap.size > count && target < selectedMap.size) {
        break;
      }
    });
  }

  if (selectedMap.size < count) {
    shuffleArray([...pool]).forEach((q) => {
      if (selectedMap.size < count) {
        selectedMap.set(q.id, q);
      }
    });
  }

  return [...selectedMap.values()].slice(0, count);
}

function maybeTriggerBreak(session) {
  if (!session.breaksEnabled) return;
  const currentNumber = session.currentIndex + 1;

  if (currentNumber === 61 && session.pendingBreakAt !== 60) {
    session.pendingBreakAt = 60;
  } else if (currentNumber === 121 && session.pendingBreakAt !== 120) {
    session.pendingBreakAt = 120;
  }

  if (session.pendingBreakAt) {
    const breakNotice = document.getElementById("examBreakNotice");
    const breakText = document.getElementById("examBreakText");

    breakText.textContent =
      session.pendingBreakAt === 60
        ? "Du har avslutat första blocket. Ta en frivillig paus innan du fortsätter med fråga 61."
        : "Du har avslutat andra blocket. Ta en frivillig paus innan du fortsätter med fråga 121.";

    breakNotice.classList.remove("hidden");
    document.getElementById("examQuestionCard").classList.add("hidden");
  }
}

function continueAfterBreak() {
  const session = APP_STATE.examSession;
  if (!session) return;

  session.pendingBreakAt = null;
  document.getElementById("examBreakNotice").classList.add("hidden");
  document.getElementById("examQuestionCard").classList.remove("hidden");
  renderSession("exam");
}

function startTimer() {
  stopTimer();
  APP_STATE.timerInterval = window.setInterval(() => {
    if (!APP_STATE.examSession) return;

    APP_STATE.examSession.remainingSeconds -= 1;
    renderExamTimer();

    if (APP_STATE.examSession.remainingSeconds <= 0) {
      stopTimer();
      finishExamSession(true);
    }
  }, 1000);
}

function stopTimer() {
  if (APP_STATE.timerInterval) {
    clearInterval(APP_STATE.timerInterval);
    APP_STATE.timerInterval = null;
  }
}

function renderExamTimer() {
  const session = APP_STATE.examSession;
  if (!session) return;

  const timerEl = document.getElementById("examTimer");
  timerEl.textContent = formatSeconds(session.remainingSeconds);

  if (session.remainingSeconds <= 15 * 60) {
    timerEl.style.color = "var(--danger)";
  } else if (session.remainingSeconds <= 45 * 60) {
    timerEl.style.color = "var(--warning)";
  } else {
    timerEl.style.color = "var(--danger)";
  }
}

function finishExamSession(autoSubmit = false) {
  const session = APP_STATE.examSession;
  if (!session) return;

  if (!autoSubmit) {
    const unanswered = session.questions.filter((q) => (session.answers[q.id] || []).length === 0).length;
    const ok = confirm(
      unanswered > 0
        ? `Du har ${unanswered} obesvarade frågor. Vill du lämna in provet ändå?`
        : "Vill du lämna in provet?"
    );

    if (!ok) return;
  }

  stopTimer();

  session.submittedAt = new Date().toISOString();
  const reviewData = buildReviewData(session);
  APP_STATE.lastReview = reviewData;
  persistLastReview();
  renderRecentResultSummary();

  document.getElementById("examSession").classList.add("hidden");
  document.getElementById("examSetup").classList.remove("hidden");

  setView("review");
}

function buildReviewData(session) {
  const results = session.questions.map((question, index) => {
    const userAnswer = [...(session.answers[question.id] || [])].sort();
    const correctAnswer = [...question.correctAnswers].sort();
    const isCorrect = arraysEqual(userAnswer, correctAnswer);

    return {
      id: question.id,
      order: index + 1,
      title: question.title,
      domain: question.domain,
      task: question.task,
      difficulty: question.difficulty,
      questionType: question.questionType,
      instruction: question.instruction,
      stem: question.stem,
      caseText: question.caseText,
      exhibit: question.exhibit,
      options: question.options,
      userAnswer,
      correctAnswer,
      isCorrect,
      explanation: question.explanation
    };
  });

  const correctCount = results.filter((r) => r.isCorrect).length;
  const incorrectCount = results.length - correctCount;
  const scorePercent = results.length ? Math.round((correctCount / results.length) * 100) : 0;

  return {
    mode: session.mode,
    startedAt: session.startedAt,
    submittedAt: session.submittedAt,
    totalQuestions: results.length,
    correctCount,
    incorrectCount,
    scorePercent,
    remainingSeconds: session.remainingSeconds,
    results,
    domainBreakdown: buildDomainBreakdown(results)
  };
}

function buildDomainBreakdown(results) {
  const domains = [...new Set(results.map((result) => result.domain))];
  return domains.map((domain) => {
    const domainResults = results.filter((result) => result.domain === domain);
    const correct = domainResults.filter((result) => result.isCorrect).length;
    const total = domainResults.length;

    return {
      domain,
      total,
      correct,
      incorrect: total - correct,
      percent: total ? Math.round((correct / total) * 100) : 0
    };
  });
}

function persistLastReview() {
  localStorage.setItem("pmpTrainerLastReview", JSON.stringify(APP_STATE.lastReview));
}

function restoreLastReview() {
  try {
    const raw = localStorage.getItem("pmpTrainerLastReview");
    if (!raw) return;
    APP_STATE.lastReview = JSON.parse(raw);
  } catch (error) {
    console.warn("Kunde inte återställa tidigare resultat:", error);
  }
}

function renderRecentResultSummary() {
  const target = document.getElementById("recentResultSummary");
  if (!APP_STATE.lastReview) {
    target.textContent = "Inga sparade resultat ännu.";
    return;
  }

  const modeLabel = APP_STATE.lastReview.mode === "exam" ? "Simulerat prov" : "Övningsläge";
  const date = new Date(APP_STATE.lastReview.submittedAt || APP_STATE.lastReview.startedAt);
  target.innerHTML = `
    <strong>${modeLabel}</strong><br>
    Resultat: <strong>${APP_STATE.lastReview.scorePercent}%</strong><br>
    Rätt: <strong>${APP_STATE.lastReview.correctCount}</strong> / ${APP_STATE.lastReview.totalQuestions}<br>
    Senast genomfört: ${date.toLocaleString("sv-SE")}
  `;
}

function bindReviewActions() {
  document.getElementById("reviewFilterStatus").addEventListener("change", renderReviewResultsOnly);
  document.getElementById("reviewFilterDomain").addEventListener("change", renderReviewResultsOnly);
}

function renderReview() {
  const empty = document.getElementById("reviewEmpty");
  const content = document.getElementById("reviewContent");

  if (!APP_STATE.lastReview) {
    empty.classList.remove("hidden");
    content.classList.add("hidden");
    return;
  }

  empty.classList.add("hidden");
  content.classList.remove("hidden");

  const review = APP_STATE.lastReview;

  document.getElementById("reviewScorePercent").textContent = `${review.scorePercent}%`;
  document.getElementById("reviewCorrectCount").textContent = String(review.correctCount);
  document.getElementById("reviewIncorrectCount").textContent = String(review.incorrectCount);
  document.getElementById("reviewMode").textContent = review.mode === "exam" ? "Simulerat prov" : "Övningsläge";

  renderDomainBreakdown(review.domainBreakdown);
  renderReviewResultsOnly();
}

function renderDomainBreakdown(domainBreakdown) {
  const container = document.getElementById("reviewDomainBreakdown");
  container.innerHTML = "";

  domainBreakdown.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "domain-breakdown-item";

    wrapper.innerHTML = `
      <div class="domain-breakdown-top">
        <span>${item.domain}</span>
        <span>${item.percent}%</span>
      </div>
      <div class="progress">
        <div class="progress-fill" style="width: ${item.percent}%"></div>
      </div>
      <div class="muted" style="margin-top: 8px;">
        Rätt: ${item.correct} | Fel: ${item.incorrect} | Totalt: ${item.total}
      </div>
    `;

    container.appendChild(wrapper);
  });
}

function renderReviewResultsOnly() {
  if (!APP_STATE.lastReview) return;

  const statusFilter = document.getElementById("reviewFilterStatus").value;
  const domainFilter = document.getElementById("reviewFilterDomain").value;

  let results = [...APP_STATE.lastReview.results];

  if (statusFilter === "correct") {
    results = results.filter((r) => r.isCorrect);
  } else if (statusFilter === "incorrect") {
    results = results.filter((r) => !r.isCorrect);
  }

  if (domainFilter) {
    results = results.filter((r) => r.domain === domainFilter);
  }

  renderReviewItems(results);
}

function renderReviewItems(results) {
  const container = document.getElementById("reviewQuestions");
  const template = document.getElementById("reviewItemTemplate");
  container.innerHTML = "";

  results.forEach((result) => {
    const node = template.content.firstElementChild.cloneNode(true);

    node.querySelector(".review-domain").textContent = result.domain;
    node.querySelector(".review-task").textContent = result.task;
    node.querySelector(".review-type").textContent =
      QUESTION_TYPE_LABELS[result.questionType] || result.questionType;
    node.querySelector(".review-difficulty").textContent =
      DIFFICULTY_LABELS[result.difficulty] || result.difficulty;

    const status = node.querySelector(".review-status");
    status.textContent = result.isCorrect ? "Rätt" : "Fel";
    status.classList.add(result.isCorrect ? "correct" : "incorrect");

    if (result.caseText) {
      node.querySelector(".review-case").classList.remove("hidden");
      node.querySelector(".review-case-text").innerHTML = formatText(result.caseText);
    }

    if (result.exhibit) {
      node.querySelector(".review-exhibit").classList.remove("hidden");
      node.querySelector(".review-exhibit-content").innerHTML = renderExhibit(result.exhibit);
    }

    node.querySelector(".review-question-title").textContent = `${result.order}. ${result.title}`;
    node.querySelector(".review-question-text").innerHTML = formatText(result.stem);

    node.querySelector(".review-user-answer").innerHTML = renderAnswerList(result.userAnswer, result.options);
    node.querySelector(".review-correct-answer").innerHTML = renderAnswerList(result.correctAnswer, result.options);
    node.querySelector(".review-explanation-text").innerHTML = formatText(result.explanation);

    container.appendChild(node);
  });

  if (results.length === 0) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.textContent = "Inga frågor matchar valt filter.";
    container.appendChild(empty);
  }
}

function renderAnswerList(answerIds, options) {
  if (!answerIds || answerIds.length === 0) {
    return "<em>Inget svar</em>";
  }

  const mapped = answerIds.map((id) => {
    const option = options.find((opt) => opt.id === id);
    if (!option) return `<strong>${id}</strong>`;
    return `<strong>${option.id}</strong>: ${escapeHtml(option.text)}`;
  });

  return `<ul class="clean-list">${mapped.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderExhibit(exhibit) {
  if (!exhibit) return "";

  if (exhibit.type === "table") {
    const headers = exhibit.headers || [];
    const rows = exhibit.rows || [];

    return `
      <table class="exhibit-table">
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  return `<div>${formatText(exhibit.content || "")}</div>`;
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, totalSeconds || 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatText(text) {
  return escapeHtml(text)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}