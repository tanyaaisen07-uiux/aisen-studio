// Два сайта из одного кода:
//   main (по умолчанию) — English + Español, международные клиенты и Испания
//   ru  (SITE=ru)       — отдельный русский сайт для Казахстана и русскоязычных команд
const variant = process.env.SITE === "ru" ? "ru" : "main";

const common = {
  name: "Aisen Studio",
  author: "Tania Aisen",
  timezone: "Europe/Madrid",
  formAccessKey: "",
  links: {
    linkedin: "https://www.linkedin.com/in/tania-aisen",
    behance: "https://www.behance.net/tanyaaisen",
    github: "https://github.com/tanyaaisen07-uiux"
  }
};

const variants = {
  main: {
    variant: "main",
    languages: ["en", "es"],
    defaultLang: "en",
    showClock: true,       // часы и подпись Spain в футере
    location: "Spain",
    cvFile: {},            // на основном сайте CV нет, его заменяет LinkedIn
    contacts: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/tania-aisen", external: true },
      { label: "Behance", href: "https://www.behance.net/tanyaaisen", external: true },
      { label: "GitHub", href: "https://github.com/tanyaaisen07-uiux", external: true }
    ]
  },
  ru: {
    variant: "ru",
    languages: ["ru"],
    defaultLang: "ru",
    showClock: false,      // на русском сайте без Испании и без часов
    location: "",
    cvFile: { ru: "" },    // путь к PDF резюме, например "/assets/cv/tania-aisen-cv-ru.pdf"
    // LinkedIn здесь не показываем: в профиле указана локация
    contacts: [
      { label: "WhatsApp +7 701 784 02 24", href: "https://wa.me/77017840224", external: true },
      { label: "Telegram @tanya_ai", href: "https://t.me/tanya_ai", external: true },
      { label: "Behance", href: "https://www.behance.net/tanyaaisen", external: true },
      { label: "GitHub", href: "https://github.com/tanyaaisen07-uiux", external: true }
    ]
  }
};

export default { ...common, ...variants[variant] };
