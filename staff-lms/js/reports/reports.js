(() => {
  "use strict";

  const API_BASE = "https://icm-website-test-production.up.railway.app/api/reports";
  const token = () => localStorage.getItem("staffToken") || localStorage.getItem("token") || "";
  let reportData = null;

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>\"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
  const num = value => Number(value || 0);
  const money = value => `£${num(value).toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;

  function statCard(value, label, delta = "") {
    return `<div class="stat-card"><div class="stat-value">${esc(value)}</div><div class="stat-label">${esc(label)}</div>${delta ? `<div class="stat-delta">${esc(delta)}</div>` : ""}</div>`;
  }

  function bars(targetId, labels, values, formatter = value => value.toLocaleString("en-GB")) {
    const el = $(targetId);
    if (!el) return;
    if (!labels.length) {
      el.innerHTML = `<div class="empty-state">No data available.</div>`;
      return;
    }
    const max = Math.max(...values.map(num), 1);
    el.innerHTML = labels.map((label, i) => {
      const value = num(values[i]);
      const width = Math.max(2, value / max * 100);
      return `<div class="bar-row"><div class="bar-label">${esc(label)}</div><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div><div class="bar-value">${esc(formatter(value))}</div></div>`;
    }).join("");
  }

  function table(targetId, headers, rows, empty = "No data available.") {
    const el = $(targetId);
    if (!el) return;
    if (!rows.length) {
      el.innerHTML = `<tbody><tr><td>${esc(empty)}</td></tr></tbody>`;
      return;
    }
    el.innerHTML = `<thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody>`;
  }

  function gauge(targetId, value, label, unavailable = false) {
    const el = $(targetId);
    if (!el) return;
    if (unavailable) {
      el.innerHTML = `<div class="gauge-ring" style="--pct:0%;position:relative"><div class="gauge-inner">—</div></div><div class="gauge-label">${esc(label)}</div>`;
      return;
    }
    const pct = Math.max(0, Math.min(100, num(value)));
    el.innerHTML = `<div class="gauge-ring" style="--pct:${pct}%;position:relative"><div class="gauge-inner">${pct.toFixed(1)}%</div></div><div class="gauge-label">${esc(label)}</div>`;
  }

  async function loadReports() {
    const range = $("dateRange")?.value || "this_month";
    const notice = $("dataNotice");
    if (notice) notice.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading live report data…`;

    try {
      const res = await fetch(`${API_BASE}?range=${encodeURIComponent(range)}`, {
        headers: { Authorization: `Bearer ${token()}` },
        cache: "no-store"
      });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem("staffToken");
        window.location.href = "login.html";
        return;
      }
      if (!res.ok || !data.success) throw new Error(data.message || "Unable to load reports.");
      reportData = data;
      render(data);
    } catch (error) {
      console.error("Reports load error:", error);
      if (notice) notice.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Unable to load live reports: ${esc(error.message)}`;
    }
  }

  function render(data) {
    const a = data.dataAvailability || {};
    const s = data.summary || {};
    const e = data.enrollment || {};
    const att = data.attendance || {};
    const ops = data.operations || {};
    const fin = data.finance || {};

    $("dataNotice").innerHTML = `<i class="fa-solid fa-circle-info"></i> ${esc(data.notice || "Live report data loaded.")} <span class="badge-live">LIVE</span>`;

    $("summaryStats").innerHTML = [
      statCard(num(s.totalStudents).toLocaleString(), "Students"),
      statCard(num(s.newEnrollments).toLocaleString(), "New Records This Period"),
      statCard(num(s.activeApplications).toLocaleString(), "Active Applications"),
      statCard(num(s.admissions).toLocaleString(), "Admissions")
    ].join("");

    bars("trendChart", (data.trend || []).map(x => x.label), (data.trend || []).map(x => x.value), value => value > 1000 ? money(value) : value.toLocaleString("en-GB"));

    bars("enrollmentChart", (e.byCourse || []).map(x => x.course).slice(0, 12), (e.byCourse || []).map(x => x.students).slice(0, 12));
    $("enrollmentStatusList").innerHTML = (e.status || []).length
      ? e.status.map(x => `<div style="display:flex;justify-content:space-between;padding:8px 0"><span>${esc(x.status)}</span><strong>${num(x.count).toLocaleString()}</strong></div>`).join("")
      : "No enrollment status data available.";

    table("completionTable", ["Course", "Students", "Admissions", "Admission Rate"], (e.completion || []).map(x => `<tr><td>${esc(x.course)}</td><td>${num(x.students)}</td><td>${num(x.completed)}</td><td>${num(x.rate).toFixed(1)}%</td></tr>`), "No course data available.");

    gauge("attendanceGauge", att.rate, "Staff attendance from recorded attendance records", !a.staffAttendance);
    gauge("submissionGauge", 0, "Assignment submission data is not connected", true);
    table("riskTable", ["Student", "Course", "Attendance", "Overdue Assignments"], [], "Student risk reporting requires student attendance and assignment data, which are not connected yet.");

    table("tutorTable", ["Staff / Tutor", "Role", "Present", "Late", "Hours", "Classes Taught", "Rating"], (data.tutors || []).map(x => `<tr><td>${esc(x.name)}</td><td>${esc(x.role || "—")}</td><td>${num(x.present)}</td><td>${num(x.late)}</td><td>${num(x.hours).toFixed(1)}</td><td>—</td><td>—</td></tr>`), "No staff data available.");

    const os = ops.stats || {};
    $("operationsStats").innerHTML = [
      statCard(num(os.documentsPending), "Documents Pending"),
      statCard(num(os.applicationsPreparing), "Applications Preparing"),
      statCard(num(os.offersPending), "Offers Pending"),
      statCard(num(os.admissionsPending), "Admissions Pending")
    ].join("");

    bars("operationsChart", [], []);
    $("operationsStatusList").innerHTML = "Operations task status is not connected to a task table yet.";
    table("operationsTaskTable", ["Task", "Owner", "Priority", "Status"], [], "Operations task records are not connected yet.");

    $("financeStats").innerHTML = [
      statCard(money(s.revenue), "Current Revenue Snapshot"),
      statCard(money(fin.revenueByCourse?.reduce((sum, x) => sum + num(x.revenue), 0)), "Revenue in Connected Data"),
      statCard("—", "Previous Period Revenue"),
      statCard("LIVE", "Source Status")
    ].join("");
    bars("revenueChart", (fin.revenueByCourse || []).map(x => x.course).slice(0, 12), (fin.revenueByCourse || []).map(x => x.revenue).slice(0, 12), money);
  }

  function exportCsv() {
    if (!reportData) return alert("Please wait for the report to load.");
    const rows = [["Section","Metric","Value"]];
    const add = (section, metric, value) => rows.push([section, metric, value]);
    const s = reportData.summary || {};
    add("Summary", "Students", s.totalStudents);
    add("Summary", "New Records This Period", s.newEnrollments);
    add("Summary", "Applications", s.activeApplications);
    add("Summary", "Admissions", s.admissions);
    add("Summary", "Revenue", s.revenue);
    (reportData.enrollment?.byCourse || []).forEach(x => add("Course", x.course, `${x.students} students; ${x.applications} applications; ${x.admissions} admissions; ${x.revenue} revenue`));
    (reportData.tutors || []).forEach(x => add("Staff", x.name, `${x.role}; ${x.present} present; ${x.late} late; ${x.hours} hours`));
    (reportData.finance?.revenueByCourse || []).forEach(x => add("Finance", x.course, x.revenue));
    const csv = rows.map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gouldings-report-${$("dateRange").value}-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("dateRange")?.addEventListener("change", loadReports);
    $("exportCsv")?.addEventListener("click", exportCsv);
    loadReports();
  });
})();
