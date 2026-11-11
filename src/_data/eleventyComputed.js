// Короткий доступ к переводам интерфейса: {{ t.nav.work }}
export default {
  t: (data) => (data.i18n && data.lang ? data.i18n[data.lang] : {}),
};
