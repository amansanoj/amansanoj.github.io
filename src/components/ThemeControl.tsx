import { useEffect, useRef, useState } from 'react';
import { SunIcon, MoonIcon } from '@phosphor-icons/react';
import { AnimatedThemeToggler } from './magicui/animated-theme-toggler';
type Preference = 'system' | 'light' | 'dark';
function applyTheme(dark: boolean) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', dark);
}
export function ThemeControl() {
  const [dark, setDark] = useState(false);
  const preference = useRef<Preference>('system');
  useEffect(() => {
    preference.current = (document.documentElement.dataset.themePreference || 'system') as Preference;
    setDark(document.documentElement.classList.contains('dark'));
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (preference.current !== 'system') return;
      applyTheme(media.matches);
      setDark(media.matches);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  const label = `Theme: ${dark ? 'dark' : 'light'}. Switch to ${dark ? 'light' : 'dark'}`;
  return <AnimatedThemeToggler className="theme-toggle" id="theme" aria-label={label} title={label}
    shouldAnimate onToggle={() => {
      const nextDark = !document.documentElement.classList.contains('dark');
      const next = nextDark ? 'dark' : 'light';
      preference.current = next;
      document.documentElement.dataset.themePreference = next;
      try { localStorage.setItem('theme', next); } catch {}
      applyTheme(nextDark);
      setDark(nextDark);
    }}>
    <span className="theme-icon theme-light"><SunIcon className="icon" weight="duotone" /></span>
    <span className="theme-icon theme-dark"><MoonIcon className="icon" weight="duotone" /></span>
  </AnimatedThemeToggler>;
}
