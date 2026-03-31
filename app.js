const state = {
  rawQuestions: [],
  questions: [],
  practicePool: [],
  practiceSession: null,
  examSession: null,
  review: null,
  timerInterval: null,
  breakShownAt: new Set(),
  currentView: "home",
  language: "en"
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
  reviewItemTemplate: document.getElementById("reviewItemTemplate"),

  // Language
  langSvBtn: document.getElementById("langSvBtn"),
  langEnBtn: document.getElementById("langEnBtn"),

  // Auth
  loginOverlay:    document.getElementById("loginOverlay"),
  loginStep1:      document.getElementById("loginStep1"),
  loginStep2:      document.getElementById("loginStep2"),
  loginEmail:      document.getElementById("loginEmail"),
  loginEmailError: document.getElementById("loginEmailError"),
  loginRequestBtn: document.getElementById("loginRequestBtn"),
  loginCode:          document.getElementById("loginCode"),
  loginCodeError:     document.getElementById("loginCodeError"),
  loginVerifyBtn:     document.getElementById("loginVerifyBtn"),
  loginBackBtn:       document.getElementById("loginBackBtn"),
  loginEmailDisplay:  document.getElementById("loginEmailDisplay"),
  userInfo:  document.getElementById("userInfo"),
  userEmail: document.getElementById("userEmail"),
  logoutBtn: document.getElementById("logoutBtn"),
};


// Translations loaded from translations.js
const TRANSLATIONS = window.TRANSLATIONS;


function t(key, vars = {}) {
  const bundle = TRANSLATIONS[state.language] || TRANSLATIONS.en;
  let value = bundle[key] ?? TRANSLATIONS.en[key] ?? key;
  return String(value).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
}

function getStoredLanguage() {
  try {
    const saved = localStorage.getItem("pmpTrainerLanguage");
    return saved === "sv" || saved === "en" ? saved : "en";
  } catch (error) {
    return "en";
  }
}

function setLanguage(language) {
  state.language = language === "sv" ? "sv" : "en";

  try {
    localStorage.setItem("pmpTrainerLanguage", state.language);
  } catch (error) {
    // Ignore storage errors.
  }

  document.documentElement.lang = state.language;
  applyTranslations();
  buildPracticeFilters();
  updateHomeStats();
  updatePracticePoolInfo();
  renderRecentResultSummary();
  renderReview();

  if (state.practiceSession) renderPractice();
  if (state.examSession) {
    renderExamTimer();
    renderExam();
  }
}

