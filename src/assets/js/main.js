// Aisen Studio · основной скрипт. Без зависимостей.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- Аналитика ----------
   Единая точка для событий. PostHog (без cookies) подключается отдельно;
   пока его нет, функция ничего не делает. */
export function track(event, props = {}) {
  if (window.posthog && typeof window.posthog.capture === "function") window.posthog.capture(event, props);
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-track]");
  if (el) track(el.dataset.track, { label: el.dataset.trackLabel || "", lang: document.documentElement.lang });
  const sw = e.target.closest("[data-lang-switch]");
  if (sw) {
    track("language_switch", { to: sw.dataset.langSwitch, from: document.documentElement.lang });
    if (location.search) sw.href = sw.href.split("?")[0] + location.search; // сохраняем фильтр
  }
});

/* ---------- Шапка: линия при прокрутке ---------- */
const header = $("[data-header]");
const onHeaderScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);

/* ---------- Логотип-интро на главной ----------
   На первом экране AISEN STUDIO стоит во всю ширину,
   при прокрутке уменьшается и уходит в левый верхний угол, где и остаётся. */
const logo = $("[data-logo]");
const hero = $("[data-hero]");
const introSpace = $("[data-intro-space]");
const intro = { on: false, S: 1, startY: 0, dist: 320 };

function measureIntro() {
  if (!logo || !hero || !introSpace || reduceMotion) return;
  logo.style.transform = "none";
  const w0 = logo.offsetWidth;
  const h0 = logo.offsetHeight;
  const cs = getComputedStyle(hero);
  const avail = hero.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const headerH = header ? header.offsetHeight : 84;
  intro.S = Math.max(1, avail / w0);
  intro.startY = headerH + 16 - logo.offsetTop;
  intro.dist = Math.max(240, intro.startY + h0 * intro.S * 0.6);
  // место под крупный логотип внутри hero
  const heroContentTop = hero.offsetTop + parseFloat(cs.paddingTop);
  const need = headerH + 16 + h0 * intro.S + 32 - heroContentTop;
  introSpace.style.height = `${Math.max(0, Math.round(need))}px`;
  intro.on = true;
  updateIntro();
}

function updateIntro() {
  if (!intro.on) return;
  const p = Math.min(1, Math.max(0, window.scrollY / intro.dist));
  const e = 1 - Math.pow(1 - p, 3);
  const scale = intro.S + (1 - intro.S) * e;
  logo.style.transform = `translate3d(0, ${(intro.startY * (1 - e)).toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
  logo.classList.toggle("is-compact", p >= 1);
}

if (document.body.classList.contains("page-home")) {
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureIntro);
  else measureIntro();
  window.addEventListener("resize", measureIntro);
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onHeaderScroll(); updateIntro(); ticking = false; });
}, { passive: true });
onHeaderScroll();

/* ---------- Мобильное меню ---------- */
const toggle = $("[data-menu-toggle]");
const nav = $("[data-nav]");
if (toggle && nav) {
  const label = $("[data-menu-label]", toggle);
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    if (label) label.textContent = open ? label.dataset.close : label.dataset.open;
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", (m) => { if (m.matches) setOpen(false); });
}

/* ---------- Появление при скролле ---------- */
const revealEls = $$(".reveal");
if (revealEls.length) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 80}ms`; io.observe(el); });
  }
}

/* ---------- Галерея работ: превью меняется при наведении и фокусе ---------- */
const gallery = $("[data-gallery]");
if (gallery) {
  const rows = $$("[data-gallery-row]", gallery);
  const slides = $$("[data-gallery-slide]", gallery);
  const captions = $$("[data-gallery-caption]", gallery);
  const activate = (i) => {
    rows.forEach((r, k) => r.classList.toggle("is-active", k === i));
    slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
    captions.forEach((c, k) => c.classList.toggle("is-active", k === i));
  };
  rows.forEach((row, i) => {
    row.addEventListener("pointerenter", () => activate(i));
    row.addEventListener("focus", () => activate(i));
  });
}

/* ---------- Вкладки экспертизы (клавиатура: стрелки, Home, End) ---------- */
const tabsRoot = $("[data-tabs]");
if (tabsRoot) {
  const tabs = $$("[role=tab]", tabsRoot);
  const select = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    track("expertise_tab", { tab: tab.dataset.tab });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      const map = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      select(tabs[(map[e.key] + tabs.length) % tabs.length], true);
    });
  });
  // Слова Brand, Digital, Product в hero открывают нужную вкладку
  $$("[data-tab-link]").forEach((a) => a.addEventListener("click", () => {
    const tab = tabs.find((t) => t.dataset.tab === a.dataset.tabLink);
    if (tab) select(tab);
  }));
}

