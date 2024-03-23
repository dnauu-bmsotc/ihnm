function ihnmSecretsAreUnveiled() {
    return localStorage.getItem("ihnm-secrets-unveiled") === "yes";
}

async function ihnmPagesInfo(hash=true, cahce="no-cache") {
    if (!ihnmPagesInfo.data || !hash) {
        const response = await fetch(window.location.origin + "/ihnm/pages.json", {cache: cahce});
        ihnmPagesInfo.data = await response.json();
    }
    return ihnmPagesInfo.data;
}

function ihnmGetPageById(data, id) {
    for (let p of data) {
        if (p.id === id)
            return p;
    }
    return null;
}

function ihnmGetPageAbsolutePath(page) {
    return window.location.origin + "/ihnm" + page.href.slice(1) + "/";
}