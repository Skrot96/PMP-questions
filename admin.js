"use strict";

const ADMIN_TOKEN_KEY = "pmpAdminToken";

let adminToken = sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
let editingId  = null;
let users      = [];

// ── Elements ──────────────────────────────────────────────────────────────────

const el = {
  loginScreen:     document.getElementById("loginScreen"),
  adminApp:        document.getElementById("adminApp"),
  adminTokenInput: document.getElementById("adminToken"),
  loginBtn:        document.getElementById("loginBtn"),
  loginError:      document.getElementById("loginError"),
  adminLogoutBtn:  document.getElementById("adminLogoutBtn"),
  // User tab
  openAddUserBtn:  document.getElementById("openAddUserBtn"),
  userTableBody:   document.getElementById("userTableBody"),
  userModal:       document.getElementById("userModal"),
  modalTitle:      document.getElementById("modalTitle"),
  modalCloseBtn:   document.getElementById("modalCloseBtn"),
  modalCancelBtn:  document.getElementById("modalCancelBtn"),
  modalSaveBtn:    document.getElementById("modalSaveBtn"),
  modalError:      document.getElementById("modalError"),
  fieldName:       document.getElementById("fieldName"),
  fieldEmail:      document.getElementById("fieldEmail"),
  fieldCourseDate: document.getElementById("fieldCourseDate"),
  // Tabs
  tabBtns:         Array.from(document.querySelectorAll(".tab-btn")),
  tabUsers:        document.getElementById("tab-users"),
  tabQuestions:    document.getElementById("tab-questions"),
  // Question tab
  openAddQuestionBtn:  document.getElementById("openAddQuestionBtn"),
  questionTableBody:   document.getElementById("questionTableBody"),
  qSearch:             document.getElementById("qSearch"),
  qFilterDomain:       document.getElementById("qFilterDomain"),
  qFilterDifficulty:   document.getElementById("qFilterDifficulty"),
  qFilterType:         document.getElementById("qFilterType"),
  qPaginationInfo:     document.getElementById("qPaginationInfo"),
  qPrevBtn:            document.getElementById("qPrevBtn"),
  qNextBtn:            document.getElementById("qNextBtn"),
  // Question modal
  questionModal:       document.getElementById("questionModal"),
  qModalTitle:         document.getElementById("qModalTitle"),
  qModalCloseBtn:      document.getElementById("qModalCloseBtn"),
  qModalCancelBtn:     document.getElementById("qModalCancelBtn"),
  qModalSaveBtn:       document.getElementById("qModalSaveBtn"),
  qModalError:         document.getElementById("qModalError"),
  qFieldId:            document.getElementById("qFieldId"),
  qFieldDomain:        document.getElementById("qFieldDomain"),
  qFieldTaskCode:      document.getElementById("qFieldTaskCode"),
  qFieldTask:          document.getElementById("qFieldTask"),
  qFieldDifficulty:    document.getElementById("qFieldDifficulty"),
  qFieldType:          document.getElementById("qFieldType"),
  qFieldTags:          document.getElementById("qFieldTags"),
  qFieldQuestion:      document.getElementById("qFieldQuestion"),
  qFieldCaseText:      document.getElementById("qFieldCaseText"),
  qFieldExhibit:       document.getElementById("qFieldExhibit"),
  qCaseBlock:          document.getElementById("qCaseBlock"),
  qExhibitBlock:       document.getElementById("qExhibitBlock"),
  qOptionsList:        document.getElementById("qOptionsList"),
  qAddOptionBtn:       document.getElementById("qAddOptionBtn"),
  qFieldExplanation:   document.getElementById("qFieldExplanation"),
  domainDatalist:      document.getElementById("domainDatalist"),
  toast:           document.getElementById("toast"),
};

// ── API ───────────────────────────────────────────────────────────────────────