/* ---------- Часы: Испания, Europe/Madrid (летнее и зимнее время учитываются сами) ---------- */
const clock = $("[data-clock]");
if (clock) {
  const tz = clock.dataset.tz || "Europe/Madrid";
  const timeEl = $("[data-clock-time]", clock);
  const zoneEl = $("[data-clock-zone]", clock);
  const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
  const zoneFmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, timeZoneName: "short" });
  const tick = () => {
    const now = new Date();
    clock.hidden = false;
    timeEl.textContent = timeFmt.format(now);
    timeEl.dateTime = now.toISOString();
    const z = zoneFmt.formatToParts(now).find((p) => p.type === "timeZoneName");
    if (zoneEl && z) zoneEl.textContent = z.value;
  };
  tick();
  setTimeout(() => { tick(); setInterval(tick, 60_000); }, (60 - new Date().getSeconds()) * 1000);
}

/* ---------- Фильтры на странице Work ----------
   Фильтр сохраняется в URL (?filter=web), чтобы ссылкой можно было поделиться. */
const filters = $("[data-filters]");
if (filters) {
  const cards = $$("[data-grid] [data-card]");
  const buttons = $$("[data-filter]", filters);
  const count = $("[data-count]");
  const empty = $("[data-empty]");
  const valid = new Set(buttons.map((b) => b.dataset.filter));
  const has = (card, key) => key === "all" || card.dataset.categories.split(" ").includes(key);
  buttons.forEach((b) => {
    const n = cards.filter((c) => has(c, b.dataset.filter)).length;
    const el = $(`[data-filter-count="${b.dataset.filter}"]`, filters);
    if (el) el.textContent = String(n).padStart(2, "0");
  });
  const apply = (key, push = true) => {
    if (!valid.has(key)) key = "all";
    const run = () => {
      let shown = 0;
      cards.forEach((card) => { const m = has(card, key); card.classList.toggle("is-hidden", !m); if (m) shown++; });
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === key)));
      if (count) count.textContent = String(shown).padStart(2, "0");
      if (empty) empty.hidden = shown > 0;
    };
    if (push && document.startViewTransition && !reduceMotion) document.startViewTransition(run);
    else run();
    if (push) {
      const url = new URL(location.href);
      if (key === "all") url.searchParams.delete("filter"); else url.searchParams.set("filter", key);
      history.replaceState(null, "", url);
    }
  };
  buttons.forEach((b) => b.addEventListener("click", () => { apply(b.dataset.filter); track("filter_click", { filter: b.dataset.filter }); }));
  apply(new URLSearchParams(location.search).get("filter") || "all", false);
}

