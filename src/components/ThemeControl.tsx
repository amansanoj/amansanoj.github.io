import { useEffect, useState } from 'react';
import { DesktopIcon, SunIcon, MoonIcon } from '@phosphor-icons/react';
const modes = ['system','light','dark'] as const;
type Mode = typeof modes[number];
export function ThemeControl() {
  const [mode,setMode] = useState<Mode>('system');
  useEffect(() => { const saved = document.documentElement.dataset.theme; if (modes.includes(saved as Mode)) setMode(saved as Mode); }, []);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { document.documentElement.classList.toggle('dark',mode==='dark'||(mode==='system'&&media.matches)); document.documentElement.dataset.theme=mode; };
    // The synchronous theme-init script owns the initial paint.
    const initial = document.documentElement.dataset.theme;
    if (initial !== mode && mode === 'system') return;
    apply(); media.addEventListener('change',apply); return () => media.removeEventListener('change',apply);
  }, [mode]);
  const next = modes[(modes.indexOf(mode)+1)%3];
  const label = `Theme: ${mode}. Switch to ${next}`;
  return <button className="theme-toggle" id="theme" type="button" aria-label={label} title={label} onClick={()=>{try{localStorage.setItem('theme',next)}catch{} setMode(next); document.documentElement.dataset.theme=next; document.documentElement.classList.toggle('dark',next==='dark'||(next==='system'&&matchMedia('(prefers-color-scheme: dark)').matches));}}>
    <span className="theme-icon theme-system"><DesktopIcon className="icon" weight="duotone" /></span><span className="theme-icon theme-light"><SunIcon className="icon" weight="duotone" /></span><span className="theme-icon theme-dark"><MoonIcon className="icon" weight="duotone" /></span>
  </button>;
}
