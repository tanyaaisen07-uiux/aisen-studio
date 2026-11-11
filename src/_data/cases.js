import fs from "node:fs";
import site from "./site.js";

// Кейсы для текущего сайта: фильтр по полю "sites" и порядок по "order".
const all = JSON.parse(fs.readFileSync(new URL("./casesAll.json", import.meta.url)));

export default all
  .filter((c) => !c.sites || c.sites.includes(site.variant))
  .sort((a, b) => (a.order?.[site.variant] ?? 99) - (b.order?.[site.variant] ?? 99));
