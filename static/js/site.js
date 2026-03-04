document.addEventListener("DOMContentLoaded", function () {
  if (window.hljs) {
    window.hljs.highlightAll();
  }

  var items = document.querySelectorAll(".reveal");
  if (!items.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) {
      el.classList.add("visible");
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  items.forEach(function (el) {
    io.observe(el);
  });

  // Keep TOC item in sync with current heading while scrolling.
  var tocLinks = Array.from(document.querySelectorAll("#TableOfContents a"));
  if (!tocLinks.length) {
    return;
  }

  var headingMap = new Map();
  tocLinks.forEach(function (link) {
    var hash = link.getAttribute("href");
    if (!hash || !hash.startsWith("#")) {
      return;
    }
    var id = decodeURIComponent(hash.slice(1));
    var target = document.getElementById(id);
    if (target) {
      headingMap.set(target, link);
    }
  });

  var headings = Array.from(headingMap.keys());
  if (!headings.length) {
    return;
  }

  function setActive(link) {
    tocLinks.forEach(function (a) {
      a.classList.remove("active");
    });
    if (link) {
      link.classList.add("active");
    }
  }

  if (!("IntersectionObserver" in window)) {
    setActive(headingMap.get(headings[0]));
    return;
  }

  function updateActiveByScroll() {
    var y = window.scrollY + 120;
    var activeHeading = headings[0];
    for (var i = 0; i < headings.length; i += 1) {
      if (headings[i].offsetTop <= y) {
        activeHeading = headings[i];
      } else {
        break;
      }
    }
    setActive(headingMap.get(activeHeading));
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(function () {
        updateActiveByScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", updateActiveByScroll);
  updateActiveByScroll();
});
