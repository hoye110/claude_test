(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  const storage = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  const saved = storage.get("mci-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = saved || (prefersDark ? "dark" : "light");

  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    storage.set("mci-theme", next);
  });

  /* ---------- Load reveal ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("is-loaded")));

  /* ---------- Count-up stats ---------- */
  const fmt = new Intl.NumberFormat("en-US");
  const countUp = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = fmt.format(target) + suffix; return; }
    const dur = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt.format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  setTimeout(() => document.querySelectorAll("[data-count]").forEach(countUp), 700);

  /* ---------- Feature slider ---------- */
  const slides = [...document.querySelectorAll("#slider .slide")];
  const dots = [...document.querySelectorAll("#slider .slider-dots button")];
  let current = 0;
  let timer;
  const goSlide = (i) => {
    if (i === current) return;
    const prev = slides[current];
    prev.classList.remove("is-active");
    prev.classList.add("is-leaving");
    setTimeout(() => prev.classList.remove("is-leaving"), 700);
    slides[i].classList.add("is-active");
    dots[current].classList.remove("is-active");
    dots[i].classList.add("is-active");
    current = i;
  };
  const autoplay = () => {
    clearInterval(timer);
    timer = setInterval(() => goSlide((current + 1) % slides.length), 4200);
  };
  dots.forEach((d, i) => d.addEventListener("click", () => { goSlide(i); autoplay(); }));
  if (!reduceMotion) autoplay();

  /* ---------- Auth view switching ---------- */
  const card = document.getElementById("card");
  const views = Object.fromEntries([...card.querySelectorAll(".view")].map((v) => [v.dataset.view, v]));
  const order = ["forgot", "signin", "register"];
  let active = "signin";

  const showView = (name, focus = true) => {
    if (!views[name] || name === active) return;
    const from = views[active];
    const to = views[name];
    const forward = order.indexOf(name) > order.indexOf(active);

    // lock current height, so we can animate to the new one
    const startH = card.offsetHeight;
    card.style.height = startH + "px";

    to.classList.remove("from-left", "is-leaving-left", "is-leaving-right");
    if (!forward) to.classList.add("from-left");
    // force style flush so the starting position applies
    void to.offsetWidth;

    from.classList.remove("is-active");
    from.classList.add(forward ? "is-leaving-left" : "is-leaving-right");
    to.classList.add("is-active");
    to.classList.remove("from-left");

    const cs = getComputedStyle(card);
    const endH = to.offsetHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + 2;
    requestAnimationFrame(() => { card.style.height = endH + "px"; });

    const cleanup = () => {
      card.style.height = "";
      from.classList.remove("is-leaving-left", "is-leaving-right");
    };
    setTimeout(cleanup, reduceMotion ? 0 : 650);

    active = name;
    if (focus) setTimeout(() => to.querySelector("input")?.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  };

  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (!go) return;
    e.preventDefault();
    const name = go.dataset.go;
    history.replaceState(null, "", name === "signin" ? location.pathname : "#" + name);
    showView(name);
  });

  const initial = location.hash.replace("#", "");
  if (views[initial]) {
    views.signin.classList.remove("is-active");
    views[initial].classList.add("is-active");
    active = initial;
  }
  window.addEventListener("hashchange", () => showView(location.hash.replace("#", "") || "signin"));

  /* ---------- Card spotlight ---------- */
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  /* ---------- Password visibility ---------- */
  document.querySelectorAll("[data-toggle-pass]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.classList.toggle("is-on", show);
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });

  /* ---------- Password strength ---------- */
  const rePass = document.getElementById("re-pass");
  const meter = rePass.parentElement.querySelector(".strength");
  rePass.addEventListener("input", () => {
    const v = rePass.value;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    meter.dataset.level = v ? Math.max(1, s) : 0;
  });

  /* ---------- Validation + submit ---------- */
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateField = (input) => {
    const field = input.closest(".field");
    let ok = input.value.trim() !== "";
    if (ok && input.type === "email") ok = emailRe.test(input.value.trim());
    if (ok && input.minLength > 0) ok = input.value.length >= input.minLength;
    field.classList.toggle("invalid", !ok);
    return ok;
  };

  document.querySelectorAll(".field input").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) validateField(input);
    });
  });

  const toastEl = document.getElementById("toast");
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  };

  const messages = {
    signin: "Signed in! (demo – connect this form to your backend)",
    register: "Account created! (demo – connect this form to your backend)",
    forgot: "Reset link sent! (demo – connect this form to your backend)",
  };

  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = [...form.querySelectorAll("input[required]")];
      const bad = inputs.filter((i) => !validateField(i));
      if (bad.length) {
        bad.forEach((i) => {
          const f = i.closest(".field");
          f.classList.remove("shake");
          void f.offsetWidth;
          f.classList.add("shake");
        });
        bad[0].focus();
        return;
      }
      const btn = form.querySelector(".btn-primary");
      btn.classList.add("is-loading");
      setTimeout(() => {
        btn.classList.remove("is-loading");
        toast(messages[form.dataset.form]);
      }, 1400);
    });
  });

  /* ---------- Ripple ---------- */
  document.querySelectorAll(".btn-primary, .btn-social").forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const span = document.createElement("span");
      span.className = "ripple";
      span.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      if (btn.classList.contains("btn-social")) span.style.background = "rgba(242,107,29,.18)";
      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.appendChild(span);
      setTimeout(() => span.remove(), 700);
    });
  });

  /* ---------- Subtle parallax on blobs ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    const blobs = document.querySelectorAll(".blob");
    let raf;
    window.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2;
        blobs.forEach((b, i) => {
          const k = (i + 1) * 12;
          b.style.translate = `${x * k}px ${y * k}px`;
        });
      });
    });
  }
})();
