import site from "./site.js";
import cases from "./cases.js";

// Страницы кейсов: только проекты с полноценным кейсом, на каждом языке сайта.
// «Следующий проект» берётся из общего списка: если у него нет кейса, ведём на страницу Work.
export default site.languages.flatMap((lang) =>
  cases
    .map((item, i) => ({ item, next: cases[(i + 1) % cases.length] }))
    .filter(({ item }) => item.hasCase && item.case && item.case[lang])
    .map(({ item, next }) => ({ lang, item, next, content: item.case[lang] }))
);
