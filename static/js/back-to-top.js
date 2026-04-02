(function () {
  function initBackToTop() {
    var button = document.querySelector(".back-to-top");

    if (!button) {
      return;
    }

    function toggleVisibility() {
      if (window.scrollY > 300) {
        button.classList.add("is-visible");
      } else {
        button.classList.remove("is-visible");
      }
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true });

    button.addEventListener("click", function (event) {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    toggleVisibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBackToTop);
  } else {
    initBackToTop();
  }
})();
