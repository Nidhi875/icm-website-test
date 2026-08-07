/*
==================================================
GOULDINGS GLOBAL ACADEMY
SEARCH INDEX GENERATOR
==================================================
*/

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUTPUT = path.join(ROOT, "search-index.json");

/*==================================================
PUBLIC WEBSITE PAGES ONLY
==================================================*/

const publicPages = [

    "index.html",

    "about.html",

    "contact.html",

    "qualifications.html",

    "professional-qualifications.html",

    "single-subjects.html",

    "framework-tool.html",

    "relative-equivalencies.html",

    "online-courses.html",

    "mission.html",

    "course-details.html",

    "checkout.html",

    "search.html"

];

/*==================================================
REMOVE HTML
==================================================*/

function cleanHTML(html){

    return html
        .replace(/<script[\s\S]*?<\/script>/gi," ")
        .replace(/<style[\s\S]*?<\/style>/gi," ")
        .replace(/<[^>]+>/g," ")
        .replace(/\s+/g," ")
        .trim();

}

/*==================================================
TITLE
==================================================*/

function getTitle(html){

    const match = html.match(/<title>(.*?)<\/title>/i);

    return match ? match[1].trim() : "";

}

/*==================================================
DESCRIPTION
==================================================*/

function getDescription(html){

    const match = html.match(
        /<meta\s+name=["']description["']\s+content=["']([^"]*)["']/i
    );

    return match ? match[1] : "";

}

/*==================================================
BUILD INDEX
==================================================*/

const index = [];

publicPages.forEach(file => {

    const fullPath = path.join(ROOT, file);

    if (!fs.existsSync(fullPath)) {

        console.log(`Skipping: ${file}`);

        return;

    }

    const html = fs.readFileSync(fullPath, "utf8");

    index.push({

        title: getTitle(html),

        url: file,

        description: getDescription(html),

        content: cleanHTML(html)

    });

});

/*==================================================
WRITE INDEX
==================================================*/

fs.writeFileSync(

    OUTPUT,

    JSON.stringify(index, null, 4),

    "utf8"

);

console.log("");
console.log("✅ Search index created successfully.");
console.log(`✅ ${index.length} public pages indexed.`);
console.log("");