import site from "./site.js";
import cases from "./cases.js";

// Страницы кейсов: каждый кейс на каждом языке сайта + ссылка на следующий проект.
export default site.languages.flatMap((lang) =>
  cases.map((item, i) => ({ lang, item, next: cases[(i + 1) % cases.length] }))
);
