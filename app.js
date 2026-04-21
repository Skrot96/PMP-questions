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

const EXAM_CONFIG = {
  questionCount: 185,
  durationMinutes: 240,
  breakpoints: [62, 124],
  formatTargets: {
    case: 6,
    exhibit: 4
  }
};

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
  langEnBtn: document.getElementById("langEnBtn")
};


const TRANSLATIONS = {
  en: {
    appTitle: "PMP Trainer 2026",
    metaDescription: "PMP Trainer 2026 - practice questions and a simulated exam aligned with the PMP exam from July 9, 2026.",
    subtitle: "Practice questions and a simulated exam aligned with the new PMP exam from July 9, 2026",
    badgeQuestions: "{count} questions",
    badgeMinutes: "{minutes} minutes",
    badgeScenario: "Scenario-focused",
    navHome: "Home",
    navPractice: "Practice",
    navExam: "Mock Exam",
    navReview: "Results",
    navAbout: "About",
    heroTitle: "Practice systematically for PMP 2026",
    heroText: "Choose between targeted topic practice and a full exam simulation. Questions are organized by domain, task, difficulty, and question type.",
    startPractice: "Start Practice",
    startExam: "Start Mock Exam",
    statsQuestions: "Questions in the bank",
    statsDomains: "Domains",
    statsTasks: "Tasks",
    statsExamFormat: "Exam format",
    examOverview: "Exam Overview",
    examOverviewQuestionCount: "{count} questions",
    examOverviewDuration: "{minutes} minutes",
    examOverviewScenario: "Scenario and application focus",
    examOverviewTypes: "Multiple question types",
    examOverviewBreaks: "Breaks after sections 1 and 2",
    domainDistribution: "Domain Distribution",
    recentResults: "Recent Results",
    noSavedResults: "No saved results yet.",
    practiceTitle: "Practice Mode",
    practiceIntro: "Filter questions by domain, task, tag, difficulty, and question type.",
    labelDomain: "Domain",
    allDomains: "All domains",
    labelTask: "Task",
    allTasks: "All tasks",
    labelDifficulty: "Difficulty",
    allLevels: "All levels",
    diffEasy: "Easy",
    diffMedium: "Medium",
    diffHard: "Hard",
    labelQuestionType: "Question type",
    allTypes: "All types",
    typeSingle: "Single response",
    typeMultiple: "Multiple response",
    typeCase: "Case set",
    typeExhibit: "Exhibit",
    labelTag: "Tag",
    allTags: "All tags",
    labelQuestionCount: "Number of questions",
    generatePractice: "Start Practice Session",
    resetFilters: "Reset Filters",
    noPracticeStarted: "No practice session started yet.",
    sessionOverview: "Session Overview",
    status: "Status",
    answered: "Answered",
    unanswered: "Unanswered",
    navigation: "Navigation",
    finishAndReview: "Finish and Review",
    prev: "Previous",
    next: "Next",
    mark: "Mark",
    unmark: "Unmark",
    mockExamTitle: "PMP Mock Exam 2026",
    mockExamIntro: "A full exam simulation with {count} questions and {minutes} minutes.",
    settings: "Settings",
    shuffleQuestions: "Shuffle question order",
    shuffleOptions: "Shuffle answer options",
    enableBreaks: "Show recommended breaks after questions {first} and {second}",
    examFormat: "Exam format",
    examFormatQuestionCount: "{count} questions",
    examFormatDuration: "{minutes} minutes",
    examFormatMix: "Domain mix aligned with the 2026 distribution",
    examFormatTypes: "Single, multiple, case, and exhibit",
    examFormatGuaranteedMix: "Target mix: up to {caseCount} case and {exhibitCount} exhibit questions when available",
    startExamAction: "Start Exam",
    timeRemaining: "Time Remaining",
    progress: "Progress",
    marked: "Marked",
    submitExam: "Submit Exam",
    recommendedBreak: "Recommended Break",
    continueExam: "Continue Exam",
    reviewTitle: "Results and Review",
    reviewIntro: "See correct and incorrect answers, your responses, the answer key, and explanations.",
    noResultYet: "No results to show yet. Complete a practice session or a mock exam first.",
    overview: "Overview",
    score: "Score",
    correct: "Correct",
    incorrect: "Incorrect",
    mode: "Mode",
    byDomain: "Results by Domain",
    filterStatus: "Filter by status",
    filterDomain: "Filter by domain",
    all: "All",
    onlyCorrect: "Correct only",
    onlyIncorrect: "Incorrect only",
    aboutTitle: "About the Program",
    aboutP1: "This application is built to provide structured preparation for the PMP exam using the 2026 format. The questions are practice questions and are not official PMI questions.",
    aboutFiles: "Project Files",
    aboutUse: "How to Use the Program",
    aboutNote: "Note",
    aboutNoteText: "This program is designed for practice. For serious certification preparation, the questions should be supplemented with manual quality review and ongoing improvements.",
    fileIndex: "interface and structure",
    fileStyles: "layout and visual design",
    fileApp: "logic for questions, exams, timer, and results",
    fileData: "question bank",
    step1: "Place all files in the same project folder.",
    step2: "Put questions.json in the data subfolder.",
    step3: "Open index.html in a web browser.",
    step4: "If the browser blocks local JSON loading, run the project through a simple local server.",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    explanation: "Explanation",
    question: "Question",
    recentScore: "Score",
    recentCorrect: "Correct",
    of: "of",
    poolNoMatch: "No questions match the current filters.",
    poolMatch: "{count} questions match the filters. The session will use up to {selected} questions.",
    noMatchingQuestions: "There are no questions matching the selected filters.",
    emptyQuestionBank: "The question bank is empty.",
    progressQuestion: "Question {current} of {total}",
    reviewQuestionTitle: "{index}. Question",
    reviewNoExplanation: "No explanation available.",
    noAnswer: "No answer",
    chooseAll: "Select all options that apply.",
    chooseBest: "Select the best answer.",
    breakNotice: "You have now completed question {question}. This is a recommended break before you continue.",
    loadError: "Could not load the question bank. Make sure questions.json exists in data/questions.json or in the same folder as index.html.",
    saveResultError: "Could not save the latest result locally.",
    restoreResultError: "Could not read the latest result locally.",
    unknown: "Unknown",
    modePractice: "Practice Mode",
    modeExam: "Mock Exam",
    typeLabelSingle: "Single",
    typeLabelMultiple: "Multiple",
    typeLabelCase: "Case",
    typeLabelExhibit: "Exhibit"
  },
  sv: {
    appTitle: "PMP Trainer 2026",
    metaDescription: "PMP Trainer 2026 - övningsfrågor och simulerat prov enligt PMP-examen från 9 juli 2026.",
    subtitle: "Övningsfrågor och simulerat prov enligt den nya PMP-examen från 9 juli 2026",
    badgeQuestions: "{count} frågor",
    badgeMinutes: "{minutes} minuter",
    badgeScenario: "Scenariofokus",
    navHome: "Start",
    navPractice: "Övningsläge",
    navExam: "Simulerat prov",
    navReview: "Resultat",
    navAbout: "Om",
    heroTitle: "Träna strukturerat inför PMP 2026",
    heroText: "Välj mellan riktad ämnesträning och fullständig examenssimulering. Frågorna är organiserade efter domän, task, svårighetsgrad och frågetyp.",
    startPractice: "Starta övningsläge",
    startExam: "Starta simulerat prov",
    statsQuestions: "Frågor i databasen",
    statsDomains: "Domäner",
    statsTasks: "Tasks",
    statsExamFormat: "Examformat",
    examOverview: "Examensupplägg",
    examOverviewQuestionCount: "{count} frågor",
    examOverviewDuration: "{minutes} minuter",
    examOverviewScenario: "Scenario- och tillämpningsfokus",
    examOverviewTypes: "Flera frågetyper",
    examOverviewBreaks: "Pauser efter block 1 och 2",
    domainDistribution: "Domänfördelning",
    recentResults: "Senaste resultat",
    noSavedResults: "Inga sparade resultat ännu.",
    practiceTitle: "Övningsläge",
    practiceIntro: "Filtrera frågor efter domän, task, tagg, svårighetsgrad och frågetyp.",
    labelDomain: "Domän",
    allDomains: "Alla domäner",
    labelTask: "Task",
    allTasks: "Alla tasks",
    labelDifficulty: "Svårighetsgrad",
    allLevels: "Alla nivåer",
    diffEasy: "Lätt",
    diffMedium: "Medel",
    diffHard: "Svår",
    labelQuestionType: "Frågetyp",
    allTypes: "Alla typer",
    typeSingle: "Single response",
    typeMultiple: "Multiple response",
    typeCase: "Case set",
    typeExhibit: "Exhibit",
    labelTag: "Tagg",
    allTags: "Alla taggar",
    labelQuestionCount: "Antal frågor",
    generatePractice: "Starta övningspass",
    resetFilters: "Återställ filter",
    noPracticeStarted: "Ingen frågesession startad ännu.",
    sessionOverview: "Passöversikt",
    status: "Status",
    answered: "Besvarade",
    unanswered: "Ej besvarade",
    navigation: "Navigering",
    finishAndReview: "Avsluta och rätta",
    prev: "Föregående",
    next: "Nästa",
    mark: "Markera",
    unmark: "Avmarkera",
    mockExamTitle: "Simulerat PMP-prov 2026",
    mockExamIntro: "Fullständig examsimulering med {count} frågor och {minutes} minuter.",
    settings: "Inställningar",
    shuffleQuestions: "Blanda frågornas ordning",
    shuffleOptions: "Blanda svarsalternativ",
    enableBreaks: "Visa rekommenderade pauser efter fråga {first} och {second}",
    examFormat: "Provformat",
    examFormatQuestionCount: "{count} frågor",
    examFormatDuration: "{minutes} minuter",
    examFormatMix: "Domänmix enligt 2026-fördelning",
    examFormatTypes: "Single, multiple, case och exhibit",
    examFormatGuaranteedMix: "Målmix: upp till {caseCount} case-frågor och {exhibitCount} exhibit-frågor när de finns tillgängliga",
    startExamAction: "Starta prov",
    timeRemaining: "Tid kvar",
    progress: "Framsteg",
    marked: "Markerade",
    submitExam: "Lämna in prov",
    recommendedBreak: "Rekommenderad paus",
    continueExam: "Fortsätt provet",
    reviewTitle: "Resultat och genomgång",
    reviewIntro: "Se rätt/fel, egna svar, facit och förklaringar.",
    noResultYet: "Inget resultat att visa ännu. Genomför först ett övningspass eller ett simulerat prov.",
    overview: "Översikt",
    score: "Resultat",
    correct: "Rätt",
    incorrect: "Fel",
    mode: "Läge",
    byDomain: "Resultat per domän",
    filterStatus: "Filtrera status",
    filterDomain: "Filtrera domän",
    all: "Alla",
    onlyCorrect: "Endast rätt",
    onlyIncorrect: "Endast fel",
    aboutTitle: "Om programmet",
    aboutP1: "Den här applikationen är byggd för att ge strukturerad träning inför PMP-examen enligt 2026 års upplägg. Frågorna är träningsfrågor och inte officiella PMI-frågor.",
    aboutFiles: "Filer i projektet",
    aboutUse: "Så används programmet",
    aboutNote: "Obs",
    aboutNoteText: "Programmet är gjort för träning. För skarp certifieringsförberedelse bör frågorna kompletteras med manuell kvalitetsgranskning och återkommande förbättringar.",
    fileIndex: "gränssnitt och struktur",
    fileStyles: "layout och visuell design",
    fileApp: "logik för frågor, prov, timer och resultat",
    fileData: "frågebanken",
    step1: "Placera alla filer i samma projektmapp.",
    step2: "Lägg questions.json i undermappen data.",
    step3: "Öppna index.html i en webbläsare.",
    step4: "Om webbläsaren blockerar lokal JSON-läsning, kör projektet via en enkel lokal server.",
    yourAnswer: "Ditt svar",
    correctAnswer: "Rätt svar",
    explanation: "Förklaring",
    question: "Fråga",
    recentScore: "Resultat",
    recentCorrect: "Rätt",
    of: "av",
    poolNoMatch: "Inga frågor matchar nuvarande filter.",
    poolMatch: "{count} frågor matchar filtren. Passet kommer att använda upp till {selected} frågor.",
    noMatchingQuestions: "Det finns inga frågor som matchar filtren.",
    emptyQuestionBank: "Frågebanken är tom.",
    progressQuestion: "Fråga {current} av {total}",
    reviewQuestionTitle: "{index}. Fråga",
    reviewNoExplanation: "Ingen förklaring tillgänglig.",
    noAnswer: "Inget svar",
    chooseAll: "Välj alla alternativ som är korrekta.",
    chooseBest: "Välj det bästa svaret.",
    breakNotice: "Du har nu passerat fråga {question}. Det här är en rekommenderad paus innan du fortsätter.",
    loadError: "Kunde inte läsa frågebanken. Kontrollera att questions.json finns i data/questions.json eller i samma mapp som index.html.",
    saveResultError: "Kunde inte spara senaste resultat lokalt.",
    restoreResultError: "Kunde inte läsa senaste resultat lokalt.",
    unknown: "Okänd",
    modePractice: "Övningsläge",
    modeExam: "Simulerat prov",
    typeLabelSingle: "Single",
    typeLabelMultiple: "Multiple",
    typeLabelCase: "Case",
    typeLabelExhibit: "Exhibit"
  }
};

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