/* ---------- Product UI playground (кейс Cohorta) ---------- */
const pg = $("[data-playground]");
if (pg) {
  const app = $("[data-mini-app]", pg);
  const state = { role: "instructor", theme: "light", view: "default" };
  const T = {
    en: {
      instructor: { title: "Grading queue", meta: "UX Design Fundamentals · 18 to review", cols: ["Student", "Status", "AI score"], menu: ["Dashboard", "Grading queue", "Course builder", "Cohort roster"], emptyTitle: "Nothing to grade", emptyText: "New submissions will appear here, late ones first." },
      student: { title: "My next step", meta: "UX Design Fundamentals · Week 4", cols: ["Assignment", "Status", "Grade"], menu: ["My course", "Assignments", "Feedback", "Calendar"], emptyTitle: "You are all caught up", emptyText: "The next lesson opens on Monday." },
      admin: { title: "Cohorts", meta: "Spring 2026 · 3 active", cols: ["Cohort", "Status", "Students"], menu: ["Overview", "Cohorts", "Courses", "People"], emptyTitle: "No cohorts yet", emptyText: "Create a course, then launch the first cohort." },
      status: { late: "Late", ai: "AI draft ready", submitted: "Submitted", returned: "Returned", graded: "Graded", running: "Running", draft: "Draft" }
    },
    es: {
      instructor: { title: "Cola de corrección", meta: "Fundamentos de diseño UX · 18 por revisar", cols: ["Estudiante", "Estado", "Nota IA"], menu: ["Panel", "Cola de corrección", "Editor de cursos", "Cohortes"], emptyTitle: "Nada por corregir", emptyText: "Las nuevas entregas aparecerán aquí, primero las atrasadas." },
      student: { title: "Mi siguiente paso", meta: "Fundamentos de diseño UX · Semana 4", cols: ["Tarea", "Estado", "Nota"], menu: ["Mi curso", "Tareas", "Comentarios", "Calendario"], emptyTitle: "Lo tienes todo al día", emptyText: "La siguiente lección se abre el lunes." },
      admin: { title: "Cohortes", meta: "Primavera 2026 · 3 activas", cols: ["Cohorte", "Estado", "Estudiantes"], menu: ["Resumen", "Cohortes", "Cursos", "Personas"], emptyTitle: "Aún no hay cohortes", emptyText: "Crea un curso y lanza la primera cohorte." },
      status: { late: "Con retraso", ai: "Borrador IA listo", submitted: "Entregado", returned: "Devuelto", graded: "Corregido", running: "En curso", draft: "Borrador" }
    },
    ru: {
      instructor: { title: "Очередь проверки", meta: "Основы UX-дизайна · 18 на проверку", cols: ["Студент", "Статус", "Оценка ИИ"], menu: ["Обзор", "Очередь проверки", "Конструктор курса", "Потоки"], emptyTitle: "Проверять нечего", emptyText: "Новые работы появятся здесь, просроченные первыми." },
      student: { title: "Мой следующий шаг", meta: "Основы UX-дизайна · Неделя 4", cols: ["Задание", "Статус", "Оценка"], menu: ["Мой курс", "Задания", "Отзывы", "Календарь"], emptyTitle: "Всё сделано", emptyText: "Следующий урок откроется в понедельник." },
      admin: { title: "Потоки", meta: "Весна 2026 · 3 активных", cols: ["Поток", "Статус", "Студенты"], menu: ["Обзор", "Потоки", "Курсы", "Люди"], emptyTitle: "Потоков пока нет", emptyText: "Создайте курс и запустите первый поток." },
      status: { late: "Просрочено", ai: "Черновик ИИ готов", submitted: "Сдано", returned: "Возвращено", graded: "Оценено", running: "Идёт", draft: "Черновик" }
    }
  };
  const ROWS = {
    instructor: [["Jonas Weber", "Group B · User interview plan", "late", "85"], ["Leo Rossi", "Group A · Wireframe review", "late", "68"], ["Priya Nair", "Group A · Wireframe review", "ai", "92"], ["Kofi Mensah", "Group A · Wireframe review", "ai", "56"]],
    student: [["User interview plan", "Oct 4", "submitted", "—"], ["Wireframe review", "Oct 11", "returned", "—"], ["Usability test report", "Oct 18", "graded", "88"]],
    admin: [["UX Design Fundamentals", "Group A, B", "running", "22"], ["Product Analytics", "Nov 20", "draft", "0"], ["UI Systems", "Group A", "running", "18"]]
  };
  const BADGE = { late: "late", returned: "late", ai: "ai", submitted: "ai", draft: "ai", graded: "done", running: "done" };
  const L = T[pg.dataset.lang] || T.en;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const render = () => {
    const sc = L[state.role];
    app.dataset.theme = state.theme;
    $("[data-mini-title]", app).textContent = sc.title;
    $("[data-mini-meta]", app).textContent = sc.meta;
    $("[data-mini-menu]", app).innerHTML = sc.menu.map((m, i) => `<li${i === 1 ? ' class="is-active"' : ""}>${esc(m)}</li>`).join("");
    const body = $("[data-mini-body]", app);
    if (state.view === "empty") {
      body.innerHTML = `<div class="mini-empty"><strong>${esc(sc.emptyTitle)}</strong><span>${esc(sc.emptyText)}</span></div>`;
    } else if (state.view === "loading") {
      body.innerHTML = `<div class="mini-skel" aria-busy="true">${"<span></span>".repeat(5)}</div>`;
    } else {
      const head = `<div class="mini-table__row mini-table__row--head">${sc.cols.map((c) => `<span>${esc(c)}</span>`).join("")}</div>`;
      const rows = ROWS[state.role].map(([name, sub, st, score]) =>
        `<div class="mini-table__row"><span class="mini-table__name"><strong>${esc(name)}</strong><span>${esc(sub)}</span></span>` +
        `<span><span class="badge badge--${BADGE[st]}">${esc(L.status[st])}</span></span><span>${esc(score)}</span></div>`).join("");
      body.innerHTML = `<div class="mini-table">${head}${rows}</div>`;
    }
  };
  $$("[data-pg]", pg).forEach((btn) => btn.addEventListener("click", () => {
    const key = btn.dataset.pg;
    state[key] = btn.dataset.value;
    $$(`[data-pg="${key}"]`, pg).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    render();
    track("playground_switch", { [key]: btn.dataset.value });
  }));
  render();
}

