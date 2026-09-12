// ==========================================================
// CONFIG — update this to match your live backend URL
// ==========================================================
const API_BASE = "https://icm-website-test-production.up.railway.app/api";

// ==========================================================
// TOKEN HELPERS
// This checks a few common storage key names used across the
// site. If your login page saves the token under a different
// name, change TOKEN_KEY / USER_KEY below to match it exactly.
// ==========================================================
const TOKEN_KEY = "staffToken";
const USER_KEY = "staffUser";

function getToken() {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
}

function authHeaders() {
    const token = getToken();
    return token ? { "Authorization": `Bearer ${token}` } : {};
}

// ==========================================================
// PHOTO UPLOAD (kept local to the browser for now)
// ==========================================================
const PROFILE_PHOTO_KEY = "staffProfilePhoto";

function initProfilePhotoUpload() {
    const profileImg = document.getElementById("profileImage");
    const input = document.getElementById("photoUpload");

    if (!input) return;

    const savedPhoto = localStorage.getItem(PROFILE_PHOTO_KEY);
    if (savedPhoto && profileImg) {
        profileImg.src = savedPhoto;
    }

    input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const image = event.target.result;
            localStorage.setItem(PROFILE_PHOTO_KEY, image);
            if (profileImg) profileImg.src = image;
        };
        reader.readAsDataURL(file);
    });
}

// ==========================================================
// LOAD PROFILE FROM THE SERVER
// ==========================================================
async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE}/staff/profile`, {
            method: "GET",
            headers: { ...authHeaders() },
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Failed to load profile:", data.message);
            return;
        }

        const user = data.user;

        document.getElementById("staffName").value = user.name || "";
        document.getElementById("staffEmail").value = user.email || "";
        document.getElementById("staffPhone").value = user.phone || "";
        document.getElementById("staffDepartment").value = user.department || "";
        document.getElementById("staffBio").value = user.bio || "";

        const roleSelect = document.getElementById("staffRole");
        if (roleSelect && user.role) roleSelect.value = user.role;

        document.getElementById("profileName").textContent = user.name || "";
        document.getElementById("profileRole").textContent = user.role || "";

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// ==========================================================
// SAVE PROFILE (Personal Information + Biography)
// ==========================================================
async function saveProfile() {
    const saveButtons = [
        document.getElementById("saveProfile"),
        document.getElementById("updateProfile")
    ].filter(Boolean);

    saveButtons.forEach(btn => btn.disabled = true);

    try {
        const payload = {
            name: document.getElementById("staffName").value,
            phone: document.getElementById("staffPhone").value,
            department: document.getElementById("staffDepartment").value,
            bio: document.getElementById("staffBio").value,
            role: document.getElementById("staffRole").value
        };

        const response = await fetch(`${API_BASE}/staff/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || "Could not save your profile. Please try again.");
            return;
        }

        // Also handle a password change, only if the user filled those fields in
        const currentPassword = document.getElementById("currentPassword")?.value;
        const newPassword = document.getElementById("newPassword")?.value;
        const confirmPassword = document.getElementById("confirmPassword")?.value;

        if (currentPassword || newPassword || confirmPassword) {
            const pwResponse = await fetch(`${API_BASE}/staff/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders()
                },
                credentials: "include",
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });

            const pwData = await pwResponse.json();

            if (!pwResponse.ok || !pwData.success) {
                alert("Profile saved, but password change failed: " + (pwData.message || "Unknown error"));
                return;
            }

            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";
        }

        document.getElementById("profileName").textContent = payload.name;
        alert("Profile saved successfully.");

    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Something went wrong while saving. Please try again.");
    } finally {
        saveButtons.forEach(btn => btn.disabled = false);
    }
}

// ==========================================================
// INIT
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    initProfilePhotoUpload();
    loadProfile();

    const saveBtn = document.getElementById("saveProfile");
    const updateBtn = document.getElementById("updateProfile");

    if (saveBtn) saveBtn.addEventListener("click", saveProfile);
    if (updateBtn) updateBtn.addEventListener("click", saveProfile);
});