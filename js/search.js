/*
==================================================
GOULDINGS GLOBAL ACADEMY
SMART SEARCH ENGINE
==================================================
*/

const params = new URLSearchParams(window.location.search);

const query = (params.get("query") || "").trim();

const searchInput = document.getElementById("searchInput");

const resultsContainer = document.getElementById("resultsContainer");

searchInput.value = query;


/*==================================================
LOAD SEARCH INDEX
==================================================
*/

fetch("search-index.json")

.then(response => response.json())

.then(index => {

    if(query===""){

        resultsContainer.innerHTML=`

            <div class="no-results">

                <h2>Search the Website</h2>

                <p>

                    Enter a keyword above.

                </p>

            </div>

        `;

        return;

    }

    search(index,query);

});


/*==================================================
SEARCH
==================================================
*/

function search(index,keyword){

    keyword=keyword.toLowerCase();

    const results=[];

    index.forEach(page=>{

        const text=page.content.toLowerCase();

        const title=page.title.toLowerCase();

        let score=0;

        if(title.includes(keyword))
            score+=20;

        const matches=(text.match(new RegExp(keyword,"gi"))||[]).length;

        score+=matches;

        if(score>0){

            results.push({

                ...page,

                score

            });

        }

    });

    results.sort((a,b)=>b.score-a.score);

    displayResults(results,keyword);

}


/*==================================================
SNIPPET
==================================================
*/

function snippet(content,keyword){

    const lower=content.toLowerCase();

    const pos=lower.indexOf(keyword);

    if(pos===-1)
        return content.substring(0,180)+"...";

    const start=Math.max(0,pos-80);

    const end=Math.min(content.length,pos+120);

    let text=content.substring(start,end);

    const regex=new RegExp(keyword,"gi");

    text=text.replace(

        regex,

        match=>`<mark>${match}</mark>`

    );

    return "..."+text+"...";

}


/*==================================================
DISPLAY
==================================================
*/

function displayResults(results,keyword){

    if(results.length===0){

        resultsContainer.innerHTML=`

            <div class="no-results">

                <h2>No Results Found</h2>

                <p>

                    No pages matched

                    "<strong>${keyword}</strong>"

                </p>

            </div>

        `;

        return;

    }

    let html="";

    results.forEach(page=>{

        html+=`

        <div class="result-card">

            <a

                href="${page.url}"

                class="result-title">

                ${page.title}

            </a>

            <div class="result-url">

                ${page.url}

            </div>

            <div class="result-description">

                ${snippet(page.content,keyword)}

            </div>

        </div>

        `;

    });

    resultsContainer.innerHTML=html;

}