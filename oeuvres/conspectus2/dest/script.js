(function() {
  var href, id, katexOptions, scrollTo;

  katexOptions = {
    delimiters: [
      {
        left: '$$',
        right: '$$',
        display: true
      },
      {
        left: '$',
        right: '$',
        display: false
      }
    ],
    throwOnError: false,
    strict: false
  };

  window.onload = function() {
    return renderMathInElement(document.body, katexOptions);
  };

  scrollTo = function(el) {
    return el && el.scrollIntoView();
  };

  document.getElementById("toc").onclick = function(e) {
    return scrollTo(document.getElementById(e.target.dataset.id));
  };

  if (window.location.href.indexOf("#") > -1) {
    href = decodeURI(window.location.href);
    id = href.slice(href.indexOf("#") + 1);
    document.getElementById(id).style.backgroundColor = "red";
  }

}).call(this);
