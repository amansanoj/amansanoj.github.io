// Apply the saved theme before styles render to avoid a theme flash.
(() => {
  const media = matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try { preference = localStorage.getItem('theme') || 'system'; } catch {}
  if (!['system', 'light', 'dark'].includes(preference)) preference = 'system';
  function apply() {
    document.documentElement.classList.toggle('dark', preference === 'dark' || (preference === 'system' && media.matches));
    document.documentElement.dataset.theme = preference;
  }
  apply();
  media.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('theme');
    select.value = preference;
    select.addEventListener('change', () => {
      preference = select.value;
      try { localStorage.setItem('theme', preference); } catch {}
      apply();
    });
  });
})();
