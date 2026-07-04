(function () {
  "use strict";

  /* Menu mobile */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("navMenu");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menu de navegação");
      });
    });
  }

  /* Sombra no header ao rolar a página */
  var header = document.getElementById("topo");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Modais de Política de Privacidade e Termos de Uso */
  document.querySelectorAll("[data-open-dialog]").forEach(function (opener) {
    var dialog = document.getElementById(opener.getAttribute("data-open-dialog"));
    if (!dialog) return;
    opener.addEventListener("click", function () {
      dialog.showModal();
    });
  });

  document.querySelectorAll(".modal").forEach(function (dialog) {
    dialog.querySelectorAll("[data-close-dialog]").forEach(function (closeBtn) {
      closeBtn.addEventListener("click", function () {
        dialog.close();
      });
    });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
  });

  /* Fade das imagens (galeria, fundos e logo) ao carregar; placeholder permanece se não existir */
  document.querySelectorAll(".gallery-img, .bg-img, .logo__img").forEach(function (img) {
    var markLoaded = function () {
      img.classList.add("is-loaded");
      var footerLogo = img.closest(".footer-logo");
      if (footerLogo) footerLogo.classList.add("has-img");
    };
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
      return;
    }
    img.addEventListener("load", markLoaded);
  });

  /* Scrollspy: destaca no menu a seção visível */
  var navLinks = document.querySelectorAll('.nav__list a[href^="#"]');
  if (navLinks.length && "IntersectionObserver" in window) {
    var linkById = {};
    var spyTargets = [];
    navLinks.forEach(function (link) {
      var section = document.getElementById(link.getAttribute("href").slice(1));
      if (section) {
        linkById[section.id] = link;
        spyTargets.push(section);
      }
    });

    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("is-active"); });
            linkById[entry.target.id].classList.add("is-active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    spyTargets.forEach(function (s) { spyObserver.observe(s); });
  }

  /* Contagem animada dos números da faixa de estatísticas */
  var statNumbers = document.querySelectorAll(".stat__number");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (statNumbers.length && !reduceMotion && "IntersectionObserver" in window) {
    var animateCount = function (el) {
      var raw = el.textContent.trim();
      var target = parseInt(raw, 10);
      if (isNaN(target)) return;
      var suffix = raw.replace(/^\d+/, "");
      var duration = 1400;
      var start = null;

      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    statNumbers.forEach(function (el) {
      statObserver.observe(el);
    });
  }

  /* Animação sutil de entrada via IntersectionObserver */
  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealItems.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }
})();
