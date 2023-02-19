"use strict"

// https://gist.github.com/abalter/b5357657311349e06bc5b32222f37030
function getListing(path, callback) {
    $.get(path, { "_": $.now() }, data => {
        callback(data
            .match(/href="([%\d\w.]+)/g) // pull out the hrefs
            .map((x) => x.replace('href="', '')) // clean up
        );
    });
}

// https://stackoverflow.com/questions/6677035/scroll-to-an-element-with-jquery
function scrollPage(el, dur=1000) {
    $([document.documentElement, document.body]).animate({
        'scrollTop': $(el).offset().top
    }, dur);  
}

function renderKaTeX(element) {
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
    });
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
    get counter() {
        return this.bookedQuestions.length;
    }
    get size() {
        return this.bookedQuestions.length + this.freeQuestions.length;
    }
}

function $tableFromJSON(obj, headersNames) {
    const $tableContainer = $("<div></div>");
    $tableContainer.addClass("table-container");
    const $table = $("<table></table");
    $tableContainer.append($table);

    const $headers = $("<tr></tr>");
    for (let header of headersNames) {
        $headers.append($(`<td>${header}</td>`));
    }
    $table.append($headers);
    
    for (let sample in obj) {
        const $row = $("<tr></tr>");
        for (let header of headersNames) {
            $row.append($(`<td>${obj[sample][header]}</td>`));
        }
        $table.append($row);
    }
    return $tableContainer;
}
