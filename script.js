(function () {
  "use strict";

  /* Ano atual no rodapé */
  var footerAno = document.getElementById("footerAno");
  if (footerAno) footerAno.textContent = String(new Date().getFullYear());

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

  document.querySelectorAll(".modal, .lightbox").forEach(function (dialog) {
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

  /* Lightbox da galeria: clique em qualquer imagem abre o pop-up; se houver mais de uma, vira carrossel */
  var lightbox = document.getElementById("lightbox");
  var galleryMedias = document.querySelectorAll(".gallery-media[data-images]");

  if (lightbox && galleryMedias.length) {
    var lightboxImg = lightbox.querySelector(".lightbox__img");
    var lightboxCounter = lightbox.querySelector(".lightbox__counter");
    var lightboxCaption = lightbox.querySelector(".lightbox__caption");
    var lightboxSlideTitle = lightbox.querySelector(".lightbox__slide-title");
    var lightboxThumbs = lightbox.querySelector(".lightbox__thumbs");
    var prevBtn = lightbox.querySelector("[data-lightbox-prev]");
    var nextBtn = lightbox.querySelector("[data-lightbox-next]");
    var currentSlides = [];
    var currentIndex = 0;

    /* Todas as imagens da galeria num único carrossel */
    var allSlides = [];
    var firstIndexByMedia = new Map();
    galleryMedias.forEach(function (media) {
      var captionEl = media.closest(".gallery-item").querySelector(".gallery-caption");
      var caption = captionEl ? captionEl.textContent : "";
      firstIndexByMedia.set(media, allSlides.length);
      media.getAttribute("data-images").split(";").forEach(function (entry) {
        var parts = entry.split("|");
        var src = parts[0].trim();
        if (src) allSlides.push({ src: src, label: parts[1] ? parts[1].trim() : "", caption: caption });
      });
    });

    var preloaded = {};
    var preload = function (src) {
      if (!src || preloaded[src]) return;
      preloaded[src] = true;
      var img = new Image();
      img.decoding = "async";
      img.src = src;
    };

    var renderSlide = function () {
      var slide = currentSlides[currentIndex];

      /* Fade suave: esconde, troca e revela quando a nova imagem carregar */
      lightboxImg.classList.add("is-switching");
      var reveal = function () { lightboxImg.classList.remove("is-switching"); };
      lightboxImg.onload = reveal;
      lightboxImg.onerror = reveal;
      lightboxImg.setAttribute("src", slide.src);
      if (lightboxImg.complete) reveal();

      lightboxImg.setAttribute("alt", slide.label || slide.caption || "");
      lightboxCaption.textContent = slide.caption || "";
      lightboxSlideTitle.textContent = slide.label || "";
      lightboxCounter.textContent = currentSlides.length > 1 ? (currentIndex + 1) + " / " + currentSlides.length : "";

      /* Pré-carrega as vizinhas para navegação instantânea */
      if (currentSlides.length > 1) {
        preload(currentSlides[(currentIndex + 1) % currentSlides.length].src);
        preload(currentSlides[(currentIndex - 1 + currentSlides.length) % currentSlides.length].src);
      }

      var thumbButtons = lightboxThumbs.querySelectorAll("button");
      thumbButtons.forEach(function (thumb, i) {
        thumb.classList.toggle("is-active", i === currentIndex);
      });

      /* Mantém a miniatura ativa centralizada na fita */
      var activeThumb = thumbButtons[currentIndex];
      if (activeThumb) {
        lightboxThumbs.scrollTo({
          left: activeThumb.offsetLeft - (lightboxThumbs.clientWidth - activeThumb.offsetWidth) / 2,
          behavior: "smooth"
        });
      }
    };

    var goTo = function (index) {
      currentIndex = (index + currentSlides.length) % currentSlides.length;
      renderSlide();
    };

    prevBtn.addEventListener("click", function () { goTo(currentIndex - 1); });
    nextBtn.addEventListener("click", function () { goTo(currentIndex + 1); });

    lightbox.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") goTo(currentIndex - 1);
      if (event.key === "ArrowRight") goTo(currentIndex + 1);
    });

    /* Swipe na imagem (celular e mouse) */
    var swipeStart = null;

    lightboxImg.addEventListener("pointerdown", function (event) {
      swipeStart = { x: event.clientX, y: event.clientY };
    });

    lightboxImg.addEventListener("pointerup", function (event) {
      if (!swipeStart) return;
      var dx = event.clientX - swipeStart.x;
      var dy = event.clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        goTo(dx < 0 ? currentIndex + 1 : currentIndex - 1);
      }
    });

    lightboxImg.addEventListener("pointercancel", function () { swipeStart = null; });
    lightboxImg.setAttribute("draggable", "false");

    var openLightbox = function (media) {
      currentSlides = allSlides;
      currentIndex = firstIndexByMedia.get(media) || 0;

      var hasMultiple = currentSlides.length > 1;
      prevBtn.hidden = !hasMultiple;
      nextBtn.hidden = !hasMultiple;

      if (!lightboxThumbs.childElementCount) {
        currentSlides.forEach(function (slide, i) {
          var thumb = document.createElement("button");
          thumb.type = "button";
          thumb.setAttribute("aria-label", slide.label || slide.caption || "Imagem " + (i + 1));
          var thumbImg = document.createElement("img");
          thumbImg.src = slide.src;
          thumbImg.alt = "";
          thumbImg.loading = "lazy";
          thumb.appendChild(thumbImg);
          thumb.addEventListener("click", function () { goTo(i); });
          lightboxThumbs.appendChild(thumb);
        });
      }

      renderSlide();
      lightbox.showModal();
    };

    galleryMedias.forEach(function (media) {
      media.addEventListener("click", function () { openLightbox(media); });
      media.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(media);
        }
      });
    });
  }

  /* Carrossel da galeria: infinito (clones nas pontas + teleporte invisível) */
  var carousel = document.querySelector(".gallery-carousel");
  if (carousel) {
    var track = carousel.querySelector("[data-carousel-track]");
    var carouselPrev = carousel.querySelector("[data-carousel-prev]");
    var carouselNext = carousel.querySelector("[data-carousel-next]");
    var dotsWrap = document.querySelector("[data-carousel-dots]");
    var realItems = Array.prototype.slice.call(track.querySelectorAll(".gallery-item"));
    var realCount = realItems.length;
    var CLONES = Math.min(2, realCount);

    /* Clones nas duas pontas; clique no clone abre o lightbox do item real */
    var makeClone = function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute("data-clone", "");
      clone.setAttribute("aria-hidden", "true");
      var cloneMedia = clone.querySelector(".gallery-media");
      var realMedia = item.querySelector(".gallery-media");
      if (cloneMedia && realMedia) {
        cloneMedia.removeAttribute("tabindex");
        cloneMedia.addEventListener("click", function () { realMedia.click(); });
        cloneMedia.addEventListener("keydown", function () {});
      }
      var img = clone.querySelector(".gallery-img");
      if (img) img.classList.remove("is-loaded");
      return clone;
    };

    for (var ci = 0; ci < CLONES; ci++) {
      track.appendChild(makeClone(realItems[ci]));
      track.insertBefore(makeClone(realItems[realCount - 1 - ci]), track.firstChild);
    }

    /* Fade dos clones ao carregar */
    track.querySelectorAll("[data-clone] .gallery-img").forEach(function (img) {
      var mark = function () { img.classList.add("is-loaded"); };
      if (img.complete && img.naturalWidth > 0) mark();
      else img.addEventListener("load", mark);
    });

    var allItems = track.querySelectorAll(".gallery-item");

    var maxScroll = function () {
      return track.scrollWidth - track.clientWidth;
    };

    /* Posição de scroll que centraliza cada item */
    var centerTarget = function (i) {
      var item = allItems[i];
      var raw = item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2;
      return Math.max(0, Math.min(raw, maxScroll()));
    };

    /* Largura de uma volta completa (dos itens reais) */
    var spanWidth = function () {
      return allItems[CLONES + realCount].offsetLeft - allItems[CLONES].offsetLeft;
    };

    var nearestAllIndex = function () {
      var pos = track.scrollLeft;
      var best = 0;
      var bestDist = Infinity;
      for (var i = 0; i < allItems.length; i++) {
        var d = Math.abs(centerTarget(i) - pos);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      return best;
    };

    var logicalIndex = function () {
      return ((nearestAllIndex() - CLONES) % realCount + realCount) % realCount;
    };

    /* Salto instantâneo (sem animação nem snap) */
    var jumpTo = function (left) {
      track.style.scrollSnapType = "none";
      track.scrollLeft = left;
      void track.offsetWidth;
      track.style.scrollSnapType = "";
    };

    /* Se parou num clone, teleporta para o item real equivalente */
    var normalize = function () {
      var idx = nearestAllIndex();
      if (idx < CLONES) {
        jumpTo(track.scrollLeft + spanWidth());
      } else if (idx >= CLONES + realCount) {
        jumpTo(track.scrollLeft - spanWidth());
      }
    };

    /* Animação manual: o scroll suave nativo conflita com o scroll-snap obrigatório */
    var isAnimating = false;
    var animateScrollTo = function (target, onDone) {
      var from = track.scrollLeft;
      var distance = target - from;
      if (!distance) { if (onDone) onDone(); return; }
      var duration = 420;
      var start = null;
      isAnimating = true;
      track.style.scrollSnapType = "none";
      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        track.scrollLeft = from + distance * eased;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          track.style.scrollSnapType = "";
          isAnimating = false;
          if (onDone) onDone();
        }
      };
      requestAnimationFrame(step);
    };

    /* Bolinhas: uma por item real */
    if (dotsWrap) {
      realItems.forEach(function (item, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Ir para o item " + (i + 1));
        dot.addEventListener("click", function () {
          animateScrollTo(centerTarget(CLONES + i), normalize);
        });
        dotsWrap.appendChild(dot);
      });
    }

    var updateCarousel = function () {
      var idx = nearestAllIndex();
      var logical = ((idx - CLONES) % realCount + realCount) % realCount;

      allItems.forEach(function (item, i) {
        item.classList.toggle("is-current", i === idx);
      });

      if (dotsWrap) {
        dotsWrap.querySelectorAll("button").forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === logical);
        });
      }
    };

    /* Atualização limitada a um frame por vez (rAF) */
    var scrollTicking = false;
    var settleTimer = null;
    var onTrackScroll = function () {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(function () {
          scrollTicking = false;
          updateCarousel();
        });
      }
      /* Depois que o scroll nativo (touch/trackpad) assenta, normaliza os clones */
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(function () {
        if (!isAnimating && !dragState) normalize();
      }, 160);
    };

    var scrollByStep = function (dir) {
      animateScrollTo(centerTarget(nearestAllIndex() + dir), normalize);
    };

    if (carouselPrev) carouselPrev.addEventListener("click", function () { scrollByStep(-1); });
    if (carouselNext) carouselNext.addEventListener("click", function () { scrollByStep(1); });

    track.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") { event.preventDefault(); scrollByStep(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); scrollByStep(1); }
    });

    /* Arrastar com o mouse no desktop (touch já é nativo) */
    var dragState = null;
    var justDragged = false;

    track.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragState = { startX: event.clientX, startScroll: track.scrollLeft, moved: false };
    });

    track.addEventListener("pointermove", function (event) {
      if (!dragState) return;
      var delta = event.clientX - dragState.startX;
      if (!dragState.moved && Math.abs(delta) > 5) {
        dragState.moved = true;
        track.classList.add("is-dragging");
        track.setPointerCapture(event.pointerId);
      }
      if (dragState.moved) {
        track.scrollLeft = dragState.startScroll - delta;
      }
    });

    var endDrag = function () {
      if (!dragState) return;
      var didDrag = dragState.moved;
      dragState = null;
      if (didDrag) {
        track.classList.remove("is-dragging");
        justDragged = true;
        window.setTimeout(function () { justDragged = false; }, 120);
        /* Reencaixa no item mais próximo e normaliza clones */
        animateScrollTo(centerTarget(nearestAllIndex()), normalize);
      }
    };

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);

    /* Depois de arrastar, o clique não deve abrir o lightbox */
    track.addEventListener("click", function (event) {
      if (justDragged) {
        event.stopPropagation();
        event.preventDefault();
      }
    }, true);

    track.addEventListener("scroll", onTrackScroll, { passive: true });
    window.addEventListener("resize", function () {
      updateCarousel();
    });

    /* Começa no primeiro item real */
    jumpTo(centerTarget(CLONES));
    updateCarousel();
  }

  /* Setores: clicar no nome troca a imagem de fundo correspondente (sempre um setor ativo) */
  var setoresBg = document.querySelector("#setores .bg-img");
  var setorButtons = document.querySelectorAll(".setor-btn");
  if (setoresBg && setorButtons.length) {
    setoresBg.addEventListener("load", function () {
      setoresBg.classList.add("is-loaded");
    });

    setorButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.classList.contains("is-active")) return;

        setorButtons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");

        var targetSrc = btn.getAttribute("data-bg");
        setoresBg.classList.remove("is-loaded");
        window.setTimeout(function () {
          setoresBg.setAttribute("src", targetSrc);
        }, 250);
      });
    });
  }

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
