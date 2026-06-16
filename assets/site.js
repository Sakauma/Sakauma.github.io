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
  const postBody = document.querySelector(".article-shell .post-body");
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

  const nav = document.querySelector(".nav");
  const commandButton = document.createElement("button");
  commandButton.className = "command-button";
  commandButton.type = "button";
  commandButton.setAttribute("aria-label", "Open site search");
  commandButton.setAttribute("aria-expanded", "false");
  commandButton.setAttribute("aria-controls", "command-panel");
  commandButton.setAttribute("aria-keyshortcuts", "Control+K /");
  commandButton.textContent = "Search";
  nav?.insertBefore(commandButton, menuButton || null);

  const commandOverlay = document.createElement("div");
  commandOverlay.className = "command-overlay";
  commandOverlay.id = "command-panel";
  commandOverlay.setAttribute("role", "dialog");
  commandOverlay.setAttribute("aria-modal", "true");
  commandOverlay.setAttribute("aria-label", "Site search");
  commandOverlay.innerHTML = `
    <div class="command-shell">
      <div class="command-head">
        <span>Route finder</span>
        <button type="button" data-command-close aria-label="Close site search">Close</button>
      </div>
      <label class="command-input-wrap">
        <span>Query</span>
        <input type="search" autocomplete="off" spellcheck="false" placeholder="Search posts, routes, tags" aria-controls="command-results" />
      </label>
      <div class="command-meta" aria-live="polite">Ready</div>
      <div class="command-results" id="command-results" role="listbox"></div>
    </div>
  `;
  body.appendChild(commandOverlay);

  const commandShell = commandOverlay.querySelector(".command-shell");
  const commandClose = commandOverlay.querySelector("[data-command-close]");
  const commandInput = commandOverlay.querySelector("input");
  const commandResults = commandOverlay.querySelector(".command-results");
  const commandMeta = commandOverlay.querySelector(".command-meta");
  let commandEntries = null;
  let commandVisibleResults = [];
  let commandActiveIndex = 0;
  let commandPreviousFocus = null;
  let startRouteTransition = (url) => {
    window.location.href = url.href;
  };

  const staticCommandEntries = [
    { title: "Home", href: "/", type: "Route", meta: "Sakauma / Egor Izmaylov" },
    { title: "Posts", href: "/list/", type: "Route", meta: "70 texts" },
    { title: "Archive", href: "/archives/", type: "Route", meta: "Chronological index" },
    { title: "Tags", href: "/tags/", type: "Route", meta: "Topic map" },
    { title: "Categories", href: "/categories/", type: "Route", meta: "Main shelf" },
    { title: "About", href: "/about/", type: "Route", meta: "Profile and contact" },
    { title: "Contact", href: "/#contact", type: "Section", meta: EMAIL },
  ];

  const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim();
  const searchableText = (entry) => `${entry.title} ${entry.type} ${entry.meta}`.toLowerCase();

  const addEntry = (map, entry) => {
    const href = entry.href;
    const title = normalizeText(entry.title);
    if (!href || !title || href.startsWith("javascript:") || href === "#") return;
    const key = new URL(href, window.location.origin).pathname + new URL(href, window.location.origin).hash;
    if (map.has(key)) return;
    map.set(key, {
      title,
      href: new URL(href, window.location.origin).pathname + new URL(href, window.location.origin).hash,
      type: normalizeText(entry.type) || "Link",
      meta: normalizeText(entry.meta),
    });
  };

  const collectEntriesFromDocument = (doc, map) => {
    doc.querySelectorAll(".post-card").forEach((card) => {
      const link = card.querySelector("h3 a");
      addEntry(map, {
        title: link?.textContent,
        href: link?.getAttribute("href"),
        type: "Post",
        meta: card.querySelector(".post-date")?.textContent || card.querySelector(".post-category")?.textContent,
      });
    });

    doc.querySelectorAll(".topic-card").forEach((card) => {
      addEntry(map, {
        title: card.querySelector("strong")?.textContent || card.textContent,
        href: card.getAttribute("href"),
        type: "Topic",
        meta: card.querySelector("span")?.textContent,
      });
    });
  };

  const loadCommandEntries = async () => {
    if (commandEntries) return commandEntries;

    const map = new Map();
    staticCommandEntries.forEach((entry) => addEntry(map, entry));
    collectEntriesFromDocument(document, map);

    try {
      const response = await fetch("/list/", { credentials: "same-origin" });
      if (response.ok) {
        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, "text/html");
        collectEntriesFromDocument(doc, map);
      }
    } catch {
      commandMeta.textContent = "Local index";
    }

    commandEntries = [...map.values()];
    return commandEntries;
  };

  const setCommandActive = (index) => {
    if (!commandVisibleResults.length) {
      commandInput?.removeAttribute("aria-activedescendant");
      return;
    }

    commandActiveIndex = (index + commandVisibleResults.length) % commandVisibleResults.length;
    commandResults.querySelectorAll(".command-result").forEach((node, itemIndex) => {
      const active = itemIndex === commandActiveIndex;
      node.classList.toggle("is-active", active);
      node.setAttribute("aria-selected", String(active));
      if (active) {
        commandInput?.setAttribute("aria-activedescendant", node.id);
      }
    });
  };

  const renderCommandResults = (query = "") => {
    if (!commandEntries || !commandResults || !commandMeta) return;

    const cleaned = query.toLowerCase().trim();
    const entries = cleaned
      ? commandEntries
          .map((entry) => {
            const haystack = searchableText(entry);
            const title = entry.title.toLowerCase();
            const score = title.startsWith(cleaned) ? 0 : title.includes(cleaned) ? 1 : haystack.includes(cleaned) ? 2 : 9;
            return { entry, score };
          })
          .filter((item) => item.score < 9)
          .sort((a, b) => a.score - b.score || a.entry.title.localeCompare(b.entry.title))
          .map((item) => item.entry)
      : commandEntries;

    commandVisibleResults = entries.slice(0, 9);
    commandActiveIndex = 0;
    commandResults.textContent = "";
    commandMeta.textContent = commandVisibleResults.length
      ? `${String(commandVisibleResults.length).padStart(2, "0")} matches`
      : "No matches";

    if (!commandVisibleResults.length) {
      const empty = document.createElement("div");
      empty.className = "command-empty";
      empty.textContent = "No route found";
      commandResults.appendChild(empty);
      commandInput?.removeAttribute("aria-activedescendant");
      return;
    }

    commandVisibleResults.forEach((entry, index) => {
      const link = document.createElement("a");
      const kicker = document.createElement("span");
      const title = document.createElement("strong");
      const meta = document.createElement("em");
      link.className = "command-result";
      link.id = `command-result-${index}`;
      link.href = entry.href;
      link.setAttribute("role", "option");
      link.setAttribute("aria-selected", "false");
      link.style.setProperty("--i", index);
      kicker.textContent = entry.type;
      title.textContent = entry.title;
      meta.textContent = entry.meta || entry.href;
      link.append(kicker, title, meta);
      link.addEventListener("click", (event) => {
        const url = new URL(link.href, window.location.href);
        if (url.origin === window.location.origin) {
          event.preventDefault();
          startRouteTransition(url);
        } else {
          closeCommand();
        }
      });
      commandResults.appendChild(link);
    });

    setCommandActive(0);
  };

  const openCommand = async () => {
    closeMenu();
    commandPreviousFocus = document.activeElement;
    body.classList.add("command-open");
    commandButton.setAttribute("aria-expanded", "true");
    commandOverlay.setAttribute("aria-hidden", "false");
    commandMeta.textContent = "Indexing";
    commandInput.value = "";
    commandInput.focus({ preventScroll: true });
    await loadCommandEntries();
    renderCommandResults("");
  };

  function closeCommand() {
    body.classList.remove("command-open");
    commandButton.setAttribute("aria-expanded", "false");
    commandOverlay.setAttribute("aria-hidden", "true");
    commandInput?.removeAttribute("aria-activedescendant");
    if (commandPreviousFocus && document.contains(commandPreviousFocus)) {
      commandPreviousFocus.focus({ preventScroll: true });
    }
  }

  commandOverlay.setAttribute("aria-hidden", "true");
  commandButton.addEventListener("click", openCommand);
  commandClose?.addEventListener("click", closeCommand);
  commandOverlay.addEventListener("click", (event) => {
    if (!commandShell?.contains(event.target)) closeCommand();
  });

  commandInput?.addEventListener("input", () => {
    renderCommandResults(commandInput.value);
  });

  commandInput?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCommandActive(commandActiveIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCommandActive(commandActiveIndex - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const activeResult = commandResults.querySelector(".command-result.is-active");
      if (activeResult) {
        startRouteTransition(new URL(activeResult.getAttribute("href"), window.location.href));
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeCommand();
    } else if (event.key === "Tab") {
      const focusable = [commandInput, commandClose].filter(Boolean);
      const currentIndex = focusable.indexOf(document.activeElement);
      if (event.shiftKey && currentIndex === 0) {
        event.preventDefault();
        commandClose?.focus();
      } else if (!event.shiftKey && currentIndex === focusable.length - 1) {
        event.preventDefault();
        commandInput?.focus();
      }
    }
  });

  window.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    if (event.key === "Escape") closeCommand();
    if (typing) return;
    if ((event.ctrlKey && event.key.toLowerCase() === "k") || event.key === "/") {
      event.preventDefault();
      if (body.classList.contains("command-open")) {
        closeCommand();
      } else {
        openCommand();
      }
    }
  });

  const routeTransition = document.createElement("div");
  routeTransition.className = "route-transition";
  routeTransition.setAttribute("aria-hidden", "true");
  routeTransition.innerHTML = `
    <span>SAKAUMA</span>
    <strong>Route</strong>
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

  startRouteTransition = (url) => {
    if (!url) return;

    if (reduceMotion || captureMode) {
      window.location.href = url.href;
      return;
    }

    if (routeLeaving) return;
    routeLeaving = true;

    closeMenu();
    closeCommand();
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
  let previousScrollY = window.scrollY;
  let previousScrollTime = performance.now();
  let smoothedVelocity = 0;

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
