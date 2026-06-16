(() => {
  const EMAIL = "ajax_mao@163.com";
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const captureMode = navigator.webdriver || new URLSearchParams(window.location.search).has("capture");
  const menuButton = document.querySelector(".menu-button");
  const menuLinks = document.querySelectorAll(".mobile-menu a");
  const progressBar = document.querySelector(".scroll-progress span");
  const hero = document.querySelector(".hero");
  const store = document.querySelector(".store");
  const parallaxImages = document.querySelectorAll(".photo img, .mode img, .page-hero-media img, .signal-card img");
  const loaderStack = document.querySelector(".loader-stack");

  const loaderPhrases = ["Sakauma online", "Motion archive", "UESTC PhD", "Text field ready"];
  let loaderTimer = null;

  if (loaderStack) {
    const copy = document.createElement("div");
    const phrase = document.createElement("span");
    const code = document.createElement("div");
    copy.className = "loader-copy";
    code.className = "loader-code";
    phrase.textContent = loaderPhrases[0];
    code.textContent = "A4 / archive / live";
    copy.appendChild(phrase);
    loaderStack.append(copy, code);

    if (!reduceMotion) {
      let phraseIndex = 0;
      loaderTimer = window.setInterval(() => {
        phraseIndex = (phraseIndex + 1) % loaderPhrases.length;
        phrase.textContent = loaderPhrases[phraseIndex];
        phrase.style.animation = "none";
        phrase.offsetHeight;
        phrase.style.animation = "";
      }, 520);
    }
  }

  document.querySelectorAll("[data-split]").forEach((node) => {
    if (node.querySelector(".char")) return;

    const text = node.textContent;
    node.setAttribute("aria-label", text);
    node.textContent = "";

    [...text].forEach((letter, index) => {
      const span = document.createElement("span");
      span.className = letter === " " ? "char space" : "char";
      span.style.setProperty("--i", index);
      span.textContent = letter === " " ? "\u00a0" : letter;
      node.appendChild(span);
    });
  });

  const finishLoading = () => {
    if (loaderTimer) window.clearInterval(loaderTimer);
    body.classList.add("loaded");
    body.classList.remove("loading");
  };

  if (reduceMotion || captureMode) {
    finishLoading();
  } else {
    window.addEventListener(
      "load",
      () => {
        window.setTimeout(finishLoading, body.classList.contains("site-page") ? 320 : 900);
      },
      { once: true }
    );
    window.setTimeout(finishLoading, 2400);
  }

  const closeMenu = () => {
    body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  };

  menuButton?.addEventListener("click", () => {
    const open = body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.querySelectorAll(".signup, [data-copy-email-form]").forEach((form) => {
    const input = form.querySelector("input");
    const button = form.querySelector("button");

    if (input) {
      input.value = EMAIL;
      input.setAttribute("readonly", "");
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!button) return;

      const originalText = button.dataset.label || "Copy email";
      button.dataset.label = originalText;
      button.textContent = "Copying";

      const timeout = new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error("Clipboard timeout")), 850);
      });

      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await Promise.race([navigator.clipboard.writeText(EMAIL), timeout]);
        button.textContent = "Copied";
      } catch {
        button.textContent = "Open email";
        window.setTimeout(() => {
          window.location.href = `mailto:${EMAIL}`;
        }, 120);
      }

      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1800);
    });
  });

  const revealNodes = [...document.querySelectorAll(".reveal")];
  revealNodes.forEach((node, index) => {
    node.style.transitionDelay = `${Math.min(index % 7, 6) * 55}ms`;
    if (reduceMotion) {
      node.classList.add("is-visible");
    }
  });

  const countNodes = [...document.querySelectorAll("[data-count]")];
  const countedNodes = new WeakSet();

  const setCount = (node) => {
    const pad = Number(node.dataset.pad || 0);
    node.textContent = String(Number(node.dataset.count)).padStart(pad, "0");
  };

  if (reduceMotion) {
    countNodes.forEach(setCount);
  }

  const isInView = (node, amount = 0.9) => {
    const rect = node.getBoundingClientRect();
    return rect.top < window.innerHeight * amount && rect.bottom > 0;
  };

  const animateCount = (node) => {
    const target = Number(node.dataset.count);
    const pad = Number(node.dataset.pad || 0);
    const duration = 1100;
    const startedAt = performance.now();

    const tick = (now) => {
      const t = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      node.textContent = String(value).padStart(pad, "0");
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const revealVisible = () => {
    revealNodes.forEach((node) => {
      if (!node.classList.contains("is-visible") && isInView(node)) {
        node.classList.add("is-visible");
      }
    });

    countNodes.forEach((node) => {
      if (!countedNodes.has(node) && isInView(node, 0.82)) {
        countedNodes.add(node);
        animateCount(node);
      }
    });
  };

  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  const sectionLabel = (section) => {
    if (section.dataset.navLabel) return section.dataset.navLabel;
    const id = section.id || "";
    const labels = {
      top: "Start",
      about: "Index",
      writing: "Writing",
      stats: "Stats",
      signal: "Signal",
      topics: "Topics",
      archive: "Archive",
      contact: "Contact",
    };
    if (labels[id]) return labels[id];
    return id.replace(/[-_]+/g, " ") || "Section";
  };

  const trackedSections = [];
  const hudLinks = new Map();
  const main = document.querySelector("main");
  const heroSection = document.querySelector(".hero");
  const pageSections = [...document.querySelectorAll("main > section[id]")];

  if (main?.id && heroSection && pageSections.length >= 4) {
    trackedSections.push({ id: main.id, element: heroSection, label: sectionLabel(main) });
    pageSections.forEach((section) => {
      trackedSections.push({ id: section.id, element: section, label: sectionLabel(section) });
    });

    const hud = document.createElement("nav");
    const title = document.createElement("span");
    hud.className = "motion-hud";
    hud.setAttribute("aria-label", "Page sections");
    title.className = "motion-hud-title";
    title.textContent = "Route";
    hud.appendChild(title);

    trackedSections.forEach(({ id, label }) => {
      const link = document.createElement("a");
      const span = document.createElement("span");
      link.href = `#${id}`;
      link.dataset.hudTarget = id;
      link.setAttribute("aria-label", `Jump to ${label}`);
      span.className = "motion-hud-label";
      span.textContent = label;
      link.appendChild(span);
      hudLinks.set(id, link);
      hud.appendChild(link);
    });

    body.appendChild(hud);
  }

  document.querySelectorAll(".mode").forEach((mode) => {
    mode.addEventListener("pointermove", (event) => {
      const rect = mode.getBoundingClientRect();
      mode.style.setProperty("--spot-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      mode.style.setProperty("--spot-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  });

  if (hero && !reduceMotion) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const mx = (event.clientX - rect.left) / rect.width - 0.5;
      const my = (event.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--mx", mx.toFixed(3));
      hero.style.setProperty("--my", my.toFixed(3));
    });

    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--mx", "0");
      hero.style.setProperty("--my", "0");
    });
  }

  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (finePointer && !reduceMotion) {
    document
      .querySelectorAll(
        ".nav-action, .arrow-link, .race-card, .helmet-card, .post-card, .topic-card, .signal-card, .social-list a, .pill-link, .pager a, .article-tags a"
      )
      .forEach((node) => {
        node.addEventListener("pointermove", (event) => {
          const rect = node.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
          node.style.setProperty("--mag-x", `${x.toFixed(2)}px`);
          node.style.setProperty("--mag-y", `${y.toFixed(2)}px`);
        });

        node.addEventListener("pointerleave", () => {
          node.style.setProperty("--mag-x", "0px");
          node.style.setProperty("--mag-y", "0px");
        });
      });
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let ticking = false;

  const updateScrollEffects = () => {
    revealVisible();

    body.classList.toggle("scrolled", window.scrollY > 16);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    const progressValue = `${progress.toFixed(2)}%`;
    root.style.setProperty("--scroll-progress", progressValue);
    root.style.setProperty("--scroll-ratio", (progress / 100).toFixed(4));

    if (progressBar) {
      progressBar.style.width = progressValue;
    }

    if (hero) {
      const rect = hero.getBoundingClientRect();
      const heroProgress = clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
      root.style.setProperty("--hero-progress", heroProgress.toFixed(3));
      body.classList.toggle("hud-ready", heroProgress > 0.28);
    }

    if (trackedSections.length) {
      const anchor = window.innerHeight * 0.42;
      let active = trackedSections[0];
      let bestDistance = Number.POSITIVE_INFINITY;

      trackedSections.forEach((item) => {
        const rect = item.element.getBoundingClientRect();
        const distance = Math.abs(rect.top - anchor);
        if (rect.bottom > 80 && rect.top < window.innerHeight - 80 && distance < bestDistance) {
          active = item;
          bestDistance = distance;
        }
      });

      body.dataset.section = active.id;
      hudLinks.forEach((link, id) => {
        if (id === active.id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    if (!reduceMotion) {
      parallaxImages.forEach((image) => {
        const parent = image.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        const distance = window.innerHeight / 2 - (rect.top + rect.height / 2);
        image.style.setProperty("--parallax", `${clamp(distance * 0.035, -22, 22).toFixed(1)}px`);
      });

      if (store) {
        const storeRect = store.getBoundingClientRect();
        store.style.setProperty("--store-shift", `${clamp((window.innerHeight / 2 - storeRect.top) * 0.035, -28, 28)}px`);
      }
    }

    ticking = false;
  };

  const requestScrollEffects = () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  };

  window.addEventListener("scroll", requestScrollEffects, { passive: true });
  window.addEventListener("resize", requestScrollEffects);
  updateScrollEffects();

  if (finePointer && !reduceMotion) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (dot && ring) {
      let ringX = 0;
      let ringY = 0;
      let mouseX = 0;
      let mouseY = 0;

      window.addEventListener("pointermove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      });

      const moveRing = () => {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(moveRing);
      };
      moveRing();

      document.querySelectorAll("a, button, input").forEach((node) => {
        node.addEventListener("pointerenter", () => body.classList.add("cursor-active"));
        node.addEventListener("pointerleave", () => body.classList.remove("cursor-active"));
      });
    }
  }
})();
