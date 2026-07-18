let selectedCountries = [];

// COUNTRY CLICK
function selectAllCountries() {

    selectedCountries = Object.keys(frameworkData);

    renderComparison();
}

function showCountry(countryName) {

    const index = selectedCountries.indexOf(countryName);

    // Add or remove country
    if (index === -1) {
        selectedCountries.push(countryName);
    } else {
        selectedCountries.splice(index, 1);
    }

    renderComparison();
}

// RESET BUTTON
function resetTool() {

    selectedCountries = [];

    document.getElementById("countryContent").innerHTML = "";
    document.getElementById("defaultMessage").style.display = "block";

    document.getElementById("selectionInfo").innerText = "";

    document.querySelectorAll(".country-btn").forEach(btn => {
        btn.style.background = "white";
        btn.style.color = "black";
    });
}

// HIDE FILTERS

function hideFilters() {
    const filters = document.getElementById("filters");
    filters.style.maxHeight = "0";
    filters.style.padding = "0";
    filters.style.overflow = "hidden";
}

// SHOW FILTERS

function showFilters() {
    const filters = document.getElementById("filters");
    filters.style.maxHeight = "300px";
    filters.style.padding = "20px";
    filters.style.overflowY = "auto";
}

function clearSearch() {

    const input = document.getElementById("countrySearch");

    input.value = "";

    filterCountries();
}

// SEARCH COUNTRIES
function filterCountries() {

    const input = document.getElementById("countrySearch");
    const filter = input.value.toLowerCase();

    const buttons = document.querySelectorAll(".country-btn");

    buttons.forEach(button => {

        const text = button.innerText.toLowerCase();

        if (text.includes(filter)) {
            button.style.display = "inline-block";
        } else {
            button.style.display = "none";
        }
    });
}

function exportCSV() {

    if (selectedCountries.length === 0) {
        alert("Please select at least one country.");
        return;
    }

    let csv = "Level,ICM Qualifications,";

    csv += selectedCountries
        .map(country => frameworkData[country].framework)
        .join(",");

    csv += "\n";

    for (let level = 10; level >= 1; level--) {

        csv += `${level},"${icmLevels[level] || "-"}",`;

        selectedCountries.forEach(country => {

            const item = frameworkData[country].levels.find(
                x => parseInt(x[0], 10) === level
            );

            csv += `"${item ? item[1] : "-"}",`;
        });

        csv += "\n";
    }

    const blob = new Blob([csv], { type: "text/csv" });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "framework-comparison.csv";

    link.click();
}

// BUILD COMPARISON TABLE
function renderComparison() {

    document.getElementById("selectionInfo").innerText =
    `${selectedCountries.length} countries selected`;

    const defaultMessage = document.getElementById("defaultMessage");
    const countryContent = document.getElementById("countryContent");


    

    // Nothing selected
    if (selectedCountries.length === 0) {

        defaultMessage.style.display = "block";
        countryContent.innerHTML = "";

        return;
    }

    defaultMessage.style.display = "none";

    let html = "<table>";

    // HEADER ROW
    html += "<tr>";

    html += "<td class='level'>Level</td>";

    html += `
        <td class="icm-title">
            ICM Qualifications
        </td>
    `;

    selectedCountries.forEach(countryName => {

        html += `
            <td>
                <strong>${frameworkData[countryName].framework}</strong>
            </td>
        `;
    });

    html += "</tr>";

    // LEVEL ROWS
    for (let level = 10; level >= 1; level--) {

        html += "<tr>";

        html += `<td class="level">${level}</td>`;

        html += `
            <td class="icm-qualification">
                ${icmLevels[level] || "-"}
            </td>
        `;

        selectedCountries.forEach(countryName => {

            const item = frameworkData[countryName].levels.find(
                x => parseInt(x[0], 10) === level
            );

            html += `<td>${item ? item[1] : "-"}</td>`;
        });

        html += "</tr>";
    }

    html += "</table>";

    countryContent.innerHTML = html;

    updateSelectedButtons();
}

// BUTTON HIGHLIGHTING
function updateSelectedButtons() {

    document.querySelectorAll(".country-btn").forEach(btn => {

        const buttonCountry = btn.innerText
            .toLowerCase()
            .replace(/\s+/g, "");

        const isSelected = selectedCountries.some(
            country =>
                country.toLowerCase().replace(/\s+/g, "") === buttonCountry
        );

        if (isSelected) {
            btn.style.background = "#8c2332";
            btn.style.color = "white";
        } else {
            btn.style.background = "white";
            btn.style.color = "black";
        }
    });
}

function createCountryButtons() {

    let html = "";

    Object.keys(frameworkData)
        .sort()
        .forEach(country => {

            let label =
                country.charAt(0).toUpperCase() +
                country.slice(1);

            html += `
                <button
                    class="country-btn"
                    onclick="showCountry('${country}')">
                    ${label}
                </button>
            `;
        });

    document.getElementById("countryButtons").innerHTML = html;
}

createCountryButtons();