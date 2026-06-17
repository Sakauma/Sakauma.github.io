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

  const loaderPhrases = ["Sakauma", "Motion archive", "UESTC PhD", "Text field ready"];
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
    const linkIndex = Array.prototype.indexOf.call(menuLinks, link);
    link.style.setProperty("--menu-link-delay", `${72 + linkIndex * 44}ms`);
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
    { title: "Home", href: "/", type: "Route", group: "route", groupLabel: "网站", meta: "Sakauma / Egor Izmaylov" },
    { title: "Sakauma", href: "/#hero", type: "Section", group: "section", groupLabel: "页面", meta: "Posts" },
    { title: "不该爱的东西", href: "/#about", type: "Section", group: "section", groupLabel: "页面", meta: "不该爱的东西" },
    { title: "Posts", href: "/#posts", type: "Section", group: "section", groupLabel: "页面", meta: "文章列表 / 关于我" },
    { title: "Sakauma", href: "/#stats", type: "Section", group: "section", groupLabel: "页面", meta: "70 posts / 25 tags" },
    { title: "MOTION ARCHIVE", href: "/#signal", type: "Section", group: "section", groupLabel: "页面", meta: "Motion archive" },
    { title: "Tags / Categories", href: "/#topics", type: "Section", group: "topic", groupLabel: "目录", meta: "翻译 / 诗歌 / 民防 / 未来主义" },
    { title: "Archive", href: "/#archive", type: "Section", group: "content", groupLabel: "内容", meta: "Archive" },
    { title: "Posts", href: "/list/", type: "Route", group: "content", groupLabel: "内容", meta: "70 texts" },
    { title: "Archive", href: "/archives/", type: "Route", group: "content", groupLabel: "内容", meta: "Chronological index" },
    { title: "Tags", href: "/tags/", type: "Route", group: "content", groupLabel: "内容", meta: "Topic map" },
    { title: "Categories", href: "/categories/", type: "Route", group: "content", groupLabel: "内容", meta: "Main shelf" },
    { title: "About", href: "/about/", type: "Route", group: "route", groupLabel: "网站", meta: "Profile and contact" },
    { title: "Contact", href: "/#contact", type: "Section", group: "contact", groupLabel: "网站", meta: EMAIL },
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
      group: normalizeText(entry.group || entry.type || "route").toLowerCase(),
      groupLabel: normalizeText(entry.groupLabel || entry.group || entry.type || "route"),
    });
  };

  const collectEntriesFromDocument = (doc, map) => {
    doc.querySelectorAll(".post-card").forEach((card) => {
      const link = card.querySelector("h3 a");
      addEntry(map, {
        title: link?.textContent,
        href: link?.getAttribute("href"),
        type: "Post",
        group: "content",
        groupLabel: "内容",
        meta: card.querySelector(".post-date")?.textContent || card.querySelector(".post-category")?.textContent,
      });
    });

    doc.querySelectorAll(".topic-card").forEach((card) => {
      addEntry(map, {
        title: card.querySelector("strong")?.textContent || card.textContent,
        href: card.getAttribute("href"),
        type: "Topic",
        group: "topic",
        groupLabel: "目录",
        meta: card.querySelector("span")?.textContent,
      });
    });
  };

  const groupOrder = {
    route: 0,
    section: 1,
    contact: 2,
    content: 3,
    topic: 4,
    other: 9,
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
            const entryGroup = entry.group || "other";
            const rank = groupOrder[entryGroup] ?? groupOrder.other;
            return { entry, score, rank };
          })
          .filter((item) => item.score < 9)
          .sort((a, b) => a.score - b.score || a.rank - b.rank || a.entry.title.localeCompare(b.entry.title))
          .map((item) => item.entry)
      : commandEntries;

    commandVisibleResults = entries.slice(0, 9);
    commandActiveIndex = 0;
    commandResults.textContent = "";

    const buckets = commandVisibleResults.reduce((acc, entry) => {
      const bucketKey = (entry.group || "other").toLowerCase();
      const list = acc.get(bucketKey) || [];
      list.push(entry);
      acc.set(bucketKey, list);
      return acc;
    }, new Map());

    const sortedBuckets = [...buckets.entries()].sort((a, b) => {
      const aEntry = a[1][0];
      const bEntry = b[1][0];
      const aRank = groupOrder[aEntry.group || "other"] ?? groupOrder.other;
      const bRank = groupOrder[bEntry.group || "other"] ?? groupOrder.other;
      return aRank - bRank || a[0].localeCompare(b[0]);
    });

    commandMeta.textContent = commandVisibleResults.length
      ? `${String(commandVisibleResults.length).padStart(2, "0")} matches · ${sortedBuckets.length} categories`
      : "No matches";

    if (!commandVisibleResults.length) {
      const empty = document.createElement("div");
      empty.className = "command-empty";
      empty.textContent = "No route found";
      commandInput?.removeAttribute("aria-activedescendant");
      return;
    }

    let visibleIndex = 0;
    sortedBuckets.forEach(([group, list]) => {
      const groupNode = document.createElement("div");
      const titleNode = document.createElement("div");
      const listNode = document.createElement("div");
      const displayName = (list[0]?.groupLabel || list[0]?.group || group).toUpperCase();

      groupNode.className = "command-group";
      titleNode.className = "command-group-title";
      titleNode.textContent = displayName;
      listNode.className = "command-group-list";
      groupNode.append(titleNode, listNode);

      list.forEach((entry) => {
        const link = document.createElement("a");
        const typeNode = document.createElement("span");
        const badge = document.createElement("i");
        const titleNode = document.createElement("strong");
        const meta = document.createElement("em");

        link.className = "command-result";
        link.id = `command-result-${visibleIndex}`;
        link.href = entry.href;
        link.setAttribute("role", "option");
        link.setAttribute("aria-selected", "false");
        link.style.setProperty("--i", visibleIndex);
        typeNode.textContent = entry.type;
        titleNode.textContent = entry.title;
        badge.className = "command-result-badge";
        badge.textContent = entry.groupLabel || entry.group || entry.type;
        meta.textContent = entry.meta || entry.href;

        link.append(typeNode, badge, titleNode, meta);
        link.addEventListener("click", (event) => {
          const url = new URL(link.href, window.location.href);
          if (url.origin === window.location.origin) {
            event.preventDefault();
            startRouteTransition(url);
          } else {
            closeCommand();
          }
        });

        listNode.appendChild(link);
        visibleIndex += 1;
      });

      commandResults.appendChild(groupNode);
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
    closeCommand();
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

  const buildInquiryMailDraftPayload = (payload) => {
    const normalize = (value) => `${(value || "").toString().trim() || "未填写"}`;
    const name = normalize(payload?.name);
    return {
      subject: `Sakauma Contact (${name})`,
      body: [
        "Sakauma Contact",
        "",
        `联系人：${name}`,
        `邮箱：${normalize(payload?.email)}`,
        `预算：${normalize(payload?.budget)}`,
        `目标周期：${normalize(payload?.timeline)}`,
        `需求：${normalize(payload?.need)}`,
        `补充：${normalize(payload?.details)}`,
        "来源：Sakauma 主页",
      ].join("\n"),
    };
  };

  const buildInquiryMailHref = (payload) => {
    const draft = buildInquiryMailDraftPayload(payload);
    return `mailto:${EMAIL}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
  };

  const getInquiryFollowupNodes = (form) => {
    const contact = form.closest("#contact");
    if (!contact) return null;
    const followup = contact.querySelector("[data-inquiry-followup]");
    if (!followup) return null;
    return {
      followup,
      text: followup.querySelector("[data-inquiry-followup-text]"),
      mailButton: followup.querySelector("[data-inquiry-open-mail]"),
      copyButton: followup.querySelector("[data-inquiry-copy-draft]"),
    };
  };

  const bindCopyDraftAction = (button) => {
    if (button?.dataset?.inquiryCopyBound === "1") return;
    if (!button) return;
    button.dataset.inquiryCopyBound = "1";

    button.addEventListener("click", async () => {
      const draftText = button.dataset.inquiryDraftText || "";
      if (!draftText) return;

      const originalText = button.textContent || "复制邮件正文";
      button.textContent = "复制中";
      try {
        if (navigator.clipboard?.writeText) {
          const timeout = new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error("clipboard timeout")), 900);
          });
          await Promise.race([navigator.clipboard.writeText(draftText), timeout]);
          button.textContent = "已复制";
        } else {
          throw new Error("Clipboard unavailable");
        }
      } catch {
        button.textContent = "复制失败";
      } finally {
        window.setTimeout(() => {
          button.textContent = originalText;
        }, 1600);
      }
    });
  };

  const renderInquiryFollowup = (form) => {
    const followupNodes = getInquiryFollowupNodes(form);
    if (!followupNodes) return null;
    const formPayload = getInquiryPayload(form);
    const draft = buildInquiryMailDraftPayload(formPayload);
    const mailHref = buildInquiryMailHref(formPayload);

    if (followupNodes.text) {
      followupNodes.text.textContent = `已生成邮件草稿（${draft.subject}），你可直接复制正文，或使用“打开邮件应用”继续发送。`;
    }
    if (followupNodes.mailButton) {
      followupNodes.mailButton.href = mailHref;
    }
    if (followupNodes.copyButton) {
      followupNodes.copyButton.dataset.inquiryDraftText = draft.body;
      bindCopyDraftAction(followupNodes.copyButton);
    }
    followupNodes.followup.hidden = false;
    followupNodes.followup.classList.add("is-visible");

    return { mailHref, draft };
  };

  document.querySelectorAll("[data-inquiry-form]").forEach((form) => {
    const nameInput = form.querySelector("input[name='name']");
    const needInput = form.querySelector("input[name='need']");
    const budgetInput = form.querySelector("select[name='budget']");
    const timelineInput = form.querySelector("input[name='timeline']");
    const emailInput = form.querySelector("input[name='email']");
    const detailsInput = form.querySelector("textarea[name='details']");
    const button = form.querySelector("button");
    const status = form.querySelector(".inquiry-status");

    if (!nameInput || !needInput || !budgetInput || !timelineInput || !emailInput || !button) return;

    (() => {
      const params = new URLSearchParams(window.location.search);
      const defaults = {
        name: params.get("name") || "",
        need: params.get("need") || "",
        budget: params.get("budget") || "",
        timeline: params.get("timeline") || "",
        email: params.get("email") || "",
        details: params.get("details") || "",
      };

      if (defaults.name) nameInput.value = defaults.name;
      if (defaults.need) needInput.value = defaults.need;
      if (defaults.budget) budgetInput.value = defaults.budget;
      if (defaults.timeline) timelineInput.value = defaults.timeline;
      if (defaults.email) emailInput.value = defaults.email;
      if (defaults.details && detailsInput) detailsInput.value = defaults.details;
    })();

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const originalText = button.textContent || "Email";
      button.disabled = true;
      button.textContent = "Preparing";
      status?.classList.remove("is-success", "is-error");
      if (status) {
        status.textContent = "Preparing email...";
      }

      const payload = {
        name: nameInput.value.trim(),
        need: needInput.value.trim(),
        budget: budgetInput.value.trim(),
        timeline: timelineInput.value.trim(),
        email: emailInput.value.trim(),
        details: detailsInput?.value?.trim() || "未补充",
      };
      const draft = buildInquiryMailDraftPayload(payload);
      const href = buildInquiryMailHref(payload);
      const payloadText = `联系人：${payload.name || "未填写"}\n邮箱：${payload.email || "未填写"}\n预算：${payload.budget || "未填写"}\n目标：${payload.timeline || "未填写"}\n需求：${payload.need || "未填写"}\n补充：${payload.details || "未补充"}`;

      if (status) {
        status.classList.remove("is-error");
      }

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(payloadText).catch(() => {});
      }

      const openMailDraft = () => {
        window.location.href = href;
      };

      if (navigator.share) {
        navigator
          .share({
            title: draft.subject,
            text: payloadText,
          })
          .then(() => {
            if (status) {
              status.classList.add("is-success");
              status.textContent = "已启动分享通道，可直接在邮件/App中继续编辑发送。";
            }
          })
          .catch(() => {
            openMailDraft();
            if (status) {
              status.classList.add("is-success");
              status.textContent = "已生成邮件草稿，建议确认后立即发送。";
            }
          });
      } else {
        openMailDraft();
        if (status) {
          status.classList.add("is-success");
          status.textContent = "已生成邮件草稿，建议确认后立即发送。";
        }
      }

      try {
        const savedPayload = {
          name: payload.name || "未填写",
          need: payload.need,
          budget: payload.budget,
          timeline: payload.timeline,
          email: payload.email,
          details: payload.details,
          submittedAt: new Date().toISOString(),
        };
        localStorage.setItem("sakauma-last-inquiry", JSON.stringify(savedPayload));
      } catch {}

      const followup = renderInquiryFollowup(form);
      const followupNote = followup?.draft
        ? `草稿已生成：${followup.draft.subject}`
        : "Email is ready.";
      status?.classList.add("is-success");
      if (status) {
        status.textContent = followupNote;
      }

      button.textContent = "已提交草案";
      window.setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
      }, 2000);
    });
  });

  const INQUIRY_FORM_DRAFT_KEY = "sakauma-inquiry-form-draft-v2";

  const buildInquiryProgress = (form) => {
    const fields = [
      { key: "name", node: form.querySelector("input[name='name']"), label: "称呼", required: true },
      { key: "need", node: form.querySelector("input[name='need']"), label: "需求", required: true },
      { key: "budget", node: form.querySelector("select[name='budget']"), label: "预算", required: true },
      { key: "timeline", node: form.querySelector("input[name='timeline']"), label: "周期", required: true },
      { key: "email", node: form.querySelector("input[name='email']"), label: "邮箱", required: true },
      { key: "details", node: form.querySelector("textarea[name='details']"), label: "说明", required: false },
    ];

    const validFields = fields.filter((item) => item.node);
    if (!validFields.length) return;

    const status = form.querySelector(".inquiry-status");
    const button = form.querySelector("button");
    if (!button) return;

    const progress = document.createElement("div");
    const progressHeader = document.createElement("div");
    const progressLabel = document.createElement("span");
    const progressPercent = document.createElement("span");
    const progressRail = document.createElement("div");
    const progressFill = document.createElement("span");
    const progressSteps = document.createElement("div");
    const progressNote = document.createElement("p");

    progress.className = "inquiry-progress";
    progressHeader.className = "inquiry-progress-header";
    progressRail.className = "inquiry-progress-rail";
    progressFill.className = "inquiry-progress-fill";
    progressSteps.className = "inquiry-progress-steps";
    progressNote.className = "inquiry-progress-note";
    progressPercent.className = "inquiry-progress-percent";

    progressLabel.textContent = "Email";
    progressPercent.textContent = "0%";
    progressHeader.append(progressLabel, progressPercent);
    progressFill.setAttribute("style", "--rate: 0%");
    progressRail.appendChild(progressFill);
    progressNote.textContent = "请先完整填写前五项，补充说明可提高初稿质量";
    progress.append(progressHeader, progressRail, progressSteps, progressNote);

    validFields.forEach((field) => {
      const marker = document.createElement("span");
      marker.className = "inquiry-progress-step";
      marker.textContent = field.label;
      progressSteps.appendChild(marker);
    });

    const readFromStorage = () => {
      try {
        const payload = JSON.parse(localStorage.getItem(INQUIRY_FORM_DRAFT_KEY) || "{}");
        if (typeof payload !== "object" || !payload) return;
        validFields.forEach((field) => {
          if (!field.node) return;
          if (!field.node.value && payload[field.key]) {
            field.node.value = payload[field.key];
          }
        });
      } catch {}
    };

    const writeToStorage = () => {
      const payload = {};
      validFields.forEach((field) => {
        if (field.node) payload[field.key] = field.node.value.trim();
      });
      try {
        localStorage.setItem(INQUIRY_FORM_DRAFT_KEY, JSON.stringify(payload));
      } catch {}
    };

    const refreshProgress = () => {
      const steps = progress.querySelectorAll(".inquiry-progress-step");
      const max = validFields.reduce((acc, field) => acc + (field.required ? 18 : 10), 0);
      const total = validFields.reduce((acc, field, index) => {
        const v = `${field.node.value || ""}`.trim();
        if (!v) return acc;
        const point = field.required ? 18 : 10;
        if (steps[index]) steps[index].classList.add("is-done");
        return acc + point;
      }, 0);

      const requiredOk = validFields.filter((item) => item.required).every((item) => `${item.node.value || ""}`.trim());
      const value = `${Math.min(100, Math.round((total / max) * 100))}%`;
      progressFill.style.width = value;
      progressPercent.textContent = value;
      steps.forEach((step, idx) => {
        const field = validFields[idx];
        if (field && `${field.node.value || ""}`.trim()) {
          step.classList.add("is-done");
        } else {
          step.classList.remove("is-done");
        }
      });

      if (requiredOk) {
        if (button.disabled === false) {
          button.textContent = "Email ready";
        }
        progressNote.textContent = "已满足提交条件，点击后将生成可发送邮件草稿。";
        progress.classList.add("is-ready");
      } else {
        button.textContent = "Email";
        progressNote.textContent = "请先完整填写前五项，补充说明可提高初稿质量。";
        progress.classList.remove("is-ready");
      }

      writeToStorage();
    };

    readFromStorage();
    if (form.querySelector(".inquiry-progress")) return;
    form.insertBefore(progress, form.querySelector(".arrow-link") || form.querySelector("button")?.parentNode || form.firstElementChild);
    refreshProgress();

    validFields.forEach((field) => {
      field.node.addEventListener("input", refreshProgress);
      field.node.addEventListener("change", refreshProgress);
    });
  };

  document.querySelectorAll("[data-inquiry-form]").forEach((form) => {
    if (form.dataset.inquiryAssistant === "1") return;
    form.dataset.inquiryAssistant = "1";
    buildInquiryProgress(form);
  });

  window.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;
    if (typing || event.defaultPrevented) return;
    if (event.key.toLowerCase() === "c" && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return;
    if (event.key.toLowerCase() === "c") {
      const contact = document.querySelector("#contact");
      const firstInput = contact?.querySelector("input[name='name']");
      if (contact) {
        event.preventDefault();
        contact.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        if (firstInput) {
          window.setTimeout(() => firstInput.focus({ preventScroll: true }), reduceMotion ? 0 : 260);
        }
      }
    }
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
      signal: "MOTION ARCHIVE",
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
      hero.style.setProperty("--hero-tilt-x", `${(-my * 3.8).toFixed(3)}deg`);
      hero.style.setProperty("--hero-tilt-y", `${(mx * 4.2).toFixed(3)}deg`);
      if (heroMedia) {
        heroMedia.style.setProperty("--hero-media-x", `${(mx * 18).toFixed(2)}px`);
        heroMedia.style.setProperty("--hero-media-y", `${(my * 14).toFixed(2)}px`);
        heroMedia.style.setProperty("--hero-media-scale", "1.06");
        heroMedia.style.setProperty("--hero-media-rotate", `${(mx * 1.5).toFixed(3)}deg`);
      }
    });

    hero.addEventListener("pointerleave", () => {
      isHeroPointerActive = false;
      hero.style.setProperty("--mx", "0");
      hero.style.setProperty("--my", "0");
      hero.style.setProperty("--hero-tilt-x", "0deg");
      hero.style.setProperty("--hero-tilt-y", "0deg");
      if (heroMedia) {
        heroMedia.style.setProperty("--hero-media-x", "0px");
        heroMedia.style.setProperty("--hero-media-y", "0px");
        heroMedia.style.setProperty("--hero-media-scale", "1.04");
        heroMedia.style.setProperty("--hero-media-rotate", "0deg");
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
      body.classList.toggle("hud-ready", heroProgress > 0.28);

      if (heroMedia && !isHeroPointerActive && !reduceMotion) {
        const easedProgress = 1 - Math.pow(1 - heroProgress, 2);
        heroMedia.style.setProperty("--hero-media-x", `${(-10 + speedRatio * 8).toFixed(2)}px`);
        heroMedia.style.setProperty("--hero-media-y", `${(-28 * easedProgress).toFixed(2)}px`);
        heroMedia.style.setProperty("--hero-media-scale", `${(1.04 + easedProgress * 0.04 + speedRatio * 0.012).toFixed(3)}`);
        heroMedia.style.setProperty("--hero-media-rotate", `${(-1.1 * easedProgress + speedRatio * 0.45).toFixed(3)}deg`);
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
  const getInquiryFormFields = (form) => {
    const name = form.querySelector("input[name='name']");
    const need = form.querySelector("input[name='need']");
    const budget = form.querySelector("select[name='budget']");
    const timeline = form.querySelector("input[name='timeline']");
    const email = form.querySelector("input[name='email']");
    const details = form.querySelector("textarea[name='details']");
    const preview = form.querySelector("[data-inquiry-preview]");
    return { name, need, budget, timeline, email, details, preview };
  };

  const buildInquiryDraftText = (payload) => {
    const name = payload.name || "未填写";
    const budget = payload.budget || "未填写";
    const timeline = payload.timeline || "未填写";
    const email = payload.email || "未填写";
    const need = payload.need || "未填写";
    const details = payload.details || "未填写";
    const timestamp = new Date().toLocaleString("zh-CN", { hour12: false });
    return [
      "Sakauma Contact",
      "",
      `创建时间：${timestamp}`,
      `联系人：${name}`,
      `邮箱：${email}`,
      `预算：${budget}`,
      `周期：${timeline}`,
      `需求：${need}`,
      `补充：${details}`,
      "",
      "Email draft ready.",
    ].join("\n");
  };

  const getInquiryPayload = (form) => {
    const fields = getInquiryFormFields(form);
    return {
      name: fields.name ? fields.name.value.trim() : "",
      need: fields.need ? fields.need.value.trim() : "",
      budget: fields.budget ? fields.budget.value.trim() : "",
      timeline: fields.timeline ? fields.timeline.value.trim() : "",
      email: fields.email ? fields.email.value.trim() : "",
      details: fields.details ? fields.details.value.trim() : "",
    };
  };

  const isInquiryReady = (payload) => {
    return Boolean(payload.name && payload.need && payload.budget && payload.timeline && payload.email);
  };

  const getStatusState = (payload) => {
    const requiredKeys = ["name", "need", "budget", "timeline", "email"];
    const filled = requiredKeys.filter((key) => Boolean(payload[key])).length;
    if (filled === 0) return "idle";
    if (filled < requiredKeys.length) return "warning";
    return "ready";
  };

  const renderInquiryPreview = (form) => {
    const payload = getInquiryPayload(form);
    const fields = getInquiryFormFields(form);
    const preview = fields.preview;
    const status = form.querySelector(".inquiry-status");
    if (!preview) return;

    const ready = isInquiryReady(payload);
    const hasAny = Object.values(payload).some(Boolean);
    preview.textContent = hasAny ? buildInquiryDraftText(payload) : "填写核心字段后可查看邮件草稿预览。";
    preview.classList.toggle("is-ready", ready);
    preview.classList.toggle("is-empty", !hasAny);

    if (status) {
      const state = getStatusState(payload);
      status.textContent = hasAny
        ? (ready ? "已形成可发送草稿雏形，点击提交可直接启动邮件。" : "继续完善字段后可立即生成高质量草稿，当前仍可先预览。")
        : "填写核心字段后可查看邮件草稿预览。";
      status.classList.remove("is-success", "is-warning", "is-error", "is-idle", "is-busy");
      if (state === "ready") status.classList.add("is-success");
      else if (state === "warning") status.classList.add("is-warning");
      else status.classList.add("is-idle");
    }

    try {
      localStorage.setItem(INQUIRY_FORM_DRAFT_KEY, JSON.stringify(payload));
    } catch {}
  };

  const refreshInquiryFormState = (form) => {
    renderInquiryPreview(form);
    const payload = getInquiryPayload(form);
    const fields = getInquiryFormFields(form);
    const progress = form.querySelector(".inquiry-progress");
    if (progress) {
      const stepList = progress.querySelectorAll(".inquiry-progress-step");
      if (stepList.length) {
        const trackedFields = [
          { node: fields.name, required: true },
          { node: fields.need, required: true },
          { node: fields.budget, required: true },
          { node: fields.timeline, required: true },
          { node: fields.email, required: true },
          { node: fields.details, required: false },
        ].filter((entry) => entry.node);

        trackedFields.forEach((entry, index) => {
          const step = stepList[index];
          if (!step) return;
          const hasValue = entry.node && `${entry.node.value || ""}`.trim();
          step.classList.toggle("is-done", Boolean(hasValue));
        });

        const requiredCompleted = trackedFields.filter((entry) => entry.required).every((entry) => `${entry.node.value || ""}`.trim());
        const completed = trackedFields.filter((entry) => entry.required).reduce((acc, entry) => acc + (`${entry.node.value || ""}`.trim() ? 1 : 0), 0);
        const percent = `${Math.round((completed / 5) * 100)}%`;
        const fill = progress.querySelector(".inquiry-progress-fill");
        const note = progress.querySelector(".inquiry-progress-note");
        const label = progress.querySelector(".inquiry-progress-percent") || progress.querySelector(".inquiry-progress-header span:last-child");
        if (fill) fill.style.width = percent;
        if (note) note.textContent = isInquiryReady(payload) ? "已满足提交条件，可直接生成邮件草稿。" : "请先完整填写前五项关键字段。";
        if (label) label.textContent = percent;
        if (requiredCompleted) fill.style.setProperty("--rate", percent);
      }
    }
  };

  const applyInquiryPayload = (form, payload) => {
    const fields = getInquiryFormFields(form);
    const patches = [
      ["name", fields.name],
      ["need", fields.need],
      ["budget", fields.budget],
      ["timeline", fields.timeline],
      ["email", fields.email],
      ["details", fields.details],
    ];
    patches.forEach(([key, input]) => {
      if (!input) return;
      const nextValue = (payload?.[key] || "").toString().trim();
      if (!nextValue) return;
      if (input.value !== nextValue) {
        input.value = nextValue;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  };

  const wireInquiryFunnel = () => {
    const forms = [...document.querySelectorAll("[data-inquiry-form]")];
    if (!forms.length) return;

    const form = forms[0];
    const fields = getInquiryFormFields(form);
    const contact = document.querySelector("#contact");

    const focusAndScroll = (selector) => {
      const target = selector ? document.querySelector(selector) : null;
      const focusNode = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement ? target : fields.name;
      if (focusNode && contact) {
        contact.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        window.setTimeout(() => {
          focusNode.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 180);
      } else if (focusNode) {
        focusNode.focus({ preventScroll: true });
      }
    };

    document.querySelectorAll(".conversion-funnel .funnel-item").forEach((item) => {
      if (item.dataset.inquiryFunnelBound === "1") return;
      item.dataset.inquiryFunnelBound = "1";

      item.addEventListener("click", () => {
        document.querySelectorAll(".conversion-funnel .funnel-item.is-active").forEach((node) => node.classList.remove("is-active"));
        item.classList.add("is-active");

        applyInquiryPayload(form, {
          need: item.dataset.inquiryNeed || "",
          timeline: item.dataset.inquiryTimeline || "",
        });

        if (item.dataset.inquiryEmail) {
          applyInquiryPayload(form, { email: item.dataset.inquiryEmail || "" });
        }

        if (item.dataset.inquiryFocus) {
          focusAndScroll(item.dataset.inquiryFocus);
        }
      });
    });

    document.querySelectorAll(".inquiry-presets .inquiry-preset").forEach((preset) => {
      if (preset.dataset.inquiryPresetBound === "1") return;
      preset.dataset.inquiryPresetBound = "1";

      preset.addEventListener("click", () => {
        document.querySelectorAll(".inquiry-presets .inquiry-preset.is-active").forEach((node) => node.classList.remove("is-active"));
        preset.classList.add("is-active");

        applyInquiryPayload(form, {
          name: preset.dataset.name || "",
          need: preset.dataset.need || "",
          budget: preset.dataset.budget || "",
          timeline: preset.dataset.timeline || "",
          email: preset.dataset.email || "",
          details: preset.dataset.details || `场景来源：${preset.textContent.trim()}`,
        });

        if (fields.need) {
          const needValue = fields.need.value || "";
          fields.need.setSelectionRange(0, needValue.length);
        }
        focusAndScroll("#inquiry-need");
        renderInquiryPreview(form);
      });
    });

    Object.values(fields).forEach((field) => {
      if (!(field instanceof Element)) return;
      if (field.dataset.inquiryReactive === "1") return;
      field.dataset.inquiryReactive = "1";
      field.addEventListener("input", () => renderInquiryPreview(form));
      field.addEventListener("change", () => renderInquiryPreview(form));
    });

    form.querySelectorAll("button[type='submit']").forEach((button) => {
      button.addEventListener("blur", () => {
        const status = form.querySelector(".inquiry-status");
        if (!status) return;
        window.setTimeout(() => {
          if (form.matches(":hover")) return;
          if (form.closest("#contact")?.querySelector("[data-inquiry-followup].is-visible")) return;
          status.textContent = "";
          status.classList.remove("is-success", "is-error");
        }, 250);
      });
    });

    renderInquiryPreview(form);
    refreshInquiryFormState(form);
  };

  wireInquiryFunnel();
})();



