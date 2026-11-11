# Aisen Studio

Сайт-портфолио Tania Aisen: Brand & Web Designer · UI/UX. Custom design, no templates.

## Стек

- HTML, CSS, JavaScript без фреймворков
- [Eleventy](https://www.11ty.dev/) собирает общие части (header, footer, карточки) и языковые версии
- Из одного кода собираются два сайта:
  - **основной** (`npm run build`): English + Español, часы Europe/Madrid, без CV;
  - **русский** (`npm run build:ru`, папка `_site_ru/`): без упоминания Испании и часов, с кнопкой резюме, свой порядок кейсов.
- GitHub Pages, сборка и публикация через GitHub Actions (`.github/workflows/deploy.yml`)
- Шрифты Playfair Display, Manrope, IBM Plex Mono хранятся локально (latin + cyrillic)

## Структура

```
src/
  _data/          site.js (настройки двух сайтов), casesAll.json (кейсы: на каком сайте и в каком порядке),
                  i18n/en.json, es.json, ru.json (тексты; es.json черновик, нужна вычитка носителем)
  _includes/      layouts/base.njk, partials/header, footer, card
  pages/          home, work, case, studio, contact (каждая собирается на всех языках)
  assets/css/     tokens.css (дизайн-токены), base.css, components.css, fonts.css
  assets/js/      main.js (меню, фильтры, часы Europe/Madrid, форма, события аналитики)
```

## Как работать

```bash
npm install
npm start          # локальный сервер с автообновлением
npm run build      # сборка в _site/
```

- Тексты интерфейса: `src/_data/i18n/en.json` и `ru.json`.
- Новый кейс: добавить объект в `src/_data/casesAll.json` (поля `sites` и `order`), страницы на всех языках появятся сами.
- Испанские тексты в `i18n/es.json` пока черновик: перед запуском их вычитывает носитель языка.
- Форма: вписать ключ Web3Forms в `site.js → formAccessKey`, форма появится на странице Contact.
- CV: положить PDF в `src/assets/cv/` и указать путь в `site.js → cvFile (только русский сайт)`.

## Публикация

Push в `main` запускает сборку и публикацию. В настройках репозитория: Settings → Pages → Source: **GitHub Actions**.
После подключения своего домена поменять `PATH_PREFIX` в workflow на `/`.
