import site from "./site.js";
import cases from "./cases.js";
import profiles from "./profiles.js";

// Главная собирается на каждом языке: общая версия + по одной на профиль.
// Кейс, которого нет на этом сайте (или он ещё черновик), просто пропускается.
// Общая главная: 3-4 сильных кейса с полным разбором. Остальные живут на странице Work и в профилях.
const HOME_CASES = ["cohorta", "duescape", "lumia", "art-cook"];
// Список идёт по годам, от новых к старым, как в хронологии; внутри года порядок из списка.
const pick = (slugs) => slugs
  .map((slug) => cases.find((c) => c.slug === slug))
  .filter(Boolean)
  .sort((a, b) => b.year - a.year);

const tabOrder = (first) => ["brand", "web", "product"].sort((a, b) => (b === first) - (a === first));

export default site.languages.flatMap((lang) => [
  { lang, profile: null, url: `/${lang}/`, cases: pick(HOME_CASES), tabs: tabOrder("brand"), caps: [0, 1, 2], copy: {}, studio: true },
  ...Object.entries(profiles).map(([key, p]) => ({
    lang,
    profile: key,
    url: `/${lang}/${key}/`,
    cases: pick(p.cases),
    tabs: tabOrder(p.tab),
    caps: p.caps,
    copy: p.copy[lang] || {}
  }))
]);
