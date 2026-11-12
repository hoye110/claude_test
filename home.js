(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Theme (shared key with login page) ---------- */
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  root.dataset.theme = store.get("mci-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  $("#themeToggle").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("mci-theme", root.dataset.theme);
  });

  /* ---------- Header, progress bar, back-to-top ---------- */
  const header = $("#header");
  const progress = $("#progress");
  const toTop = $("#toTop");
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("scrolled", y > 10);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    toTop.classList.toggle("show", y > 700);
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  burger.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
  });
  $$(".has-menu > .nav-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".has-menu")) $$(".has-menu.open").forEach((m) => m.classList.remove("open"));
  });
  $$(".nav a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("menu-open")));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  // once revealed, drop the stagger delay so hover effects respond instantly
  revealEls.forEach((el) => el.addEventListener("transitionend", (e) => {
    if (e.target === el && e.propertyName === "opacity" && el.classList.contains("in")) el.classList.add("done");
  }));
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }
  // Safety net: never leave content hidden (e.g. background tabs, old browsers)
  setTimeout(() => $$(".hero .reveal").forEach((el) => el.classList.add("in")), 400);

  /* ---------- Count-up stats ---------- */
  const fmt = new Intl.NumberFormat("vi-VN");
  const runCount = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const pad = +el.dataset.pad || 0;
    const show = (n) => { el.textContent = (pad ? String(n).padStart(pad, "0") : fmt.format(n)) + suffix; };
    if (reduce) return show(target);
    const t0 = performance.now(), dur = 1800;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      show(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  } else counters.forEach(runCount);

  /* ---------- Hero banner slider ---------- */
  const slides = $$("#banner img");
  const dotsWrap = $("#bannerDots");
  let cur = 0, timer;
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Banner ${i + 1}`);
    if (i === 0) b.classList.add("is-active");
    b.addEventListener("click", () => { go(i); auto(); });
    dotsWrap.appendChild(b);
  });
  const dots = $$("button", dotsWrap);
  const go = (i) => {
    slides[cur].classList.remove("is-active"); dots[cur].classList.remove("is-active");
    cur = i;
    slides[cur].classList.add("is-active"); dots[cur].classList.add("is-active");
  };
  const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go((cur + 1) % slides.length), 4500); };
  auto();

  /* ---------- Course tabs with sliding ink ---------- */
  const tabs = $$(".tab");
  const ink = $(".tab-ink");
  const moveInk = (tab) => {
    ink.style.width = tab.offsetWidth + "px";
    ink.style.transform = `translateX(${tab.offsetLeft}px)`;
  };
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
    $$(".course-grid").forEach((g) => g.classList.toggle("is-active", g.dataset.panel === tab.dataset.tab));
    moveInk(tab);
  }));
  const initInk = () => moveInk($(".tab.is-active"));
  addEventListener("resize", initInk);
  document.fonts?.ready.then(initInk);
  initInk();

  /* ---------- Lecturer carousel buttons ---------- */
  const lect = $("#lecturers");
  $$("[data-scroll]").forEach((b) => b.addEventListener("click", () => {
    const card = lect.querySelector(".lect");
    lect.scrollBy({ left: (card.offsetWidth + 18) * 2 * +b.dataset.scroll, behavior: reduce ? "auto" : "smooth" });
  }));

  /* ---------- Duplicate marquee content for seamless loop ---------- */
  ["#partnerTrack", "#testiTrack"].forEach((sel) => {
    const track = $(sel);
    [...track.children].forEach((n) => {
      const c = n.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      track.appendChild(c);
    });
  });

  /* ---------- Tilt cards ---------- */
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });

    /* Magnetic primary CTA */
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Hide images that fail to load ---------- */
  $$("img").forEach((img) => img.addEventListener("error", () => { img.style.visibility = "hidden"; }, { once: true }));

  /* ---------- Contact form (demo) ---------- */
  const form = $("#contactForm");
  const select = $("#cf-track");
  select.addEventListener("change", () => select.classList.toggle("has-value", !!select.value));
  const toastEl = $("#toast");
  const toast = (msg) => {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove("show"), 3500);
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const bad = $$("[required]", form).filter((el) => {
      const ok = el.value.trim() !== "" && (!el.pattern || new RegExp(`^${el.pattern}$`).test(el.value.trim()));
      el.closest(".field").classList.toggle("invalid", !ok);
      return !ok;
    });
    if (bad.length) {
      bad.forEach((el) => { const f = el.closest(".field"); f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake"); });
      bad[0].focus();
      return;
    }
    const btn = $("button[type=submit]", form);
    btn.classList.add("is-loading");
    setTimeout(() => {
      btn.classList.remove("is-loading");
      form.reset(); select.classList.remove("has-value");
      toast("Đã gửi! MCI sẽ liên hệ với bạn sớm. (bản demo – cần nối với hệ thống thật)");
    }, 1200);
  });
  $$("input, select", form).forEach((el) => el.addEventListener("input", () => el.closest(".field").classList.remove("invalid")));
})();
