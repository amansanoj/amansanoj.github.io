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
    const button = document.getElementById('theme');
    const modes = ['system', 'light', 'dark'];
    function label() {
      const next = modes[(modes.indexOf(preference) + 1) % modes.length];
      const text = `Theme: ${preference}. Switch to ${next}`;
      button.setAttribute('aria-label', text);
      button.title = text;
    }
    label();
    button.addEventListener('click', () => {
      preference = modes[(modes.indexOf(preference) + 1) % modes.length];
      try { localStorage.setItem('theme', preference); } catch {}
      apply();
      label();
    });
  });
})();
