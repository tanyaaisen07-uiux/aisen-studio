import site from "./site.js";
import cases from "./cases.js";
import profiles from "./profiles.js";

// Главная собирается на каждом языке: общая версия + по одной на профиль.
// Кейс, которого нет на этом сайте (или он ещё черновик), просто пропускается.
const tabOrder = (first) => ["brand", "web", "product"].sort((a, b) => (b === first) - (a === first));

export default site.languages.flatMap((lang) => [
  { lang, profile: null, url: `/${lang}/`, cases, tabs: tabOrder("brand"), caps: [0, 1, 2, 3, 4], copy: {} },
  ...Object.entries(profiles).map(([key, p]) => ({
    lang,
    profile: key,
    url: `/${lang}/${key}/`,
    cases: p.cases.map((slug) => cases.find((c) => c.slug === slug)).filter(Boolean),
    tabs: tabOrder(p.tab),
    caps: p.caps,
    copy: p.copy[lang] || {}
  }))
]);
