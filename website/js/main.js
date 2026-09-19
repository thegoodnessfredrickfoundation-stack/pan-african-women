/* =========================================================
   PAN AFRICAN WOMEN FREELANCERS & TECH TALENT
   Vanilla JS — no dependencies, no tracking, runs fast on
   low-bandwidth devices.
   ========================================================= */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. CURRENT YEAR ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. STICKY HEADER STATE ---------- */
  var header = $("#siteHeader");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      if (header) header.classList.toggle("is-stuck", window.scrollY > 12);
      var toTop = $("#toTop");
      if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 600);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 3. BACK TO TOP ---------- */
  var toTop = $("#toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 4. TOAST ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 3200);
  }

  /* ---------- 5. MOBILE MENU ---------- */
  var burger = $("#burger");
  var mobile = $("#mobile");
  function closeMobile() {
    if (!mobile || !burger) return;
    mobile.classList.remove("is-open");
    mobile.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }
  if (burger && mobile) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      if (open) {
        closeMobile();
      } else {
        mobile.classList.add("is-open");
        mobile.setAttribute("aria-hidden", "false");
        burger.setAttribute("aria-expanded", "true");
        burger.setAttribute("aria-label", "Close menu");
        document.body.style.overflow = "hidden";
      }
    });
    $$("a", mobile).forEach(function (a) { a.addEventListener("click", closeMobile); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeMobile(); closeLang(); }
    });
  }

  /* ---------- 6. LANGUAGE DROPDOWN ---------- */
  var langBtn = $("#langBtn");
  var langMenu = $("#langMenu");
  function closeLang() {
    if (!langMenu || !langBtn) return;
    langMenu.classList.remove("is-open");
    langBtn.setAttribute("aria-expanded", "false");
  }
  if (langBtn && langMenu) {
    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = langMenu.classList.contains("is-open");
      if (open) { closeLang(); }
      else {
        langMenu.classList.add("is-open");
        langBtn.setAttribute("aria-expanded", "true");
      }
    });
    $$("li", langMenu).forEach(function (li) {
      li.addEventListener("click", function () {
        var code = li.getAttribute("data-lang");
        var label = li.textContent.trim();
        if (code === "EN") {
          $$(".lang-btn .txt", langBtn).forEach(function () {});
          langBtn.childNodes.forEach(function (n) {
            if (n.nodeType === 3 && n.textContent.trim()) n.textContent = " EN ";
          });
          toast("Language set to English");
        } else {
          toast(label + " — coming soon after launch");
        }
        closeLang();
      });
    });
    document.addEventListener("click", function (e) {
      if (!langMenu.contains(e.target) && !langBtn.contains(e.target)) closeLang();
    });
  }

  /* ---------- 7. SECTION TABS (How it works) ---------- */
  var tabs = $$(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      $$(".steps").forEach(function (panel) {
        panel.classList.add("is-hidden");
      });
      var target = document.getElementById("tab-" + tab.getAttribute("data-tab"));
      if (target) {
        target.classList.remove("is-hidden");
        $$(".step", target).forEach(function (s) { s.classList.add("reveal", "is-visible"); });
      }
    });
  });

  /* ---------- 8. TALENT CATEGORY FILTER ---------- */
  var chips = $$(".chip");
  var cards = $$(".talent-card");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var cat = chip.getAttribute("data-cat");
      cards.forEach(function (card) {
        var match = cat === "all" || card.getAttribute("data-cat") === cat;
        card.classList.toggle("is-hidden", !match);
      });
      var count = cards.filter(function (c) { return !c.classList.contains("is-hidden"); }).length;
      toast(count + " freelancer" + (count === 1 ? "" : "s") + " shown");
    });
  });

  /* ---------- 9. CARD ACTIONS ---------- */
  $$(".js-hire").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".talent-card");
      var name = card ? $(".tc-id h3", card).textContent.replace("✓", "").trim() : "this freelancer";
      toast("Hiring flow for " + name + " arrives with the MVP launch.");
    });
  });
  $$(".js-msg").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("In-platform messaging opens after you create an account.");
    });
  });

  /* ---------- 10. HERO SEARCH ---------- */
  var heroSearch = $("#heroSearch");
  if (heroSearch) {
    heroSearch.addEventListener("submit", function (e) {
      e.preventDefault();
      var role = ($("#hsRole").value || "").trim();
      var country = ($("#hsCountry").value || "").trim();
      var msg = "Searching talent";
      if (role) msg += " for “" + role + "”";
      if (country) msg += " in " + country;
      toast(msg + " — full search launches with the MVP.");
    });
  }

  /* ---------- 11. SIGNUP FORM ---------- */
  var signup = $("#signup");
  var note = $("#signupNote");
  if (signup) {
    signup.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("#email");
      var value = (email.value || "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      if (!valid) {
        note.style.color = "#F8C238";
        note.textContent = "Please enter a valid email address.";
        email.focus();
        return;
      }
      note.style.color = "#DFA02A";
      note.textContent = "Thank you — we'll email you at " + value + " when early access opens.";
      email.value = "";
    });
  }

  /* ---------- 12. COUNTRY LOCAL TIMES ---------- */
  var tzEls = $$(".tz[data-tz]");
  function paintTimes() {
    tzEls.forEach(function (el) {
      var tz = el.getAttribute("data-tz");
      try {
        var t = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz
        }).format(new Date());
        el.textContent = t + " local";
      } catch (err) {
        el.textContent = "—";
      }
    });
  }
  if (tzEls.length) {
    paintTimes();
    setInterval(paintTimes, 60000);
  }

  /* ---------- 13. TESTIMONIAL CAROUSEL ---------- */
  var track = $("#carTrack");
  var dotsWrap = $("#carDots");
  if (track) {
    var slides = $$(".quote", track);
    var index = 0;
    var timer;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Testimonial " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    var dots = $$("button", dotsWrap);

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      dots.forEach(function (d, di) { d.classList.toggle("is-active", di === index); });
    }
    function next() { go(index + 1); }
    function restart() {
      clearInterval(timer);
      timer = setInterval(next, 6500);
    }
    restart();

    /* swipe support */
    var startX = 0, dx = 0, dragging = false;
    track.addEventListener("touchstart", function (e) {
      dragging = true; startX = e.touches[0].clientX; dx = 0; clearInterval(timer);
    }, { passive: true });
    track.addEventListener("touchmove", function (e) {
      if (!dragging) return;
      dx = e.touches[0].clientX - startX;
    }, { passive: true });
    track.addEventListener("touchend", function () {
      if (Math.abs(dx) > 45) { dx < 0 ? next() : go(index - 1); }
      dragging = false;
      restart();
    });
  }

  /* ---------- 14. SCROLL REVEALS ----------
     Progressive enhancement: the .reveal elements are fully visible without
     this script. We only add .js-anim (which hides them) once we know the
     observer is live, so blocked/absent JS can never hide the content. */
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length && !reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("js-anim"); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });

    /* Safety net: anything still hidden after 3s (e.g. a browser that
       reports IntersectionObserver but never fires) is revealed anyway. */
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }, 3000);
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 15. COUNT-UP STATS ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || (target >= 1000 ? "+" : "");
    var start = null, dur = 1400;
    function fmt(n) {
      return n >= 1000 ? n.toLocaleString("en-US") : String(n);
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Write the final value immediately, so the number is never left at 0 if
     the observer does not fire (no-JS, reduced motion, headless capture).
     Then animate from 0 only when we know we can observe it. */
  function settle(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || (target >= 1000 ? "+" : "");
    el.textContent = (target >= 1000 ? target.toLocaleString("en-US") : String(target)) + suffix;
  }

  var counters = $$("[data-count]");
  counters.forEach(settle);

  if ("IntersectionObserver" in window && counters.length && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- 16. SMOOTH ANCHOR SCROLL (offset for sticky nav) ---------- */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });
})();
