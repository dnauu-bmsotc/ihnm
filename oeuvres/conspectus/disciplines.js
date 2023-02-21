"use strict"

class DefaultDiscipline {
    constructor(vault, groupFolder, name, $conspectContainer, $questionContainer) {
        this.vault = vault;
        this.groupFolder = groupFolder;
        this.name = name;
        this.$conspectContainer = $conspectContainer;
        this.$questionContainer = $questionContainer;
        this.$lastPressedButton = null;
    }
    deploy() {
        this.appendQuestionButtonsContainer();
        this.appendMarkdownContainer();

        $.get(this.groupFolder + this.name + ".md", { "_": $.now() }, data => {
            this.$markdownContainer.append(this.$createMarkdown(this.groupFolder, data));

            const $chapters = this.$conspectContainer.find("h2");
            for (let i = 0; i < $chapters.length; i++) {
                let $between = null;
                if (i < $chapters.length - 1) {
                    $between = $($chapters[i]).nextUntil($($chapters[i+1]));
                }
                else {
                    $between = $($chapters[i]).nextAll();
                }
                const questions = $.map($between.filter("h3"), header => $(header).text());
                const $button = this.$createQuestionButton($chapters[i].textContent, questions, question => {
                    scrollPage(this.$conspectContainer.find(`h3:contains(${question})`)[0]);
                });
                this.$buttonsContainer.append($button);
            }

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
            this.setLastPressedButton($button);
        });
        return $button;
    }
    $createMarkdown(baseUrl, data) {
        marked.setOptions({ baseUrl: baseUrl });
        const $conspect = $(marked.parse(data));
        $conspect.find("img").each(function() {
            this.style.width = this.src.match(/(\d+).png/)[1] + "%";
        });
        return $conspect;
    }
    setLastPressedButton($button) {
        this.$lastPressedButton && this.$lastPressedButton.removeClass("last-pressed");
        this.$lastPressedButton = $button;
        this.$lastPressedButton.addClass("last-pressed");
    }
}

class RocksGuessDiscipline extends DefaultDiscipline {
    constructor(vault, groupFolder, name, $conspectContainer, $questionContainer) {
        super(vault, groupFolder, name, $conspectContainer, $questionContainer);
    }
    deploy() {
        this.appendQuestionButtonsContainer();
        
        this.createBox(this.$buttonsContainer, "minerals5", "Минералы (фото) (ящ. №5)");
        this.createBox(this.$buttonsContainer, "rocks3", "Горные породы (фото) (ящ. №3)");

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
                const filename = lottery.select();
                const $img = $(`<img src="${boxFolder + filename}">`);
                $img.on("click.showAnswer", _ => {
                    this.$questionContainer.append(`<div>${filename}</div>`);
                    $img.off("click.showAnswer");
                });
                this.$questionContainer.html($img);
                $button.attr("data-counter", ` (${lottery.counter}/${lottery.size})`);
                this.setLastPressedButton($button);
            })
        });
    }
    appendRocksTables(buttonName, metadata, callback, index=0, lotteryList=[]) {
        if (index < metadata.length) {
            const $placeholder = $("<div></div>");
            this.$conspectContainer.append($placeholder);
            $.getJSON(metadata[index].path, { "_": $.now() }, data => {
                const headers = Array.from(new Set(data.map(rock => Object.keys(rock)).flat()));
                const $table = $tableFromJSON(metadata[index].name, data, headers);
                $placeholder.replaceWith($table);

                lotteryList.push(...data.map(rock => rock["Название"]));
                this.appendRocksTables(buttonName, metadata, callback, index + 1, lotteryList);
            });
        }
        else {
            this.$buttonsContainer.append(this.$createQuestionButton(buttonName, lotteryList, name => {
                scrollPage(this.$conspectContainer.find(`td:contains(${name})`)[0]);
            }));
            callback && callback();
        }
    }
    appendMineralsTable() {
        this.appendRocksTables("Минералы (названия)", [
            { name: "Минералы", path: this.vault + "json/minerals.json" }
        ]);

        this.appendRocksTables("Горные породы (названия)", [
            { name: "Магматические горные породы", path: this.vault + "json/magmatic-rocks.json" },
            { name: "Обломочные горные породы", path: this.vault + "json/clastic-rocks.json" },
            { name: "Хемогенные и органические горные породы", path: this.vault + "json/biochemogenic-rocks.json" },
            { name: "Метаморфические горные породы", path: this.vault + "json/metamorphic-rocks.json" }
        ], _ => renderKaTeX(this.$conspectContainer.get(0)));
    }
}