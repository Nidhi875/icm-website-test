/*==========================================================
SALES TARGETS & GOALS — live component
Replaces the hardcoded 68%/42%/81% block.
Add this file as its own <script src="js/dashboard/goals.js">
in operations.html, after app.js and after operations.js.
==========================================================*/

(() => {

    "use strict";

    // Same base your other operations.js fetch call already uses
    // (POST to /api/notifications) — worth centralizing into one
    // config constant later, but matching the existing pattern for now.
    const API_BASE = "http://localhost:5000";

    const METRICS = [
        { key: "admissions",   label: "September Admissions" },
        { key: "applications", label: "Student Applications" },
        { key: "enrolment",    label: "Enrolment Completion" }
    ];

    const container = document.getElementById("goalsContainer");
    const editBtn    = document.getElementById("goalsEditBtn");

    if (!container) return; // block not on this page

    let currentGoals = null;
    let editing = false;

    function isAdmin() {
        return (localStorage.getItem("staffRole") || "").trim() === "Administrator";
    }

    function getToken() {
        return localStorage.getItem("staffToken");
    }

    function pct(actual, target) {
        if (!target || target <= 0) return 0;
        return Math.max(0, Math.min(100, Math.round((actual / target) * 100)));
    }

    /*==========================================================
    RENDER (read-only)
    ==========================================================*/
    function renderReadOnly(goals) {

        container.innerHTML = "";

        METRICS.forEach(metric => {

            const actual = Number(goals[`${metric.key}_actual`]) || 0;
            const target = Number(goals[`${metric.key}_target`]) || 0;
            const percent = pct(actual, target);

            const card = document.createElement("div");
            card.className = "goal-card";
            card.innerHTML = `
                <div class="goal-header">
                    <span>${metric.label}</span>
                    <strong>${percent}%</strong>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width:${percent}%;"></div>
                </div>
                <small>${actual} of ${target}</small>
            `;
            container.appendChild(card);
        });
    }

    /*==========================================================
    RENDER (edit mode — admins only)
    ==========================================================*/
    function renderEditForm(goals) {

        container.innerHTML = "";

        const form = document.createElement("form");
        form.id = "goalsEditForm";

        METRICS.forEach(metric => {

            const actual = Number(goals[`${metric.key}_actual`]) || 0;
            const target = Number(goals[`${metric.key}_target`]) || 0;

            const row = document.createElement("div");
            row.className = "goal-card goal-edit-row";
            row.innerHTML = `
                <div class="goal-header"><span>${metric.label}</span></div>
                <label>
                    Actual
                    <input type="number" min="0" step="1"
                        name="${metric.key}_actual" value="${actual}">
                </label>
                <label>
                    Target
                    <input type="number" min="0" step="1"
                        name="${metric.key}_target" value="${target}">
                </label>
            `;
            form.appendChild(row);
        });

        const actions = document.createElement("div");
        actions.className = "goal-edit-actions";
        actions.innerHTML = `
            <button type="submit" class="primary-btn small">Save changes</button>
            <button type="button" class="link-btn" id="goalsCancelBtn">Cancel</button>
        `;
        form.appendChild(actions);

        container.appendChild(form);

        form.addEventListener("submit", handleSave);
        document.getElementById("goalsCancelBtn")
            .addEventListener("click", () => {
                editing = false;
                renderReadOnly(currentGoals);
                updateEditButton();
            });
    }

    /*==========================================================
    SAVE (admin PUT — sends Bearer token)
    ==========================================================*/
    async function handleSave(e) {

        e.preventDefault();

        const formData = new FormData(e.target);
        const payload = {};
        METRICS.forEach(metric => {
            payload[`${metric.key}_actual`] = Number(formData.get(`${metric.key}_actual`));
            payload[`${metric.key}_target`] = Number(formData.get(`${metric.key}_target`));
        });

        const token = getToken();

        if (!token) {
            alert("Your session has expired. Please log in again.");
            return;
        }

        try {

            const res = await fetch(`${API_BASE}/api/goals`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to save goals.");
            }

            currentGoals = await res.json();
            editing = false;
            renderReadOnly(currentGoals);
            updateEditButton();

        } catch (err) {
            console.error(err);
            alert(err.message || "Unable to save goals. Please try again.");
        }
    }

    /*==========================================================
    EDIT BUTTON (admin-only visibility)
    ==========================================================*/
    function updateEditButton() {

        if (!editBtn) return;

        if (!isAdmin()) {
            editBtn.hidden = true;
            return;
        }

        editBtn.hidden = false;
        editBtn.textContent = editing ? "Viewing edit form" : "Edit";
        editBtn.disabled = editing;
    }

    editBtn?.addEventListener("click", () => {
        if (!currentGoals) return;
        editing = true;
        renderEditForm(currentGoals);
        updateEditButton();
    });

    /*==========================================================
    LOAD
    ==========================================================*/
    async function loadGoals() {

        try {

            const res = await fetch(`${API_BASE}/api/goals`);

            if (!res.ok) throw new Error("Failed to load goals.");

            currentGoals = await res.json();
            renderReadOnly(currentGoals);
            updateEditButton();

        } catch (err) {
            console.error(err);
            container.innerHTML = `<p class="goals-error">Unable to load goals right now.</p>`;
        }
    }

    loadGoals();

})();