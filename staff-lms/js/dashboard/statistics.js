/*==================================================
    DASHBOARD STATISTICS
==================================================*/

const dashboardStats = [
    {
        title: "Students",
        value: 524,
        icon: "graduation-cap",
        change: "+12 This Week"
    },
    {
        title: "Tutors",
        value: 18,
        icon: "users",
        change: "+2 This Month"
    },
    {
        title: "Courses",
        value: 36,
        icon: "book-open",
        change: "4 New"
    },
    {
        title: "Meetings",
        value: 5,
        icon: "video",
        change: "Today"
    }
];

/*==================================================
    RENDER CARDS
==================================================*/

function renderStatistics() {

    const container = document.getElementById("statistics");

    if (!container) return;

    container.innerHTML = "";

    dashboardStats.forEach(stat => {

        container.innerHTML += `
            <div class="stat-card">

                <div class="stat-icon">
                    <i data-lucide="${stat.icon}"></i>
                </div>

                <div class="stat-info">

                    <span class="stat-title">${stat.title}</span>

                    <h2>${stat.value}</h2>

                    <p>${stat.change}</p>

                </div>

            </div>
        `;

    });

    lucide.createIcons();

}

document.addEventListener("DOMContentLoaded", renderStatistics);