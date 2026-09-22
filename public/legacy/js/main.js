/*
 * Legacy page behaviour, rewritten as dependency-free vanilla JS.
 *
 * Previously this file required jQuery + WOW.js + Waypoints + CounterUp +
 * Owl Carousel and attached several scroll listeners that read layout on every
 * scroll event (forced synchronous layout => 1-2s of jank right after load).
 *
 * Everything here is now either passive + rAF-throttled or driven by
 * IntersectionObserver, so scrolling never triggers layout work.
 */
(function () {
  "use strict";

  var spinner = document.getElementById("spinner");
  if (spinner) spinner.classList.remove("show");

  /* Mobile navigation without the external Bootstrap JavaScript bundle. */
  if (!window.__legacyNavToggle) {
    window.__legacyNavToggle = true;
    document.addEventListener("click", function (event) {
      var target = event.target;
      var toggle = target && target.closest ? target.closest(".navbar-toggler") : null;
      if (toggle) {
        var selector = toggle.getAttribute("data-bs-target") || "#navbarCollapse";
        var menu = document.querySelector(selector);
        if (!menu) return;
        var open = menu.classList.toggle("show");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }
      var navLink = target && target.closest ? target.closest("#navbarCollapse a") : null;
      if (!navLink) return;
      var expanded = document.querySelector("#navbarCollapse.show");
      if (expanded) expanded.classList.remove("show");
    });
  }

  /* ---------------------------------------------------------------
   * Sticky navbar + back-to-top button.
   * One passive scroll listener, rAF-throttled, writes only on change.
   * ------------------------------------------------------------- */
  var stickyEls = null;
  var backTop = null;
  var lastSticky = null;
  var lastTop = null;
  var ticking = false;

  function onScrollFrame() {
    ticking = false;
    if (stickyEls === null) {
      stickyEls = document.querySelectorAll(".sticky-top");
      backTop = document.querySelector(".back-to-top");
    }
    var y = window.scrollY;
    var stuck = y > 300;
    if (stuck !== lastSticky) {
      lastSticky = stuck;
      for (var i = 0; i < stickyEls.length; i++) {
        stickyEls[i].classList.toggle("shadow-sm", stuck);
        stickyEls[i].style.top = stuck ? "0px" : "-150px";
      }
    }
    var show = y > 100;
    if (backTop && show !== lastTop) {
      lastTop = show;
      backTop.style.transition = "opacity .3s ease";
      backTop.style.opacity = show ? "1" : "0";
      backTop.style.display = show ? "block" : "none";
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }

  // Client-side navigation re-runs this file: drop the previous listeners
  // instead of stacking a new one on every page change.
  if (window.__legacyScroll) window.removeEventListener("scroll", window.__legacyScroll);
  window.__legacyScroll = onScroll;
  window.addEventListener("scroll", onScroll, { passive: true });
  requestAnimationFrame(onScrollFrame);

  if (!window.__legacyBackToTop) {
    window.__legacyBackToTop = true;
    document.addEventListener("click", function (event) {
      var target = event.target;
      var btn = target && target.closest ? target.closest(".back-to-top") : null;
      if (!btn) return;
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }



  /* ---------------------------------------------------------------
   * Reveal-on-scroll (replaces WOW.js + animate.css).
   * IntersectionObserver only: no scroll listener, no layout reads.
   * ------------------------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll(".wow:not([data-revealed])");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) {
        els[i].setAttribute("data-revealed", "1");
        els[i].classList.add("is-revealed");
      }
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (var j = 0; j < entries.length; j++) {
          var entry = entries[j];
          if (!entry.isIntersecting) continue;
          var el = entry.target;
          observer.unobserve(el);
          var delay = el.getAttribute("data-wow-delay");
          if (delay) el.style.animationDelay = delay;
          el.classList.add("is-revealed");
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    for (var k = 0; k < els.length; k++) {
      els[k].setAttribute("data-revealed", "1");
      observer.observe(els[k]);
    }
  }

  initReveal();
})();
