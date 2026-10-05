// Nova Cash · Aplica el tema antes del primer render para evitar parpadeo (Cap. 3.24 / R-02).
// Archivo propio (no script en línea) para permitir una CSP estricta sin hashes (R-18).
(function () {
  try {
    var saved = JSON.parse(localStorage.getItem('nova-theme') || 'null');
    var theme = saved && saved.state && saved.state.theme;
    if (!theme) theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {
    // Sin almacenamiento disponible: se usa el tema claro.
  }
})();