function applyTranslations() {
  document.title = t("appTitle");
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute("content", t("metaDescription"));

  const textMap = {
    "#appTitle": t("appTitle"),
    ".subtitle": t("subtitle"),
    "#badgeQuestions": t("badgeQuestions"),
    "#badgeMinutes": t("badgeMinutes"),
    "#badgeScenario": t("badgeScenario"),
    '[data-view="home"]': t("navHome"),
    '[data-view="practice"]': t("navPractice"),
    '[data-view="exam"]': t("navExam"),
    '[data-view="review"]': t("navReview"),
    '[data-view="about"]': t("navAbout"),
    "#homeTitle": t("heroTitle"),
    "#homeIntro": t("heroText"),
    "#startPracticeBtn": t("startPractice"),
    "#startExamBtn": t("startExam"),
    "#statsQuestionsLabel": t("statsQuestions"),
    "#statsDomainsLabel": t("statsDomains"),
    "#statsTasksLabel": t("statsTasks"),
    "#statsExamFormatLabel": t("statsExamFormat"),
    "#examOverviewTitle": t("examOverview"),
    "#examOverviewScenario": t("examOverviewScenario"),
    "#examOverviewTypes": t("examOverviewTypes"),
    "#examOverviewBreaks": t("examOverviewBreaks"),
    "#domainDistributionTitle": t("domainDistribution"),
    "#recentResultsTitle": t("recentResults"),
    "#practiceTitle": t("practiceTitle"),
    "#practiceIntro": t("practiceIntro"),
    'label[for="practiceDomain"]': t("labelDomain"),
    'label[for="practiceTask"]': t("labelTask"),
    'label[for="practiceDifficulty"]': t("labelDifficulty"),
    'label[for="practiceQuestionType"]': t("labelQuestionType"),
    'label[for="practiceTag"]': t("labelTag"),
    'label[for="practiceCount"]': t("labelQuestionCount"),
    "#practiceGenerateBtn": t("generatePractice"),
    "#practiceResetFiltersBtn": t("resetFilters"),
    "#practiceSessionOverviewTitle": t("sessionOverview"),
    "#practiceStatusTitle": t("status"),
    "#practiceAnsweredLabel": t("answered"),
    "#practiceUnansweredLabel": t("unanswered"),
    "#practiceNavigationTitle": t("navigation"),
    "#practiceFinishBtn": t("finishAndReview"),
    "#practicePrevBtn": t("prev"),
    "#practiceNextBtn": t("next"),
    "#examTitle": t("mockExamTitle"),
    "#examIntro": t("mockExamIntro"),
    "#examSettingsTitle": t("settings"),
    "#examShuffleQuestionsLabel": t("shuffleQuestions"),
    "#examShuffleOptionsLabel": t("shuffleOptions"),
    "#examEnableBreaksLabel": t("enableBreaks"),
    "#examFormatTitle": t("examFormat"),
    "#examFormatMix": t("examFormatMix"),
    "#examFormatTypes": t("examFormatTypes"),
    "#examStartBtn": t("startExamAction"),
    "#examTimeRemainingTitle": t("timeRemaining"),
    "#examProgressTitle": t("progress"),
    "#examStatusTitle": t("status"),
    "#examAnsweredLabel": t("answered"),
    "#examMarkedLabel": t("marked"),
    "#examNavigationTitle": t("navigation"),
    "#examFinishBtn": t("submitExam"),
    "#examBreakTitle": t("recommendedBreak"),
    "#examContinueAfterBreakBtn": t("continueExam"),
    "#examPrevBtn": t("prev"),
    "#examNextBtn": t("next"),
    "#reviewTitle": t("reviewTitle"),
    "#reviewIntro": t("reviewIntro"),
    "#reviewEmptyText": t("noResultYet"),
    "#reviewOverviewTitle": t("overview"),
    "#reviewScoreLabel": t("score"),
    "#reviewCorrectLabel": t("correct"),
    "#reviewIncorrectLabel": t("incorrect"),
    "#reviewModeLabel": t("mode"),
    "#reviewByDomainTitle": t("byDomain"),
    'label[for="reviewFilterStatus"]': t("filterStatus"),
    'label[for="reviewFilterDomain"]': t("filterDomain"),
    "#aboutTitle": t("aboutTitle"),
    "#aboutP1": t("aboutP1"),
    "#aboutFilesTitle": t("aboutFiles"),
    "#aboutUseTitle": t("aboutUse"),
    "#aboutNoteTitle": t("aboutNote"),
    "#aboutNoteText": t("aboutNoteText"),
    "#reviewTemplateYourAnswerTitle": t("yourAnswer"),
    "#reviewTemplateCorrectAnswerTitle": t("correctAnswer"),
    "#reviewTemplateExplanationTitle": t("explanation")
  };

  Object.entries(textMap).forEach(([selector, value]) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = value;
    });
  });

  const htmlMap = {
    "#aboutFileIndex": `<code>index.html</code> – ${escapeHtml(t("fileIndex"))}`,
    "#aboutFileStyles": `<code>styles.css</code> – ${escapeHtml(t("fileStyles"))}`,
    "#aboutFileApp": `<code>app.js</code> – ${escapeHtml(t("fileApp"))}`,
    "#aboutFileData": `<code>data/questions.json</code> – ${escapeHtml(t("fileData"))}`,
    "#aboutStep2": `${escapeHtml(t("step2")).replace("questions.json", "")}<code>questions.json</code>${escapeHtml(t("step2").split("questions.json").slice(1).join("questions.json"))}`
  };

  Object.entries(htmlMap).forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = value;
  });

  setText(document.querySelector("#aboutStep1"), t("step1"));
  setText(document.querySelector("#aboutStep3"), t("step3"));
  setText(document.querySelector("#aboutStep4"), t("step4"));

  const practiceDifficultyOptions = els.practiceDifficulty?.options;
  if (practiceDifficultyOptions?.length >= 4) {
    practiceDifficultyOptions[0].textContent = t("allLevels");
    practiceDifficultyOptions[1].textContent = t("diffEasy");
    practiceDifficultyOptions[2].textContent = t("diffMedium");
    practiceDifficultyOptions[3].textContent = t("diffHard");
  }

  const practiceTypeOptions = els.practiceQuestionType?.options;
  if (practiceTypeOptions?.length >= 5) {
    practiceTypeOptions[0].textContent = t("allTypes");
    practiceTypeOptions[1].textContent = t("typeSingle");
    practiceTypeOptions[2].textContent = t("typeMultiple");
    practiceTypeOptions[3].textContent = t("typeCase");
    practiceTypeOptions[4].textContent = t("typeExhibit");
  }

  const reviewStatusOptions = els.reviewFilterStatus?.options;
  if (reviewStatusOptions?.length >= 3) {
    reviewStatusOptions[0].textContent = t("all");
    reviewStatusOptions[1].textContent = t("onlyCorrect");
    reviewStatusOptions[2].textContent = t("onlyIncorrect");
  }

  const isSv = state.language === "sv";
  if (els.langSvBtn) {
    els.langSvBtn.classList.toggle("active", isSv);
    els.langSvBtn.setAttribute("aria-pressed", String(isSv));
  }
  if (els.langEnBtn) {
    els.langEnBtn.classList.toggle("active", !isSv);
    els.langEnBtn.setAttribute("aria-pressed", String(!isSv));
  }
  document.documentElement.lang = state.language;
}

