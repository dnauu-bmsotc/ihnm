"use strict"

const GECHO = 0;
const GRESP = 1;
const GERRR = 2;

const inputHistory = [];
let inputHistoryCursor = 0;

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#input-box input").addEventListener("keydown", function(e) {
        switch (e.keyCode) {
            case 13: onEnter(e); break;
            case 38: onArrowUp(e); break;
            case 40: onArrowDown(e); break;
        }
    });
});

function onEnter(e) {
    inputHistory.push(e.target.value);
    gcout(GECHO, e.target.value);
    try {
        gcout(GRESP, (1, eval)(e.target.value)); // https://stackoverflow.com/questions/9107240
    }
    catch (e) {
        gcout(GERRR, e.name + ": " + e.message);
    }
    e.target.value = "";
    inputHistoryCursor = inputHistory.length;
    document.getElementById("console").scrollTop = document.getElementById("console").scrollHeight;
}

function onArrowUp(e) {
    if (inputHistoryCursor - 1 >= 0) {
        e.target.value = inputHistory[--inputHistoryCursor];
    }
}

function onArrowDown(e) {
    if (inputHistoryCursor + 1 < inputHistory.length) {
        e.target.value = inputHistory[++inputHistoryCursor];
    }
    else if (inputHistoryCursor + 1 >= inputHistory.length) {
        e.target.value = "";
        inputHistoryCursor = inputHistory.length;
    }
}

// https://stackoverflow.com/questions/384286
function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;  
}

function gcout(type, ...args) {
    let div = document.createElement("div");
    div.classList.add("history-item");
    if (type === GECHO) div.classList.add("history-item-echo");
    if (type === GRESP) div.classList.add("history-item-respond");
    if (type === GERRR) div.classList.add("history-item-error");
    for (let arg of args) {
        let el = document.createElement("div");
        el.classList.add("history-item-part");
        if (isElement(arg)) {
            el.appendChild(arg);
        }
        else {
            el.innerHTML = JSON.stringify(arg);
        }
        div.appendChild(el);
    }
    document.getElementById("history-box").appendChild(div);
}

// https://stackoverflow.com/questions/6249095
function selectOnClick(el) {
    let range = document.createRange();
    let sel = window.getSelection();
    range.setStart(el.childNodes[0], 0);
    range.setEnd(el.childNodes[0], el.textContent.length);
    sel.removeAllRanges();
    sel.addRange(range);
}