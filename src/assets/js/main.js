// Aisen Studio · основной скрипт. Без зависимостей.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ---------- Аналитика ----------
   Единая точка для событий. Когда подключим PostHog (без cookies),
   события пойдут туда; пока просто ничего не делает. */
export function track(event, props = {}) {
  if (window.posthog && typeof window.posthog.capture === "function") {
    window.posthog.capture(event, props);
  }
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-track]");
  if (el) track(el.dataset.track, { label: el.dataset.trackLabel || "", lang: document.documentElement.lang });
  const sw = e.target.closest("[data-lang-switch]");
  if (sw) {
    track("language_switch", { to: sw.dataset.langSwitch, from: document.documentElement.lang });
    // Сохраняем выбранный фильтр (?filter=...) при смене языка
    if (location.search) sw.href = sw.href.split("?")[0] + location.search;
  }
});

/* ---------- Header: тень при скролле ---------- */
const header = document.querySelector("[data-header]");
if (header) {
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Мобильное меню ---------- */
const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
if (toggle && nav) {
  const label = toggle.querySelector(".menu-toggle__label");
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    if (label) label.textContent = open ? label.dataset.closeLabel : label.dataset.openLabel;
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", (m) => { if (m.matches) setOpen(false); });
}

/* ---------- Появление при скролле ---------- */
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    revealEls.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 4, 3) * 80}ms`; io.observe(el); });
  }
}

/* ---------- Hero: фигура мягко реагирует на курсор (только мышь) ---------- */
const shape = document.querySelector("[data-hero-shape]");
if (shape && finePointer && !reduceMotion) {
  const hero = shape.parentElement;
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    shape.style.setProperty("--mx", `${(x * 40).toFixed(1)}px`);
    shape.style.setProperty("--my", `${(y * 40).toFixed(1)}px`);
    shape.style.setProperty("--rot", `${(x * 12).toFixed(1)}deg`);
  });
  hero.addEventListener("pointerleave", () => {
    ["--mx", "--my", "--rot"].forEach((p) => shape.style.removeProperty(p));
  });
}

/* ---------- Часы в футере: Испания, Europe/Madrid ----------
   Intl сам учитывает переход на летнее и зимнее время. */
const clock = document.querySelector("[data-clock]");
if (clock) {
  const tz = clock.dataset.tz || "Europe/Madrid";
  const locale = clock.dataset.lang === "ru" ? "ru-RU" : "en-GB";
  const timeEl = clock.querySelector("[data-clock-time]");
  const zoneEl = clock.querySelector("[data-clock-zone]");
  const timeFmt = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
  const zoneFmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, timeZoneName: "short" });
  const tick = () => {
    const now = new Date();
    timeEl.textContent = timeFmt.format(now);
    timeEl.dateTime = now.toISOString();
    const zone = zoneFmt.formatToParts(now).find((p) => p.type === "timeZoneName");
    if (zoneEl && zone) zoneEl.textContent = zone.value;
  };
  tick();
  // Обновляем ровно в начале каждой минуты
  setTimeout(() => { tick(); setInterval(tick, 60_000); }, (60 - new Date().getSeconds()) * 1000);
}

/* ---------- Фильтры на странице Work ----------
   Фильтр сохраняется в URL (?filter=web), чтобы ссылкой можно было поделиться. */
const filters = document.querySelector("[data-filters]");
if (filters) {
  const cards = [...document.querySelectorAll("[data-grid] [data-card]")];
  const buttons = [...filters.querySelectorAll("[data-filter]")];
  const count = document.querySelector("[data-count]");
  const empty = document.querySelector("[data-empty]");
  const valid = new Set(buttons.map((b) => b.dataset.filter));

  const apply = (key, push = true) => {
    if (!valid.has(key)) key = "all";
    const run = () => {
      let shown = 0;
      cards.forEach((card) => {
        const match = key === "all" || card.dataset.categories.split(" ").includes(key);
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === key)));
      if (count) count.textContent = shown;
      if (empty) empty.hidden = shown > 0;
    };
    // Плавная перестройка сетки через View Transitions там, где поддерживается
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(run);
    else run();

    if (push) {
      const url = new URL(location.href);
      if (key === "all") url.searchParams.delete("filter"); else url.searchParams.set("filter", key);
      history.replaceState(null, "", url);
    }
  };

  buttons.forEach((b) => b.addEventListener("click", () => {
    apply(b.dataset.filter);
    track("filter_click", { filter: b.dataset.filter });
  }));
  apply(new URLSearchParams(location.search).get("filter") || "all", false);
}

/* ---------- Контактная форма ---------- */
const form = document.querySelector("[data-form]");
if (form) {
  const status = form.querySelector("[data-form-status]");
  const submitBtn = form.querySelector('[type="submit"]');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (input) => {
    const field = input.closest(".field");
    const err = field.querySelector(".field__error");
    let msg = "";
    if (!input.value.trim()) msg = form.dataset.msgRequired;
    else if (input.type === "email" && !emailRe.test(input.value.trim())) msg = form.dataset.msgEmail;
    field.classList.toggle("has-error", Boolean(msg));
    input.setAttribute("aria-invalid", String(Boolean(msg)));
    if (msg) input.setAttribute("aria-describedby", err.id); else input.removeAttribute("aria-describedby");
    err.textContent = msg;
    return !msg;
  };

  const inputs = [...form.querySelectorAll(".field__input")];
  inputs.forEach((i) => i.addEventListener("blur", () => validateField(i)));
  inputs.forEach((i) => i.addEventListener("input", () => { if (i.closest(".has-error")) validateField(i); }));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstInvalid = inputs.find((i) => !validateField(i));
    if (firstInvalid) { firstInvalid.focus(); return; }

    const original = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = form.dataset.msgSending;
    status.className = "form__status";
    status.textContent = "";

    try {
      const res = await fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error("send failed");
      form.reset();
      status.classList.add("is-success");
      status.textContent = form.dataset.msgSuccess;
      track("contact_submit", { lang: document.documentElement.lang });
    } catch {
      status.classList.add("is-error");
      status.textContent = form.dataset.msgError;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
    }
  });
}
