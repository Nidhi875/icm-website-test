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




const API_BASE = "https://icm-website-test-production.up.railway.app/api";
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

    const rows = allStudents.filter((s) => {
        const matchesSearch =
            !search ||
            (s.full_name || "").toLowerCase().includes(search) ||
            (s.email || "").toLowerCase().includes(search) ||
            (s.student_id || "").toLowerCase().includes(search);

        const matchesStatus =
            !statusFilter || s.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const tbody = document.getElementById("studentsTableBody");

    if (rows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    No students match your filters.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = rows.map((s) => `
        <tr class="student-row" data-id="${s.id}">
            <td>
                <button
                    type="button"
                    class="student-name-btn"
                    data-id="${s.id}"
                >
                    ${escapeHtml(s.full_name || "—")}
                </button>
            </td>

            <td>${escapeHtml(s.email || "—")}</td>

            <td>${escapeHtml(s.student_id || "—")}</td>

            <td>
                <span class="status-pill ${escapeHtml(s.status || "")}">
                    ${escapeHtml(s.status || "unknown")}
                </span>
            </td>

            <td>
                ${
                    s.fee_amount != null
                        ? "£" + Number(s.fee_amount).toLocaleString()
                        : "—"
                }
            </td>

            <td>
                <div class="row-actions">

                    <button
                        type="button"
                        class="view-btn"
                        data-id="${s.id}"
                        title="View Student Details"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="edit-btn"
                        data-id="${s.id}"
                        title="Edit"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        data-id="${s.id}"
                        title="Delete"
                    >
                        Delete
                    </button>

                </div>
            </td>
        </tr>
    `).join("");

    // ---------------------------------------------------------
    // VIEW DETAILS
    // ---------------------------------------------------------

    tbody.querySelectorAll(".student-name-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            openStudentDetails(btn.dataset.id);
        });
    });

    tbody.querySelectorAll(".view-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            openStudentDetails(btn.dataset.id);
        });
    });

    // ---------------------------------------------------------
    // EDIT
    // ---------------------------------------------------------

    tbody.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            openEditModal(btn.dataset.id);
        });
    });

    // ---------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------

    tbody.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            openDeleteModal(btn.dataset.id);
        });
    });
}


function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ---------------------------------------------------------
// STUDENT DETAILS
// ---------------------------------------------------------

