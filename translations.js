/**
 * translations.js – PMP Trainer 2026
 *
 * Lägg till ett nytt språk genom att:
 *   1. Kopiera hela "sv"-blocket nedan
 *   2. Byt nyckeln (t.ex. "de" för tyska)
 *   3. Översätt varje värde
 *   4. Lägg till en knapp i index.html:
 *        <button id="langDeBtn" class="lang-btn" type="button"
 *                aria-pressed="false" lang="de">DE</button>
 *   5. Lägg till knappstöd i setLanguage() i app.js
 *
 * Struktur:
 *   TRANSLATIONS["språkkod"]["nyckel"] = "text"
 *   Platshållare skrivs {variabelnamn}, t.ex. "Fråga {current} av {total}"
 */

/* Tilldelas till window så att app.js kan använda globalen */
window.TRANSLATIONS = {

  /* ── Engelska (referensspråk) ─────────────────────────────────────── */
  en: {
    /* Meta */
    appTitle:          "PMP Trainer 2026",
    metaDescription:   "PMP Trainer 2026 – practice questions and a simulated exam aligned with the PMP exam from July 9, 2026.",
    subtitle:          "Practice questions and a simulated exam aligned with the new PMP exam from July 9, 2026",
    badgeQuestions:    "180 questions",
    badgeMinutes:      "230 minutes",
    badgeScenario:     "Scenario-focused",

    /* Navigation */
    navHome:           "Home",
    navPractice:       "Practice",
    navExam:           "Mock Exam",
    navReview:         "Results",
    navAbout:          "About",

    /* Home */
    heroTitle:         "Practice systematically for PMP 2026",
    heroText:          "Choose between targeted topic practice and a full exam simulation. Questions are organized by domain, task, difficulty, and question type.",
    startPractice:     "Start Practice",
    startExam:         "Start Mock Exam",
    statsQuestions:    "Questions in the bank",
    statsDomains:      "Domains",
    statsTasks:        "Tasks",
    statsExamFormat:   "Exam format",
    examOverview:      "Exam Overview",
    examOverviewScenario: "Scenario and application focus",
    examOverviewTypes: "Multiple question types",
    examOverviewBreaks:"Breaks after sections 1 and 2",
    domainDistribution:"Domain Distribution",
    recentResults:     "Recent Results",
    noSavedResults:    "No saved results yet.",

    /* Practice */
    practiceTitle:     "Practice Mode",
    practiceIntro:     "Filter questions by domain, task, tag, difficulty, and question type.",
    labelDomain:       "Domain",
    allDomains:        "All domains",
    labelTask:         "Task",
    allTasks:          "All tasks",
    labelDifficulty:   "Difficulty",
    allLevels:         "All levels",
    diffEasy:          "Easy",
    diffMedium:        "Medium",
    diffHard:          "Hard",
    labelQuestionType: "Question type",
    allTypes:          "All types",
    typeSingle:        "Single response",
    typeMultiple:      "Multiple response",
    typeCase:          "Case set",
    typeExhibit:       "Exhibit",
    labelTag:          "Tag",
    allTags:           "All tags",
    labelQuestionCount:"Number of questions",
    generatePractice:  "Start Practice Session",
    resetFilters:      "Reset Filters",
    noPracticeStarted: "No practice session started yet.",
    sessionOverview:   "Session Overview",
    status:            "Status",
    answered:          "Answered",
    unanswered:        "Unanswered",
    navigation:        "Navigation",
    finishAndReview:   "Finish and Review",
    prev:              "Previous",
    next:              "Next",
    mark:              "Mark",
    unmark:            "Unmark",

    /* Mock exam */
    mockExamTitle:     "PMP Mock Exam 2026",
    mockExamIntro:     "A full exam simulation with 180 questions and 230 minutes.",
    settings:          "Settings",
    shuffleQuestions:  "Shuffle question order",
    shuffleOptions:    "Shuffle answer options",
    enableBreaks:      "Show recommended breaks after questions 60 and 120",
    examFormat:        "Exam Format",
    examFormatMix:     "Domain mix aligned with the 2026 distribution",
    examFormatTypes:   "Single, multiple, case, and exhibit",
    startExamAction:   "Start Exam",
    timeRemaining:     "Time Remaining",
    progress:          "Progress",
    marked:            "Marked",
    submitExam:        "Submit Exam",
    recommendedBreak:  "Recommended Break",
    continueExam:      "Continue Exam",

    /* Review / Results */
    reviewTitle:       "Results and Review",
    reviewIntro:       "See correct and incorrect answers, your responses, the answer key, and explanations.",
    noResultYet:       "No results to show yet. Complete a practice session or a mock exam first.",
    overview:          "Overview",
    score:             "Score",
    correct:           "Correct",
    incorrect:         "Incorrect",
    mode:              "Mode",
    byDomain:          "Results by Domain",
    filterStatus:      "Filter by status",
    filterDomain:      "Filter by domain",
    all:               "All",
    onlyCorrect:       "Correct only",
    onlyIncorrect:     "Incorrect only",

    /* About */
    aboutTitle:        "About the Program",
    aboutP1:           "This application is built to provide structured preparation for the PMP exam using the 2026 format. The questions are practice questions and are not official PMI questions.",
    aboutFiles:        "Project Files",
    aboutUse:          "How to Use the Program",
    aboutNote:         "Note",
    aboutNoteText:     "This program is designed for practice. For serious certification preparation, the questions should be supplemented with manual quality review and ongoing improvements.",
    fileIndex:         "interface and structure",
    fileStyles:        "layout and visual design",
    fileApp:           "logic for questions, exams, timer, and results",
    fileData:          "question bank",
    step1:             "Place all files in the same project folder.",
    step2:             "Put questions.json in the data subfolder.",
    step3:             "Open index.html in a web browser.",
    step4:             "If the browser blocks local JSON loading, run the project through a simple local server.",

    /* Review detail */
    yourAnswer:        "Your answer",
    correctAnswer:     "Correct answer",
    explanation:       "Explanation",
    question:          "Question",
    recentScore:       "Score",
    recentCorrect:     "Correct",
    of:                "of",

    /* Dynamic messages */
    poolNoMatch:       "No questions match the current filters.",
    poolMatch:         "{count} questions match the filters. The session will use up to {selected} questions.",
    noMatchingQuestions:"There are no questions matching the selected filters.",
    emptyQuestionBank: "The question bank is empty.",
    progressQuestion:  "Question {current} of {total}",
    reviewQuestionTitle:"{index}. Question",
    reviewNoExplanation:"No explanation available.",
    noAnswer:          "No answer",
    chooseAll:         "Select all options that apply.",
    chooseBest:        "Select the best answer.",
    breakNotice:       "You have now completed question {question}. This is a recommended break before you continue.",
    loadError:         "Could not load the question bank. Make sure questions.json exists in data/questions.json or in the same folder as index.html.",
    saveResultError:   "Could not save the latest result locally.",
    restoreResultError:"Could not read the latest result locally.",

    /* Labels */
    unknown:           "Unknown",
    modePractice:      "Practice Mode",
    modeExam:          "Mock Exam",
    typeLabelSingle:   "Single",
    typeLabelMultiple: "Multiple",
    typeLabelCase:     "Case",
    typeLabelExhibit:  "Exhibit"
  },

  /* ── Svenska ──────────────────────────────────────────────────────── */
  sv: {
    /* Meta */
    appTitle:          "PMP Trainer 2026",
    metaDescription:   "PMP Trainer 2026 – övningsfrågor och simulerat prov enligt PMP-examen från 9 juli 2026.",
    subtitle:          "Övningsfrågor och simulerat prov enligt den nya PMP-examen från 9 juli 2026",
    badgeQuestions:    "180 frågor",
    badgeMinutes:      "230 minuter",
    badgeScenario:     "Scenariofokus",

    /* Navigation */
    navHome:           "Start",
    navPractice:       "Övningsläge",
    navExam:           "Simulerat prov",
    navReview:         "Resultat",
    navAbout:          "Om",

    /* Home */
    heroTitle:         "Träna strukturerat inför PMP 2026",
    heroText:          "Välj mellan riktad ämnesträning och fullständig examenssimulering. Frågorna är organiserade efter domän, uppgift, svårighetsgrad och frågetyp.",
    startPractice:     "Starta övningsläge",
    startExam:         "Starta simulerat prov",
    statsQuestions:    "Frågor i databasen",
    statsDomains:      "Domäner",
    statsTasks:        "Uppgifter",
    statsExamFormat:   "Provformat",
    examOverview:      "Examensupplägg",
    examOverviewScenario: "Scenario- och tillämpningsfokus",
    examOverviewTypes: "Flera frågetyper",
    examOverviewBreaks:"Pauser efter block 1 och 2",
    domainDistribution:"Domänfördelning",
    recentResults:     "Senaste resultat",
    noSavedResults:    "Inga sparade resultat ännu.",

    /* Practice */
    practiceTitle:     "Övningsläge",
    practiceIntro:     "Filtrera frågor efter domän, uppgift, tagg, svårighetsgrad och frågetyp.",
    labelDomain:       "Domän",
    allDomains:        "Alla domäner",
    labelTask:         "Uppgift",
    allTasks:          "Alla uppgifter",
    labelDifficulty:   "Svårighetsgrad",
    allLevels:         "Alla nivåer",
    diffEasy:          "Lätt",
    diffMedium:        "Medel",
    diffHard:          "Svår",
    labelQuestionType: "Frågetyp",
    allTypes:          "Alla typer",
    typeSingle:        "Enstaka svar",
    typeMultiple:      "Flera svar",
    typeCase:          "Fallstudie",
    typeExhibit:       "Bilaga",
    labelTag:          "Tagg",
    allTags:           "Alla taggar",
    labelQuestionCount:"Antal frågor",
    generatePractice:  "Starta övningspass",
    resetFilters:      "Återställ filter",
    noPracticeStarted: "Ingen övningssession startad ännu.",
    sessionOverview:   "Passöversikt",
    status:            "Status",
    answered:          "Besvarade",
    unanswered:        "Obesvarade",
    navigation:        "Navigering",
    finishAndReview:   "Avsluta och rätta",
    prev:              "Föregående",
    next:              "Nästa",
    mark:              "Markera",
    unmark:            "Avmarkera",

    /* Mock exam */
    mockExamTitle:     "Simulerat PMP-prov 2026",
    mockExamIntro:     "Fullständig examenssimulering med 180 frågor och 230 minuter.",
    settings:          "Inställningar",
    shuffleQuestions:  "Blanda frågornas ordning",
    shuffleOptions:    "Blanda svarsalternativ",
    enableBreaks:      "Visa rekommenderade pauser efter fråga 60 och 120",
    examFormat:        "Provformat",
    examFormatMix:     "Domänmix enligt 2026-fördelning",
    examFormatTypes:   "Enstaka, flera, fallstudie och bilaga",
    startExamAction:   "Starta prov",
    timeRemaining:     "Tid kvar",
    progress:          "Framsteg",
    marked:            "Markerade",
    submitExam:        "Lämna in prov",
    recommendedBreak:  "Rekommenderad paus",
    continueExam:      "Fortsätt provet",

    /* Review / Results */
    reviewTitle:       "Resultat och genomgång",
    reviewIntro:       "Se rätt och fel svar, dina svar, facit och förklaringar.",
    noResultYet:       "Inget resultat att visa ännu. Genomför först ett övningspass eller ett simulerat prov.",
    overview:          "Översikt",
    score:             "Resultat",
    correct:           "Rätt",
    incorrect:         "Fel",
    mode:              "Läge",
    byDomain:          "Resultat per domän",
    filterStatus:      "Filtrera på status",
    filterDomain:      "Filtrera på domän",
    all:               "Alla",
    onlyCorrect:       "Endast rätt",
    onlyIncorrect:     "Endast fel",

    /* About */
    aboutTitle:        "Om programmet",
    aboutP1:           "Den här applikationen är byggd för att ge strukturerad träning inför PMP-examen enligt 2026 års upplägg. Frågorna är träningsfrågor och inte officiella PMI-frågor.",
    aboutFiles:        "Filer i projektet",
    aboutUse:          "Så här används programmet",
    aboutNote:         "Observera",
    aboutNoteText:     "Programmet är gjort för träning. För skarp certifieringsförberedelse bör frågorna kompletteras med manuell kvalitetsgranskning och återkommande förbättringar.",
    fileIndex:         "gränssnitt och struktur",
    fileStyles:        "layout och visuell design",
    fileApp:           "logik för frågor, prov, timer och resultat",
    fileData:          "frågebanken",
    step1:             "Placera alla filer i samma projektmapp.",
    step2:             "Lägg questions.json i undermappen data.",
    step3:             "Öppna index.html i en webbläsare.",
    step4:             "Om webbläsaren blockerar lokal JSON-läsning, kör projektet via en enkel lokal server.",

    /* Review detail */
    yourAnswer:        "Ditt svar",
    correctAnswer:     "Rätt svar",
    explanation:       "Förklaring",
    question:          "Fråga",
    recentScore:       "Resultat",
    recentCorrect:     "Rätt",
    of:                "av",

    /* Dynamic messages */
    poolNoMatch:       "Inga frågor matchar nuvarande filter.",
    poolMatch:         "{count} frågor matchar filtren. Passet kommer att använda upp till {selected} frågor.",
    noMatchingQuestions:"Det finns inga frågor som matchar de valda filtren.",
    emptyQuestionBank: "Frågebanken är tom.",
    progressQuestion:  "Fråga {current} av {total}",
    reviewQuestionTitle:"{index}. Fråga",
    reviewNoExplanation:"Ingen förklaring tillgänglig.",
    noAnswer:          "Inget svar",
    chooseAll:         "Välj alla alternativ som stämmer.",
    chooseBest:        "Välj det bästa svaret.",
    breakNotice:       "Du har nu passerat fråga {question}. Det här är en rekommenderad paus innan du fortsätter.",
    loadError:         "Kunde inte läsa frågebanken. Kontrollera att questions.json finns i data/questions.json eller i samma mapp som index.html.",
    saveResultError:   "Kunde inte spara senaste resultat lokalt.",
    restoreResultError:"Kunde inte läsa senaste resultat lokalt.",

    /* Labels */
    unknown:           "Okänd",
    modePractice:      "Övningsläge",
    modeExam:          "Simulerat prov",
    typeLabelSingle:   "Enstaka",
    typeLabelMultiple: "Flera",
    typeLabelCase:     "Fall",
    typeLabelExhibit:  "Bilaga"
  }

  /*
   * ── Lägg till fler språk här ──────────────────────────────────────
   *
   * Exempel – Tyska:
   * de: {
   *   appTitle: "PMP Trainer 2026",
   *   ...
   * }
   */
};
