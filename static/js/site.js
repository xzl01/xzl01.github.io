(function () {
  var STORAGE_MODE = "xzl_theme_mode";
  var STORAGE_MANUAL = "xzl_theme_manual";
  var AUTO_UPDATE_MS = 5 * 60 * 1000;

  function initHighlight() {
    if (window.hljs) {
      window.hljs.highlightAll();
    }
  }

  function getThemeByHour() {
    var h = new Date().getHours();
    if (h >= 6 && h < 10) return "sunrise";
    if (h >= 10 && h < 16) return "noon";
    if (h >= 16 && h < 19) return "dusk";
    return "midnight";
  }

  function setTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    var palette = document.getElementById("theme-palette-select");
    if (palette) {
      palette.value = theme;
    }
  }

  function setMode(mode) {
    var modeSelect = document.getElementById("theme-mode-select");
    var palette = document.getElementById("theme-palette-select");
    if (modeSelect) {
      modeSelect.value = mode;
    }
    if (palette) {
      palette.disabled = mode !== "manual";
    }
  }

  function updateSolarBlob() {
    var now = new Date();
    var hour = now.getHours() + now.getMinutes() / 60;
    var progress = Math.max(0, Math.min(1, (hour - 6) / 12));
    var fakeElev = Math.sin(progress * Math.PI);
    var x = 10 + progress * 80;
    var y = 80 - fakeElev * 56;
    var opacity = 0.08 + fakeElev * 0.28;
    var size = 180 + fakeElev * 110;

    document.body.style.setProperty("--sun-x", x.toFixed(2) + "%");
    document.body.style.setProperty("--sun-y", y.toFixed(2) + "%");
    document.body.style.setProperty("--sun-opacity", opacity.toFixed(3));
    document.body.style.setProperty("--sun-size", size.toFixed(0) + "px");
  }

  function initThemeSystem() {
    var modeSelect = document.getElementById("theme-mode-select");
    var paletteSelect = document.getElementById("theme-palette-select");
    if (!modeSelect || !paletteSelect) {
      return;
    }

    var mode = localStorage.getItem(STORAGE_MODE) || "auto";
    var manualTheme = localStorage.getItem(STORAGE_MANUAL) || "sunrise";
    var timer = null;

    function runCycle() {
      if (mode === "auto") {
        setTheme(getThemeByHour());
      }
      updateSolarBlob();
    }

    function startTimer() {
      runCycle();
      if (timer) {
        clearInterval(timer);
      }
      timer = window.setInterval(runCycle, AUTO_UPDATE_MS);
    }

    setMode(mode);
    if (mode === "manual") {
      setTheme(manualTheme);
    }
    startTimer();

    modeSelect.addEventListener("change", function () {
      mode = modeSelect.value;
      localStorage.setItem(STORAGE_MODE, mode);
      setMode(mode);
      if (mode === "manual") {
        setTheme(paletteSelect.value);
      }
      startTimer();
    });

    paletteSelect.addEventListener("change", function () {
      manualTheme = paletteSelect.value;
      localStorage.setItem(STORAGE_MANUAL, manualTheme);
      if (mode === "manual") {
        setTheme(manualTheme);
        runCycle();
      }
    });
  }

  function initReveal() {
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
  }

  function initTocFollow() {
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
      var rawId = hash.slice(1);
      var id = rawId;
      try {
        id = decodeURIComponent(rawId);
      } catch (err) {
        id = rawId;
      }
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

    if ("IntersectionObserver" in window) {
      var seen = new Map();
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            seen.set(entry.target, entry.isIntersecting ? entry.boundingClientRect.top : Infinity);
          });
          var visible = Array.from(seen.entries())
            .filter(function (pair) {
              return Number.isFinite(pair[1]);
            })
            .sort(function (a, b) {
              return a[1] - b[1];
            });
          if (visible.length) {
            setActive(headingMap.get(visible[0][0]));
          }
        },
        { rootMargin: "-90px 0px -65% 0px", threshold: [0, 1] }
      );

      headings.forEach(function (h) {
        io.observe(h);
      });
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
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHighlight();
    initThemeSystem();
    initReveal();
    initTocFollow();
  });
})();

/* Scroll progress bar */
(function () {
  var bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  function update() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight * 100) : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* Bottom nav active state */
(function () {
  var nav = document.querySelector('.site-nav-bottom');
  if (!nav) return;
  var links = nav.querySelectorAll('a');
  var path = location.pathname;
  links.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === '/' && (path === '/' || path === '')) {
      link.classList.add("active");
    } else if (href !== '/' && path.startsWith(href)) {
      link.classList.add("active");
    }
  });
})();
