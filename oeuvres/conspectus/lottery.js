"use strict"

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
