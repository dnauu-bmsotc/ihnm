const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const marked = require("marked");
const pug = require("pug");
const sass = require("sass")
const coffee = require("coffeescript");
const jsdom = require("jsdom");

const srcDir = "./src/";
const destDir = "./dest/";
const conspectsDir = "./src/conspects";

const pugIndex = pug.compileFile("./src/index.pug");
const pugHomepage = pug.compileFile("./src/home.pug");



clearDestDir();

const dirs = createDestDirectories();

for (let block of dirs) {
    for (let d of block.disciplines) {
        tryMarkdown(block.name, d.name);
        tryMedia(block.name, d.name);
    }
}

compileSass();

compileCoffee();

createHomepage();



function clearDestDir() {
    if (!fs.existsSync(destDir)){
        fs.mkdirSync(destDir);
    }
    else {
        fsExtra.emptyDirSync(destDir);
    }
}


function createDestDirectories() {
    const dirs = [];

    fs.readdirSync(conspectsDir).forEach(blockName => {

        fs.mkdirSync(path.join(destDir, blockName));
        const blockObj = { name: blockName, disciplines: [] };
        dirs.push(blockObj);

        fs.readdirSync(path.join(conspectsDir, blockName)). forEach(disciplineName => {
    
            fs.mkdirSync(path.join(destDir, blockName, disciplineName));
            blockObj.disciplines.push({
                name: disciplineName,
                href: `${blockName}/${disciplineName}`});
        });
    });

    return dirs;
}


function tryMarkdown(blockName, disciplineName) {
    const mdpath = path.join(conspectsDir, blockName, disciplineName, "markdown.md");
    const pagepath = path.join(destDir, blockName, disciplineName, "index.html");

    if (fs.existsSync(mdpath)) {

        const mdtext = fs.readFileSync(mdpath, 'utf8');
        const mdhtml = marked.parse(mdtext, { mangle: false, headerIds: false });
        const dom = new jsdom.JSDOM(mdhtml);
        const toc = [];

        // collect headers for table of contents
        Array.from(dom.window.document.querySelectorAll("h2, h3, h4")).forEach((h, i) => {
            h.id = "toc-id-" + i;
            toc.push({
                name: h.textContent,
                order: h.tagName,
                id: h.id,
            });
        });

        // set css variables for images
        for (let img of dom.window.document.querySelectorAll("img")) {
            const width = img.src.match(/(\d+).[^\.]+$/)[1];
            img.style.setProperty("--width", width + "%");
        }
        
        const pagehtml = pugIndex({
            title: disciplineName,
            conspect: dom.serialize(),
            dirs: dirs,
            toc: toc,
        });

        fs.appendFile(pagepath, pagehtml, err => {});
    }
}


function tryMedia(blockName, disciplineName) {
    const mediaPath = path.join(conspectsDir, blockName, disciplineName, "media");
    const mediaDest = path.join(destDir, blockName, disciplineName, "media");

    if (fs.existsSync(mediaPath)) {
        fsExtra.copySync(mediaPath, mediaDest);
    }
}


function compileSass() {
    const sassResult = sass.compile(path.join(srcDir, "style.sass"));
    fs.writeFile(path.join(destDir, "style.css"), sassResult.css, err => {});
}

function compileCoffee() {
    const script = fs.readFileSync(path.join(srcDir, "script.coffee"), 'utf8');
    fs.writeFile(path.join(destDir, "script.js"), coffee.compile(script), err => {});
}

function createHomepage() {
    const pagehtml = pugHomepage({
        dirs: dirs,
    });

    fs.appendFile("./dest/index.html", pagehtml, err => {});
}