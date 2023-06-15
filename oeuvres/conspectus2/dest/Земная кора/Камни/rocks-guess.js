
const imgEl = document.getElementById("rocks-guess-img");
const nameEl = document.getElementById("rocks-guess-name");
const buttonsDiv = document.getElementById("rocks-guess-buttons");

fetch("./rocks-guess.json", {cache: "no-store"})
    .then(response => response.json())
    .then(data => {
        for (let box of data) {
            processBox(box);
        }
    })


function toggleNameVisibility(visible) {
    visible
        ? nameEl.classList.add("visible")
        : nameEl.classList.remove("visible");
}


function processBox(box) {
    const btn = document.createElement("button");
    btn.textContent = box.name;

    btn.addEventListener("click", e => {
        if (nameEl.classList.contains("visible")) {
            nameEl.textContent = box.images[0];
            imgEl.src = "./" + box.path + box.images[0];
            swipeCard(box);
            toggleNameVisibility(false);
        }
        else {
            toggleNameVisibility(true);
        }
    })

    buttonsDiv.append(btn);
}


function swipeCard(box, buffer=0.3) {
    const indexMin = Math.max(1, box.images.length * buffer);
    const indexMax = box.images.length;
    const index = indexMin + Math.floor(Math.random() * (indexMax - indexMin));

    box.images = [
        ...box.images.slice(1, index),
        box.images[0],
        ...box.images.slice(index)
    ];
}