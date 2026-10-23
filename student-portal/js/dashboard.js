/* Live student dashboard. Uses the existing student login token and backend route. */
(() => {
  "use strict";

  const API_BASE = "https://icm-website-test-production.up.railway.app/api";
  const token = localStorage.getItem("token");
  let user = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch (_) {}

  const $ = (id) => document.getElementById(id);
  const safeArray = (value) => Array.isArray(value) ? value : [];
  const first = (...values) => values.find(v => v !== undefined && v !== null && v !== "");
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const numberOrDash = (v) => v === undefined || v === null || v === "" ? "—" : v;
  const dateValue = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const formatDate = (value, options = { day: "2-digit", month: "short", year: "numeric" }) => {
    const d = dateValue(value);
    return d ? d.toLocaleDateString("en-GB", options) : "Date not set";
  };
  const initials = (name) => String(name || "Student").trim().split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join("").toUpperCase() || "ST";
  const showEmpty = (container, icon, title, note) => {
    if (!container) return;
    container.innerHTML = `<div class="empty-state"><i class="${icon}"></i><strong>${esc(title)}</strong><br>${esc(note)}</div>`;
  };

  function setIdentity(data = {}) {
    const student = data.student || {};
    const name = first(student.full_name, student.fullName, student.name, user.full_name, user.fullName, user.name, "Student");
    const avatar = initials(name);
    ["welcomeName", "topName"].forEach(id => { if ($(id)) $(id).textContent = name; });
    ["topAvatar"].forEach(id => { if ($(id)) $(id).textContent = avatar; });
    document.title = `Dashboard | ${name} — Gouldings Global Academy`;
  }

  function setStat(id, value) { if ($(id)) $(id).textContent = numberOrDash(value); }

  function normalizeList(data, keys) {
    for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
    return [];
  }

  function renderStats(data) {
    const stats = data.stats || {};
    const docs = safeArray(data.documents);
    const messages = safeArray(data.messages);
    const activity = safeArray(data.activity);
    const qualifications = normalizeList(data, ["qualifications", "courses", "enrolments", "enrollments"]);
    const assignments = normalizeList(data, ["assignments", "upcomingDeadlines", "deadlines"]);
    const notifications = normalizeList(data, ["notifications"]);
    const certificatesFromDocs = docs.filter(d => /certificate/i.test(`${d.document_type || ""} ${d.document_name || ""}`) && /approved|verified|issued|complete/i.test(d.verification_status || d.status || "issued")).length;

    setStat("enrolledCourses", first(stats.enrolledCourses, stats.enrolled_courses, stats.qualifications, qualifications.length || null));
    setStat("assignmentsDue", first(stats.assignmentsDue, stats.assignments_due, assignments.filter(a => {
      const d = dateValue(a.due_date || a.dueDate || a.deadline);
      return d && d >= new Date();
    }).length || null));
    setStat("certificates", first(stats.certificates, stats.certificateCount, certificatesFromDocs || null));
    setStat("notifications", first(stats.unreadNotifications, stats.notifications, stats.notificationCount, notifications.length || null));
    setStat("profileCompletion", stats.profileCompletion != null ? `${stats.profileCompletion}%` : "—");
    if ($("completionRing")) $("completionRing").style.setProperty("--completion", `${Math.max(0, Math.min(100, Number(stats.profileCompletion) || 0))}%`);
    if ($("profileStatus")) $("profileStatus").textContent = Number(stats.profileCompletion) >= 100 ? "Profile complete" : "Complete your profile";
    setStat("messageNavCount", stats.unreadMessages);
    const messageCount = first(stats.unreadMessages, stats.messages, messages.length || null);
    setStat("messages", messageCount);
    if ($("messageNavCount")) {
      $("messageNavCount").hidden = messageCount == null || Number(messageCount) <= 0;
      $("messageNavCount").textContent = messageCount ?? "";
    }
    if ($("assignmentNavCount")) {
      $("assignmentNavCount").hidden = !assignments.length;
      $("assignmentNavCount").textContent = assignments.length || "";
    }
    if ($("notificationDot")) $("notificationDot").hidden = !(Number(stats.unreadNotifications || 0) > 0);
    if ($("notificationHint")) $("notificationHint").textContent = Number(stats.unreadNotifications || 0) ? "Unread updates" : "Latest updates";
  }

  function renderQualifications(data) {
    const el = $("qualificationList");
    const list = normalizeList(data, ["qualifications", "courses", "enrolments", "enrollments"]);
    const application = data.application || {};
    const academic = data.academic || {};
    if (!list.length && (application.qualification || application.programme || application.program_name || academic.qualification || academic.programme)) {
      list.push({
        title: first(application.qualification, application.programme, application.program_name, academic.qualification, academic.programme),
        level: first(application.level, academic.level, ""),
        progress: first(academic.progress, academic.progress_percentage, null),
        status: first(application.status, "Application on record")
      });
    }
    if (!list.length) {
      showEmpty(el, "fa-solid fa-graduation-cap", "Your qualifications will appear here", "We couldn't find an active qualification record for your account yet.");
      return;
    }
    el.innerHTML = list.slice(0,4).map((q, i) => {
      const title = first(q.qualification_name, q.qualification, q.course_name, q.courseName, q.title, q.programme, "Qualification");
      const progress = Number(first(q.progress, q.progress_percentage, q.completion, 0));
      const validProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
      const subtitle = first(q.level, q.status, q.module, "Student record");
      return `<div class="qualification-item"><div class="qualification-art ${i % 2 ? "gold-art" : ""}"><i class="${i % 2 ? "fa-solid fa-shield-halved" : "fa-solid fa-graduation-cap"}"></i></div><div><div class="qualification-title">${esc(title)}</div><div class="qualification-subtitle">${esc(subtitle)}</div>${q.progress != null || q.progress_percentage != null || q.completion != null ? `<div class="progress-line"><span style="width:${validProgress}%"></span></div>` : ""}</div><div class="progress-label">${q.progress != null || q.progress_percentage != null || q.completion != null ? `${validProgress}%` : ""}</div></div>`;
    }).join("");
  }

  function renderAssignments(data) {
    const el = $("assignmentList");
    const list = normalizeList(data, ["assignments", "upcomingDeadlines", "deadlines"]);
    if (!list.length) {
      showEmpty(el, "fa-solid fa-file-circle-check", "You're all caught up", "Upcoming assignments will appear here when they are published.");
      return;
    }
    const sorted = list.slice().sort((a,b) => (dateValue(a.due_date || a.dueDate || a.deadline)?.getTime() || Infinity) - (dateValue(b.due_date || b.dueDate || b.deadline)?.getTime() || Infinity));
    el.innerHTML = sorted.slice(0,4).map(a => {
      const date = dateValue(a.due_date || a.dueDate || a.deadline);
      const title = first(a.title, a.assignment_title, a.name, a.assignment_name, "Assignment");
      const course = first(a.qualification, a.course_name, a.courseName, a.module, "Course not specified");
      const dueLabel = date ? `Due ${formatDate(date)}` : "Due date not set";
      const days = date ? Math.ceil((date.getTime() - Date.now()) / 86400000) : null;
      const badge = days != null && days <= 3 && days >= 0 ? "due-badge" : "due-badge upcoming";
      const dateTile = date ? `<div class="date-tile"><span>${esc(date.toLocaleDateString("en-GB",{month:"short"}))}</span><strong>${date.getDate()}</strong></div>` : `<div class="date-tile"><span>Due</span><strong>—</strong></div>`;
      return `<div class="assignment-item">${dateTile}<div class="assignment-main"><strong>${esc(title)}</strong><div class="assignment-meta">${esc(course)}</div><span class="${badge}">${esc(dueLabel)}</span></div></div>`;
    }).join("");
  }

  function renderActivity(data) {
    const el = $("recentActivity");
    const list = normalizeList(data, ["activity", "recentActivity", "recent_activity"]);
    if (!list.length) {
      showEmpty(el, "fa-solid fa-clock-rotate-left", "Your activity will show here", "Submissions, updates and learning milestones will appear as they happen.");
      return;
    }
    el.innerHTML = list.slice(0,5).map((a,i) => {
      const desc = first(a.description, a.activity, a.activity_type, a.title, "Student activity");
      const time = a.created_at || a.createdAt || a.date;
      const tone = i % 3 === 1 ? "green" : i % 3 === 2 ? "gold" : "";
      const icon = /message|feedback/i.test(desc) ? "fa-regular fa-message" : /certificate|complete|award/i.test(desc) ? "fa-solid fa-award" : /assignment|submit/i.test(desc) ? "fa-solid fa-file-lines" : "fa-solid fa-circle-check";
      return `<div class="activity-item"><div class="activity-icon ${tone}"><i class="${icon}"></i></div><div class="activity-copy"><strong>${esc(desc)}</strong><span>${esc(first(a.performed_by, a.actor, "Student portal"))}</span></div><time class="activity-time">${esc(time ? formatDate(time,{day:"2-digit",month:"short"}) : "")}</time></div>`;
    }).join("");
  }

  function renderNotifications(data) {
    const el = $("notificationList");
    const list = normalizeList(data, ["notifications", "announcements"]);
    const messages = safeArray(data.messages).filter(m => !m.is_internal);
    const combined = list.length ? list : messages.slice(0,4);
    if (!combined.length) {
      showEmpty(el, "fa-solid fa-bullhorn", "No new announcements", "Important messages and announcements will appear here.");
      return;
    }
    el.innerHTML = combined.slice(0,4).map((n,i) => {
      const title = first(n.title, n.subject, n.message_title, n.message, n.description, "Update from the academy");
      const body = first(n.description, n.body, n.preview, n.message_body, "");
      const date = n.created_at || n.createdAt || n.date;
      return `<div class="announcement-item"><div class="announcement-icon"><i class="${i % 2 ? "fa-solid fa-calendar-check" : "fa-solid fa-bullhorn"}"></i></div><div><strong>${esc(title)}</strong>${body && body !== title ? `<p>${esc(body)}</p>` : ""}<time>${esc(date ? formatDate(date) : "Academy update")}</time></div></div>`;
    }).join("");
  }

  function renderCalendar(data) {
    const grid = $("calendarGrid");
    if (!grid) return;
    const now = new Date();
    let shown = new Date(now.getFullYear(), now.getMonth(), 1);
    const events = normalizeList(data, ["calendar", "calendarEvents", "calendar_events", "events", "deadlines", "assignments"]);
    const draw = () => {
      $("calendarMonth").textContent = shown.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
      const start = new Date(shown.getFullYear(), shown.getMonth(), 1);
      const offset = (start.getDay() + 6) % 7;
      const days = new Date(shown.getFullYear(), shown.getMonth()+1, 0).getDate();
      const prevDays = new Date(shown.getFullYear(), shown.getMonth(), 0).getDate();
      const cells = [];
      ["MON","TUE","WED","THU","FRI","SAT","SUN"].forEach(d => cells.push(`<span class="calendar-day-name">${d}</span>`));
      for (let i=0;i<42;i++) {
        let day, date, muted = false;
        if (i < offset) { day = prevDays-offset+i+1; date = new Date(shown.getFullYear(),shown.getMonth()-1,day); muted = true; }
        else if (i >= offset+days) { day = i-offset-days+1; date = new Date(shown.getFullYear(),shown.getMonth()+1,day); muted = true; }
        else { day = i-offset+1; date = new Date(shown.getFullYear(),shown.getMonth(),day); }
        const hasEvent = events.some(e => {
          const d = dateValue(e.due_date || e.dueDate || e.date || e.start_date || e.start);
          return d && d.toDateString() === date.toDateString();
        });
        const isToday = date.toDateString() === now.toDateString();
        cells.push(`<span class="calendar-day ${muted?"muted":""} ${isToday?"today":""} ${hasEvent?"has-event":""}">${day}</span>`);
        if (i >= offset+days && cells.length >= 35) break;
      }
      grid.innerHTML = cells.join("");
      const monthEvents = events.filter(e => {
        const d = dateValue(e.due_date || e.dueDate || e.date || e.start_date || e.start);
        return d && d.getMonth() === shown.getMonth() && d.getFullYear() === shown.getFullYear();
      }).sort((a,b) => (dateValue(a.due_date||a.dueDate||a.date||a.start_date||a.start)?.getTime()||0)-(dateValue(b.due_date||b.dueDate||b.date||b.start_date||b.start)?.getTime()||0));
      const eventsEl = $("calendarEvents");
      if (!monthEvents.length) eventsEl.innerHTML = '<p class="empty-note">No upcoming calendar events for this month.</p>';
      else eventsEl.innerHTML = monthEvents.slice(0,3).map(e => `<div class="calendar-event"><i class="fa-solid fa-circle"></i><div><strong>${esc(first(e.title,e.name,e.assignment_title,"Academic event"))}</strong>${esc(formatDate(e.due_date||e.dueDate||e.date||e.start_date||e.start))}</div></div>`).join("");
    };
    $("prevMonth").onclick = () => { shown = new Date(shown.getFullYear(),shown.getMonth()-1,1); draw(); };
    $("nextMonth").onclick = () => { shown = new Date(shown.getFullYear(),shown.getMonth()+1,1); draw(); };
    draw();
  }

  async function loadDashboard() {
    if (!token) { window.location.href = "login.html"; return; }
    try {
      const response = await fetch(`${API_BASE}/students/dashboard`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
        return;
      }
      const data = await response.json();
      if (!response.ok || data.success === false) throw new Error(data.message || `Dashboard request failed (${response.status})`);
      setIdentity(data);
      renderStats(data);
      renderQualifications(data);
      renderAssignments(data);
      renderActivity(data);
      renderNotifications(data);
      renderCalendar(data);
      if ($("lastUpdated")) $("lastUpdated").innerHTML = `<i class="fa-regular fa-clock"></i> Updated ${new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`;
    } catch (error) {
      console.error("Student dashboard load error:", error);
      const message = "Couldn't refresh live data. Check your connection and try again.";
      ["qualificationList","assignmentList","recentActivity","notificationList"].forEach(id => {
        if ($(id)) showEmpty($(id), "fa-solid fa-triangle-exclamation", "Live data unavailable", message);
      });
      if ($("lastUpdated")) $("lastUpdated").textContent = "Unable to refresh data";
      const toast = $("dashboardToast");
      if (toast) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 4500); }
    }
  }

  window.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  };

  $("menuToggle")?.addEventListener("click", () => $("sidebar")?.classList.toggle("open"));
  $("notificationShortcut")?.addEventListener("click", () => $("announcements")?.scrollIntoView({behavior:"smooth",block:"start"}));
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 980 && $("sidebar")?.classList.contains("open") &&
        !$("sidebar").contains(event.target) && !$("menuToggle")?.contains(event.target)) $("sidebar").classList.remove("open");
  });

  setIdentity();
  loadDashboard();
  // Refresh live information periodically without reloading the page.
  window.setInterval(loadDashboard, 60000);
})();
