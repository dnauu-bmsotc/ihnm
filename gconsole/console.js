"use strict"

const GECHO = 0;
const GRESP = 1;
const GERRR = 2;

const inputHistory = [];
let inputHistoryCursor = 0;

function onKeydown(e) {
    switch (e.keyCode) {
        case 13: onEnter(e); break;
        case 38: onArrowUp(e); break;
        case 40: onArrowDown(e); break;
    }
}

function onEnter(e) {
    const inp = document.getElementById("input-box--input");
    inputHistory.push(inp.value);
    gcout(GECHO, inp.value);
    try {
        gcout(GRESP, (1, eval)(inp.value)); // https://stackoverflow.com/questions/9107240
    }
    catch (err) {
        gcout(GERRR, err.name + ": " + err.message);
    }
    inp.value = "";
    inputHistoryCursor = inputHistory.length;
    document.getElementById("history-box").scrollTop = document.getElementById("history-box").scrollHeight;
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

function gcout(type, arg) {
    if (arg && typeof arg.next === "function") {
        let done = false;
        while (!done) {
            const res = arg.next();
            gcout_single(type, res.value);
            done = res.done;
        }
    }
    else {
        gcout_single(type, arg)
    }
}

function gcout_single(type, arg) {
    let div = document.createElement("div");
    div.classList.add("history-item");
    if (type === GECHO) div.classList.add("history-item-echo");
    if (type === GRESP) div.classList.add("history-item-respond");
    if (type === GERRR) div.classList.add("history-item-error");
    let el = document.createElement("div");
    el.classList.add("history-item-part");
    if (isElement(arg)) {
        el.appendChild(arg);
    }
    else {
        el.innerHTML = JSON.stringify(arg);
    }
    div.appendChild(el);
    document.getElementById("history-box").appendChild(div);
}

// https://stackoverflow.com/questions/384286
function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;  
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

async function getFile(e) {
    const txt = await e.target.files[0].text();
    document.getElementById("commands-sequence").value = txt;
    document.getElementById("commands-sequence").dispatchEvent(new Event("input"));
    processFile(txt);
}
 
async function getTestFile(path) {
    let testfile = await fetchNoCache(path);
    if (testfile.ok) {
        const txt = await testfile.text();
        document.getElementById("commands-sequence").value = txt;
        document.getElementById("commands-sequence").dispatchEvent(new Event("input"));
        processFile(txt);
    }
}

function processFile(txt) {
    for (let command of txt.split(";")) {
        document.getElementById("input-box--input").value = command.replace(/\/\*[\s\S]*?\*\//g, "");
        document.getElementById("input-box--enter-btn").dispatchEvent(new Event("click"));
    }
}

// https://stackoverflow.com/questions/29246444
async function fetchNoCache(path) {
    var myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');
    var myInit = {
        method: 'GET',
        headers: myHeaders,
    };
    var myRequest = new Request(path);
    return await fetch(myRequest, myInit);
}

function clearConsole() {
    document.getElementById("history-box").innerHTML = "";
}

document.addEventListener('DOMContentLoaded', function() {
    const tx = document.getElementsByTagName("textarea");
    for (let i = 0; i < tx.length; i++) {
      tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
      tx[i].addEventListener("input", OnTextareaInput, false);
    }
    
    function OnTextareaInput() {
      this.style.height = "auto";
      this.style.height = (this.scrollHeight) + "px";
    }
});