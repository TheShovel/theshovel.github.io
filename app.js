/* TheShovel static rebuild — same structure + same data as the Scratch site.
   No build step, no node. Pure fetch + DOM, using data/*.json + image files. */
(() => {
  const grid = document.getElementById("grid");
  const viewer = document.getElementById("viewer");
  const viewerBack = document.getElementById("viewer-back");
  const viewerTitle = document.getElementById("viewer-title");
  const viewerImg = document.getElementById("viewer-img");
  const viewerText = document.getElementById("viewer-text");
  const viewerPaper = document.getElementById("viewer-paper");
  const viewerSheetBack = document.getElementById("viewer-sheet-back");
  const viewerBody = document.getElementById("viewer-body");
  const viewerZoom = document.getElementById("viewer-zoom");
  const viewerZoomIn = document.getElementById("viewer-zoom-in");
  const viewerZoomOut = document.getElementById("viewer-zoom-out");
  const viewerZoomLabel = document.getElementById("viewer-zoom-label");

  const bannerImg = document.getElementById("banner-img");
  const bannerLink = document.getElementById("banner-link");
  const bannerPrev = document.getElementById("banner-prev");
  const bannerNext = document.getElementById("banner-next");
  const bannerDots = document.getElementById("banner-dots");
  const footerHead = document.getElementById("footer-head");
  const footerHeadImg = document.getElementById("footer-head-img");
  const bg = document.getElementById("bg");

  const isMobileDevice = () =>
    ("ontouchstart" in window && window.innerWidth < 820) ||
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  const sizeSuffix = () => {
    // same rule as Scratch: mobile -> small, tall screen -> full, else medium
    if (isMobileDevice()) return "small";
    if (window.screen.height > 1080 || window.innerWidth > 1100) return "";
    return "medium";
  };

  const thumbFor = (id) => {
    const sfx = sizeSuffix();
    // data/<id><suffix>.png, e.g. data/artPagemedium.png, data/arts/underbedsmall.png
    return `data/${id}${sfx}.png`;
  };
  const fullFor = (id) => `data/${id}.png`;

  let redirects = {};
  let banners = [];
  let bannerIndex = 0;
  let bannerTimer = 0;
  let currentFile = "data/gameList.json";
  let currentStyle = ""; // "", logBook, discordLog, artView
  let oldPage = null;

  const shortFor = (file) => redirects[file] || file;
  const fileFor = (short) => redirects[short] || short;

  function resolveHash() {
    let h = (location.hash || "").replace(/^#/, "").trim();
    if (!h) return "data/gameList.json";
    // redirects.json maps both ways: "home" <-> "data/gameList.json", etc.
    if (redirects[h]) return redirects[h];
    // allow direct file in hash
    if (h.endsWith(".json")) return h;
    return "data/gameList.json";
  }

  function setHashFor(file) {
    const short = shortFor(file);
    const want = "#" + short;
    if (location.hash !== want) history.replaceState(null, "", want);
  }

  function isNew(item) {
    if (!item.creationDate) return false;
    const created = new Date(item.creationDate.replace(" ", "T"));
    if (isNaN(created)) return false;
    const days = (Date.now() - created.getTime()) / 86400000;
    if (days > 30) return false;
    try {
      return localStorage.getItem(item.id + "lastcheckeddate") !== item.creationDate;
    } catch {
      return true;
    }
  }

  function markSeen(item) {
    if (!item.creationDate) return;
    try {
      localStorage.setItem(item.id + "lastcheckeddate", item.creationDate);
    } catch {}
  }

  function resolveDataLink(link, id) {
    // Scratch: replace "*" with path ("") and "^" with id
    return link.split("*").join("").split("^").join(id);
  }

  /* Deterministic per-log paper dressing: each log gets its own stains,
     rotation, tape spot and tint (stable across revisits). */
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function dressPaper(title) {
    const rnd = mulberry32(hashStr(title || "log"));
    const pick = (a, b) => a + rnd() * (b - a);
    const pct = (v) => v.toFixed(1) + "%";
    const deg = (v) => v.toFixed(2) + "deg";
    // Vars live on the wrapper so both the lined sheet and the backing
    // sheet inherit them (they are siblings).
    const root = viewerPaper || viewerText;
    root.style.setProperty("--paper-rot", deg(pick(-1.6, 1.6)));
    root.style.setProperty("--sheet-rot", deg(pick(-2.2, 2.2)));
    root.style.setProperty("--tape-x", pct(pick(22, 78)));
    root.style.setProperty("--tape-rot", deg(pick(-4, 4)));
    const tints = ["#f6f0dd", "#f3ecd4", "#f7f2e2", "#efe5cb"];
    viewerText.style.backgroundColor =
      tints[Math.floor(rnd() * tints.length) % tints.length];
  }

  /* Deterministic per-note scramble: each logbook entry gets its own
     sticky-note color, tilt, offset and tape spot (stable across visits). */
  function dressNote(el, id) {
    const rnd = mulberry32(hashStr("note:" + (id || "log")));
    const pick = (a, b) => a + rnd() * (b - a);
    el.style.setProperty("--note-rot", pick(-4.5, 4.5).toFixed(2) + "deg");
    el.style.setProperty("--note-dy", pick(-4, 6).toFixed(1) + "px");
    el.style.setProperty("--tape-x", pick(28, 72).toFixed(1) + "%");
    el.style.setProperty("--tape-rot", pick(-6, 6).toFixed(2) + "deg");
    const notes = ["#fff6a3", "#ffd1dc", "#c5f0ff", "#d8ffcc", "#ffe4b3", "#e8d8ff"];
    el.style.setProperty(
      "--note-bg",
      notes[Math.floor(rnd() * notes.length) % notes.length]
    );
  }

  /* ---------- background parallax (tiled doodle drifts slower than scroll) ----------
     Uses background-position on the fixed #bg layer so the repeating tile
     never leaves gaps. Disabled when the user prefers reduced motion. */
  const BG_PARALLAX_FACTOR = 0.35;
  const BG_TILE = 420; // must match background-size in styles.css
  let bgTicking = false;
  function updateBgParallax() {
    bgTicking = false;
    if (!bg) return;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      bg.style.backgroundPosition = "";
      return;
    }
    const y = window.scrollY || 0;
    const off = -((y * BG_PARALLAX_FACTOR) % BG_TILE);
    bg.style.backgroundPosition = "0px " + off + "px";
  }
  function requestBgParallax() {
    if (bgTicking) return;
    bgTicking = true;
    requestAnimationFrame(updateBgParallax);
  }
  function initBgParallax() {
    if (!bg) return;
    window.addEventListener("scroll", requestBgParallax, { passive: true });
    window.addEventListener("resize", requestBgParallax);
    updateBgParallax();
  }

  /* ---------- tiny dependency-free markdown renderer (XSS-safe) ----------
     Diary-friendly: single newlines render as breaks, only fenced code
     blocks count as code (leading spaces are NOT code), supports
     headings, bold/italic/strike, links, lists, quotes, hr. */
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderInline(s) {
    const codes = [];
    s = s.replace(/`([^`\n]+)`/g, (m, c) => {
      codes.push(c);
      return "\u0000" + (codes.length - 1) + "\u0000";
    });
    s = s
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/(^|[^A-Za-z0-9_])_([^_]+)_/g, "$1<em>$2</em>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>")
      .replace(
        /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      )
      .replace(
        /(^|\s)(https?:\/\/[^\s<]+)/g,
        '$1<a href="$2" target="_blank" rel="noopener">$2</a>'
      );
    s = s.replace(/\u0000(\d+)\u0000/g, (m, i) => "<code>" + codes[+i] + "</code>");
    return s;
  }

  function renderMarkdown(src) {
    const lines = escapeHtml(src.replace(/\r\n?/g, "\n")).split("\n");
    let html = "";
    let para = [];
    let quoteDepth = 0;
    const listStack = []; // {type: "ul"|"ol", liOpen: bool}
    let inFence = false;
    let fence = [];

    const flushPara = () => {
      if (!para.length) return;
      const text = para.join("\n").replace(/^\s+|\s+$/g, "");
      para = [];
      if (!text) return;
      if (/^(—|–|--)\s*/.test(text)) {
        html += '<p class="sig">' + renderInline(text) + "</p>";
      } else {
        html += "<p>" + renderInline(text).replace(/\n/g, "<br>") + "</p>";
      }
    };
    const closeQuote = () => {
      flushPara();
      while (quoteDepth > 0) {
        html += "</blockquote>";
        quoteDepth--;
      }
    };
    const closeLists = () => {
      flushPara();
      while (listStack.length) {
        const l = listStack.pop();
        if (l.liOpen) html += "</li>";
        html += l.type === "ul" ? "</ul>" : "</ol>";
      }
    };

    for (const raw of lines) {
      if (/^```/.test(raw.trim())) {
        if (inFence) {
          html += "<pre><code>" + fence.join("\n") + "</code></pre>";
          fence = [];
          inFence = false;
        } else {
          flushPara();
          closeLists();
          closeQuote();
          inFence = true;
        }
        continue;
      }
      if (inFence) {
        fence.push(raw);
        continue;
      }
      if (raw.trim() === "") {
        flushPara();
        continue;
      }
      let m = raw.match(/^((?:&gt;)+)\s?(.*)$/);
      if (m) {
        flushPara();
        const depth = m[1].length / 4;
        while (quoteDepth < depth) {
          html += "<blockquote>";
          quoteDepth++;
        }
        while (quoteDepth > depth) {
          html += "</blockquote>";
          quoteDepth--;
        }
        if (m[2].trim() !== "") para.push(m[2]);
        continue;
      } else if (quoteDepth > 0) {
        closeQuote();
      }
      m = raw.trim().match(/^(#{1,6})\s+(.*)$/);
      if (m) {
        flushPara();
        closeLists();
        html +=
          "<h" +
          m[1].length +
          ">" +
          renderInline(m[2]) +
          "</h" +
          m[1].length +
          ">";
        continue;
      }
      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(raw.trim())) {
        flushPara();
        closeLists();
        html += "<hr>";
        continue;
      }
      m = raw.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
      if (m) {
        flushPara();
        const indent = m[1].replace(/\t/g, "  ").length;
        const type = /^\d/.test(m[2]) ? "ol" : "ul";
        const wantDepth = indent >= 2 ? 1 : 0;
        while (listStack.length > wantDepth + 1) {
          const l = listStack.pop();
          if (l.liOpen) html += "</li>";
          html += l.type === "ul" ? "</ul>" : "</ol>";
        }
        if (
          listStack.length === wantDepth + 1 &&
          listStack[wantDepth].type !== type
        ) {
          const l = listStack.pop();
          if (l.liOpen) html += "</li>";
          html += l.type === "ul" ? "</ul>" : "</ol>";
        }
        while (listStack.length <= wantDepth) {
          html += type === "ul" ? "<ul>" : "<ol>";
          listStack.push({ type, liOpen: false });
        }
        const top = listStack[listStack.length - 1];
        if (top.liOpen) html += "</li>";
        html += "<li>" + renderInline(m[3].trim());
        top.liOpen = true;
        continue;
      }
      if (listStack.length) closeLists();
      // A "— date" signature line starts its own paragraph for styling,
      // even without a blank line above it.
      if (/^(—|–|--)\s*/.test(raw.trim())) flushPara();
      para.push(raw);
    }
    flushPara();
    closeQuote();
    closeLists();
    if (inFence) html += "<pre><code>" + fence.join("\n") + "</code></pre>";
    return html;
  }

  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to load " + path);
    return res.json();
  }

  async function init() {
    initBgParallax();
    try {
      redirects = await loadJSON("data/redirects.json");
    } catch {
      redirects = {
        home: "data/gameList.json",
        "data/gameList.json": "home",
        art: "data/artList.json",
        "data/artList.json": "art",
        comics: "data/comicList.json",
        "data/comicList.json": "comics",
        logs: "data/logList.json",
        "data/logList.json": "logs",
      };
    }
    try {
      const b = await loadJSON("banner/banners.json");
      if (Array.isArray(b) && b.length) banners = b;
    } catch {}
    if (!banners.length) banners = [{ tex: "updatebanner.png", link: "updates/bannerupdate.html" }];
    renderBanner();
    startBannerAuto();

    window.addEventListener("hashchange", () => {
      closeViewer();
      renderCurrent();
    });
    window.addEventListener("resize", () => {
      // re-pick small/medium/full thumbs on resize (debounced, no transition)
      clearTimeout(window.__thumbT);
      window.__thumbT = setTimeout(() => renderCurrent(true, false), 250);
    });

    bannerPrev.addEventListener("click", () => stepBanner(-1));
    bannerNext.addEventListener("click", () => stepBanner(1));
    // Footer head: idle static Icon-tight.PNG, bop + Iconbop-tight.PNG briefly on click only
    if (footerHead && footerHeadImg) {
      const bopPreload = new Image();
      bopPreload.src = "imageSources/Iconbop-tight.PNG";
      let bopT = 0;
      footerHead.addEventListener("click", () => {
        footerHead.classList.remove("bop");
        void footerHead.offsetWidth;
        footerHeadImg.src = "imageSources/Iconbop-tight.PNG";
        footerHead.classList.add("bop");
        clearTimeout(bopT);
        bopT = setTimeout(() => {
          footerHeadImg.src = "imageSources/Icon-tight.PNG";
        }, 400);
      });
    }
    viewerBack.addEventListener("click", closeViewer);
    wireViewerZoom();

    await renderCurrent();
  }

  /* ---------- image zoom (viewer lightbox) ---------- */
  let viewerZoomLevel = 1;
  const VIEWER_ZOOM_MIN = 0.25;
  const VIEWER_ZOOM_MAX = 4;
  function applyViewerZoom() {
    viewerZoomLevel = Math.min(
      VIEWER_ZOOM_MAX,
      Math.max(VIEWER_ZOOM_MIN, viewerZoomLevel)
    );
    // Width is always relative to the viewer body so the image fills the
    // window (minus body padding); height stays auto so aspect is kept.
    viewerImg.style.width = viewerZoomLevel * 100 + "%";
    viewerImg.style.maxWidth = "none";
    if (viewerZoomLabel) {
      viewerZoomLabel.textContent = Math.round(viewerZoomLevel * 100) + "%";
    }
  }
  function stepViewerZoom(factor) {
    viewerZoomLevel *= factor;
    applyViewerZoom();
  }
  function wireViewerZoom() {
    if (viewerZoomIn) {
      viewerZoomIn.addEventListener("click", (e) => {
        e.stopPropagation();
        stepViewerZoom(1.25);
      });
    }
    if (viewerZoomOut) {
      viewerZoomOut.addEventListener("click", (e) => {
        e.stopPropagation();
        stepViewerZoom(1 / 1.25);
      });
    }
    if (viewerZoomLabel) {
      viewerZoomLabel.addEventListener("click", (e) => {
        e.stopPropagation();
        viewerZoomLevel = 1;
        applyViewerZoom();
      });
    }
    if (viewerImg) {
      // Double-click toggles between fit-width and 2x for reading details
      viewerImg.addEventListener("dblclick", (e) => {
        e.preventDefault();
        viewerZoomLevel = viewerZoomLevel > 1.1 ? 1 : 2;
        applyViewerZoom();
      });
      viewerImg.addEventListener("dragstart", (e) => e.preventDefault());
    }
    if (viewerBody) {
      // Ctrl/Cmd + wheel (or pinch) zooms; plain wheel scrolls long comics
      viewerBody.addEventListener(
        "wheel",
        (e) => {
          if (!(e.ctrlKey || e.metaKey)) return;
          e.preventDefault();
          stepViewerZoom(e.deltaY < 0 ? 1.12 : 1 / 1.12);
        },
        { passive: false }
      );
      // Drag to pan when zoomed in
      let panning = false;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;
      viewerBody.addEventListener("pointerdown", (e) => {
        if (viewerImg.hidden) return;
        panning = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = viewerBody.scrollLeft;
        startTop = viewerBody.scrollTop;
        viewerBody.classList.add("panning");
      });
      window.addEventListener("pointermove", (e) => {
        if (!panning) return;
        viewerBody.scrollLeft = startLeft - (e.clientX - startX);
        viewerBody.scrollTop = startTop - (e.clientY - startY);
      });
      window.addEventListener("pointerup", () => {
        panning = false;
        viewerBody.classList.remove("panning");
      });
    }
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !viewer.hidden) closeViewer();
    });
  }

  /* ---------- banner (same data as Scratch: banner/banners.json) ---------- */
  function renderBanner() {
    const b = banners[bannerIndex % banners.length];
    bannerImg.src = "banner/" + b.tex;
    bannerImg.alt = b.tex;
    bannerLink.href = b.link;
    bannerDots.innerHTML = "";
    banners.forEach((_, i) => {
      const d = document.createElement("i");
      if (i === bannerIndex % banners.length) d.className = "on";
      bannerDots.appendChild(d);
    });
  }
  function stepBanner(dir) {
    bannerIndex = (bannerIndex + dir + banners.length * 100) % banners.length;
    renderBanner();
    restartBannerAuto();
  }
  function startBannerAuto() {
    stopBannerAuto();
    bannerTimer = setInterval(() => {
      bannerIndex = (bannerIndex + 1) % banners.length;
      renderBanner();
    }, 8000);
  }
  function restartBannerAuto() {
    // keep auto-advance but reset timer (Scratch auto-increments too)
    startBannerAuto();
  }
  function stopBannerAuto() {
    if (bannerTimer) clearInterval(bannerTimer);
  }

  /* ---------- main list rendering (staggered fade out/in) ---------- */
  let renderSeq = 0;
  const prefersReducedMotion = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  async function renderCurrent(keepScroll, animate = true) {
    if (prefersReducedMotion()) animate = false;
    const my = ++renderSeq;
    const y = keepScroll ? window.scrollY : 0;
    currentFile = resolveHash();
    setHashFor(currentFile);

    // style mapping mirrors Scratch reloadList %s
    if (currentFile === "data/logList.json") currentStyle = "logBook";
    else if (currentFile === "data/discord-archiv.json") currentStyle = "discordLog";
    else if (currentFile === "data/artDisplay.json") currentStyle = "artView";
    else currentStyle = "";

    // Kick off the fetch while the old tiles fade out.
    const fetchP = loadJSON(currentFile);
    if (animate && grid.children.length) {
      grid.classList.add("leaving");
      await new Promise((r) =>
        setTimeout(r, Math.min(140 + grid.children.length * 18, 400))
      );
      if (my !== renderSeq) return;
    }

    let list;
    try {
      list = await fetchP;
    } catch (e) {
      grid.classList.remove("leaving");
      grid.innerHTML = "";
      const p = document.createElement("p");
      p.textContent = "Could not load " + currentFile;
      grid.appendChild(p);
      return;
    }
    if (my !== renderSeq) return;

    grid.classList.remove("leaving");
    grid.innerHTML = "";
    closeViewer(true);

    const listMode = currentStyle === "logBook" || currentStyle === "discordLog";
    grid.classList.toggle("list-mode", listMode);
    grid.classList.toggle("logbook-mode", currentStyle === "logBook");

    if (!Array.isArray(list) || !list.length) {
      if (currentStyle === "artView") return; // viewer handles it
      const p = document.createElement("p");
      p.textContent = "Nothing here yet.";
      grid.appendChild(p);
      return;
    }

    list.forEach((item, idx) => {
      if (!item || !item.id) return;
      const el = listMode ? logCard(item) : imageCard(item);
      // Stagger index for the cascade (capped so long lists stay snappy).
      el.style.setProperty("--i", Math.min(idx, 14));
      grid.appendChild(el);
    });

    if (keepScroll) window.scrollTo(0, y);
    else if (!location.hash) window.scrollTo(0, 0);
  }

  function imageCard(item) {
    const btn = document.createElement("button");
    btn.className = "card";
    btn.title = item.id;
    btn.setAttribute("aria-label", item.id);

    const wrap = document.createElement("span");
    wrap.className = "thumb-wrap";

    const img = document.createElement("img");
    img.className = "thumb";
    img.alt = item.id;
    img.loading = "lazy";
    const primary = thumbFor(item.id);
    img.src = primary;
    // fallback chain: suffix -> full -> nothing (then show text)
    img.onerror = () => {
      const full = fullFor(item.id);
      if (img.src.endsWith(encodeURI(full)) || img.dataset.fbk) {
        // no image at all (e.g. log titles) -> convert to text card
        const text = logCard(item);
        text.style.setProperty(
          "--i",
          btn.style.getPropertyValue("--i") || 0
        );
        btn.replaceWith(text);
      } else {
        img.dataset.fbk = "1";
        img.src = full;
      }
    };

    const frame = document.createElement("img");
    frame.className = "frame";
    frame.src = "imageSources/Frame.PNG";
    frame.alt = "";

    wrap.appendChild(img);
    wrap.appendChild(frame);

    if (isNew(item)) {
      const badge = document.createElement("img");
      badge.className = "new-badge";
      badge.src = "imageSources/new.png";
      badge.alt = "new";
      wrap.appendChild(badge);
    }

    btn.appendChild(wrap);
    btn.addEventListener("click", () => onItemClick(item));
    return btn;
  }

  function logCard(item) {
    // single-column handwritten rows (logBook / discordLog + image fallback).
    // Logbook entries get scrambled sticky-note styling via .note + dressNote;
    // the note look only applies inside #grid.logbook-mode.
    const btn = document.createElement("button");
    const isBack = item.id === "back";
    btn.className = "card text-card" + (isBack ? " is-back" : " note");
    btn.setAttribute("aria-label", item.id);
    const label = document.createElement("span");
    label.className = "note-label";
    label.textContent = isBack ? "← Back" : item.id;
    btn.appendChild(label);
    if (!isBack) dressNote(btn, item.id);
    if (isNew(item)) {
      const sub = document.createElement("span");
      sub.className = "sub";
      sub.textContent = "● new";
      btn.appendChild(sub);
    }
    btn.addEventListener("click", () => onItemClick(item));
    return btn;
  }

  async function onItemClick(item) {
    markSeen(item);
    // remove NEW badge immediately
    const badge = document.querySelector(".new-badge");
    // (grid re-renders on next navigation; for now just continue)

    const link = item.link || "";
    const internal = String(item.internal) === "true" || item.internal === true;

    if (internal) {
      location.hash = "#" + shortFor(link);
      return;
    }
    if (link.includes("*data")) {
      const resolved = resolveDataLink(link, item.id);
      await openDataViewer(resolved, item.id);
      return;
    }
    // external link, with Scratch mobile gate
    const hasMobile = !!item.mobile;
    if (isMobileDevice() && !hasMobile) {
      const ok = confirm(
        "This game is not compatible with mobile devices :(\n\nYou can choose to continue anyway, but keep in mind that you will encounter bugs, or the game will straight up not be playable!"
      );
      if (!ok) return;
    }
    window.open(link, "_blank", "noopener");
  }

  /* ---------- *data viewer lightbox (art png / log txt / comic png) ---------- */
  async function openDataViewer(resolved, title) {
    oldPage = currentFile;
    viewerTitle.textContent = title;
    viewerImg.hidden = true;
    viewerText.hidden = true;
    if (viewerSheetBack) viewerSheetBack.hidden = true;

    if (/\.txt$/i.test(resolved)) {
      if (viewerZoom) viewerZoom.hidden = true;
      try {
        const res = await fetch(encodeURI(resolved));
        viewerText.innerHTML = renderMarkdown(await res.text());
      } catch {
        viewerText.textContent = "(could not load " + resolved + ")";
      }
      dressPaper(title);
      viewerText.hidden = false;
      if (viewerSheetBack) viewerSheetBack.hidden = false;
    } else {
      if (viewerZoom) viewerZoom.hidden = false;
      viewerZoomLevel = 1;
      applyViewerZoom();
      viewerImg.src = encodeURI(resolved);
      viewerImg.alt = title;
      viewerImg.hidden = false;
    }
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    if (viewerBody) {
      viewerBody.scrollTop = 0;
      viewerBody.scrollLeft = 0;
    }
    grid.style.display = "none";
  }

  function closeViewer(silent) {
    if (viewer.hidden) return;
    if (!silent && viewer.classList.contains("closing")) return;
    if (silent || prefersReducedMotion()) {
      viewer.hidden = true;
      viewer.classList.remove("closing");
      document.body.style.overflow = "";
      grid.style.display = "";
      oldPage = null;
      return;
    }
    viewer.classList.add("closing");
    setTimeout(() => {
      viewer.hidden = true;
      viewer.classList.remove("closing");
      document.body.style.overflow = "";
      grid.style.display = "";
      oldPage = null;
    }, 170);
  }

  init().catch((e) => {
    console.error(e);
    grid.innerHTML = "<p>Failed to start. Check data/ files are served over http.</p>";
  });
})();
