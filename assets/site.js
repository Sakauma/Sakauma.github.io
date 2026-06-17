(() => {
  const EMAIL = "ajax_mao@163.com";
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const captureMode = navigator.webdriver || new URLSearchParams(window.location.search).has("capture");
  const menuButton = document.querySelector(".menu-button");
  const menuLinks = document.querySelectorAll(".mobile-menu a");
  const allNavLinks = document.querySelectorAll(".nav-links a, .mobile-menu a");
  const progressBar = document.querySelector(".scroll-progress span");
  const hero = document.querySelector(".hero");
  const store = document.querySelector(".store");
  const contactSection = document.querySelector("#contact");
  const floatingCta = document.querySelector(".floating-cta");
  const postBody = document.querySelector(".article-shell .post-body");
  const parallaxImages = document.querySelectorAll(".photo img, .mode img, .page-hero-media img, .signal-card img");
  const loaderStack = document.querySelector(".loader-stack");
  const shellRoot = document.querySelector(".shell, .site-page");
  let isHeroPointerActive = false;

  const loaderPhrases = ["Sakauma", "Posts", "Archive", "Tags", "UESTC PhD"];
  let loaderTimer = null;
  const heroMedia = document.querySelector(".hero-media");

  if (loaderStack) {
    const copy = document.createElement("div");
    const phrase = document.createElement("span");
    const code = document.createElement("div");
    copy.className = "loader-copy";
    code.className = "loader-code";
    phrase.textContent = loaderPhrases[0];
    code.textContent = "Posts / Archive / Tags";
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
    body.classList.add("scene-ready");
  };

  const sceneNodes = [
    ...new Set([
      ...document.querySelectorAll("main > section"),
      ...document.querySelectorAll(".content-panel"),
      ...document.querySelectorAll(".article-shell"),
      ...document.querySelectorAll(".post-list"),
      ...document.querySelectorAll(".topic-list"),
      ...document.querySelectorAll(".about-layout"),
    ]),
  ];

  sceneNodes.forEach((node, index) => {
    node.classList.add("scene-stage");
    node.style.setProperty("--scene-delay", `${Math.min(index, 8) * 70}ms`);
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    const sceneObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("stage-visible");
            sceneObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.11 }
    );

    sceneNodes.forEach((node) => sceneObserver.observe(node));
  } else {
    sceneNodes.forEach((node) => node.classList.add("stage-visible"));
  }

  const wireSkipToContent = () => {
    const main = document.querySelector("main");
    const existing = document.getElementById("skip-to-content");
    const root = shellRoot || body;

    if (!main) return;
    if (!main.id) main.id = "top";

    if (existing) return;

    const skipLink = document.createElement("a");
    skipLink.id = "skip-to-content";
    skipLink.className = "skip-link";
    skipLink.href = "#top";
    skipLink.textContent = "Skip to content";
    root.prepend(skipLink);
  };

  wireSkipToContent();

  const normalizeRoute = (path) => {
    const cleaned = (path || "/").split(/[?#]/)[0].replace(/\/index\.html$/i, "/").replace(/\/$/, "/");
    if (cleaned === "//") return "/";
    return cleaned;
  };

  const getCurrentRoute = () => {
    const path = normalizeRoute(location.pathname);

    if (path === "/" || path === "/index/" || path === "/404/") return "/";
    if (path.startsWith("/list/")) return "/list/";
    if (path.startsWith("/archives/")) return "/archives/";
    if (path.startsWith("/tags/")) return "/tags/";
    if (path.startsWith("/categories/")) return "/categories/";
    if (path.startsWith("/about/")) return "/about/";
    if (/^\/\d{4}\//.test(path)) return "/list/";

    return path;
  };

  const syncAriaCurrent = () => {
    const activeRoute = getCurrentRoute();

    allNavLinks.forEach((link) => {
      const href = normalizeRoute(link.getAttribute("href") || "");
      const normalizedHref = href.startsWith("http") ? normalizeRoute(new URL(href, location.href).pathname) : href;
      const isCurrent = href === activeRoute || normalizedHref === activeRoute;
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  syncAriaCurrent();

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

  const setMenuLinksVisible = (open) => {
    menuLinks.forEach((link) => {
      link.style.opacity = open ? "1" : "";
      link.style.transform = open ? "translate3d(0, 0, 0)" : "";
    });
  };

  const closeMenu = () => {
    body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
    setMenuLinksVisible(false);
  };

  menuButton?.addEventListener("click", () => {
    const open = body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(open));
    setMenuLinksVisible(open);
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
    const linkIndex = Array.prototype.indexOf.call(menuLinks, link);
    link.style.setProperty("--menu-link-delay", `${72 + linkIndex * 44}ms`);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  let startRouteTransition = (url) => {
    window.location.href = url.href;
  };

  const routeTransition = document.createElement("div");
  routeTransition.className = "route-transition";
  routeTransition.setAttribute("aria-hidden", "true");
  routeTransition.innerHTML = `
    <span>SAKAUMA</span>
    <strong>Route</strong>
    <small></small>
    <i class="route-progress-track" aria-hidden="true"><b></b></i>
  `;
  body.appendChild(routeTransition);

  let routeLeaving = false;

  const shouldTransitionLink = (link, event) => {
    if (!link || event.defaultPrevented || event.button !== 0) return null;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
    if (link.target && link.target !== "_self") return null;
    if (link.hasAttribute("download")) return null;

    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;

    let url = null;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return null;
    }

    if (url.origin !== window.location.origin) return null;
    const samePath = url.pathname === window.location.pathname && url.search === window.location.search;
    if (samePath && url.hash) return null;
    if (url.href === window.location.href) return null;
    return url;
  };

  const routeLabel = (url) => {
    if (url.pathname === "/") return "Home";
    const last = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "Route");
    return last.replace(/[-_]+/g, " ").slice(0, 34) || "Route";
  };

  const routeKind = (url) => {
    if (/^\/\d{4}\//.test(url.pathname)) return "Read";
    if (url.pathname.includes("/list/")) return "Posts";
    if (url.pathname.includes("/archives/")) return "Archive";
    if (url.pathname.includes("/tags/")) return "Tags";
    if (url.pathname.includes("/categories/")) return "Categories";
    if (url.pathname.includes("/about/")) return "About";
    return "Route";
  };

  startRouteTransition = (url) => {
    if (!url) return;

    if (reduceMotion || captureMode) {
      window.location.href = url.href;
      return;
    }

    if (routeLeaving) return;
    routeLeaving = true;

    closeMenu();
    routeTransition.dataset.routeMode = routeKind(url);
    routeTransition.querySelector("strong").textContent = routeLabel(url);
    body.classList.add("route-leaving");

    window.setTimeout(() => {
      window.location.href = url.href;
    }, 340);
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    const url = shouldTransitionLink(link, event);
    if (!url) return;

    event.preventDefault();
    startRouteTransition(url);
  });

  window.addEventListener("pageshow", () => {
    routeLeaving = false;
    body.classList.remove("route-leaving");
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

  let revealNodes = [];
  let revealObserver = null;

  const pickRevealMode = (node) => {
    if (node.dataset.revealMode) return node.dataset.revealMode;
    if (node.matches(".route-readout, .motion-hud, .hero-readout, .article-dock")) return "fade";
    if (node.matches(".post-card, .topic-card, .signal-card, .helmet-card, .race-card, .mode")) return "drift";
    if (node.matches("section, .content-panel, .article-shell, .about-layout, .post-list, .topic-list")) return "wipe";
    if (node.matches(".hero h1, .section-title, .split-word, .page-hero h1")) return "slice";
    if (node.matches("h1, h2, h3, .post-card h3, .topic-card h3, .signal-card strong, .helmet-card h3")) return "glide";
    if (node.matches(".hero-copy, .intro-copy, .signal-copy p, .page-hero-copy")) return "left";
    if (node.matches(".social-list a, .arrow-link, .pill-link, .pager a, .article-tags a")) return "stagger";
    if (node.matches("img, .photo img, .hero-media img, .page-hero-media img, .mode img, .signal-card img")) return "zoom";
    if (node.matches(".eyebrow, .stat strong")) return "micro";
    return "rise";
  };

  const resolveRevealOffset = (mode) => {
    if (mode === "micro") return "8px";
    if (mode === "fade") return "0px";
    return "22px";
  };

  const registerRevealNode = (node, index = revealNodes.length) => {
    if (!node.classList.contains("reveal") || node.dataset.revealRegistered) return;
    const mode = pickRevealMode(node);
    node.dataset.revealMode = mode;
    node.dataset.revealRegistered = "true";
    node.style.setProperty("--reveal-delay", `${Math.min(index % 7, 6) * 55}ms`);
    node.style.setProperty("--reveal-offset", resolveRevealOffset(mode));
    revealNodes.push(node);
    if (reduceMotion) {
      node.classList.add("is-visible");
      return;
    }

    if (revealObserver) {
      revealObserver.observe(node);
    }
  };

  const registerRevealNodes = (nodes) => {
    nodes.forEach((node, index) => {
      registerRevealNode(node, index);
    });
    if (revealObserver) {
      revealNodes = [...document.querySelectorAll(".reveal[data-reveal-registered='true']")];
    }
  };

  registerRevealNodes(document.querySelectorAll(".reveal"));

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
    revealObserver = observer;
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  const compactNumber = (value) => String(value).padStart(2, "0");

  const contentHead = document.querySelector(".content-head");
  if (contentHead && !contentHead.querySelector(".route-readout")) {
    contentHead.classList.add("has-route-readout");
    const postCount = document.querySelectorAll(".post-card").length;
    const topicCount = document.querySelectorAll(".topic-card").length;
    const pageTitle = document.querySelector(".page-hero h1")?.textContent?.trim() || document.title.split("|")[0].trim();
    const primaryCount = postCount || topicCount || document.querySelectorAll(".pill-link, .article-tags a").length;
    const readout = document.createElement("div");
    readout.className = "route-readout reveal";
    readout.setAttribute("aria-label", "Page status");
    readout.innerHTML = `
      <span>Route<strong>${pageTitle || "Sakauma"}</strong></span>
      <span>Items<strong>${compactNumber(primaryCount)}</strong></span>
      <span>Mode<strong>${postCount ? "List" : topicCount ? "Index" : "Read"}</strong></span>
    `;
    contentHead.appendChild(readout);
    registerRevealNode(readout, revealNodes.length);
  }

  let articleDock = null;
  let articleDockValue = null;

  if (postBody) {
    articleDock = document.createElement("aside");
    articleDock.className = "article-dock";
    articleDock.setAttribute("aria-label", "Article reading controls");
    articleDock.innerHTML = `
      <div class="article-dock-head">
        <span>Reading</span>
        <strong>00%</strong>
      </div>
      <div class="article-dock-track" aria-hidden="true"><span></span></div>
      <div class="article-dock-actions">
        <button type="button" data-scroll-top>Top</button>
        <a href="/list/">Posts</a>
      </div>
    `;
    document.body.appendChild(articleDock);
    articleDockValue = articleDock.querySelector("strong");
    articleDock.querySelector("[data-scroll-top]")?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  const sectionLabel = (section) => {
    if (section.dataset.navLabel) return section.dataset.navLabel;
    const id = section.id || "";
    const labels = {
      top: "Start",
      about: "Index",
      posts: "Posts",
      stats: "Sakauma",
      signal: "Archive",
      topics: "Tags / Categories",
      archive: "Archive",
      contact: "Contact",
    };
    if (labels[id]) return labels[id];
    return id.replace(/[-_]+/g, " ") || "Section";
  };

  const floatingCtaPlan = {
    top: { label: "Posts", href: "/list/" },
    hero: { label: "Posts", href: "/list/" },
    about: { label: "About", href: "/about/" },
    posts: { label: "Posts", href: "/list/" },
    stats: { label: "Tags", href: "/tags/" },
    signal: { label: "Archive", href: "/archives/" },
    topics: { label: "Tags", href: "/tags/" },
    archive: { label: "Archive", href: "/archives/" },
    contact: { label: "Contact", href: "/#contact" },
    "about-link": { label: "About", href: "/about/" },
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
      isHeroPointerActive = true;
      const rect = hero.getBoundingClientRect();
      const mx = (event.clientX - rect.left) / rect.width - 0.5;
      const my = (event.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--mx", mx.toFixed(3));
      hero.style.setProperty("--my", my.toFixed(3));
      hero.style.setProperty("--hero-core-x", `${(mx * 10).toFixed(2)}px`);
      hero.style.setProperty("--hero-core-y", `${(my * 8).toFixed(2)}px`);
      hero.style.setProperty("--hero-tilt-x", `${(-my * 3.8).toFixed(3)}deg`);
      hero.style.setProperty("--hero-tilt-y", `${(mx * 4.2).toFixed(3)}deg`);
      if (heroMedia) {
        heroMedia.style.setProperty("--hero-media-x", `${(mx * 18).toFixed(2)}px`);
        heroMedia.style.setProperty("--hero-media-y", `${(my * 14).toFixed(2)}px`);
        heroMedia.style.setProperty("--hero-media-scale", "1.06");
        heroMedia.style.setProperty("--hero-media-rotate", `${(mx * 1.5).toFixed(3)}deg`);
        heroMedia.style.setProperty("--hero-sheen-x", `${(-mx * 2.52).toFixed(2)}px`);
        heroMedia.style.setProperty("--hero-sheen-y", `${(-my * 1.96).toFixed(2)}px`);
      }
    });

    hero.addEventListener("pointerleave", () => {
      isHeroPointerActive = false;
      hero.style.setProperty("--mx", "0");
      hero.style.setProperty("--my", "0");
      hero.style.setProperty("--hero-core-x", "0px");
      hero.style.setProperty("--hero-core-y", "0px");
      hero.style.setProperty("--hero-tilt-x", "0deg");
      hero.style.setProperty("--hero-tilt-y", "0deg");
      if (heroMedia) {
        heroMedia.style.setProperty("--hero-media-x", "0px");
        heroMedia.style.setProperty("--hero-media-y", "0px");
        heroMedia.style.setProperty("--hero-media-scale", "1.04");
        heroMedia.style.setProperty("--hero-media-rotate", "0deg");
        heroMedia.style.setProperty("--hero-sheen-x", "0px");
        heroMedia.style.setProperty("--hero-sheen-y", "0px");
      }
    });
  }

  const resolveFloatingCta = () => {
    if (!floatingCta) return;

    const reachedContact = contactSection ? contactSection.getBoundingClientRect().top < window.innerHeight * 0.9 : false;
    const pastHero = hero ? hero.getBoundingClientRect().bottom < 84 : false;
    const nearTop = window.scrollY < 120;

    floatingCta.classList.toggle("is-visible", pastHero && !nearTop);
    floatingCta.classList.toggle("is-soft", !reachedContact);
    floatingCta.classList.toggle("is-urgent", !reachedContact && pastHero && body.dataset.section === "services");
  };

  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (finePointer && !reduceMotion) {
    document
      .querySelectorAll(
        ".brand-mark, .nav-action, .arrow-link, .race-card, .helmet-card, .post-card, .topic-card, .signal-card, .social-list a, .pill-link, .pager a, .article-tags a, .mode, .service-card, .outcome-card, .proof-card, .showcase-card, .stat, .studio-pill, .conversion-funnel .funnel-item"
      )
      .forEach((node) => {
        node.addEventListener("pointermove", (event) => {
          const rect = node.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
          node.style.setProperty("--mag-x", `${x.toFixed(2)}px`);
          node.style.setProperty("--mag-y", `${y.toFixed(2)}px`);
          node.style.setProperty("--mag-tilt-x", `${(-y * 0.18).toFixed(3)}deg`);
          node.style.setProperty("--mag-tilt-y", `${(x * 0.18).toFixed(3)}deg`);
        });

        node.addEventListener("pointerleave", () => {
          node.style.setProperty("--mag-x", "0px");
          node.style.setProperty("--mag-y", "0px");
          node.style.setProperty("--mag-tilt-x", "0deg");
          node.style.setProperty("--mag-tilt-y", "0deg");
        });
      });
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let ticking = false;
  let previousScrollY = window.scrollY;
  let previousScrollTime = performance.now();
  let smoothedVelocity = 0;
  let scrollSettleTimer = null;

  const settleScrollVelocity = () => {
    smoothedVelocity = 0;
    previousScrollY = window.scrollY;
    previousScrollTime = performance.now();
    root.style.setProperty("--scroll-velocity", "0.000");
    root.style.setProperty("--scroll-velocity-px", "0");
    root.style.setProperty("--scroll-speed-shift", "0px");
    root.style.setProperty("--scroll-speed-opacity", "0.000");
    root.style.setProperty("--scroll-lift", "0px");
    root.style.setProperty("--scroll-blur", "0px");
    root.style.setProperty("--speed-layer-duration", "340ms");
    body.classList.remove("scroll-fast");
  };

  const updateScrollEffects = () => {
    revealVisible();

    const now = performance.now();
    const currentScrollY = window.scrollY;
    const deltaY = Math.abs(currentScrollY - previousScrollY);
    const deltaTime = Math.max(1, now - previousScrollTime);
    const rawVelocity = Math.min(2, deltaY / deltaTime);
    smoothedVelocity += (rawVelocity - smoothedVelocity) * 0.22;

    const speedRatio = clamp(smoothedVelocity / 0.36, 0, 1);
    root.style.setProperty("--scroll-velocity", speedRatio.toFixed(3));
    root.style.setProperty("--scroll-velocity-px", Math.round(smoothedVelocity * 1000));
    root.style.setProperty("--scroll-speed-shift", `${(speedRatio * 18).toFixed(3)}px`);
    root.style.setProperty("--scroll-speed-opacity", (speedRatio * 0.1).toFixed(3));
    root.style.setProperty("--scroll-lift", `${(-speedRatio * 3).toFixed(3)}px`);
    root.style.setProperty("--scroll-blur", `${(speedRatio * 0.45).toFixed(3)}px`);
    root.style.setProperty("--ticker-pace", `${(8 + (1 - speedRatio) * 26).toFixed(2)}s`);
    root.style.setProperty("--speed-layer-duration", `${Math.round(340 - 150 * speedRatio)}ms`);
    body.classList.toggle("scroll-fast", speedRatio > 0.25);

    previousScrollY = currentScrollY;
    previousScrollTime = now;

    body.classList.toggle("scrolled", window.scrollY > 16);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    const progressValue = `${progress.toFixed(2)}%`;
    root.style.setProperty("--scroll-progress", progressValue);
    root.style.setProperty("--scroll-ratio", (progress / 100).toFixed(4));

    if (progressBar) {
      progressBar.style.width = progressValue;
    }

    if (postBody && articleDock) {
      const rect = postBody.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight * 0.45, 1);
      const read = clamp(window.innerHeight * 0.32 - rect.top, 0, total);
      const articleProgress = Math.round((read / total) * 100);
      const articleProgressValue = `${articleProgress}%`;
      root.style.setProperty("--article-progress", articleProgressValue);
      if (articleDockValue) articleDockValue.textContent = articleProgressValue.padStart(3, "0");
    }

    if (hero) {
      const rect = hero.getBoundingClientRect();
      const heroScrollTop = Math.max(-rect.top, currentScrollY - hero.offsetTop, 0);
      const heroProgress = clamp(heroScrollTop / Math.max(rect.height, 1), 0, 1);
      root.style.setProperty("--hero-progress", heroProgress.toFixed(3));
      root.style.setProperty("--hero-screen-opacity", (0.18 + heroProgress * 0.22).toFixed(3));
      body.classList.toggle("hud-ready", heroProgress > 0.28);

      if (heroMedia && !isHeroPointerActive && !reduceMotion) {
        const easedProgress = 1 - Math.pow(1 - heroProgress, 2);
        heroMedia.style.setProperty("--hero-media-x", `${(-10 + speedRatio * 8).toFixed(2)}px`);
        heroMedia.style.setProperty("--hero-media-y", `${(-28 * easedProgress).toFixed(2)}px`);
        heroMedia.style.setProperty("--hero-media-scale", `${(1.04 + easedProgress * 0.04 + speedRatio * 0.012).toFixed(3)}`);
        heroMedia.style.setProperty("--hero-media-rotate", `${(-1.1 * easedProgress + speedRatio * 0.45).toFixed(3)}deg`);
        heroMedia.style.setProperty("--hero-sheen-x", `${((10 - speedRatio * 8) * 0.14).toFixed(2)}px`);
        heroMedia.style.setProperty("--hero-sheen-y", `${(28 * easedProgress * 0.14).toFixed(2)}px`);
      }
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
      body.style.setProperty("--active-section-id", `'${active.id}'`);
      const cta = floatingCtaPlan[active.id] || { label: `了解${active.label || sectionLabel(active.element)}`, href: `#${active.id}` };
      if (floatingCta) {
        floatingCta.dataset.section = active.id;
        floatingCta.textContent = cta.label;
        floatingCta.href = cta.href;
      }
      hudLinks.forEach((link, id) => {
        if (id === active.id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    resolveFloatingCta();

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

  const requestScrollEffectsWithSettle = () => {
    requestScrollEffects();
    if (scrollSettleTimer) window.clearTimeout(scrollSettleTimer);
    scrollSettleTimer = window.setTimeout(settleScrollVelocity, 220);
    window.setTimeout(settleScrollVelocity, 760);
  };

  window.addEventListener("scroll", requestScrollEffectsWithSettle, { passive: true });
  window.addEventListener("resize", requestScrollEffects);
  resolveFloatingCta();
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
