// Модульное портфолио: профили под тип вакансии.
// Каждый профиль собирает свою главную: /ru/web/, /en/product/ и т.д.
// Меняются только модульные блоки: роль и интро в hero, порядок компетенций,
// набор и порядок кейсов, первая вкладка экспертизы.
// Всё остальное (студия, процесс, инструменты, контакты, страницы кейсов) общее.
//
// Ссылка под конкретную компанию: /ru/web/?for=MARTA
// в hero появится строка «Портфолио для MARTA».
//
// Профили под вакансии показывают статус «Открыта к работе», общая главная: «Беру новые проекты».
// caps: три главных направления, порядковые номера из i18n home.caps (0 Айдентика, 1 Веб, 2 UI/UX, 3 Продукт, 4 Дизайн-системы).

export default {
  web: {
    cases: ["lumia", "art-cook", "cohorta", "kun"],
    tab: "web",
    caps: [1, 2, 0],
    copy: {
      en: {
        role: "Web & UI/UX Designer",
        intro: "Websites and landing pages from structure to launch: wireframes, UI, responsive build in Webflow, Framer or code, and A/B tests after launch."
      },
      es: {
        role: "Diseñadora web y UI/UX",
        intro: "Webs y landing pages de la estructura al lanzamiento: wireframes, UI, maquetación responsive en Webflow, Framer o código y tests A/B después del lanzamiento."
      },
      ru: {
        role: "Веб-дизайнер и UI/UX",
        intro: "Сайты и лендинги от структуры до запуска: вайрфреймы, UI, адаптивная сборка в Webflow, Framer или кодом и A/B-тесты после запуска."
      }
    }
  },
  product: {
    cases: ["cohorta", "duescape", "lumia"],
    tab: "product",
    caps: [3, 2, 1],
    copy: {
      en: {
        role: "Product Designer · UI/UX",
        intro: "Interfaces for real work: user flows, roles, states and design systems, checked with prototypes and A/B tests."
      },
      es: {
        role: "Diseñadora de producto · UI/UX",
        intro: "Interfaces para el trabajo real: flujos, roles, estados y sistemas de diseño, validados con prototipos y tests A/B."
      },
      ru: {
        role: "Продуктовый дизайнер · UI/UX",
        intro: "Интерфейсы для реальной работы: сценарии, роли, состояния и дизайн-системы, проверенные прототипами и A/B-тестами."
      }
    }
  },
  brand: {
    cases: ["art-cook", "kun"],
    tab: "brand",
    caps: [0, 1, 2],
    copy: {
      en: {
        role: "Brand & Graphic Designer",
        intro: "Brand identity from scratch: logo, colour, type and a visual system that carries into packaging, print, social media and the website."
      },
      es: {
        role: "Diseñadora de marca y gráfica",
        intro: "Identidad de marca desde cero: logotipo, color, tipografía y un sistema visual que llega al packaging, la impresión, las redes y la web."
      },
      ru: {
        role: "Дизайнер айдентики и графики",
        intro: "Айдентика с нуля: логотип, цвет, шрифты и визуальная система, которая переходит в упаковку, печать, соцсети и сайт."
      }
    }
  }
};
