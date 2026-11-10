import { useEffect, useRef, useState } from 'react';
import { DesktopIcon, SunIcon, MoonIcon } from '@phosphor-icons/react';
import { AnimatedThemeToggler } from './magicui/animated-theme-toggler';
const modes = ['system', 'light', 'dark'] as const;
type Mode = typeof modes[number];
function applyTheme(mode: Mode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.classList.toggle('dark', mode === 'dark' ||
    (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches));
}
export function ThemeControl() {
  const [mode, setMode] = useState<Mode>('system');
  const preference = useRef<Mode>('system');
  useEffect(() => {
    const saved = document.documentElement.dataset.theme as Mode;
    preference.current = modes.includes(saved) ? saved : 'system';
    setMode(preference.current);
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (preference.current === 'system') applyTheme('system'); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  const next = modes[(modes.indexOf(mode) + 1) % modes.length];
  const label = `Theme: ${mode}. Switch to ${next}`;
  return <AnimatedThemeToggler className="theme-toggle" id="theme" aria-label={label} title={label}
    shouldAnimate={() => {
      const nextIsDark = next === 'dark' || (next === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
      return nextIsDark !== document.documentElement.classList.contains('dark');
    }} onToggle={() => {
      preference.current = next;
      try { localStorage.setItem('theme', next); } catch {}
      applyTheme(next);
      setMode(next);
    }}>
    <span className="theme-icon theme-system"><DesktopIcon className="icon" weight="duotone" /></span>
    <span className="theme-icon theme-light"><SunIcon className="icon" weight="duotone" /></span>
    <span className="theme-icon theme-dark"><MoonIcon className="icon" weight="duotone" /></span>
  </AnimatedThemeToggler>;
}
