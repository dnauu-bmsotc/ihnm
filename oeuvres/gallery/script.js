window.addEventListener("load", hydrate);

async function hydrate() {
    const main = document.querySelector("main");

    const response = await fetch("./meta.json", { cache: "no-store" });
    const jsonData = await response.json();

    for (let chapter of jsonData) {
        chapter.el = document.createElement("section");
        let html = `<h2>${chapter.name}</h2>`;

        for (let item of chapter.list) {
            switch (item.path.split('.').pop()) {
                case "jpg":
                case "png":
                    html += `<img src="${item.path}"></img>`;
                    break;
                case "mp4":
                    html += `<video src="${item.path}" controls></video>`;
                    break;
                default:
                    break;
            }
        }

        chapter.el.innerHTML = html;
        main.appendChild(chapter.el);
    }
}