function modeLabel(modeKey) {
  return modeKey === "exam" ? t("modeExam") : t("modePractice");
}


// â”€â”€ Authentication â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const AUTH_TOKEN_KEY = "pmpTrainerToken";

const auth = {
  token: null,
  email: null,
};

async function apiFetch(url, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (auth.token) headers["Authorization"] = `Bearer ${auth.token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function showLoginStep(step) {
  els.loginStep1.classList.toggle("hidden", step !== 1);
  els.loginStep2.classList.toggle("hidden", step !== 2);
  els.loginEmailError.classList.add("hidden");
  els.loginCodeError.classList.add("hidden");
}

function setLoginError(el, msg) {
  el.textContent = msg;
  el.classList.toggle("hidden", !msg);
}

async function checkAuth() {
  const stored = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!stored) return false;

  auth.token = stored;
  const { ok, data } = await apiFetch("/api/auth/me");
  if (!ok) {
    auth.token = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return false;
  }

  auth.email = data.email;
  return true;
}

function showApp() {
  els.loginOverlay.classList.add("hidden");
  if (els.userInfo)  els.userInfo.classList.remove("hidden");
  if (els.userEmail) els.userEmail.textContent = auth.email || "";
}

function showLoginOverlay() {
  els.loginOverlay.classList.remove("hidden");
  if (els.userInfo) els.userInfo.classList.add("hidden");
  showLoginStep(1);
  els.loginEmail.value = "";
  els.loginCode.value  = "";
}

async function handleRequestOTP() {
  const email = els.loginEmail.value.trim();
  setLoginError(els.loginEmailError, "");

  if (!email) {
    setLoginError(els.loginEmailError, "Ange din e-postadress.");
    return;
  }

  els.loginRequestBtn.disabled = true;
  els.loginRequestBtn.textContent = "Skickar…";

  const { ok, data } = await apiFetch("/api/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  els.loginRequestBtn.disabled = false;
  els.loginRequestBtn.textContent = "Skicka inloggningskod";

  if (!ok) {
    setLoginError(els.loginEmailError, data.error || "NÃ¥got gick fel. FÃ¶rsÃ¶k igen.");
    return;
  }

  if (els.loginEmailDisplay) els.loginEmailDisplay.textContent = email;
  showLoginStep(2);
  els.loginCode.focus();
}

async function handleVerifyOTP() {
  const email = els.loginEmail.value.trim();
  const code  = els.loginCode.value.trim();
  setLoginError(els.loginCodeError, "");

  if (!code) {
    setLoginError(els.loginCodeError, "Ange den 6-siffriga koden.");
    return;
  }

  els.loginVerifyBtn.disabled = true;
  els.loginVerifyBtn.textContent = "Verifierar…";

  const { ok, data } = await apiFetch("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });

  els.loginVerifyBtn.disabled = false;
  els.loginVerifyBtn.textContent = "Logga in";

  if (!ok) {
    setLoginError(els.loginCodeError, data.error || "Ogiltig kod. FÃ¶rsÃ¶k igen.");
    return;
  }

  auth.token = data.token;
  auth.email = data.email;
  localStorage.setItem(AUTH_TOKEN_KEY, auth.token);

  showApp();
  init();
}

async function handleLogout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
  auth.token = null;
  auth.email = null;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  showLoginOverlay();
}

function bindAuthEvents() {
  els.loginRequestBtn?.addEventListener("click", handleRequestOTP);
  els.loginVerifyBtn?.addEventListener("click", handleVerifyOTP);
  els.loginBackBtn?.addEventListener("click", () => showLoginStep(1));
  els.logoutBtn?.addEventListener("click", handleLogout);

  els.loginEmail?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleRequestOTP();
  });
  els.loginCode?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleVerifyOTP();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  bindAuthEvents();
  const authenticated = await checkAuth();
  if (authenticated) {
    showApp();
    init();
  } else {
    showLoginOverlay();
  }
});

async function init() {
  state.language = getStoredLanguage();
  bindEvents();
  applyTranslations();
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
  els.langSvBtn?.addEventListener("click", () => setLanguage("sv"));
  els.langEnBtn?.addEventListener("click", () => setLanguage("en"));
}

async function loadQuestions() {
  const candidatePaths = ["./data/questions.json", "./questions.json"];
  let loaded = null;
  let lastError = null;

  for (const path of candidatePaths) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${path}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error(`File ${path} does not contain an array`);
      }
      loaded = data;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!loaded) {
    console.error(lastError);
    alert(t("loadError"));
    return;
  }

  state.rawQuestions = loaded;
  state.questions = loaded.map(normalizeQuestion).filter(Boolean);
}

function normalizeQuestion(q, index) {
  if (!q || typeof q !== "object") return null;

  const rawOptions = Array.isArray(q.options) ? q.options : [];
  const options = normalizeOptions(rawOptions);
  const normalizedType = normalizeQuestionType(q.type, options);
  const normalizedOptions =
    (normalizedType === "case" || normalizedType === "exhibit") && options.length === 0
      ? []
      : options;

  const correctAnswers = normalizeCorrectAnswers(q.correctAnswers || [], normalizedOptions);

  return {
    id: q.id || `Q-${index + 1}`,
    domain: q.domain || t("unknown"),
    taskCode: q.taskCode || "",
    task: q.task || "",
    tags: Array.isArray(q.tags) ? q.tags : [],
    difficulty: normalizeDifficulty(q.difficulty),
    difficultyLabel: difficultyLabelFromValue(normalizeDifficulty(q.difficulty)),
    type: normalizedType,
    question: q.question || "",
    options: normalizedOptions,
    correctAnswers,
    explanation: q.explanation || "",
    caseText: q.caseText ?? q.case ?? "",
    exhibitContent: q.exhibitContent ?? q.exhibit ?? ""
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
    "lÃ¤tt": "easy",
    "medel": "medium",
    "svÃ¥r": "hard",
    "easy": "easy",
    "medium": "medium",
    "hard": "hard"
  };
  const key = String(value || "").trim().toLowerCase();
  return map[key] || "medium";
}

function difficultyLabelFromValue(value) {
  if (value === "easy") return t("diffEasy");
  if (value === "hard") return t("diffHard");
  return t("diffMedium");
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
  populateSelect(els.practiceDomain, uniqueSorted(state.questions.map((q) => q.domain)), t("allDomains"));
  populateSelect(els.practiceTag, uniqueSorted(state.questions.flatMap((q) => q.tags || [])), t("allTags"));
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
  populateSelect(els.practiceTask, tasks, t("allTasks"));
  updatePracticePoolInfo();
}

function populateReviewDomainFilter() {
  populateSelect(els.reviewFilterDomain, uniqueSorted(state.questions.map((q) => q.domain)), t("allDomains"));
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
    String(a).localeCompare(String(b), state.language)
  );
}

function formatTaskLabel(question) {
  return question.taskCode ? `${question.taskCode} – ${question.task}` : question.task;
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
    els.practicePoolInfo.textContent = t("poolNoMatch");
    return;
  }

  const count = Number(els.practiceCount?.value || 20);
  els.practicePoolInfo.textContent = t("poolMatch", { count: filtered.length, selected: Math.min(count, filtered.length) });
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
    alert(t("noMatchingQuestions"));
    return;
  }

  const count = Math.min(Number(els.practiceCount?.value || 20), pool.length);
  const selected = pool.slice(0, count);

  state.practiceSession = createSession({
    modeKey: "practice",
    questions: selected,
    totalSeconds: null,
    shuffleOptions: false
  });

  els.practiceSession?.classList.remove("hidden");
  renderPractice();
}

function createSession({ modeKey, questions, totalSeconds, shuffleOptions }) {
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
    modeKey,
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

  setText(els.practiceProgressText, t("progressQuestion", { current: session.currentIndex + 1, total }));
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

  setText(els.practiceQuestionTitle, t("progressQuestion", { current: session.currentIndex + 1, total }));
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
    els.practiceMarkBtn.textContent = session.marked.has(question.id) ? t("unmark") : t("mark");
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
    alert(t("emptyQuestionBank"));
    return;
  }

  const selected = buildExamQuestionSet(source, 180);
  const shuffleQuestions = !!els.examShuffleQuestions?.checked;
  const shuffleOptions = !!els.examShuffleOptions?.checked;

  const questions = shuffleQuestions ? shuffle(selected) : selected;

  state.examSession = createSession({
    modeKey: "exam",
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

  setText(els.examProgressText, t("progressQuestion", { current: session.currentIndex + 1, total }));
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

  setText(els.examQuestionTitle, t("progressQuestion", { current: session.currentIndex + 1, total }));
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
    els.examMarkBtn.textContent = session.marked.has(question.id) ? t("unmark") : t("mark");
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
      els.examBreakText.textContent = t("breakNotice", { question: previousBlockEnd });
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
    const domain = detail.question.domain || t("unknown");
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
    console.warn(t("saveResultError"), error);
  }

  renderRecentResultSummary();
}

function restoreRecentResult() {
  try {
    const raw = localStorage.getItem("pmpTrainerLastResult");
    if (!raw) return;
    state.review = JSON.parse(raw);
  } catch (error) {
    console.warn(t("restoreResultError"), error);
  }
}

function renderRecentResultSummary() {
  if (!els.recentResultSummary) return;
  if (!state.review) {
    els.recentResultSummary.textContent = t("noSavedResults");
    return;
  }

  els.recentResultSummary.innerHTML = `
    <strong>${escapeHtml(modeLabel(state.review.mode))}</strong><br>
    ${escapeHtml(t("recentScore"))}: ${state.review.scorePercent}%<br>
    ${escapeHtml(t("recentCorrect"))}: ${state.review.correctCount} ${escapeHtml(t("of"))} ${state.review.total}
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
  setText(els.reviewMode, modeLabel(state.review.mode));

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
    statusEl.textContent = item.isCorrect ? t("correct") : t("incorrect");
    statusEl.classList.add(item.isCorrect ? "status-correct" : "status-incorrect");

    const caseBlock = clone.querySelector(".review-case");
    const caseText = clone.querySelector(".review-case-text");
    const exhibitBlock = clone.querySelector(".review-exhibit");
    const exhibitContent = clone.querySelector(".review-exhibit-content");
    renderCaseAndExhibit(item.question, caseBlock, caseText, exhibitBlock, exhibitContent);

    clone.querySelector(".review-question-title").textContent = t("reviewQuestionTitle", { index: item.index });
    clone.querySelector(".review-question-text").textContent = item.question.question;
    clone.querySelector(".review-user-answer").textContent = formatAnswerForDisplay(item.question, item.userAnswer);
    clone.querySelector(".review-correct-answer").textContent = formatAnswerForDisplay(item.question, item.correctAnswer);
    clone.querySelector(".review-explanation-text").textContent = item.question.explanation || t("reviewNoExplanation");

    if (root) {
      root.classList.add(item.isCorrect ? "review-correct" : "review-incorrect");
    }

    els.reviewQuestions.appendChild(clone);
  });
}

function formatAnswerForDisplay(question, answerIds) {
  if (!answerIds || !answerIds.length) return t("noAnswer");
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
  if (type === "multiple") return t("typeLabelMultiple");
  if (type === "case") return t("typeLabelCase");
  if (type === "exhibit") return t("typeLabelExhibit");
  return t("typeLabelSingle");
}

function instructionText(type) {
  if (type === "multiple") return t("chooseAll");
  return t("chooseBest");
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