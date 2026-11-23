# Aisen Studio

Сайт-портфолио Tania Aisen: Brand & Web Designer · UI/UX. Custom design, no templates.

## Стек

- HTML, CSS, JavaScript без фреймворков
- [Eleventy](https://www.11ty.dev/) собирает общие части (header, footer, карточки) и языковые версии
- Из одного кода собираются два сайта:
  - **основной** (`npm run build`): English + Español, часы Europe/Madrid, без CV;
  - **русский** (`npm run build:ru`, папка `_site_ru/`): без упоминания Испании и часов, с кнопкой резюме, свой порядок кейсов.
- GitHub Pages, сборка и публикация через GitHub Actions (`.github/workflows/deploy.yml`)
- Шрифты хранятся локально (`src/assets/fonts/`, подключение в `fonts.css`):
  - логотип: AISEN в Cormorant SemiBold (заглавные, плотно), Studio в Great Vibes акцентным цветом (только латиница);
  - заголовки: Source Serif 4; текст: Manrope; подписи и метки: IBM Plex Mono (latin + cyrillic)

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

## Модульное портфолио (профили под вакансию)

Главная собирается в нескольких версиях из одного кода:

| Ссылка | Для каких вакансий | Кейсы |
|---|---|---|
| `/ru/`, `/en/` | общая (студия) | Cohorta, Duescape, LUMIA, Art Cook, Kün |
| `/ru/web/` | веб-дизайн, UI/UX | LUMIA, Art Cook, Cohorta, Kün |
| `/ru/product/` | продуктовый дизайн | Cohorta, Duescape, LUMIA |
| `/ru/brand/` | айдентика, графика | Art Cook, Kün |

- Меняются только модульные блоки: роль и интро в hero, три главных направления, набор кейсов (по годам, от новых к старым), первая вкладка экспертизы и статус внизу («Беру новые проекты» на общей, «Открыта к работе» в профилях). Студия, процесс, инструменты, контакты и страницы кейсов общие.
- Профили настраиваются в `src/_data/profiles.js`. Новый профиль: добавить ключ с `cases`, `tab`, `caps`, `copy`.
- Ссылка под компанию: `/ru/web/?for=MARTA` добавляет в hero строку «Портфолио для MARTA» и событие `portfolio_for` в аналитике.
- Если человек пришёл на профиль, логотип и меню со страниц кейсов ведут обратно в этот профиль.

## Блоки кейса (поля в casesAll.json)

- `beforeAfter`: слайдер до/после. `"frame": "browser"` рисует окно браузера, `labels` меняет подписи (например, Вайрфрейм / Дизайн), `baLabel` и `baLead` в `case.<lang>` меняют заголовок блока.
- `flashlight`: эффект фонарика, тёмная тема снизу, светлая под курсором. Пары картинок `dark` / `light` одного размера.
- `media`: короткое видео или гифка (`.mp4`, `.webm`, `.gif`, `.webp`), подписи `mediaLabel` / `mediaLead` в `case.<lang>`.
- Jewelry Visuals скрыт (`"sites": []`), вернуть: указать сайты снова.
- `draft: true`: кейс скрыт, пока нет картинок (сейчас так у Duescape). Посмотреть локально: `DRAFTS=1 npm start`.

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
