(() => {
  "use strict";
  const API_BASE = "https://icm-website-test-production.up.railway.app/api";
  const token = localStorage.getItem("token");
  const page = document.body.dataset.page || "";
  const root = document.getElementById("pageData");
  const status = document.getElementById("sectionStatus");
  let storedUser = {};
  try { storedUser = JSON.parse(localStorage.getItem("user") || "{}"); } catch (_) {}
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const first = (...values) => values.find(v => v !== undefined && v !== null && String(v).trim() !== "") ?? "";
  const list = value => Array.isArray(value) ? value : [];
  const keysByPage = {
    qualifications: ["qualifications", "enrolledQualifications", "enrolled_qualifications"],
    courses: ["courses", "learningMaterials", "learning_materials", "modules"],
    assignments: ["assignments", "upcomingDeadlines", "deadlines"],
    calendar: ["calendar", "calendarEvents", "calendar_events", "events", "deadlines", "assignments"],
    messages: ["messages"],
    certificates: ["certificates", "documents"],
    results: ["results", "examResults", "exam_results", "grades"],
    payments: ["payments", "invoices", "transactions"],
    documents: ["documents"]
  };
  function showMessage(title, message) {
    root.innerHTML = `<div class="empty-state" style="padding:30px 10px;text-align:center"><strong>${esc(title)}</strong><p>${esc(message)}</p></div>`;
  }
  function displayItem(item) {
    if (typeof item === "string" || typeof item === "number") return {title: String(item), detail: ""};
    if (!item || typeof item !== "object") return {title: "Record", detail: ""};
    const title = first(item.title, item.name, item.course_name, item.courseName, item.qualification, item.assignment_title, item.subject, item.document_name, item.file_name, item.payment_reference, item.reference, item.activity, item.description, item.message, item.grade, item.result, "Record");
    const detail = first(item.description, item.body, item.message_body, item.status, item.submission_status, item.verification_status, item.grade, item.score, item.amount, item.due_date, item.dueDate, item.created_at, item.date, "");
    return {title: String(title), detail: detail === title ? "" : String(detail)};
  }
  function render(data) {
    const keys = keysByPage[page] || [];
    let records = [];
    for (const key of keys) {
      const found = list(data[key]);
      if (found.length) { records = found; break; }
    }
    if (page === "certificates" && records.length && records === list(data.documents)) {
      records = records.filter(item => /certificate/i.test(`${item.document_type || ""} ${item.document_name || ""} ${item.title || ""}`));
    }
    if (page === "settings") {
      const user = data.student || data.user || storedUser || {};
      const fields = [
        ["Full name", first(user.full_name, user.fullName, user.name)],
        ["Email", first(user.email)],
        ["Student ID", first(user.student_id, user.studentId)],
        ["Account status", first(user.account_status, user.status)]
      ].filter(pair => pair[1]);
      if (!fields.length) { showMessage("Profile information unavailable", "The API response did not include profile fields for this account."); return; }
      root.innerHTML = fields.map(([label, value]) => `<div class="qualification-item"><div class="qualification-main"><strong>${esc(label)}</strong><span>${esc(value)}</span></div></div>`).join("");
      return;
    }
    if (!records.length) {
      showMessage("No records available", `The current dashboard API did not return ${page === "courses" ? "learning materials" : page} for this account. No sample figures have been added. Backend support may be required for this section.`);
      return;
    }
    root.innerHTML = records.map(item => {
      const view = displayItem(item);
      return `<div class="qualification-item"><div class="qualification-main"><strong>${esc(view.title)}</strong>${view.detail ? `<span>${esc(view.detail)}</span>` : ""}</div></div>`;
    }).join("");
  }
  window.logout = function () { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "login.html"; };
  const name = first(storedUser.full_name, storedUser.fullName, storedUser.name, "Student");
  if ($("topName")) $("topName").textContent = name;
  if ($("topAvatar")) $("topAvatar").textContent = name.split(/\s+/).filter(Boolean).map(part => part[0]).join("").slice(0,2).toUpperCase() || "S";
  const menuToggle = $("menuToggle");
const sidebar = $("sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", (event) => {
        event.preventDefault();
        sidebar.classList.toggle("open");
    });
}

  if (!token || !Object.keys(storedUser).length) { window.location.href = "login.html"; return; }
  fetch(`${API_BASE}/students/dashboard`, {headers: {Authorization: `Bearer ${token}`, Accept: "application/json"}})
    .then(async response => {
      if (response.status === 401 || response.status === 403) { window.logout(); return null; }
      let data;
      try { data = await response.json(); } catch (_) { throw new Error("The server returned an invalid response."); }
      if (!response.ok || data.success === false) throw new Error(data.message || `Request failed (${response.status}).`);
      return data;
    })
    .then(data => { if (!data) return; render(data); if (status) status.textContent = "Data refreshed"; })
    .catch(error => { console.error("Student section load error:", error); showMessage("Unable to load live data", "Please check your connection and try again. If this continues, the backend endpoint needs to be checked."); if (status) status.textContent = "Could not load data"; });
})();
