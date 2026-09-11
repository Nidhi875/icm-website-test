/*==================================================
    DASHBOARD STATISTICS
==================================================*/

const dashboardStats = [
    {
        title: "Students",
        value: 0,
        icon: "graduation-cap",
        change: "No data yet"
    },
    {
        title: "Tutors",
        value: 0,
        icon: "users",
        change: "No data yet"
    },
    
    {
        title: "Courses",
        value: 0,
        icon: "book-open",
        change: "No data yet"
    },
    {
        title: "Meetings",
        value: 0,
        icon: "video",
        change: "No data yet"
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