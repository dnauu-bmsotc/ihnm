const path = require("path");
const fs = require("fs");
const jsdom = require("jsdom");

module.exports = function(data) {
    const dom = new jsdom.JSDOM(data.pageHTML);

    collectRocks(data);
    insertRocksGuess(dom, data);

    insertTable(dom, "tables/metamorphic-rocks.json");
    insertTable(dom, "tables/biochemogenic-rocks.json");
    insertTable(dom, "tables/clastic-rocks.json");
    insertTable(dom, "tables/magmatic-rocks.json");
    insertTable(dom, "tables/minerals.json");

    save(dom, data);
}

function createDiv(dom, data) {
    const document = dom.window.document;
    const guessDiv = document.createElement("div");
    const conspectEl = document.getElementById("conspect");
    conspectEl.parentElement.insertBefore(guessDiv, conspectEl);
    return guessDiv;
}

function save(dom, data) {
    data.pageHTML = dom.serialize();
    fs.writeFile(data.pagePath, data.pageHTML, err => {});
}

function parseTableJSON(document, obj) {
    const tDiv = document.createElement("div");
    tDiv.classList.add("table");
    tDiv.innerHTML = `
        <div class="table-name">${obj.name}</div>
        <div class="table-wrap">
            <table></table>
        </div>
    `;
    const table = tDiv.querySelector("table");

    const uniqueKeys = Array.from(new Set(obj.list.map(el => Object.keys(el)).flat()));
    const appendRow = sample => {
        const row = document.createElement("tr");
        for (let key of uniqueKeys) {
            const td = document.createElement("td");
            td.textContent = sample[key];
            row.appendChild(td);
        }
        table.appendChild(row);
    }

    appendRow(Object.fromEntries(uniqueKeys.map(k => [k, k])));

    for (let sample of obj.list) {
        appendRow(sample);
    }

    return {
        el: tDiv,
        keys: uniqueKeys
    };
}

function insertTable(dom, tablePath) {
    const conspectEl = dom.window.document.getElementById("conspect");
    const tableJSON = fs.readFileSync(path.join(data.conspectsDir, data.blockName, data.disciplineName, tablePath));
    const tableEl = parseTableJSON(dom.window.document, JSON.parse(tableJSON)).el;
    conspectEl.insertBefore(tableEl, conspectEl.firstChild);
}

function insertRocksGuess(dom, data) {
    const guessDiv = createDiv(dom, data);
    guessDiv.outerHTML = `
    <div id="rocks-guess">
        <div id="rocks-guess-buttons"></div>
        <img id="rocks-guess-img" src="./media/placeholder.png"></img>
        <span id="rocks-guess-name" class="visible">Название минерала</span>
        
        <script src="./rocks-guess.js"></script>
        
        <style>
            #rocks-guess {
                margin: 1em 0 2em 0;
            }
            #rocks-guess-buttons {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 1em;
            }
            #rocks-guess-img {
                display: block;
                margin: 1em auto 1em auto;
                width: 50%;
                min-width: min(20em, 100%);
                max-width: min(25em, 100%);
                border: 1px solid var(--color);
            }
            #rocks-guess-name {
                display: block;
                text-align: center;
            }
            #rocks-guess-name:not(.visible) {
                color: var(--background-color);
            }
        </style>
    </div>`;

    const scriptPath = path.join(data.conspectsDir, data.blockName, data.disciplineName, "rocks-guess.js");
    const destPath = path.join(data.destDir, data.blockName, data.disciplineName, "rocks-guess.js");
    fs.copyFile(scriptPath, destPath, (err) => {});     
}

function collectRocks(d) {
    const rocks = [
        {
            name: "Минералы 5",
            path: "media/minerals5/",
            images: collectBoxOfRocks(d, "media/minerals5/"),
        },
        {
            name: "Горные породы 3",
            path: "media/rocks3/",
            images: collectBoxOfRocks(d, "media/rocks3/"),
        },
    ];

    rocksJSONPath = path.join(data.destDir, data.blockName, data.disciplineName, "rocks-guess.json");
    fs.writeFileSync(rocksJSONPath, JSON.stringify(rocks));
}

function collectBoxOfRocks(d, where) {
    const dir = path.join(data.conspectsDir, data.blockName, data.disciplineName, where);
    const box = [];
    fs.readdirSync(dir).forEach(img => {
        box.push(img);
    });
    return box;
}