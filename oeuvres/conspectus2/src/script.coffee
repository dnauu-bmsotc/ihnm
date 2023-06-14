katexOptions =
    delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
    ],
    throwOnError: false
    strict: false

window.onload = () -> renderMathInElement(document.body, katexOptions)


scrollTo = (el) -> el.scrollIntoView()

document.getElementById("toc").onclick = (e) -> scrollTo document.getElementById e.target.dataset.id