/* ---------- Контактная форма ---------- */
const form = $("[data-form]");
if (form) {
  const status = $("[data-form-status]", form);
  const submitBtn = $('[type="submit"]', form);
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const inputs = $$(".field__input", form);
  const validate = (input) => {
    const field = input.closest(".field");
    const err = $(".field__error", field);
    let msg = "";
    if (!input.value.trim()) msg = form.dataset.msgRequired;
    else if (input.type === "email" && !emailRe.test(input.value.trim())) msg = form.dataset.msgEmail;
    field.classList.toggle("has-error", Boolean(msg));
    input.setAttribute("aria-invalid", String(Boolean(msg)));
    if (msg) input.setAttribute("aria-describedby", err.id); else input.removeAttribute("aria-describedby");
    err.textContent = msg;
    return !msg;
  };
  inputs.forEach((i) => i.addEventListener("blur", () => validate(i)));
  inputs.forEach((i) => i.addEventListener("input", () => { if (i.closest(".has-error")) validate(i); }));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = inputs.find((i) => !validate(i));
    if (bad) { bad.focus(); return; }
    const original = submitBtn.textContent;
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
      submitBtn.textContent = original;
    }
  });
}

/* ---------- До / после: слайдер сравнения (кейс Jewelry Visuals) ---------- */
$$("[data-ba]").forEach((ba) => {
  let dragging = false;
  let tracked = false;
  const set = (p) => {
    p = Math.max(0, Math.min(100, p));
    ba.style.setProperty("--pos", p + "%");
    ba.setAttribute("aria-valuenow", String(Math.round(p)));
  };
  const fromX = (x) => {
    const r = ba.getBoundingClientRect();
    set(((x - r.left) / r.width) * 100);
  };
  const once = () => { if (!tracked) { tracked = true; track("before_after_drag"); } };
  ba.addEventListener("pointerdown", (e) => { dragging = true; ba.setPointerCapture(e.pointerId); fromX(e.clientX); once(); });
  ba.addEventListener("pointermove", (e) => { if (dragging) fromX(e.clientX); });
  ba.addEventListener("pointerup", () => { dragging = false; });
  ba.addEventListener("pointercancel", () => { dragging = false; });
  ba.addEventListener("keydown", (e) => {
    const v = Number(ba.getAttribute("aria-valuenow"));
    if (e.key === "ArrowLeft") { set(v - 5); e.preventDefault(); once(); }
    if (e.key === "ArrowRight") { set(v + 5); e.preventDefault(); once(); }
  });
});

/* ---------- Тема и акцентный цвет ----------
   Выбор хранится в localStorage; без него сайт остаётся светлым с жёлтым акцентом. */
(() => {
  const root = document.documentElement;
  const save = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* хранилище недоступно */ } };
  const swatches = $$("[data-accent-set]");
  const syncAccent = () => {
    const cur = root.getAttribute("data-accent") || "mint";
    swatches.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.accentSet === cur)));
  };
  swatches.forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.accentSet;
    if (v === "mint") root.removeAttribute("data-accent"); else root.setAttribute("data-accent", v);
    save("aisen-accent", v); syncAccent(); track("accent_change", { accent: v });
  }));
  syncAccent();
  const meta = document.querySelector('meta[name="theme-color"]');
  const syncTheme = () => { if (meta) meta.content = root.getAttribute("data-theme") === "dark" ? "#0C0D0E" : "#FFFFFF"; };
  const toggle = $("[data-theme-toggle]");
  if (toggle) toggle.addEventListener("click", () => {
    const dark = root.getAttribute("data-theme") === "dark";
    if (dark) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", "dark");
    save("aisen-theme", dark ? "light" : "dark"); syncTheme(); track("theme_change", { theme: dark ? "light" : "dark" });
  });
  syncTheme();
})();
