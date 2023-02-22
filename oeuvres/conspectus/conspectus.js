"use strict"

class Conspectus {
    constructor({disciplinesContainer, questionContainer,
        chaptersContainer, conspectContainer, srcPath}) {

        this.disciplinesContainer = disciplinesContainer;
        this.questionContainer = questionContainer;
        this.chaptersContainer = chaptersContainer;
        this.conspectContainer = conspectContainer;
        this.srcPath = srcPath;
    }
    deploy() {
        return new Promise((resolve, reject) => {
            fetch(this.srcPath + "json/structure.json")
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
            this.questionContainer.innerHTML = "А расскажи-ка про...";

            for (let chapter of discipline.chapters) {
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
            }
            else {
                this.conspectContainer.innerHTML = "";
                this.questionContainer.innerHTML = "";
                btn.disabled = true;
                this.initChapter(chapter).then(_ => {
                    this.currentChapterBtn && this.currentChapterBtn.classList.remove("current");
                    this.currentChapterBtn = btn;
                    this.currentChapterBtn.disabled = false;
                    this.currentChapterBtn.classList.add("current");

                    if (!chapter.lottery) {
                        this.createChapterLottery(chapter);
                    }
                });
            }
        });
    }
    appendMarkdown(path) {
        const mdDiv = document.createElement("div");
        this.conspectContainer.appendChild(mdDiv);

        return new Promise((resolve, reject) => {
            fetch(path)
                .then(res => res.text())
                .then(out => {
                    mdDiv.replaceWith(this.parseMarkdown(out));
                    resolve();
                });
        })
    }
    appendTable(path) {
        const tDiv = document.createElement("div");
        this.conspectContainer.appendChild(tDiv);

        return new Promise((resolve, reject) => {
            fetch(path)
                .then(res => res.json())
                .then(obj => {
                    tDiv.replaceWith(this.parseTableJSON(obj));
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
            for (let url of chapter.tables) {
                promises.push(this.appendTable(this.srcPath + url));
            }
        }

        return Promise.all(promises);
    }
    loadZip(path) {
        return new Promise((resolve, reject) => {
            fetch(path)
                .then(res => res.blob())
                .then(out => {
                    const zipFileReader = new zip.BlobReader(out);
                    const zipReader = new zip.ZipReader(zipFileReader);
                    const entries = zipReader.getEntries();
                    zipReader.close();
                    return entries;
                })
                .then(entries => resolve(entries));
        });
    }
    createChapterLottery(chapter) {
        return new Promise((resolve, reject) => {
            switch (chapter.type) {
                case "guess-by-image":
                    this.loadZip(this.srcPath + chapter.images).then(entries => {
                        chapter.zip = entries;
                        const promises = [];
                        for (let entry of entries.slice(1)) {
                            promises.push(entry.getData(new zip.BlobWriter()));
                        }
                        return Promise.all(promises);
                    })
                    .then(blobs => {
                        const tickets = [];
                        for (let i = 0; i < blobs.length; i++) {
                            tickets.push({
                                filename: chapter.zip[i].filename,
                                blob: blobs[i]
                            });
                        }
                        chapter.lottery = new Lottery(tickets);
                        resolve();
                    });
                    break;
            
                default:
                    chapter.lottery = new Lottery(
                        [...this.conspectContainer.querySelectorAll("h3")].map(el => el.textContent)
                    );
                    resolve();
            }
        })
    }

    drawChapterLottery(chapter) {
        return new Promise((resolve, reject) => {
            switch (chapter.type) {
                case "guess-by-image":
                    const ticket = chapter.lottery.select();
                    // chapter.zip.file(imageFilename).async("blob")
                    //     .then(blob => {
                            const img = document.createElement("img");
                            img.src = URL.createObjectURL(ticket.blob);
                            img.addEventListener("click", _ => {
                                const answer = document.createElement("div");
                                answer.textContent = blob.match(/.*\/(.*)/)[1];
                                this.questionContainer.appendChild(answer);
                            }, { once: true });
                            this.questionContainer.append(img);
                    //         resolve();
                    //     });
                    break;
    
                default:
                    this.questionContainer.textContent = chapter.lottery.select();
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
            <table></table>
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


// // https://stackoverflow.com/questions/6677035/scroll-to-an-element-with-jquery
// function scrollPage(el, dur=600) {
//     $([document.documentElement, document.body]).animate({
//         'scrollTop': $(el).offset().top
//     }, dur);  
// }