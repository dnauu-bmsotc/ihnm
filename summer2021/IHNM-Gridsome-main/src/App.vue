<template>
  <router-view />
</template>

<script>
  export default {
    mounted() {
      separateTabNavigationStyles(document);
      window.scrollbarWidth = getScrollbarWidth(document);
    }
  };

  function separateTabNavigationStyles(document) {
    document.body.addEventListener("mousedown", function(e) {
      document.body.classList.add("using-mouse");
    });
    document.body.addEventListener("keydown", function(e) {
      if (e.keyCode === 9) {
        document.body.classList.remove("using-mouse");
      }
    });
  }

  function getScrollbarWidth(document) {
    // Creating invisible container
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll"; // forcing scrollbar to appear
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement("div");
    outer.appendChild(inner);

    // Calculating difference between container"s full width and the child width
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }
</script>