function examVars(extra = {}) {
  const [first = 0, second = 0] = EXAM_CONFIG.breakpoints;
  const caseCount = EXAM_CONFIG.formatTargets?.case || 0;
  const exhibitCount = EXAM_CONFIG.formatTargets?.exhibit || 0;
  return {
    count: EXAM_CONFIG.questionCount,
    minutes: EXAM_CONFIG.durationMinutes,
    first,
    second,
    caseCount,
    exhibitCount,
    standardCount: Math.max(0, EXAM_CONFIG.questionCount - caseCount - exhibitCount),
    ...extra
  };
}

function applyTranslations() {
  document.title = t("appTitle");
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute("content", t("metaDescription"));

  const textMap = {
    "#appTitle": t("appTitle"),
    ".subtitle": t("subtitle"),
    "#badgeQuestions": t("badgeQuestions", examVars()),
    "#badgeMinutes": t("badgeMinutes", examVars()),
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
    "#examOverviewQuestionCount": t("examOverviewQuestionCount", examVars()),
    "#examOverviewDuration": t("examOverviewDuration", examVars()),
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
    "#examIntro": t("mockExamIntro", examVars()),
    "#examSettingsTitle": t("settings"),
    "#examShuffleQuestionsLabel": t("shuffleQuestions"),
    "#examShuffleOptionsLabel": t("shuffleOptions"),
    "#examEnableBreaksLabel": t("enableBreaks", examVars()),
    "#examFormatTitle": t("examFormat"),
    "#examFormatQuestionCount": t("examFormatQuestionCount", examVars()),
    "#examFormatDuration": t("examFormatDuration", examVars()),
    "#examFormatMix": t("examFormatMix"),
    "#examFormatTypes": t("examFormatTypes"),
    "#examFormatGuaranteedMix": t("examFormatGuaranteedMix", examVars()),
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

  if (els.langSvBtn) els.langSvBtn.classList.toggle("active", state.language === "sv");
  if (els.langEnBtn) els.langEnBtn.classList.toggle("active", state.language === "en");
}

function modeLabel(modeKey) {
  return modeKey === "exam" ? t("modeExam") : t("modePractice");
}


document.addEventListener("DOMContentLoaded", init);

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

  const options = normalizeOptions(q.options || []);
  const caseText = normalizeTextBlock(q.caseText || q.case || q.caseSet || "");
  const exhibitContent = normalizeExhibitContent(q.exhibitContent || q.exhibit || "");
  const format = normalizeQuestionFormat(q.format || q.type, { caseText, exhibitContent });
  const normalizedOptions =
    (format === "case" || format === "exhibit") && options.length === 0
      ? []
      : options;

  const correctAnswers = normalizeCorrectAnswers(q.correctAnswers || [], normalizedOptions);
  const selectionMode = finalizeSelectionMode(
    normalizeSelectionMode(q.selectionMode || q.responseType || q.answerMode || q.type),
    correctAnswers
  );
  const legacyType = format === "standard" ? selectionMode : format;

  return {
    id: q.id || `Q-${index + 1}`,
    domain: q.domain || t("unknown"),
    taskCode: q.taskCode || "",
    task: q.task || "",
    tags: Array.isArray(q.tags) ? q.tags : [],
    difficulty: normalizeDifficulty(q.difficulty),
    difficultyLabel: difficultyLabelFromValue(normalizeDifficulty(q.difficulty)),
    format,
    selectionMode,
    type: legacyType,
    question: q.question || "",
    options: normalizedOptions,
    correctAnswers,
    explanation: q.explanation || "",
    caseText,
    caseTitle: q.caseTitle || "",
    caseSetId: q.caseSetId || q.caseGroupId || "",
    exhibitTitle: q.exhibitTitle || "",
    exhibitContent
  };
}

