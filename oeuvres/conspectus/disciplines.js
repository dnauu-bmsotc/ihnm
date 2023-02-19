"use strict"

// https://gist.github.com/abalter/b5357657311349e06bc5b32222f37030
function getListing(path, callback) {
    $.get(path, data => {
        callback(data
            .match(/href="([%\d\w]+)/g) // pull out the hrefs
            .map((x) => x.replace('href="', '')) // clean up
        );
    });
}

// https://stackoverflow.com/questions/6677035/scroll-to-an-element-with-jquery
function scrollMarkdown(el, dur=1000) {
    $([document.documentElement, document.body]).animate({
        'scrollTop': $(el).offset().top
    }, dur);  
}

class Lottery {
    constructor(questions) {
        this.freeQuestions = questions;
        this.bookedQuestions = [];
    }
    select() {
        if (!this.freeQuestions.length) {
            this.freeQuestions = this.bookedQuestions;
            this.bookedQuestions = [];
        }
        const idx = Math.trunc(Math.random() * this.freeQuestions.length);
        this.bookedQuestions.push(this.freeQuestions[idx]);
        this.freeQuestions.splice(idx, 1);
        return this.bookedQuestions[this.bookedQuestions.length - 1];
    }
}

class DefaultDiscipline {
    constructor(groupFolder, name, $conspectContainer, $questionContainer) {
        this.groupFolder = groupFolder;
        this.name = name;
        this.$conspectContainer = $conspectContainer;
        this.$questionContainer = $questionContainer;
    }
    deploy() {
        const $buttonsContainer = $("<div></div>");
        $buttonsContainer.attr("id", "question-buttons-container");
        this.$conspectContainer.append($buttonsContainer);

        const $markdownContainer = $("<div></div>");
        $markdownContainer.attr("id", "markdown-container");
        this.$conspectContainer.append($markdownContainer);

        $.get(this.groupFolder + this.name + ".md", data => {
            $markdownContainer.append(this.$createMarkdown(this.groupFolder, data));
            const questions = $.map(this.$conspectContainer.find("h2"), header => $(header).text());
            const button = this.$createQuestionButton("Выбрать вопрос", questions, this.$questionContainer);
            $buttonsContainer.append(button);
        });
    }
    $createQuestionButton(text, questions) {
        const lottery = new Lottery(questions);
        const $button = $(`<button>${text}</button>`);
        $button.on("click", _ => {
            const text = lottery.select();
            const $question = $(`<div>${text}</div>`);
            $question.on("click", _ => {
                scrollMarkdown(this.$conspectContainer.find(`h2:contains(${text})`)[0]);
            })
            this.$questionContainer.html($question);
        });
        return $button;
    }
    $createMarkdown(folder, data) {
        marked.setOptions({ baseUrl: folder + "../" });
        const $conspect = $(marked.parse(data));
        $conspect.find("img").each(function() {
            this.style.width = this.src.match(/(\d+).png/)[1] + "%";
        });
        return $conspect;
    }
}

class RocksGuessDiscipline extends DefaultDiscipline {
    constructor(groupFolder, name, $conspectContainer, $questionContainer) {
        super(groupFolder, name, $conspectContainer, $questionContainer);
    }
    deploy() {
    }
    createBox() {

    }
}