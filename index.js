/* ===========================================================
   Student Scholarship Application & Disbursement Tracker
   Plain HTML / CSS / JS, no frameworks.
   Data persisted in localStorage (acts as our "database").
   =========================================================== */

const STORAGE_KEY = "scholarship_records_v3";

/* -----------------------------------------------------------
   FIELD REFERENCE (also documented in README.md)
   application_id     : string, unique, auto-generated e.g. "APP-0001"
   student_id         : string, e.g. "STU1001"
   student_name       : string
   scheme             : string, one of a fixed list of scholarship schemes
   applied_date       : ISO date string "YYYY-MM-DD"
   documents_status   : one of Pending | Incomplete | Verified | Rejected
   stage              : one of Submitted | Document Verification |
                         Forwarded for Sanction | Sanctioned | Disbursed | Rejected
   sanctioned_amount  : number (rupees), 0 if not yet sanctioned
   disbursed_date     : ISO date string or "" if not yet disbursed
   stage_since        : ISO date string - when the record LAST entered its
                         current stage. This is what "days at stage" is
                         calculated from (a derived value, recalculated
                         automatically whenever "stage" changes).
   ----------------------------------------------------------- */

// ---- Task 1: Sample dataset (20 records, including awkward cases) --------
const SAMPLE_DATA = [
  { application_id: "APP-0001", student_id: "STU1001", student_name: "Suriya", scheme: "State Merit Scholarship", applied_date: "2026-01-10", documents_status: "Verified", stage: "Disbursed", sanctioned_amount: 12000, disbursed_date: "2026-02-15", stage_since: "2026-02-15" },
  { application_id: "APP-0002", student_id: "STU1002", student_name: "Lathika", scheme: "Post-Matric SC/ST Scholarship", applied_date: "2026-01-12", documents_status: "Pending", stage: "Document Verification", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-01-14" },
  { application_id: "APP-0003", student_id: "STU1003", student_name: "Meenakshi", scheme: "Minority Welfare Scholarship", applied_date: "2025-09-02", documents_status: "Incomplete", stage: "Document Verification", sanctioned_amount: 0, disbursed_date: "", stage_since: "2025-09-05" },
  { application_id: "APP-0004", student_id: "STU1004", student_name: "Srimathi", scheme: "Central Sector Scheme", applied_date: "2026-02-01", documents_status: "Verified", stage: "Forwarded for Sanction", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-02-05" },
  { application_id: "APP-0005", student_id: "STU1005", student_name: "Bhavani", scheme: "State Merit Scholarship", applied_date: "2026-02-03", documents_status: "Verified", stage: "Sanctioned", sanctioned_amount: 8000, disbursed_date: "", stage_since: "2026-03-01" },
  { application_id: "APP-0006", student_id: "STU1006", student_name: "", scheme: "Fee Reimbursement (EWS)", applied_date: "2026-01-20", documents_status: "Rejected", stage: "Rejected", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-01-25" },
  { application_id: "APP-0007", student_id: "STU1007", student_name: "Vanthana", scheme: "Central Sector Scheme", applied_date: "2026-02-10", documents_status: "Pending", stage: "Submitted", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-02-10" },
  { application_id: "APP-0008", student_id: "STU1008", student_name: "Abishek", scheme: "State Merit Scholarship", applied_date: "2026-01-05", documents_status: "Verified", stage: "Document Verification", sanctioned_amount: 0, disbursed_date: "", stage_since: "2025-12-01" },
  { application_id: "APP-0019", student_id: "STU1019", student_name: "Hemamalini", scheme: "Fee Reimbursement (EWS)", applied_date: "2026-02-08", documents_status: "Rejected", stage: "Rejected", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-02-11" },
  { application_id: "APP-0009", student_id: "STU1009", student_name: "Kowsalya", scheme: "Minority Welfare Scholarship", applied_date: "2026-02-15", documents_status: "Verified", stage: "Forwarded for Sanction", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-02-20" },
  { application_id: "APP-0010", student_id: "STU1010", student_name: "Vanaja", scheme: "Post-Matric SC/ST Scholarship", applied_date: "2026-01-18", documents_status: "Verified", stage: "Disbursed", sanctioned_amount: 15000, disbursed_date: "2026-02-20", stage_since: "2026-02-20" },
  { application_id: "APP-0011", student_id: "STU1011", student_name: "Lishintha", scheme: "State Merit Scholarship", applied_date: "2026-02-22", documents_status: "Pending", stage: "Submitted", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-02-22" },
  { application_id: "APP-0012", student_id: "STU1012", student_name: "Ramya", scheme: "Central Sector Scheme", applied_date: "2026-01-08", documents_status: "Incomplete", stage: "Document Verification", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-01-11" },
  { application_id: "APP-0013", student_id: "STU1013", student_name: "Shruthi", scheme: "Minority Welfare Scholarship", applied_date: "2026-02-05", documents_status: "Verified", stage: "Sanctioned", sanctioned_amount: 9500, disbursed_date: "", stage_since: "2026-02-28" },
  { application_id: "APP-0014", student_id: "STU1014", student_name: "Thamilarasi", scheme: "Fee Reimbursement (EWS)", applied_date: "2026-01-29", documents_status: "Verified", stage: "Forwarded for Sanction", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-02-02" },
  { application_id: "APP-0015", student_id: "STU1015", student_name: "Devi", scheme: "State Merit Scholarship", applied_date: "2025-11-20", documents_status: "Pending", stage: "Submitted", sanctioned_amount: 0, disbursed_date: "", stage_since: "2025-11-20" },
  { application_id: "APP-0016", student_id: "STU1016", student_name: "Jancy", scheme: "Post-Matric SC/ST Scholarship", applied_date: "2026-02-12", documents_status: "Verified", stage: "Disbursed", sanctioned_amount: 11000, disbursed_date: "2026-03-10", stage_since: "2026-03-10" },
  { application_id: "APP-0017", student_id: "STU1017", student_name: "Janani", scheme: "Central Sector Scheme", applied_date: "2026-02-18", documents_status: "Incomplete", stage: "Document Verification", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-02-19" },
  { application_id: "APP-0018", student_id: "STU1018", student_name: "Velvizhi", scheme: "Minority Welfare Scholarship", applied_date: "2026-01-25", documents_status: "Verified", stage: "Sanctioned", sanctioned_amount: 7000, disbursed_date: "", stage_since: "2026-02-25" },
  { application_id: "APP-0020", student_id: "STU1020", student_name: "Kalpana", scheme: "State Merit Scholarship", applied_date: "2026-02-25", documents_status: "Pending", stage: "Submitted", sanctioned_amount: 0, disbursed_date: "", stage_since: "2026-02-25" }
];

// ---------------------------------------------------------------
// "Fake backend": wraps localStorage with async + occasional
// failure surface points so the UI genuinely exercises the
// loading / empty / error states required by Task 4.
// ---------------------------------------------------------------
const backend = {
  async load() {
    await delay(500);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DATA));
      return clone(SAMPLE_DATA);
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Corrupt data");
      return parsed;
    } catch (e) {
      throw new Error("Stored data could not be read. It may be corrupted.");
    }
  },
  async save(records) {
    await delay(300);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    } catch (e) {
      throw new Error("Could not save changes. Storage may be full or unavailable.");
    }
  },
  async reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DATA));
  }
};

function delay(ms) { return new Promise(res => setTimeout(res, ms)); }
function clone(x) { return JSON.parse(JSON.stringify(x)); }

// ---------------------------------------------------------------
// App state
// ---------------------------------------------------------------
let records = [];
let uiState = "loading"; // loading | error | ready
let editingId = null;

const STAGE_LIST = ["Submitted", "Document Verification", "Forwarded for Sanction", "Sanctioned", "Disbursed", "Rejected"];

// ---------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------
const el = {
  summaryStrip: document.getElementById("summaryStrip"),
  searchInput: document.getElementById("searchInput"),
  stageFilter: document.getElementById("stageFilter"),
  schemeFilter: document.getElementById("schemeFilter"),
  sortSelect: document.getElementById("sortSelect"),
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  errorMessage: document.getElementById("errorMessage"),
  emptyState: document.getElementById("emptyState"),
  dataWrap: document.getElementById("dataWrap"),
  recordsBody: document.getElementById("recordsBody"),
  retryBtn: document.getElementById("retryBtn"),
  addBtn: document.getElementById("addBtn"),
  modalOverlay: document.getElementById("modalOverlay"),
  modalTitle: document.getElementById("modalTitle"),
  recordForm: document.getElementById("recordForm"),
  closeModal: document.getElementById("closeModal"),
  cancelBtn: document.getElementById("cancelBtn"),
  detailOverlay: document.getElementById("detailOverlay"),
  detailBody: document.getElementById("detailBody"),
  closeDetail: document.getElementById("closeDetail"),
  toast: document.getElementById("toast")
};

// ---------------------------------------------------------------
// Derived value: days at current stage (Task 3 requirement)
// ---------------------------------------------------------------
function daysAtStage(record) {
  if (!record.stage_since) return null;
  const since = new Date(record.stage_since + "T00:00:00");
  const now = new Date();
  const diffMs = now - since;
  if (isNaN(diffMs)) return null;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function daysClass(days) {
  if (days === null) return "";
  if (days >= 30) return "days-high";
  if (days >= 10) return "days-mid";
  return "days-low";
}

function badgeClass(stage) {
  return "badge-" + stage.replace(/\s+/g, "-");
}
function docClass(status) {
  return "doc-" + status;
}
function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtMoney(n) {
  if (!n || n === 0) return "—";
  return "₹" + Number(n).toLocaleString("en-IN");
}

// ---------------------------------------------------------------
// Init / load
// ---------------------------------------------------------------
async function init() {
  populateSchemeFilter();
  bindEvents();
  await loadData();
}

async function loadData() {
  setUiState("loading");
  try {
    records = await backend.load();
    setUiState("ready");
    render();
  } catch (e) {
    setUiState("error", e.message);
  }
}

function populateSchemeFilter() {
  const schemes = [...new Set(SAMPLE_DATA.map(r => r.scheme))];
  schemes.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    el.schemeFilter.appendChild(opt);
  });
}

function setUiState(state, message) {
  uiState = state;
  el.loadingState.classList.toggle("hidden", state !== "loading");
  el.errorState.classList.toggle("hidden", state !== "error");
  if (state === "error") el.errorMessage.textContent = message || "Something went wrong.";
  if (state !== "ready") {
    el.dataWrap.classList.add("hidden");
    el.emptyState.classList.add("hidden");
  }
}

// ---------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------
function getFiltered() {
  const q = el.searchInput.value.trim().toLowerCase();
  const stageF = el.stageFilter.value;
  const schemeF = el.schemeFilter.value;
  const sort = el.sortSelect.value;

  let list = records.filter(r => {
    if (stageF && r.stage !== stageF) return false;
    if (schemeF && r.scheme !== schemeF) return false;
    if (q) {
      const hay = [r.application_id, r.student_id, r.student_name].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  list.sort((a, b) => {
    switch (sort) {
      case "daysAsc": return (daysAtStage(a) ?? 0) - (daysAtStage(b) ?? 0);
      case "nameAsc": return (a.student_name || "").localeCompare(b.student_name || "");
      case "dateDesc": return new Date(b.applied_date) - new Date(a.applied_date);
      case "daysDesc":
      default: return (daysAtStage(b) ?? 0) - (daysAtStage(a) ?? 0);
    }
  });

  return list;
}

function render() {
  renderSummary();
  const list = getFiltered();

  if (list.length === 0) {
    el.dataWrap.classList.add("hidden");
    el.emptyState.classList.remove("hidden");
    return;
  }
  el.emptyState.classList.add("hidden");
  el.dataWrap.classList.remove("hidden");

  el.recordsBody.innerHTML = list.map(rowHtml).join("");

  el.recordsBody.querySelectorAll("[data-action='view']").forEach(btn =>
    btn.addEventListener("click", () => openDetail(btn.dataset.id)));
  el.recordsBody.querySelectorAll("[data-action='edit']").forEach(btn =>
    btn.addEventListener("click", () => openForm(btn.dataset.id)));
  el.recordsBody.querySelectorAll("[data-action='delete']").forEach(btn =>
    btn.addEventListener("click", () => deleteRecord(btn.dataset.id)));
}

function rowHtml(r) {
  const days = daysAtStage(r);
  const name = r.student_name ? escapeHtml(r.student_name) : '<span class="missing">Missing name</span>';
  return `
    <tr>
      <td data-label="App ID">${escapeHtml(r.application_id)}</td>
      <td data-label="Student" class="name-cell"><strong>${name}</strong><span>${escapeHtml(r.student_id)}</span></td>
      <td data-label="Scheme">${escapeHtml(r.scheme)}</td>
      <td data-label="Applied">${fmtDate(r.applied_date)}</td>
      <td data-label="Documents"><span class="doc-badge ${docClass(r.documents_status)}">${escapeHtml(r.documents_status)}</span></td>
      <td data-label="Stage"><span class="badge ${badgeClass(r.stage)}">${escapeHtml(r.stage)}</span></td>
      <td data-label="Days at Stage" class="days-cell ${daysClass(days)}">${days === null ? "—" : days + "d"}</td>
      <td data-label="Sanctioned Amt">${fmtMoney(r.sanctioned_amount)}</td>
      <td data-label="Disbursed">${r.disbursed_date ? fmtDate(r.disbursed_date) : "—"}</td>
      <td data-label="">
        <div class="row-actions">
          <button data-action="view" data-id="${r.application_id}">Status</button>
          <button data-action="edit" data-id="${r.application_id}">Edit</button>
          <button data-action="delete" data-id="${r.application_id}">Delete</button>
        </div>
      </td>
    </tr>`;
}

function renderSummary() {
  const total = records.length;
  const disbursed = records.filter(r => r.stage === "Disbursed").length;
  const stuck30 = records.filter(r => (daysAtStage(r) ?? 0) >= 30 && r.stage !== "Disbursed" && r.stage !== "Rejected").length;
  const totalDisbursed = records.reduce((sum, r) => sum + (r.stage === "Disbursed" ? Number(r.sanctioned_amount || 0) : 0), 0);

  el.summaryStrip.innerHTML = `
    <div class="summary-card">
      <div class="num">${total}</div>
      <div class="label">Total Applications</div>
    </div>
    <div class="summary-card">
      <div class="num">${disbursed}</div>
      <div class="label">Disbursed</div>
    </div>
    <div class="summary-card ${stuck30 > 0 ? "alert" : ""}">
      <div class="num">${stuck30}</div>
      <div class="label">Stuck 30+ days at a stage</div>
    </div>
    <div class="summary-card">
      <div class="num">${fmtMoney(totalDisbursed)}</div>
      <div class="label">Total Amount Disbursed</div>
    </div>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------------------------------------------------------------
// Detail / Status view
// ---------------------------------------------------------------
function openDetail(id) {
  const r = records.find(x => x.application_id === id);
  if (!r) {
    showToast("Record not found. It may have been deleted.", "error");
    return;
  }
  const days = daysAtStage(r);
  el.detailBody.innerHTML = `
    <dl>
      <dt>Application ID</dt><dd>${escapeHtml(r.application_id)}</dd>
      <dt>Student</dt><dd>${r.student_name ? escapeHtml(r.student_name) : "Missing name"} (${escapeHtml(r.student_id)})</dd>
      <dt>Scheme</dt><dd>${escapeHtml(r.scheme)}</dd>
      <dt>Current Stage</dt><dd><span class="badge ${badgeClass(r.stage)}">${escapeHtml(r.stage)}</span></dd>
      <dt>Days at this stage</dt><dd class="${daysClass(days)}">${days === null ? "Unknown" : days + " day(s)"}</dd>
      <dt>Documents Status</dt><dd>${escapeHtml(r.documents_status)}</dd>
      <dt>Sanctioned Amount</dt><dd>${fmtMoney(r.sanctioned_amount)}</dd>
      <dt>Disbursed Date</dt><dd>${r.disbursed_date ? fmtDate(r.disbursed_date) : "Not yet disbursed"}</dd>
    </dl>`;
  el.detailOverlay.classList.remove("hidden");
}

// ---------------------------------------------------------------
// Form (Add / Edit) — Task 3
// ---------------------------------------------------------------
function openForm(id) {
  editingId = id || null;
  el.recordForm.reset();
  clearErrors();

  if (editingId) {
    const r = records.find(x => x.application_id === editingId);
    if (!r) { showToast("Record not found.", "error"); return; }
    el.modalTitle.textContent = "Edit Application — " + r.application_id;
    document.getElementById("application_id").value = r.application_id;
    document.getElementById("student_id").value = r.student_id;
    document.getElementById("student_name").value = r.student_name;
    document.getElementById("scheme").value = r.scheme;
    document.getElementById("applied_date").value = r.applied_date;
    document.getElementById("documents_status").value = r.documents_status;
    document.getElementById("stage").value = r.stage;
    document.getElementById("sanctioned_amount").value = r.sanctioned_amount;
    document.getElementById("disbursed_date").value = r.disbursed_date;
  } else {
    el.modalTitle.textContent = "New Application";
    document.getElementById("application_id").value = "";
  }
  el.modalOverlay.classList.remove("hidden");
}

function closeForm() {
  el.modalOverlay.classList.add("hidden");
  editingId = null;
}

function clearErrors() {
  document.querySelectorAll(".err").forEach(e => e.textContent = "");
  document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
}

function setError(fieldId, message) {
  const small = document.querySelector(`.err[data-for="${fieldId}"]`);
  if (small) small.textContent = message;
  const input = document.getElementById(fieldId);
  if (input) input.classList.add("invalid");
}

// Server-side-style validation (Task 3: validate every field before saving)
function validateForm(data) {
  clearErrors();
  let ok = true;

  if (!data.student_id.trim()) { setError("student_id", "Student ID is required."); ok = false; }
  if (!data.student_name.trim()) { setError("student_name", "Student name is required."); ok = false; }
  if (!data.scheme) { setError("scheme", "Please select a scheme."); ok = false; }
  if (!data.applied_date) { setError("applied_date", "Applied date is required."); ok = false; }
  else if (new Date(data.applied_date) > new Date()) { setError("applied_date", "Applied date cannot be in the future."); ok = false; }
  if (!data.documents_status) { setError("documents_status", "Please select documents status."); ok = false; }
  if (!data.stage) { setError("stage", "Please select a stage."); ok = false; }

  if (data.sanctioned_amount !== "" && Number(data.sanctioned_amount) < 0) {
    setError("sanctioned_amount", "Amount cannot be negative."); ok = false;
  }
  if (data.stage === "Sanctioned" || data.stage === "Disbursed") {
    if (!data.sanctioned_amount || Number(data.sanctioned_amount) <= 0) {
      setError("sanctioned_amount", "Sanctioned amount is required once sanctioned."); ok = false;
    }
  }
  if (data.disbursed_date && data.stage !== "Disbursed") {
    setError("disbursed_date", 'Disbursed date can only be set when stage is "Disbursed".'); ok = false;
  }
  if (data.stage === "Disbursed" && !data.disbursed_date) {
    setError("disbursed_date", "Disbursed date is required once disbursed."); ok = false;
  }
  if (data.disbursed_date && data.applied_date && new Date(data.disbursed_date) < new Date(data.applied_date)) {
    setError("disbursed_date", "Disbursed date cannot be before applied date."); ok = false;
  }

  return ok;
}

function nextApplicationId() {
  const nums = records.map(r => parseInt((r.application_id || "APP-0000").split("-")[1], 10)).filter(n => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return "APP-" + String(next).padStart(4, "0");
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const data = {
    student_id: document.getElementById("student_id").value,
    student_name: document.getElementById("student_name").value,
    scheme: document.getElementById("scheme").value,
    applied_date: document.getElementById("applied_date").value,
    documents_status: document.getElementById("documents_status").value,
    stage: document.getElementById("stage").value,
    sanctioned_amount: document.getElementById("sanctioned_amount").value,
    disbursed_date: document.getElementById("disbursed_date").value
  };

  if (!validateForm(data)) {
    showToast("Please fix the highlighted fields.", "error");
    return;
  }

  const submitBtn = el.recordForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  try {
    if (editingId) {
      const idx = records.findIndex(r => r.application_id === editingId);
      const prevStage = records[idx].stage;
      const updated = {
        ...records[idx],
        ...data,
        sanctioned_amount: Number(data.sanctioned_amount) || 0,
        stage_since: data.stage !== prevStage ? todayISO() : records[idx].stage_since
      };
      records[idx] = updated;
    } else {
      const newRecord = {
        application_id: nextApplicationId(),
        ...data,
        sanctioned_amount: Number(data.sanctioned_amount) || 0,
        stage_since: todayISO()
      };
      records.push(newRecord);
    }

    await backend.save(records);
    closeForm();
    render();
    showToast(editingId ? "Application updated." : "Application added.", "success");
  } catch (err) {
    showToast(err.message || "Save failed. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Application";
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function deleteRecord(id) {
  const r = records.find(x => x.application_id === id);
  if (!r) { showToast("Record not found.", "error"); return; }
  if (!confirm(`Delete application ${id} (${r.student_name || "unnamed"})? This cannot be undone.`)) return;

  const backup = clone(records);
  records = records.filter(x => x.application_id !== id);
  try {
    await backend.save(records);
    render();
    showToast("Application deleted.", "success");
  } catch (err) {
    records = backup;
    render();
    showToast(err.message || "Delete failed.", "error");
  }
}

// ---------------------------------------------------------------
// Toast
// ---------------------------------------------------------------
let toastTimer = null;
function showToast(msg, type) {
  el.toast.textContent = msg;
  el.toast.className = "toast " + (type || "");
  el.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.add("hidden"), 3000);
}

// ---------------------------------------------------------------
// Events
// ---------------------------------------------------------------
function bindEvents() {
  el.searchInput.addEventListener("input", render);
  el.stageFilter.addEventListener("change", render);
  el.schemeFilter.addEventListener("change", render);
  el.sortSelect.addEventListener("change", render);

  el.addBtn.addEventListener("click", () => openForm(null));
  el.closeModal.addEventListener("click", closeForm);
  el.cancelBtn.addEventListener("click", closeForm);
  el.modalOverlay.addEventListener("click", (e) => { if (e.target === el.modalOverlay) closeForm(); });
  el.recordForm.addEventListener("submit", handleFormSubmit);

  el.closeDetail.addEventListener("click", () => el.detailOverlay.classList.add("hidden"));
  el.detailOverlay.addEventListener("click", (e) => { if (e.target === el.detailOverlay) el.detailOverlay.classList.add("hidden"); });

  el.retryBtn.addEventListener("click", loadData);

  document.getElementById("stage").addEventListener("change", (e) => {
    const disbursedField = document.getElementById("disbursed_date");
    if (e.target.value !== "Disbursed") disbursedField.value = "";
  });
}

document.addEventListener("DOMContentLoaded", init);