function normalizeQuestionFormat(value, { caseText = "", exhibitContent = "" } = {}) {
  const t = String(value || "").trim().toLowerCase();
  if (["case", "case set", "caseset"].includes(t)) return "case";
  if (["exhibit", "exhibit item"].includes(t)) return "exhibit";
  if (["standard", "single", "multiple", "question", "default"].includes(t)) return "standard";
  if (caseText) return "case";
  if (hasExhibitContent(exhibitContent)) return "exhibit";
  return "standard";
}

function normalizeSelectionMode(value) {
  const t = String(value || "").trim().toLowerCase();
  if (["multiple", "multi", "multiple response", "multiple-response", "multi-select", "multiselect"].includes(t)) {
    return "multiple";
  }
  if (["single", "single response", "single-response", "best answer"].includes(t)) {
    return "single";
  }
  return "";
}

function finalizeSelectionMode(selectionMode, correctAnswers) {
  if (selectionMode === "multiple") return "multiple";
  if (selectionMode === "single") return correctAnswers.length > 1 ? "multiple" : "single";
  return correctAnswers.length > 1 ? "multiple" : "single";
}

function normalizeTextBlock(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "")).join("\n");
  }
  if (typeof value === "object") {
    if (Array.isArray(value.lines)) return value.lines.map((item) => String(item ?? "")).join("\n");
    if (typeof value.text === "string") return value.text;
    if (typeof value.body === "string") return value.body;
  }
  return String(value);
}

