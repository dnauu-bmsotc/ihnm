katexOptions =
    delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
    ],
    throwOnError: false
    strict: false

window.onload = () -> renderMathInElement(document.body, katexOptions)


scrollTo = (el) -> el && el.scrollIntoView()

document.getElementById("toc").onclick = (e) -> scrollTo document.getElementById e.target.dataset.id


if window.location.href.indexOf("#") > -1
    href = decodeURI window.location.href
    id = href.slice(href.indexOf("#") + 1)
    document.getElementById(id).style.backgroundColor = "red"