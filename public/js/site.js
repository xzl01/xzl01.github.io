(function () {
  var STORAGE_MODE = "xzl_theme_mode";
  var STORAGE_MANUAL = "xzl_theme_manual";
  var AUTO_UPDATE_MS = 5 * 60 * 1000;

  function initHighlight() {
    if (window.hljs) {
      window.hljs.highlightAll();
    }
  }

  function getLocalTimeBucket() {
    var h = new Date().getHours();
    if (h >= 6 && h < 10) return "sunrise";
    if (h >= 10 && h < 16) return "noon";
    if (h >= 16 && h < 19) return "dusk";
    return "midnight";
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function solarPosition(date, lat, lon) {
    var rad = Math.PI / 180;
    var d = (date.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / 86400000;

    var g = rad * (357.529 + 0.98560028 * d);
    var q = rad * (280.459 + 0.98564736 * d);
    var L = q + rad * (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));

    var e = rad * (23.439 - 0.00000036 * d);
    var sinDec = Math.sin(e) * Math.sin(L);
    var dec = Math.asin(sinDec);

    var ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));

    var gmst = 18.697374558 + 24.06570982441908 * d;
    var lst = ((gmst + lon / 15) % 24 + 24) % 24;
    var ha = lst * 15 * rad - ra;

    var latRad = lat * rad;
    var elev = Math.asin(
      Math.sin(latRad) * Math.sin(dec) +
        Math.cos(latRad) * Math.cos(dec) * Math.cos(ha)
    );
    var az = Math.atan2(
      Math.sin(ha),
      Math.cos(ha) * Math.sin(latRad) - Math.tan(dec) * Math.cos(latRad)
    );
    return {
      elevation: elev / rad,
      azimuth: ((az / rad + 180) % 360 + 360) % 360,
    };
  }

  function phaseFromElevation(elev) {
    if (elev >= 42) return "noon";
    if (elev >= 8) return "sunrise";
    if (elev >= -8) return "dusk";
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

  function applyAutoTheme(coords) {
    if (!coords) {
      setTheme(getLocalTimeBucket());
      return;
    }
    var pos = solarPosition(new Date(), coords.lat, coords.lon);
    setTheme(phaseFromElevation(pos.elevation));
  }

  function updateSolarBlob(coords) {
    var now = new Date();
    var x;
    var y;
    var opacity;
    var size;

    if (coords) {
      var pos = solarPosition(now, coords.lat, coords.lon);
      var elev = pos.elevation;
      var elevNorm = clamp((elev + 12) / 78, 0, 1);
      x = clamp((pos.azimuth / 360) * 100, 8, 92);
      y = clamp(80 - elevNorm * 62, 18, 82);
      opacity = clamp(0.06 + elevNorm * 0.34, 0.06, 0.4);
      size = 180 + elevNorm * 120;
    } else {
      var hour = now.getHours() + now.getMinutes() / 60;
      var progress = clamp((hour - 6) / 12, 0, 1);
      var fakeElev = Math.sin(progress * Math.PI);
      x = 10 + progress * 80;
      y = 80 - fakeElev * 56;
      opacity = 0.08 + fakeElev * 0.28;
      size = 180 + fakeElev * 110;
    }

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
    var coords = null;
    var timer = null;

    function runCycle() {
      if (mode === "auto") {
        applyAutoTheme(coords);
      }
      updateSolarBlob(coords);
    }

    function startTimer() {
      runCycle();
      if (timer) {
        clearInterval(timer);
      }
      timer = window.setInterval(function () {
        runCycle();
      }, AUTO_UPDATE_MS);
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

    // Geolocation removed for privacy — using local time for theme auto-cycle instead
    startTimer();
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