function normalizeExhibitContent(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => String(item ?? ""));
  if (typeof value !== "object") return String(value);

  if (Array.isArray(value.columns) && Array.isArray(value.rows)) {
    return {
      kind: "table",
      columns: value.columns.map((item) => String(item ?? "")),
      rows: value.rows.map((row) => (Array.isArray(row) ? row.map((cell) => String(cell ?? "")) : [String(row ?? "")])),
      title: typeof value.title === "string" ? value.title : ""
    };
  }

  if (Array.isArray(value.items)) {
    return {
      kind: "list",
      items: value.items.map((item) => String(item ?? "")),
      title: typeof value.title === "string" ? value.title : ""
    };
  }

  if (Array.isArray(value.entries)) {
    return {
      kind: "key-value",
      entries: value.entries
        .filter((entry) => entry && typeof entry === "object")
        .map((entry) => ({
          key: String(entry.key ?? ""),
          value: String(entry.value ?? "")
        })),
      title: typeof value.title === "string" ? value.title : ""
    };
  }

  if (typeof value.text === "string" || typeof value.body === "string") {
    return {
      kind: "text",
      text: typeof value.text === "string" ? value.text : value.body,
      title: typeof value.title === "string" ? value.title : ""
    };
  }

  return normalizeTextBlock(value);
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
    const matchesType = !type || matchesQuestionTypeFilter(q, type);
    const matchesTag = !tag || (q.tags || []).includes(tag);
    return matchesDomain && matchesTask && matchesDifficulty && matchesType && matchesTag;
  });
}

