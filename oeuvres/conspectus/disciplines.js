"use strict"

class DefaultDiscipline {
    constructor(vault, groupFolder, name, $conspectContainer, $questionContainer) {
        this.vault = vault;
        this.groupFolder = groupFolder;
        this.name = name;
        this.$conspectContainer = $conspectContainer;
        this.$questionContainer = $questionContainer;
    }
    deploy() {
        this.appendQuestionButtonsContainer();
        this.appendMarkdownContainer();

        $.get(this.groupFolder + this.name + ".md", { "_": $.now() }, data => {
            this.$markdownContainer.append(this.$createMarkdown(data));
            const questions = $.map(this.$conspectContainer.find("h2"), header => $(header).text());
            const button = this.$createQuestionButton("Случайный вопрос", questions, question => {
                scrollPage(this.$conspectContainer.find(`h2:contains(${question})`)[0]);
            });
            this.$buttonsContainer.append(button);

            renderKaTeX(this.$markdownContainer.get(0));
        });
    }
    appendQuestionButtonsContainer() {
        this.$buttonsContainer = $("<div></div>");
        this.$buttonsContainer.attr("id", "question-buttons-container");
        this.$conspectContainer.append(this.$buttonsContainer);
    }
    appendMarkdownContainer() {
        this.$markdownContainer = $("<div></div>");
        this.$markdownContainer.attr("id", "markdown-container");
        this.$conspectContainer.append(this.$markdownContainer);
    }
    $createQuestionButton(text, questions, onclick) {
        const lottery = new Lottery(questions);
        const $button = $(`<button>${text}</button>`);
        $button.on("click", _ => {
            const text = lottery.select();
            const $question = $(`<div>${text}</div>`);
            $question.on("click", _ => onclick(text));
            this.$questionContainer.html($question);
            $button.attr("data-counter", ` (${lottery.counter}/${lottery.size})`);
        });
        return $button;
    }
    $createMarkdown(data) {
        const $conspect = $(marked.parse(data));
        $conspect.find("img").each(function() {
            this.style.width = this.src.match(/(\d+).png/)[1] + "%";
        });
        return $conspect;
    }
}

class RocksGuessDiscipline extends DefaultDiscipline {
    constructor(vault, groupFolder, name, $conspectContainer, $questionContainer) {
        super(vault, groupFolder, name, $conspectContainer, $questionContainer);
    }
    deploy() {
        this.appendQuestionButtonsContainer();
        
        this.createBox(this.$buttonsContainer, "minerals5", "Минералы (ящ. №5)");
        this.createBox(this.$buttonsContainer, "rocks3", "Горные породы (ящ. №3)");

        this.appendMineralsTable();
    }
    createBox($container, folder, text) {
        const boxFolder = this.groupFolder + "../../media/rocks-guess/" + folder + "/";
        const $button = $(`<button>${text}</button>`);
        $container.append($button);
        
        getListing(boxFolder, listing => {
            listing = $.map(listing, name => decodeURIComponent(name));
            const lottery = new Lottery(listing);
            $button.on("click", _ => {
                const img = $(`<img src="${boxFolder + lottery.select()}">`);
                this.$questionContainer.html(img);
                $button.attr("data-counter", ` (${lottery.counter}/${lottery.size})`);
            })
        });
    }
    appendRocksTable(name, path) {
        const $placeholder = $("<div></div>");
        this.$conspectContainer.append($placeholder);
        $.getJSON(path, { "_": $.now() }, data => {
            const headers = Array.from(new Set(data.map(rock => Object.keys(rock)).flat()));
            const $table = $tableFromJSON(name, data, headers);
            $placeholder.replaceWith($table);

            this.appendRockTheoryButton(name, data);
            renderKaTeX(this.$conspectContainer.get(0));
        });
    }
    appendRockTheoryButton(name, data, key="Название") {
        const list = data.map(rock => rock[key]);
        this.$buttonsContainer.append(this.$createQuestionButton(name, list, name => {
            scrollPage(this.$conspectContainer.find(`td:contains(${name})`)[0]);
        }));
    }
    appendMineralsTable() {
        this.appendRocksTable("Минералы", this.vault + "json/minerals.json");
        this.appendRocksTable("Магматические горные породы", this.vault + "json/magmatic-rocks.json");
        this.appendRocksTable("Обломочные горные породы", this.vault + "json/clastic-rocks.json");
        this.appendRocksTable("Хемогенные и органические горные породы", this.vault + "json/biochemogenic-rocks.json");
        this.appendRocksTable("Метаморфические горные породы", this.vault + "json/metamorphic-rocks.json");
    }
}