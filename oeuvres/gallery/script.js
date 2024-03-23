
window.addEventListener("load", async function() {
    const main = document.querySelector("main");
    const response = await fetch("./meta.json", { cache: "no-store" });
    const jsonData = await response.json();

    for (let chapter of jsonData) {
        chapter.el = document.createElement("section");
        chapter.el.append(fromHTML(`<h2>${chapter.name}</h2>`));

        for (let item of chapter.list) {
            const itemEl = fromHTML(`<div class="item"></div>`);
            item.secret && !ihnmSecretsAreUnveiled() && (itemEl.classList.add("secret"));
            chapter.el.append(itemEl);

            itemEl.append(fromHTML(htmlMedia(item)));
            itemEl.append(fromHTML(htmlName(item)));
            item.secondName && itemEl.append(fromHTML(htmlSecondName(item)));
            item.description && itemEl.append(fromHTML(`<div class="description">${item.description}</dvi>`));
            item.date && itemEl.append(fromHTML(`<span class="date">${item.date}</span>`));

            if (item.sensitiveContent) {
                itemEl.classList.add("sensitive");
                const revealEl = fromHTML(htmlReveal());
                revealEl.querySelector(".reveal-btn").addEventListener("click", _ => {
                    itemEl.classList.remove("sensitive");
                })
                itemEl.append(revealEl);
            }
        }

        main.appendChild(chapter.el);
    }
});

function htmlMedia(item) {
    switch (item.path.split('.').pop()) {
        case "jpg":
        case "png":
            return `<img src="${item.path}"></img>`;
        case "mp4":
            return `<video src="${item.path}" controls></video>`;
        default:
            return ``;
    }
}

function htmlReveal(item) {
    return `<div class="reveal"><span class="reveal-btn">
        Чувствительный контент. Click to reveal.</span></div>`;
}

function htmlName(item) {
    return `<strong class="name">${item.name ? item.name : 'Без названия'}</strong>`;
}

function htmlSecondName(item) {
    return `<span class="second-name">(${item.secondName})</span>`;
}

function fromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}