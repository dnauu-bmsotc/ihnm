(function() {
  var katexOptions, scrollTo;

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
    return el.scrollIntoView();
  };

  document.getElementById("toc").onclick = function(e) {
    return scrollTo(document.getElementById(e.target.dataset.id));
  };

}).call(this);
