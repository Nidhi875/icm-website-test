/* ==========================================================
   ADMIN — STUDENT RECORDS (inside Student Portal, staff-gated)
   --------------------------------------------------------
   GET /students is real and already working (same one the
   Staff LMS Reports page uses).

   PUT /students/:id and DELETE /students/:id are NEW — see
   studentsController-additions.js / studentsRoutes-additions.js
   for the backend code these need. Verify those are deployed
   and tested before relying on Edit/Delete with real students.
   ========================================================== */


const API_BASE = "http://localhost:5000/api";

function authHeaders() {
    const token = localStorage.getItem("staffToken");
    return token ? { "Authorization": `Bearer ${token}` } : {};
}

let allStudents = [];
let editingId = null;
let deletingId = null;

// ---------------------------------------------------------
// LOAD
// ---------------------------------------------------------

async function loadStudents() {
    const errorBox = document.getElementById("loadError");
    errorBox.style.display = "none";

    try {
        const res = await fetch(`${API_BASE}/students`, {
            headers: { ...authHeaders() }
        });

      if (res.status === 401) {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffEmail");
    localStorage.removeItem("staffName");
    localStorage.removeItem("staffRole");

    window.location.replace("login.html?mode=admin");
    return;
}


        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to load students");
        }

        allStudents = data.students || [];
        renderTable();

    } catch (error) {
        console.error(error);
        errorBox.textContent = "Could not load student records: " + error.message;
        errorBox.style.display = "block";
        document.getElementById("studentsTableBody").innerHTML =
            `<tr><td colspan="6" class="empty-row">Could not load students.</td></tr>`;
    }
}

// ---------------------------------------------------------
// RENDER
// ---------------------------------------------------------

function renderTable() {
    const search = document.getElementById("studentSearch").value.trim().toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;

    let rows = allStudents.filter(s => {
     const matchesSearch = !search ||
    (s.full_name || "").toLowerCase().includes(search) ||
    (s.email || "").toLowerCase().includes(search) ||
    (s.student_id || "").toLowerCase().includes(search);
        const matchesStatus = !statusFilter || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const tbody = document.getElementById("studentsTableBody");

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No students match your filters.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(s => `
        <tr>
            <td>${escapeHtml(s.full_name || "—")}</td>
            <td>${escapeHtml(s.email || "—")}</td>
            <td>${escapeHtml(s.student_id || "—")}</td>
            <td><span class="status-pill ${s.status}">${s.status || "unknown"}</span></td>
            <td>${s.fee_amount != null ? "£" + Number(s.fee_amount).toLocaleString() : "—"}</td>
            <td>
                <div class="row-actions">
                    <button class="edit-btn" data-id="${s.id}" title="Edit">Edit</button>
                    <button class="delete-btn" data-id="${s.id}" title="Delete">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");

    tbody.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => openEditModal(btn.dataset.id));
    });

    tbody.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => openDeleteModal(btn.dataset.id));
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ---------------------------------------------------------
// EDIT
// ---------------------------------------------------------

function openEditModal(id) {
    const student = allStudents.find(s => String(s.id) === String(id));
    if (!student) return;

    editingId = id;
    document.getElementById("editName").value = student.full_name || "";
    document.getElementById("editEmail").value = student.email || "";
    document.getElementById("editStatus").value = student.status || "pending";
    document.getElementById("editFee").value = student.fee_amount || "";
    document.getElementById("editError").textContent = "";

    document.getElementById("editModalOverlay").classList.add("open");
}

function closeEditModal() {
    document.getElementById("editModalOverlay").classList.remove("open");
    editingId = null;
}

async function saveEdit() {
    const errorBox = document.getElementById("editError");
    errorBox.textContent = "";

    const payload = {
        full_name: document.getElementById("editName").value.trim(),
        email: document.getElementById("editEmail").value.trim(),
        status: document.getElementById("editStatus").value,
        fee_amount: document.getElementById("editFee").value
            ? Number(document.getElementById("editFee").value)
            : null
    };

    if (!payload.full_name || !payload.email) {
        errorBox.textContent = "Name and email are required.";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/students/${editingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Update failed");
        }

        closeEditModal();
        await loadStudents();

    } catch (error) {
        console.error(error);
        errorBox.textContent = error.message + " (this endpoint is new — confirm it's deployed on the backend.)";
    }
}

// ---------------------------------------------------------
// DELETE
// ---------------------------------------------------------

function openDeleteModal(id) {
    const student = allStudents.find(s => String(s.id) === String(id));
    deletingId = id;

    document.getElementById("deleteConfirmText").textContent =
        `This will permanently remove ${student ? student.full_name : "this student"}'s record. This cannot be undone.`;
    document.getElementById("deleteError").textContent = "";

    document.getElementById("deleteModalOverlay").classList.add("open");
}

function closeDeleteModal() {
    document.getElementById("deleteModalOverlay").classList.remove("open");
    deletingId = null;
}

async function confirmDelete() {
    const errorBox = document.getElementById("deleteError");
    errorBox.textContent = "";

    try {
        const res = await fetch(`${API_BASE}/students/${deletingId}`, {
            method: "DELETE",
            headers: { ...authHeaders() }
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Delete failed");
        }

        closeDeleteModal();
        await loadStudents();

    } catch (error) {
        console.error(error);
        errorBox.textContent = error.message + " (this endpoint is new — confirm it's deployed on the backend.)";
    }
}

// ---------------------------------------------------------
// INIT
// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    loadStudents();

    document.getElementById("studentSearch").addEventListener("input", renderTable);
    document.getElementById("statusFilter").addEventListener("change", renderTable);

    document.getElementById("cancelEdit").addEventListener("click", closeEditModal);
    document.getElementById("saveEdit").addEventListener("click", saveEdit);

    document.getElementById("cancelDelete").addEventListener("click", closeDeleteModal);
    document.getElementById("confirmDelete").addEventListener("click", confirmDelete);
});