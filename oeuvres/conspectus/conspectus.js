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
            new Promise((resolve, reject) => {
                if (this.currentChapterBtn === btn) {
                    this.questionContainer.innerHTML = "";
                    const ticket = chapter.lottery.select();
                    this.drawChapterLottery(chapter, ticket)
                        .then(_ => resolve());
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
                            if (chapter.lottery.lastDraw) {
                                this.questionContainer.innerHTML = "";
                                this.drawChapterLottery(chapter, chapter.lottery.lastDraw)
                                .then(_ => resolve());
                            }
                            else {
                                this.questionContainer.textContent = chapter.name;
                                resolve();
                            }
                        });
                }
            })
            .then(_ => {
                if (chapter.lottery.counter === 0) {
                    btn.dataset.counter = `(${chapter.lottery.size} шт.)`;
                }
                else {
                    btn.dataset.counter = `(${chapter.lottery.counter}/${chapter.lottery.size})`;
                }
            });
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

        chapter.tmp.tables.push({});
        const ct = chapter.tmp.tables[chapter.tmp.tables.length - 1];

        return new Promise((resolve, reject) => {
            fetch(path, {cache: this.cache})
                .then(res => res.json())
                .then(obj => {
                    const parsed = this.parseTableJSON(obj);
                    ct.el = parsed.el;
                    ct.keys = parsed.keys;
                    ct.json = obj;
                    tDiv.replaceWith(parsed.el);
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
                    this.createChapterLottery_guessByImage(chapter, resolve);
                    break;

                case "tell-tables":
                    this.createChapterLottery_tellTables(chapter, resolve);
                    break;
            
                default:
                    this.createChapterLottery_default(chapter, resolve);
                    break;
            }
        })
    }
    createLotteryId(chapter) {
        return "Lottery " + chapter.tmp.discipline.name + " / " + chapter.name;
    }
    createChapterLottery_guessByImage(chapter, resolve) {
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
            chapter.lottery = new Lottery(this.createLotteryId(chapter), tickets);
            resolve();
        });
    }
    createChapterLottery_tellTables(chapter, resolve) {
        const keys = chapter.tmp.tables.map(
            table => table.json.list.map(
                sample => ({
                    name: sample[chapter.key],
                    tableEl: table.el
                })
            )
        );
        chapter.lottery = new Lottery(this.createLotteryId(chapter), keys.flat());

        // reversing a shallow-copy to keep order when inserting hint as first child.
        [...chapter.tmp.tables].reverse().map(table => {
            const hint = document.createElement("div");
            hint.classList.add("tell-tables-hint");
            hint.innerHTML = `
                <div class="tell-tables-hint--name">${table.json.name}:</div>
                <div class="tell-tables-hint--list">${table.keys.join(", ").toLowerCase()}.</div>
            `;
            this.conspectContainer.insertBefore(hint, this.conspectContainer.firstChild);
        });
        resolve();
    }
    createChapterLottery_default(chapter, resolve) {
        const h2h3 = [...this.conspectContainer.querySelectorAll("h2, h3, h4")];
        const lotteryTickets = [];
        let lastH2 = null;

        const toc = document.createElement("div");
        toc.classList.add("toc");

        const pushToC = (el, className) => {
            const header = document.createElement("div");
            header.classList.add(className);
            header.textContent = el.textContent;
            header.addEventListener("click", _ => {
                this.scrollTo(el);
            })
            toc.appendChild(header);
        };

        for (let h of h2h3) {
            switch (h.tagName) {
                case "H2":
                    lastH2 = h;
                    pushToC(h, "toc-h2");
                    break;

                case "H3":
                    switch (lastH2.textContent) {
                        case "Приложение":
                            break;
                        default:
                            lotteryTickets.push(h);
                            break;
                    }
                    pushToC(h, "toc-h3");
                    break;

                case "H4":
                    lastH2 = h;
                    pushToC(h, "toc-h4");
                    break;
            }
        }

        this.conspectContainer.insertBefore(toc, this.conspectContainer.firstChild);
        chapter.lottery = new Lottery(this.createLotteryId(chapter), lotteryTickets);
        resolve();
    }
    drawChapterLottery(chapter, ticket) {
        return new Promise((resolve, reject) => {
            switch (chapter.type) {
                case "guess-by-image":
                    this.drawChapterLottery_guessByImage(ticket, resolve);
                    break;

                case "tell-tables":
                    this.drawChapterLottery_tellTables(ticket, resolve);
                    break;
    
                default:
                    this.drawChapterLottery_default(ticket, resolve);
                    break;
            }
        })
    }
    drawChapterLottery_guessByImage(ticket, resolve) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(ticket.blob);
        img.addEventListener("click", _ => {
            const answer = document.createElement("div");
            answer.textContent = ticket.filename.match(/.*\/(.*)/)[1];
            this.questionContainer.appendChild(answer);
        }, { once: true });
        this.questionContainer.append(img);
        resolve();
    }
    drawChapterLottery_tellTables(ticket, resolve) {
        const questionDiv = document.createElement("div");
        questionDiv.textContent = ticket.name;
        questionDiv.addEventListener("click", _ => {
            this.scrollTo(ticket.tableEl);
        });
        this.questionContainer.appendChild(questionDiv);
        resolve();

    }
    drawChapterLottery_default(ticket, resolve) {
        const questionDiv = document.createElement("div");
        questionDiv.textContent = ticket.textContent;
        questionDiv.addEventListener("click", _ => {
            this.scrollTo(ticket);
        });
        this.questionContainer.appendChild(questionDiv);
        resolve();

    }
    parseMarkdown(text, baseUrl) {
        marked.setOptions({ baseUrl: baseUrl ? baseUrl : this.srcPath + "markdown/" });
        const md = marked.parse(text);
        
        const div = document.createElement("div");
        div.classList.add("markdown");
        div.innerHTML = md;
        
        for (let img of div.querySelectorAll("img")) {
            const imgwidth = img.src.match(/(\d+).[^\.]+$/)[1];
            img.style.width = imgwidth + "%";

            const format = img.src.match(/.([^\.]+)$/)[1];
            if (format === "mp4") {
                const vidEl = document.createElement("video");
                vidEl.type="video/mp4";
                vidEl.src = img.src;
                vidEl.controls = true;
                vidEl.style.width = imgwidth + "%";
                img.replaceWith(vidEl);
            }
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
        return {
            el: tDiv,
            keys: uniqueKeys
        };
    }
    renderKaTeX(element) {
        if (!element) {
            element = document.body;
        }
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            strict: false,
        });
    }
    scrollTo(el) {
        el.scrollIntoView();
    }
}