function matchesQuestionTypeFilter(question, filterValue) {
  if (filterValue === "single" || filterValue === "multiple") {
    return question.selectionMode === filterValue;
  }
  if (filterValue === "case" || filterValue === "exhibit") {
    return question.format === filterValue;
  }
  return true;
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
  setText(els.practiceMetaType, questionTypeLabel(question));
  setText(els.practiceMetaDifficulty, question.difficultyLabel);

  renderCaseAndExhibit(
    question,
    els.practiceCaseBlock,
    els.practiceCaseText,
    els.practiceExhibitBlock,
    els.practiceExhibitContent
  );

  setText(els.practiceQuestionTitle, t("progressQuestion", { current: session.currentIndex + 1, total }));
  setText(els.practiceQuestionInstruction, instructionText(question));
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

  const selected = buildExamQuestionSet(source, EXAM_CONFIG.questionCount);
  const shuffleQuestions = !!els.examShuffleQuestions?.checked;
  const shuffleOptions = !!els.examShuffleOptions?.checked;

  const questions = arrangeExamQuestionOrder(selected, shuffleQuestions);

  state.examSession = createSession({
    modeKey: "exam",
    questions,
    totalSeconds: EXAM_CONFIG.durationMinutes * 60,
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

  const domainTargets = calculateExamDomainTargets(count);
  const formatTargets = resolveExamFormatTargets(shuffled, count);
  const selected = [];
  const usedIds = new Set();
  const currentDomainCounts = { people: 0, process: 0, business: 0 };

  addQuestionsToSelection(
    selectCaseQuestionsForExam(shuffled, formatTargets.case, domainTargets, currentDomainCounts, usedIds),
    selected,
    usedIds,
    currentDomainCounts
  );

  addQuestionsToSelection(
    selectQuestionsByDomainTarget(
      shuffled.filter((q) => q.format === "exhibit" && !usedIds.has(q.id)),
      formatTargets.exhibit,
      domainTargets,
      currentDomainCounts,
      usedIds
    ),
    selected,
    usedIds,
    currentDomainCounts
  );

  addQuestionsToSelection(
    selectQuestionsByDomainTarget(
      shuffled.filter((q) => q.format === "standard" && !usedIds.has(q.id)),
      Math.max(0, count - selected.length),
      domainTargets,
      currentDomainCounts,
      usedIds
    ),
    selected,
    usedIds,
    currentDomainCounts
  );

  if (selected.length < count) {
    addQuestionsToSelection(
      shuffle(shuffled.filter((q) => !usedIds.has(q.id))).slice(0, count - selected.length),
      selected,
      usedIds,
      currentDomainCounts
    );
  }

  return selected.slice(0, count);
}

function calculateExamDomainTargets(count) {
  const people = Math.round(count * 0.33);
  const process = Math.round(count * 0.41);
  return {
    people,
    process,
    business: count - people - process
  };
}

function resolveExamFormatTargets(source, count) {
  const available = source.reduce((acc, question) => {
    const format = question.format || "standard";
    acc[format] = (acc[format] || 0) + 1;
    return acc;
  }, { standard: 0, case: 0, exhibit: 0 });

  const caseTarget = Math.min(EXAM_CONFIG.formatTargets?.case || 0, available.case || 0, count);
  const exhibitTarget = Math.min(EXAM_CONFIG.formatTargets?.exhibit || 0, available.exhibit || 0, Math.max(0, count - caseTarget));

  return {
    case: caseTarget,
    exhibit: exhibitTarget,
    standard: Math.max(0, count - caseTarget - exhibitTarget)
  };
}

function addQuestionsToSelection(questions, selected, usedIds, currentDomainCounts) {
  for (const question of questions || []) {
    if (!question || usedIds.has(question.id)) continue;
    selected.push(question);
    usedIds.add(question.id);

    const domainKey = getQuestionDomainKey(question);
    if (domainKey in currentDomainCounts) {
      currentDomainCounts[domainKey] += 1;
    }
  }
}

function getQuestionDomainKey(question) {
  const domain = String(question?.domain || "").toLowerCase();
  if (domain === "people") return "people";
  if (domain === "process") return "process";
  if (domain.includes("business")) return "business";
  return "other";
}

function selectQuestionsByDomainTarget(pool, count, domainTargets, currentDomainCounts, usedIds) {
  if (count <= 0) return [];

  const available = shuffle((pool || []).filter((question) => !usedIds.has(question.id)));
  if (!available.length) return [];

  const buckets = { people: [], process: [], business: [], other: [] };
  for (const question of available) {
    buckets[getQuestionDomainKey(question)].push(question);
  }

  const selected = [];
  let remaining = count;

  for (const domainKey of ["people", "process", "business"]) {
    const deficit = Math.max(0, (domainTargets[domainKey] || 0) - (currentDomainCounts[domainKey] || 0));
    const take = Math.min(deficit, remaining, buckets[domainKey].length);
    if (take > 0) {
      selected.push(...buckets[domainKey].splice(0, take));
      remaining -= take;
    }
  }

  if (remaining > 0) {
    const fillers = shuffle([
      ...buckets.people,
      ...buckets.process,
      ...buckets.business,
      ...buckets.other
    ]).slice(0, remaining);
    selected.push(...fillers);
  }

  return selected.slice(0, count);
}

function selectCaseQuestionsForExam(source, count, domainTargets, currentDomainCounts, usedIds) {
  if (count <= 0) return [];

  const pool = source.filter((question) => question.format === "case" && !usedIds.has(question.id));
  if (!pool.length) return [];

  const groups = buildCaseQuestionGroups(pool);
  const selected = [];
  const workingDomainCounts = { ...currentDomainCounts };
  let remaining = count;

  while (remaining > 0 && groups.length) {
    const ranked = groups
      .filter((group) => group.questions.length <= remaining)
      .map((group) => ({
        group,
        score: scoreCaseGroupForExam(group, domainTargets, workingDomainCounts)
      }))
      .sort((a, b) => b.score - a.score);

    if (!ranked.length) break;

    const chosen = ranked[0].group;
    selected.push(...chosen.questions);
    remaining -= chosen.questions.length;

    const domainKey = chosen.primaryDomain;
    if (domainKey in workingDomainCounts) {
      workingDomainCounts[domainKey] += chosen.questions.length;
    }

    const groupIndex = groups.findIndex((group) => group.key === chosen.key);
    if (groupIndex >= 0) groups.splice(groupIndex, 1);
  }

  if (remaining > 0) {
    selected.push(
      ...selectQuestionsByDomainTarget(
        groups.flatMap((group) => group.questions),
        remaining,
        domainTargets,
        workingDomainCounts,
        usedIds
      )
    );
  }

  return selected.slice(0, count);
}

function buildCaseQuestionGroups(questions) {
  const groups = new Map();

  for (const question of questions) {
    const key = question.caseSetId || question.id;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(question);
  }

  return shuffle(Array.from(groups.entries()).map(([key, groupQuestions]) => ({
    key,
    questions: groupQuestions,
    primaryDomain: getQuestionDomainKey(groupQuestions[0])
  })));
}

function scoreCaseGroupForExam(group, domainTargets, currentDomainCounts) {
  const domainKey = group.primaryDomain;
  const deficit = Math.max(0, (domainTargets[domainKey] || 0) - (currentDomainCounts[domainKey] || 0));
  return (Math.min(group.questions.length, deficit) * 10) + Math.random();
}

function arrangeExamQuestionOrder(questions, shuffleQuestions) {
  const blocks = [];
  const seenCaseSets = new Set();

  for (const question of questions) {
    if (question.format === "case") {
      const key = question.caseSetId || question.id;
      if (seenCaseSets.has(key)) continue;
      seenCaseSets.add(key);
      blocks.push(questions.filter((item) => item.format === "case" && (item.caseSetId || item.id) === key));
    } else {
      blocks.push([question]);
    }
  }

  const orderedBlocks = shuffleQuestions ? shuffle(blocks) : blocks;
  return orderedBlocks.flat();
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
  setText(els.examMetaType, questionTypeLabel(question));
  setText(els.examMetaDifficulty, question.difficultyLabel);

  renderCaseAndExhibit(
    question,
    els.examCaseBlock,
    els.examCaseText,
    els.examExhibitBlock,
    els.examExhibitContent
  );

  setText(els.examQuestionTitle, t("progressQuestion", { current: session.currentIndex + 1, total }));
  setText(els.examQuestionInstruction, instructionText(question));
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

  for (const blockEnd of EXAM_CONFIG.breakpoints) {
    const triggerIndex = Math.min(blockEnd + 1, session.questions.length);
    if (currentHumanIndex === triggerIndex && !state.breakShownAt.has(blockEnd)) {
      state.breakShownAt.add(blockEnd);
      if (els.examBreakText) {
        els.examBreakText.textContent = t("breakNotice", { question: blockEnd });
      }
      els.examBreakNotice?.classList.remove("hidden");
      return;
    }
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

  if (question.selectionMode === "multiple") {
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
    input.type = question.selectionMode === "multiple" ? "checkbox" : "radio";
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
    mode: session.modeKey,
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
    clone.querySelector(".review-type").textContent = questionTypeLabel(item.question);
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
  const hasExhibit = hasExhibitContent(question.exhibitContent);

  if (caseBlock) caseBlock.classList.toggle("hidden", !hasCase);
  if (caseText) {
    caseText.innerHTML = hasCase ? renderRichTextBlock(question.caseText, question.caseTitle) : "";
  }

  if (exhibitBlock) exhibitBlock.classList.toggle("hidden", !hasExhibit);
  if (exhibitContent) {
    exhibitContent.innerHTML = hasExhibit ? renderExhibitContent(question.exhibitContent, question.exhibitTitle) : "";
  }
}

function renderRichTextBlock(text, title = "") {
  const parts = [];
  if (title) {
    parts.push(`<div class="stimulus-title">${escapeHtml(title)}</div>`);
  }
  parts.push(escapeHtml(String(text || "")).replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>"));
  return parts.join("");
}

function renderExhibitContent(content, fallbackTitle = "") {
  if (!hasExhibitContent(content)) return "";

  if (typeof content === "string") {
    return renderRichTextBlock(content, fallbackTitle);
  }

  if (Array.isArray(content)) {
    const items = content.map((item) => `<li>${escapeHtml(String(item || ""))}</li>`).join("");
    const titleHtml = fallbackTitle ? `<div class="stimulus-title">${escapeHtml(fallbackTitle)}</div>` : "";
    return `${titleHtml}<ul class="rich-list">${items}</ul>`;
  }

  if (content && typeof content === "object") {
    const title = content.title || fallbackTitle || "";
    const titleHtml = title ? `<div class="stimulus-title">${escapeHtml(title)}</div>` : "";

    if (content.kind === "table") {
      const headerHtml = (content.columns || []).map((col) => `<th>${escapeHtml(String(col || ""))}</th>`).join("");
      const rowsHtml = (content.rows || [])
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell || ""))}</td>`).join("")}</tr>`)
        .join("");
      return `${titleHtml}<div class="rich-table-wrap"><table class="rich-table"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
    }

    if (content.kind === "list") {
      const items = (content.items || []).map((item) => `<li>${escapeHtml(String(item || ""))}</li>`).join("");
      return `${titleHtml}<ul class="rich-list">${items}</ul>`;
    }

    if (content.kind === "key-value") {
      const entries = (content.entries || [])
        .map((entry) => `<div class="rich-kv-row"><dt>${escapeHtml(String(entry.key || ""))}</dt><dd>${escapeHtml(String(entry.value || ""))}</dd></div>`)
        .join("");
      return `${titleHtml}<dl class="rich-kv">${entries}</dl>`;
    }

    if (content.kind === "text") {
      return renderRichTextBlock(content.text || "", title);
    }
  }

  return renderRichTextBlock(normalizeTextBlock(content), fallbackTitle);
}

function hasExhibitContent(content) {
  if (!content) return false;
  if (typeof content === "string") return !!content.trim();
  if (Array.isArray(content)) return content.length > 0;
  if (typeof content === "object") {
    if (Array.isArray(content.rows)) return content.rows.length > 0;
    if (Array.isArray(content.items)) return content.items.length > 0;
    if (Array.isArray(content.entries)) return content.entries.length > 0;
    if (typeof content.text === "string") return !!content.text.trim();
    if (typeof content.body === "string") return !!content.body.trim();
  }
  return true;
}

function questionTypeLabel(questionOrType, maybeSelectionMode = "") {
  const question = typeof questionOrType === "object" && questionOrType ? questionOrType : null;
  const format = question
    ? question.format || (question.type === "case" || question.type === "exhibit" ? question.type : "standard")
    : (questionOrType === "case" || questionOrType === "exhibit" ? questionOrType : "standard");
  const selectionMode = question
    ? question.selectionMode || (question.type === "multiple" ? "multiple" : "single")
    : maybeSelectionMode || (questionOrType === "multiple" ? "multiple" : "single");

  if (format === "case") {
    return selectionMode === "multiple" ? `${t("typeLabelCase")} • ${t("typeLabelMultiple")}` : `${t("typeLabelCase")} • ${t("typeLabelSingle")}`;
  }
  if (format === "exhibit") {
    return selectionMode === "multiple" ? `${t("typeLabelExhibit")} • ${t("typeLabelMultiple")}` : `${t("typeLabelExhibit")} • ${t("typeLabelSingle")}`;
  }
  if (selectionMode === "multiple") return t("typeLabelMultiple");
  return t("typeLabelSingle");
}

function instructionText(questionOrType) {
  const selectionMode =
    typeof questionOrType === "object" && questionOrType
      ? questionOrType.selectionMode || (questionOrType.type === "multiple" ? "multiple" : "single")
      : questionOrType === "multiple"
        ? "multiple"
        : "single";

  if (selectionMode === "multiple") return t("chooseAll");
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