async function openStudentDetails(id) {
    const student = allStudents.find(
        (s) => String(s.id) === String(id)
    );

    if (!student) {
        alert("Student record not found.");
        return;
    }

    // Show basic information immediately
    // while the detailed information is being loaded.
    createStudentDetailsModal();

    const modal = document.getElementById("studentDetailsModal");
    const content = document.getElementById("studentDetailsContent");

    modal.classList.add("open");

    content.innerHTML = `
        <div class="student-details-loading">
            <div class="loading-spinner"></div>
            <p>Loading student details...</p>
        </div>
    `;

    try {
        const res = await fetch(
            `${API_BASE}/students/${encodeURIComponent(id)}/details`,
            {
                method: "GET",
                headers: {
                    ...authHeaders()
                }
            }
        );

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
            throw new Error(
                data.message || "Failed to load student details."
            );
        }

        renderStudentDetails(data.student || data);

    } catch (error) {
        console.error("Student details error:", error);

        content.innerHTML = `
            <div class="student-details-error">
                <h3>Unable to load student details</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
    }
}

function createStudentDetailsModal() {
    if (document.getElementById("studentDetailsModal")) {
        return;
    }

    const modalHTML = `
        <div
            id="studentDetailsModal"
            class="student-details-overlay"
        >

            <div class="student-details-modal">

                <div class="student-details-header">

                    <div>
                        <h2>Student Details</h2>
                        <p>Complete student record</p>
                    </div>

                    <button
                        type="button"
                        id="closeStudentDetails"
                        class="student-details-close"
                    >
                        ×
                    </button>

                </div>

                <div
                    id="studentDetailsContent"
                    class="student-details-content"
                ></div>

            </div>

        </div>
    `;

    document.body.insertAdjacentHTML(
        "beforeend",
        modalHTML
    );

    document
        .getElementById("closeStudentDetails")
        .addEventListener("click", closeStudentDetails);

    document
        .getElementById("studentDetailsModal")
        .addEventListener("click", (event) => {

            if (
                event.target.id === "studentDetailsModal"
            ) {
                closeStudentDetails();
            }

        });
}

function closeStudentDetails() {
    const modal =
        document.getElementById("studentDetailsModal");

    if (modal) {
        modal.classList.remove("open");
    }
}

function renderStudentDetails(student) {
    const content =
        document.getElementById("studentDetailsContent");

    const profile = student.profile || {};
    const application = student.application || {};

    content.innerHTML = `

        <!-- =========================================
             HEADER
        ========================================== -->

        <section class="student-detail-profile">

            <div class="student-avatar">
                ${
                    profile.profile_photo_url
                        ? `<img
                            src="${escapeHtml(profile.profile_photo_url)}"
                            alt="Student"
                           >`
                        : escapeHtml(
                            (student.full_name || "S")
                                .charAt(0)
                                .toUpperCase()
                          )
                }
            </div>

            <div class="student-profile-main">

                <h3>
                    ${escapeHtml(student.full_name || "—")}
                </h3>

                <p>
                    Student ID:
                    <strong>
                        ${escapeHtml(student.student_id || "—")}
                    </strong>
                </p>

                <p>
                    ${escapeHtml(student.email || "—")}
                </p>

                <span class="status-pill">
                    ${escapeHtml(student.status || "unknown")}
                </span>

            </div>

        </section>


        <!-- =========================================
             OVERVIEW
        ========================================== -->

        <section class="student-detail-section">

            <h3>Overview</h3>

            <div class="student-detail-grid">

                <div>
                    <label>Full Name</label>
                    <strong>
                        ${escapeHtml(student.full_name || "—")}
                    </strong>
                </div>

                <div>
                    <label>Preferred Name</label>
                    <strong>
                        ${escapeHtml(profile.preferred_name || "—")}
                    </strong>
                </div>

                <div>
                    <label>Email</label>
                    <strong>
                        ${escapeHtml(student.email || "—")}
                    </strong>
                </div>

                <div>
                    <label>Phone</label>
                    <strong>
                        ${escapeHtml(profile.phone || "—")}
                    </strong>
                </div>

                <div>
                    <label>WhatsApp</label>
                    <strong>
                        ${escapeHtml(profile.whatsapp_number || "—")}
                    </strong>
                </div>

                <div>
                    <label>Date of Birth</label>
                    <strong>
                        ${escapeHtml(profile.date_of_birth || "—")}
                    </strong>
                </div>

                <div>
                    <label>Gender</label>
                    <strong>
                        ${escapeHtml(profile.gender || "—")}
                    </strong>
                </div>

                <div>
                    <label>Nationality</label>
                    <strong>
                        ${escapeHtml(profile.nationality || "—")}
                    </strong>
                </div>

                <div>
                    <label>City</label>
                    <strong>
                        ${escapeHtml(profile.city || "—")}
                    </strong>
                </div>

                <div>
                    <label>Country</label>
                    <strong>
                        ${escapeHtml(profile.country || "—")}
                    </strong>
                </div>

                <div class="full-width">
                    <label>Address</label>
                    <strong>
                        ${escapeHtml(profile.address || "—")}
                    </strong>
                </div>

            </div>

        </section>


        <!-- =========================================
             EMERGENCY CONTACT
        ========================================== -->

        <section class="student-detail-section">

            <h3>Emergency Contact</h3>

            <div class="student-detail-grid">

                <div>
                    <label>Name</label>
                    <strong>
                        ${escapeHtml(
                            profile.emergency_contact_name || "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Phone</label>
                    <strong>
                        ${escapeHtml(
                            profile.emergency_contact_phone || "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Relationship</label>
                    <strong>
                        ${escapeHtml(
                            profile.emergency_contact_relationship || "—"
                        )}
                    </strong>
                </div>

            </div>

        </section>


        <!-- =========================================
             APPLICATION
        ========================================== -->

        <section class="student-detail-section">

            <h3>Application</h3>

            <div class="student-detail-grid">

                <div>
                    <label>Course</label>
                    <strong>
                        ${escapeHtml(application.course || "—")}
                    </strong>
                </div>

                <div>
                    <label>University</label>
                    <strong>
                        ${escapeHtml(application.university || "—")}
                    </strong>
                </div>

                <div>
                    <label>Destination Country</label>
                    <strong>
                        ${escapeHtml(
                            application.destination_country || "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Intake</label>
                    <strong>
                        ${escapeHtml(application.intake || "—")}
                    </strong>
                </div>

                <div>
                    <label>Study Level</label>
                    <strong>
                        ${escapeHtml(
                            application.study_level || "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Application Date</label>
                    <strong>
                        ${escapeHtml(
                            application.application_date || "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Assigned Staff</label>
                    <strong>
                        ${escapeHtml(
                            application.assigned_staff || "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Offer Status</label>
                    <strong>
                        ${escapeHtml(
                            application.offer_status || "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Admission Status</label>
                    <strong>
                        ${escapeHtml(
                            application.admission_status || "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Enrollment Status</label>
                    <strong>
                        ${escapeHtml(
                            application.enrollment_status || "—"
                        )}
                    </strong>
                </div>

                <div class="full-width">
                    <label>Application Notes</label>
                    <strong>
                        ${escapeHtml(
                            application.notes || "—"
                        )}
                    </strong>
                </div>

            </div>

        </section>


        <!-- =========================================
             ACCOUNT
        ========================================== -->

        <section class="student-detail-section">

            <h3>Account Information</h3>

            <div class="student-detail-grid">

                <div>
                    <label>Account Status</label>
                    <strong>
                        ${escapeHtml(
                            profile.account_status ||
                            student.status ||
                            "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Last Login</label>
                    <strong>
                        ${escapeHtml(
                            profile.last_login || "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Created</label>
                    <strong>
                        ${escapeHtml(
                            profile.created_at || "—"
                        )}
                    </strong>
                </div>

                <div>
                    <label>Updated</label>
                    <strong>
                        ${escapeHtml(
                            profile.updated_at || "—"
                        )}
                    </strong>
                </div>

            </div>

        </section>

    `;
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