async function apiFetch(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${adminToken}`,
    ...(options.headers || {}),
  };
  const res  = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── Toast ─────────────────────────────────────────────────────────────────────

let toastTimer = null;
function showToast(msg, type = "success") {
  el.toast.textContent = msg;
  el.toast.className   = type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.toast.className = "hidden"; }, 3500);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

async function tryLogin() {
  const token = el.adminTokenInput.value.trim();
  if (!token) { showLoginError("Ange adminlösenordet."); return; }

  el.loginBtn.disabled    = true;
  el.loginBtn.textContent = "Verifierar…";

  const { ok, data } = await apiFetch("/api/admin/verify-token", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

  el.loginBtn.disabled    = false;
  el.loginBtn.textContent = "Logga in";

  if (!ok) { showLoginError(data.error || "Fel lösenord."); return; }

  adminToken = token;
  sessionStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
  showAdminApp();
}

function showLoginError(msg) {
  el.loginError.textContent = msg;
  el.loginError.classList.remove("hidden");
}

function logout() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  adminToken = "";
  questions  = [];
  el.adminApp.classList.add("hidden");
  el.loginScreen.classList.remove("hidden");
  el.adminTokenInput.value = "";
  el.loginError.classList.add("hidden");
  switchTab("users");
}

async function showAdminApp() {
  el.loginScreen.classList.add("hidden");
  el.adminApp.classList.remove("hidden");
  await loadUsers();
}

// ── Users ─────────────────────────────────────────────────────────────────────

async function loadUsers() {
  setTableMessage("Laddar…");
  const { ok, data } = await apiFetch("/api/admin/users");

  if (!ok) {
    if (data.error && data.error.includes("Obehörig")) {
      logout();
    } else {
      setTableMessage(data.error || "Kunde inte hämta användare.", true);
    }
    return;
  }

  users = Array.isArray(data) ? data : [];
  renderTable();
}

function setTableMessage(msg, isError = false) {
  const td = document.createElement("td");
  td.colSpan = 6;
  td.className = "empty-state";
  td.textContent = msg;
  if (isError) td.style.color = "var(--error)";

  const tr = document.createElement("tr");
  tr.appendChild(td);

  el.userTableBody.replaceChildren(tr);
}

function accessExpiry(courseDateStr) {
  if (!courseDateStr) return null;
  const d = new Date(courseDateStr);
  d.setMonth(d.getMonth() + 12);
  return d;
}

function formatDate(isoStr) {
  if (!isoStr) return "–";
  return new Date(isoStr).toLocaleDateString("sv-SE");
}

function makeStatusBadge(valid) {
  const span = document.createElement("span");
  span.className   = valid ? "badge-active" : "badge-expired";
  span.textContent = valid ? "Aktiv" : "Utgången";
  return span;
}

function makeActionBtn(label, ariaLabel, className, handler) {
  const btn = document.createElement("button");
  btn.type        = "button";
  btn.className   = `btn ${className} btn-sm`;
  btn.textContent = label;
  btn.setAttribute("aria-label", ariaLabel);
  btn.addEventListener("click", handler);
  return btn;
}

function renderTable() {
  if (!users.length) {
    setTableMessage('Inga användare registrerade ännu. Klicka på "Lägg till användare" för att börja.');
    return;
  }

  const fragment = document.createDocumentFragment();

  users.forEach((u) => {
    const expiry = accessExpiry(u.course_date);
    const valid  = expiry && expiry > new Date();

    const cells = [
      (() => { const td = document.createElement("td"); const b = document.createElement("strong"); b.textContent = u.name || "–"; td.appendChild(b); return td; })(),
      (() => { const td = document.createElement("td"); td.textContent = u.email; return td; })(),
      (() => { const td = document.createElement("td"); td.textContent = formatDate(u.course_date); return td; })(),
      (() => { const td = document.createElement("td"); td.textContent = expiry ? formatDate(expiry.toISOString()) : "–"; return td; })(),
      (() => { const td = document.createElement("td"); td.appendChild(makeStatusBadge(valid)); return td; })(),
      (() => {
        const td  = document.createElement("td");
        td.style.whiteSpace = "nowrap";

        const editBtn = makeActionBtn(
          "Redigera",
          `Redigera ${u.name || u.email}`,
          "btn-ghost",
          () => openEdit(u.id)
        );
        const delBtn = makeActionBtn(
          "Ta bort",
          `Ta bort ${u.name || u.email}`,
          "btn-danger",
          () => confirmDelete(u.id, u.name || u.email)
        );
        delBtn.style.marginLeft = "6px";

        td.appendChild(editBtn);
        td.appendChild(delBtn);
        return td;
      })(),
    ];

    const tr = document.createElement("tr");
    cells.forEach((td) => tr.appendChild(td));
    fragment.appendChild(tr);
  });

  el.userTableBody.replaceChildren(fragment);
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function openAdd() {
  editingId = null;
  el.modalTitle.textContent = "Lägg till användare";
  el.fieldName.value        = "";
  el.fieldEmail.value       = "";
  el.fieldCourseDate.value  = "";
  el.modalError.classList.add("hidden");
  el.userModal.classList.remove("hidden");
  el.fieldName.focus();
}

function openEdit(id) {
  const user = users.find((u) => u.id === id);
  if (!user) return;
  editingId               = id;
  el.modalTitle.textContent = "Redigera användare";
  el.fieldName.value        = user.name || "";
  el.fieldEmail.value       = user.email || "";
  el.fieldCourseDate.value  = user.course_date || "";
  el.modalError.classList.add("hidden");
  el.userModal.classList.remove("hidden");
  el.fieldName.focus();
}

function closeModal() {
  el.userModal.classList.add("hidden");
  editingId = null;
}

async function saveUser() {
  const name        = el.fieldName.value.trim();
  const email       = el.fieldEmail.value.trim();
  const course_date = el.fieldCourseDate.value;

  if (!name || !email || !course_date) {
    el.modalError.textContent = "Alla fält måste fyllas i.";
    el.modalError.classList.remove("hidden");
    return;
  }

  el.modalSaveBtn.disabled    = true;
  el.modalSaveBtn.textContent = "Sparar…";

  const isEdit    = !!editingId;
  const { ok, data } = await apiFetch(
    isEdit ? `/api/admin/users/${editingId}` : "/api/admin/users",
    { method: isEdit ? "PUT" : "POST", body: JSON.stringify({ name, email, course_date }) }
  );

  el.modalSaveBtn.disabled    = false;
  el.modalSaveBtn.textContent = "Spara";

  if (!ok) {
    el.modalError.textContent = data.error || "Kunde inte spara användaren.";
    el.modalError.classList.remove("hidden");
    return;
  }

  closeModal();
  showToast(isEdit ? "Användaren uppdaterades." : "Användaren lades till.");
  await loadUsers();
}

async function confirmDelete(id, name) {
  if (!confirm(`Ta bort "${name}"? Åtgärden kan inte ångras.`)) return;

  const { ok, data } = await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
  if (!ok) { showToast(data.error || "Kunde inte ta bort användaren.", "error"); return; }

  showToast(`"${name}" togs bort.`);
  await loadUsers();
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function switchTab(tabName) {
  el.tabBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });
  el.tabUsers.classList.toggle("hidden", tabName !== "users");
  el.tabQuestions.classList.toggle("hidden", tabName !== "questions");
  if (tabName === "questions" && questions.length === 0) {
    loadQuestions();
  }
}

// ── Questions ─────────────────────────────────────────────────────────────────

let questions      = [];
let questionPage   = 0;
const Q_PER_PAGE   = 25;
let qFilter        = { search: "", domain: "", difficulty: "", type: "" };
let editingQId     = null;
let modalOptions   = []; // [{ text, correct }, ...]

async function loadQuestions() {
  setQTableMessage("Laddar…");
  const { ok, data } = await apiFetch("/api/admin/questions");
  if (!ok) {
    if (data.error && data.error.includes("Obehörig")) { logout(); return; }
    setQTableMessage(data.error || "Kunde inte hämta frågor.", true);
    return;
  }
  questions = Array.isArray(data) ? data : [];
  populateDomainFilter();
  renderQuestionTable();
}

function setQTableMessage(msg, isError = false) {
  const td = document.createElement("td");
  td.colSpan = 6;
  td.className = "empty-state";
  td.textContent = msg;
  if (isError) td.style.color = "var(--error)";
  const tr = document.createElement("tr");
  tr.appendChild(td);
  el.questionTableBody.replaceChildren(tr);
}

function populateDomainFilter() {
  const domains = [...new Set(questions.map(q => q.domain).filter(Boolean))].sort();
  const cur = el.qFilterDomain.value;
  el.qFilterDomain.innerHTML = '<option value="">Alla domäner</option>';
  el.domainDatalist.innerHTML = "";
  domains.forEach(d => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = d;
    el.qFilterDomain.appendChild(opt.cloneNode(true));
    el.domainDatalist.appendChild(opt);
  });
  if (cur) el.qFilterDomain.value = cur;
}

function getFilteredQuestions() {
  const { search, domain, difficulty, type } = qFilter;
  const s = search.toLowerCase();
  return questions.filter(q => {
    if (domain && q.domain !== domain) return false;
    if (difficulty && q.difficulty !== difficulty) return false;
    if (type && q.type !== type) return false;
    if (s) {
      const inId = (q.id || "").toLowerCase().includes(s);
      const inQ  = (q.question || "").toLowerCase().includes(s);
      if (!inId && !inQ) return false;
    }
    return true;
  });
}

function renderQuestionTable() {
  const filtered = getFilteredQuestions();
  const total    = filtered.length;
  const maxPage  = Math.max(0, Math.ceil(total / Q_PER_PAGE) - 1);
  if (questionPage > maxPage) questionPage = maxPage;

  const page = filtered.slice(questionPage * Q_PER_PAGE, (questionPage + 1) * Q_PER_PAGE);

  const from = total === 0 ? 0 : questionPage * Q_PER_PAGE + 1;
  const to   = Math.min((questionPage + 1) * Q_PER_PAGE, total);
  el.qPaginationInfo.textContent = total === 0
    ? "Inga frågor matchar filtret."
    : `${from}–${to} av ${total} frågor`;
  el.qPrevBtn.disabled = questionPage === 0;
  el.qNextBtn.disabled = questionPage >= maxPage;

  if (!page.length) {
    setQTableMessage("Inga frågor matchar filtret.");
    return;
  }

  const fragment = document.createDocumentFragment();
  page.forEach(q => {
    const tr = document.createElement("tr");

    const preview = (q.question || "").length > 90
      ? q.question.slice(0, 90) + "…"
      : (q.question || "");

    const makeCell = (content, style = "") => {
      const td = document.createElement("td");
      if (style) td.style.cssText = style;
      if (typeof content === "string") td.textContent = content;
      else td.appendChild(content);
      return td;
    };

    const idCode = document.createElement("code");
    idCode.style.fontSize = ".8125rem";
    idCode.textContent = q.id;

    const actions = document.createElement("span");
    actions.style.whiteSpace = "nowrap";
    const editBtn = makeActionBtn("Redigera", `Redigera ${q.id}`, "btn-ghost",
      () => openEditQuestion(q.id));
    const delBtn  = makeActionBtn("Ta bort",  `Ta bort ${q.id}`,  "btn-danger",
      () => confirmDeleteQuestion(q.id));
    delBtn.style.marginLeft = "6px";
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    tr.appendChild(makeCell(idCode));
    tr.appendChild(makeCell(q.domain || "–"));
    tr.appendChild(makeCell(q.type || "–"));
    tr.appendChild(makeCell(q.difficulty || "–"));
    tr.appendChild(makeCell(preview, "max-width:360px;white-space:normal;font-size:.875rem"));
    tr.appendChild(makeCell(actions));

    fragment.appendChild(tr);
  });
  el.questionTableBody.replaceChildren(fragment);
}

// ── Question modal ────────────────────────────────────────────────────────────

function renderModalOptions() {
  const isSingle = el.qFieldType.value === "single";
  el.qOptionsList.innerHTML = "";

  modalOptions.forEach((opt, idx) => {
    const row = document.createElement("div");
    row.className = "option-row";

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + idx) + ".";

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = opt.text;
    textInput.placeholder = `Alternativ ${String.fromCharCode(65 + idx)}`;
    textInput.className = "input";
    textInput.addEventListener("input", () => { modalOptions[idx].text = textInput.value; });

    const correctLabel = document.createElement("label");
    correctLabel.className = "option-correct-label";

    const correctInput = document.createElement("input");
    correctInput.type = isSingle ? "radio" : "checkbox";
    if (isSingle) correctInput.name = "qCorrectAnswer";
    correctInput.checked = opt.correct;
    correctInput.addEventListener("change", () => {
      if (isSingle) {
        modalOptions.forEach((o, i) => { o.correct = i === idx; });
      } else {
        modalOptions[idx].correct = correctInput.checked;
      }
    });

    correctLabel.appendChild(correctInput);
    correctLabel.appendChild(document.createTextNode(" Rätt"));

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-ghost btn-sm";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", `Ta bort alternativ ${String.fromCharCode(65 + idx)}`);
    removeBtn.addEventListener("click", () => {
      modalOptions.splice(idx, 1);
      renderModalOptions();
    });

    row.appendChild(letter);
    row.appendChild(textInput);
    row.appendChild(correctLabel);
    row.appendChild(removeBtn);
    el.qOptionsList.appendChild(row);
  });
}

function updateQConditionalFields() {
  const type = el.qFieldType.value;
  el.qCaseBlock.classList.toggle("hidden",    type !== "case");
  el.qExhibitBlock.classList.toggle("hidden", type !== "exhibit");
  renderModalOptions();
}

function openAddQuestion() {
  editingQId = null;
  el.qModalTitle.textContent = "Lägg till fråga";
  el.qFieldId.disabled       = false;
  el.qFieldId.value          = "";
  el.qFieldDomain.value      = "";
  el.qFieldTaskCode.value    = "";
  el.qFieldTask.value        = "";
  el.qFieldDifficulty.value  = "Medium";
  el.qFieldType.value        = "single";
  el.qFieldTags.value        = "";
  el.qFieldQuestion.value    = "";
  el.qFieldCaseText.value    = "";
  el.qFieldExhibit.value     = "";
  el.qFieldExplanation.value = "";
  modalOptions = [
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
  ];
  el.qModalError.classList.add("hidden");
  updateQConditionalFields();
  el.questionModal.classList.remove("hidden");
  el.qFieldId.focus();
}

function openEditQuestion(id) {
  const q = questions.find(x => x.id === id);
  if (!q) return;
  editingQId = id;
  el.qModalTitle.textContent = "Redigera fråga";
  el.qFieldId.disabled       = true;
  el.qFieldId.value          = q.id;
  el.qFieldDomain.value      = q.domain || "";
  el.qFieldTaskCode.value    = q.taskCode || "";
  el.qFieldTask.value        = q.task || "";
  el.qFieldDifficulty.value  = q.difficulty || "Medium";
  el.qFieldType.value        = q.type || "single";
  el.qFieldTags.value        = Array.isArray(q.tags) ? q.tags.join(", ") : "";
  el.qFieldQuestion.value    = q.question || "";
  el.qFieldCaseText.value    = q.caseText || q.case || "";
  el.qFieldExhibit.value     = q.exhibitContent || q.exhibit || "";
  el.qFieldExplanation.value = q.explanation || "";

  const correctSet = new Set(Array.isArray(q.correctAnswers) ? q.correctAnswers : []);
  const opts = Array.isArray(q.options) ? q.options : [];
  modalOptions = opts.map((text, i) => ({
    text: typeof text === "string" ? text : "",
    correct: correctSet.has(i),
  }));

  el.qModalError.classList.add("hidden");
  updateQConditionalFields();
  el.questionModal.classList.remove("hidden");
  el.qFieldQuestion.focus();
}

function closeQuestionModal() {
  el.questionModal.classList.add("hidden");
  editingQId = null;
}

async function saveQuestion() {
  const id           = el.qFieldId.value.trim();
  const questionText = el.qFieldQuestion.value.trim();

  if (!id) {
    el.qModalError.textContent = "ID måste fyllas i.";
    el.qModalError.classList.remove("hidden");
    return;
  }
  if (!questionText) {
    el.qModalError.textContent = "Frågetext måste fyllas i.";
    el.qModalError.classList.remove("hidden");
    return;
  }

  const type          = el.qFieldType.value;
  const options       = modalOptions.map(o => o.text);
  const correctAnswers = modalOptions.reduce((acc, o, i) => {
    if (o.correct) acc.push(i);
    return acc;
  }, []);
  const tags = el.qFieldTags.value.split(",").map(s => s.trim()).filter(Boolean);

  const q = {
    id,
    domain:      el.qFieldDomain.value.trim(),
    taskCode:    el.qFieldTaskCode.value.trim(),
    task:        el.qFieldTask.value.trim(),
    tags,
    difficulty:  el.qFieldDifficulty.value,
    type,
    question:    questionText,
    options,
    correctAnswers,
    explanation: el.qFieldExplanation.value.trim(),
  };
  if (type === "case")    q.caseText      = el.qFieldCaseText.value.trim();
  if (type === "exhibit") q.exhibitContent = el.qFieldExhibit.value.trim();

  el.qModalSaveBtn.disabled    = true;
  el.qModalSaveBtn.textContent = "Sparar…";

  const isEdit = !!editingQId;
  const { ok, data } = await apiFetch(
    isEdit ? `/api/admin/questions/${editingQId}` : "/api/admin/questions",
    { method: isEdit ? "PUT" : "POST", body: JSON.stringify(q) }
  );

  el.qModalSaveBtn.disabled    = false;
  el.qModalSaveBtn.textContent = "Spara";

  if (!ok) {
    el.qModalError.textContent = data.error || "Kunde inte spara frågan.";
    el.qModalError.classList.remove("hidden");
    return;
  }

  closeQuestionModal();
  showToast(isEdit ? "Frågan uppdaterades." : "Frågan lades till.");
  await loadQuestions();
}

async function confirmDeleteQuestion(id) {
  if (!confirm(`Ta bort fråga "${id}"? Åtgärden kan inte ångras.`)) return;
  const { ok, data } = await apiFetch(`/api/admin/questions/${id}`, { method: "DELETE" });
  if (!ok) { showToast(data.error || "Kunde inte ta bort frågan.", "error"); return; }
  showToast(`Fråga "${id}" togs bort.`);
  await loadQuestions();
}

// ── Events ────────────────────────────────────────────────────────────────────

el.loginBtn.addEventListener("click", tryLogin);
el.adminTokenInput.addEventListener("keydown", (e) => { if (e.key === "Enter") tryLogin(); });
el.adminLogoutBtn.addEventListener("click", logout);

// User tab
el.openAddUserBtn.addEventListener("click", openAdd);
el.modalCloseBtn.addEventListener("click",  closeModal);
el.modalCancelBtn.addEventListener("click", closeModal);
el.modalSaveBtn.addEventListener("click",   saveUser);
el.userModal.addEventListener("click", (e) => { if (e.target === el.userModal) closeModal(); });

// Tabs
el.tabBtns.forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

// Question tab filters & pagination
el.qSearch.addEventListener("input", () => {
  qFilter.search = el.qSearch.value;
  questionPage = 0;
  renderQuestionTable();
});
el.qFilterDomain.addEventListener("change", () => {
  qFilter.domain = el.qFilterDomain.value;
  questionPage = 0;
  renderQuestionTable();
});
el.qFilterDifficulty.addEventListener("change", () => {
  qFilter.difficulty = el.qFilterDifficulty.value;
  questionPage = 0;
  renderQuestionTable();
});
el.qFilterType.addEventListener("change", () => {
  qFilter.type = el.qFilterType.value;
  questionPage = 0;
  renderQuestionTable();
});
el.qPrevBtn.addEventListener("click", () => {
  if (questionPage > 0) { questionPage--; renderQuestionTable(); }
});
el.qNextBtn.addEventListener("click", () => {
  questionPage++;
  renderQuestionTable();
});

// Question modal
el.openAddQuestionBtn.addEventListener("click", openAddQuestion);
el.qModalCloseBtn.addEventListener("click",  closeQuestionModal);
el.qModalCancelBtn.addEventListener("click", closeQuestionModal);
el.qModalSaveBtn.addEventListener("click",   saveQuestion);
el.questionModal.addEventListener("click", (e) => {
  if (e.target === el.questionModal) closeQuestionModal();
});
el.qAddOptionBtn.addEventListener("click", () => {
  modalOptions.push({ text: "", correct: false });
  renderModalOptions();
});
el.qFieldType.addEventListener("change", updateQConditionalFields);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!el.userModal.classList.contains("hidden"))     closeModal();
    if (!el.questionModal.classList.contains("hidden")) closeQuestionModal();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

if (adminToken) {
  showAdminApp();
} else {
  el.adminTokenInput.focus();
}
