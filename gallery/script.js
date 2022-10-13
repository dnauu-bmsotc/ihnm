const order = ["drawings", "photos", document.getElementById("")];

$(document).ready(function() {
    $.ajax({
        dataType: "json",
        url: "./links.json",
        mimeType: "application/json",
        success: addThemes
    });
});

function addThemes(data) {
    for (let theme of order) {
        $("#main").append(typeof theme === "string" ? createImageRow(data, theme) : theme);
    }
}

function createImageRow(data, theme) {
    infos = data.filter(obj => obj.name === theme)[0].array;
    themeObject = $(`<div class="main--row"></div>`);
    for (let info of infos) {
        themeObject.append(`
            <div class="image-frame">
                <img src="${info.compress}"></img>
            </div>
        `);
    }
    return themeObject;
}