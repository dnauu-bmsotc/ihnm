"use strict"

class Conspectus {
    constructor({disciplinesContainer, questionContainer,
        chaptersContainer, conspectContainer, srcPath}) {

        this.disciplinesContainer = disciplinesContainer;
        this.questionContainer = questionContainer;
        this.chaptersContainer = chaptersContainer;
        this.conspectContainer = conspectContainer;
        this.srcPath = srcPath;

        this.cache = "no-cache";
    }
    deploy() {
        return new Promise((resolve, reject) => {
            fetch(this.srcPath + "json/structure.json", {cache: this.cache})
            .then(res => res.json())
            .then(out => this.parseStructureJSON(out))
            .then(_ => resolve());
        });
    }
    parseStructureJSON(json) {
        return new Promise((resolve, reject) => {
            for (let discipline of json) {
                this.appendDiscipline(discipline);
            }
            resolve();
        });
    }
    appendDiscipline(discipline) {
        const btn = document.createElement("button");
        btn.textContent = discipline.name;
        this.disciplinesContainer.appendChild(btn);

        btn.addEventListener("click", _ => {
            this.chaptersContainer.innerHTML = "";
            this.questionContainer.innerHTML = ". . .";
            this.conspectContainer.innerHTML = "";
            window.history.replaceState(null, null, `?discipline=${discipline.name}`);

            this.currentDisciplineBtn && (this.currentDisciplineBtn.disabled = false);
            this.currentDisciplineBtn = btn;
            this.currentDisciplineBtn.disabled = true;

            for (let chapter of discipline.chapters) {
                chapter.tmp = {};
                chapter.tmp.discipline = discipline;
                this.appendChapter(chapter);
            }
        })
    }
    appendChapter(chapter) {
        const btn = document.createElement("button");
        btn.textContent = chapter.name;
        this.chaptersContainer.appendChild(btn);

        btn.addEventListener("click", _ => {
            if (this.currentChapterBtn === btn) {
                this.questionContainer.innerHTML = "";
                this.drawChapterLottery(chapter);
                btn.dataset.counter = `(${chapter.lottery.counter}/${chapter.lottery.size})`;
            }
            else {
                this.conspectContainer.innerHTML = "";
                this.questionContainer.textContent = "Загрузка...";
                window.history.replaceState(null, null, `?discipline=${chapter.tmp.discipline.name}&chapter=${chapter.name}`);
                btn.disabled = true;
                this.setCurrentChapterButton(chapter, btn);
                this.initChapter(chapter)
                    .then(_ => this.createChapterLottery(chapter))
                    .then(_ => {
                        btn.disabled = false;
                        this.questionContainer.textContent = chapter.name;
                        if (chapter.lottery.counter === 0) {
                            btn.dataset.counter = `(${chapter.lottery.size} шт.)`;
                        }
                    });
            }
        });
    }
    setCurrentChapterButton(newChapter, itsButton) {
        this.currentChapterBtn && this.currentChapterBtn.classList.remove("current");
        this.currentChapter && (this.currentChapterBtn.textContent = this.currentChapter.name);

        this.currentChapter = newChapter;
        this.currentChapterBtn = itsButton;
        this.currentChapterBtn.classList.add("current");
        this.currentChapterBtn.textContent = "Случайный вопрос по теме";
    }
    appendMarkdown(path) {
        const mdDiv = document.createElement("div");
        this.conspectContainer.appendChild(mdDiv);

        return new Promise((resolve, reject) => {
            fetch(path, {cache: this.cache})
                .then(res => res.text())
                .then(out => {
                    mdDiv.replaceWith(this.parseMarkdown(out));
                    resolve();
                });
        })
    }
    appendTable(chapter, path) {
        const tDiv = document.createElement("div");
        this.conspectContainer.appendChild(tDiv);

        return new Promise((resolve, reject) => {
            fetch(path, {cache: this.cache})
                .then(res => res.json())
                .then(obj => {
                    const el = this.parseTableJSON(obj);
                    chapter.tmp.tables.push({
                        el: el,
                        json: obj
                    });
                    tDiv.replaceWith(el);
                    resolve();
                });
        })
    }
    initChapter(chapter) {
        const promises = [];

        if (chapter.markdown) {
            promises.push(this.appendMarkdown(this.srcPath + chapter.markdown));
        }

        if (chapter.tables) {
            chapter.tmp.tables = [];
            for (let url of chapter.tables) {
                promises.push(this.appendTable(chapter, this.srcPath + url));
            }
        }

        return Promise.all(promises);
    }
    loadZip(path) {
        let zipReader = null;
        return new Promise((resolve, reject) => {
            fetch(path, {cache: this.cache})
                .then(res => res.blob())
                .then(out => {
                    const zipFileReader = new zip.BlobReader(out);
                    zipReader = new zip.ZipReader(zipFileReader);
                    return zipReader.getEntries();
                })
                .then(entries => {
                    zipReader.close();
                    resolve(entries.slice(1));
                });
        });
    }
    blobZip(zipEntries) {
        const promises = [];
        for (let entry of zipEntries) {
            promises.push(entry.getData(new zip.BlobWriter()));
        }
        return Promise.all(promises);
    }
    createChapterLottery(chapter) {
        return new Promise((resolve, reject) => {
            if (chapter.lottery) {
                resolve();
            }
            switch (chapter.type) {
                case "guess-by-image":
                    this.loadZip(this.srcPath + chapter.images)
                    .then(entries => {
                        chapter.zip = entries;
                        return this.blobZip(entries);
                    })
                    .then(blobs => {
                        const tickets = chapter.zip.map((e, i) => ({
                            filename: e.filename,
                            blob: blobs[i]
                        }));
                        chapter.lottery = new Lottery(tickets);
                        resolve();
                    });
                    break;

                case "tell-tables":
                    const keys = chapter.tmp.tables.map(
                        table => table.json.list.map(
                            sample => ({
                                name: sample[chapter.key],
                                tableEl: table.el
                            })
                        )
                    );
                    chapter.lottery = new Lottery(keys.flat());
                    resolve();
                    break;
            
                default:
                    const headers = [...this.conspectContainer.querySelectorAll("h3")];
                    chapter.lottery = new Lottery(headers);
                    resolve();
            }
        })
    }
    drawChapterLottery(chapter) {
        return new Promise((resolve, reject) => {
            switch (chapter.type) {
                case "guess-by-image":
                    const ticket = chapter.lottery.select();
                    const img = document.createElement("img");
                    img.src = URL.createObjectURL(ticket.blob);
                    img.addEventListener("click", _ => {
                        const answer = document.createElement("div");
                        answer.textContent = ticket.filename.match(/.*\/(.*)/)[1];
                        this.questionContainer.appendChild(answer);
                    }, { once: true });
                    this.questionContainer.append(img);
                    break;

                case "tell-tables":
                    const tellTablesTicket = chapter.lottery.select();
                    const tellTablesQuestionDiv = document.createElement("div");
                    tellTablesQuestionDiv.textContent = tellTablesTicket.name;
                    tellTablesQuestionDiv.addEventListener("click", _ => {
                        tellTablesTicket.tableEl.scrollIntoView();
                    });
                    this.questionContainer.appendChild(tellTablesQuestionDiv);
                    resolve();
                    break;
    
                default:
                    const questionDiv = document.createElement("div");
                    const question = chapter.lottery.select();
                    questionDiv.textContent = question.textContent;
                    questionDiv.addEventListener("click", _ => {
                        question.scrollIntoView();
                    });
                    this.questionContainer.appendChild(questionDiv);
                    resolve();
                    break;
            }
        })
    }
    parseMarkdown(text, baseUrl) {
        marked.setOptions({ baseUrl: baseUrl ? baseUrl : this.srcPath + "t/t/" });
        const md = marked.parse(text);
        
        const div = document.createElement("div");
        div.innerHTML = md;
        
        for (let img of div.querySelectorAll("img")) {
            img.style.width = img.src.match(/(\d+).[^\.]+$/)[1] + "%";
        }

        this.renderKaTeX(div);
        return div;
    }
    parseTableJSON(obj) {
        const tDiv = document.createElement("div");
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

        this.renderKaTeX(table);
        return tDiv;
    }
    renderKaTeX(element) {
        if (!element) {
            element = document.body;
        }
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ],
            strict: false,
        });
    }
}