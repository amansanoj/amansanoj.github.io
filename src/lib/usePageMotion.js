import { useEffect } from 'react';
export function usePageMotion() {
 useEffect(() => {
 const root = document.querySelector('.site-shell');
 if (!root) return;
 const controller = new AbortController();
 const on = (target, type, callback, options = {}) => target.addEventListener(type, callback, { ...options, signal: controller.signal });
 let entranceObserver;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
// Animate content units individually; nested links and icons travel with their
// parent so their movement never compounds.
const motionSelector = [
  '.home', 'nav a', '.theme-toggle', 'main h1', 'main h2', 'main h3', 'main p',
  '.links a', '.project-heading', '.screenshot', 'main li',
  '.other-projects > a', '.blog-intro > *',
  '.post-cover', '.post-body > *', 'footer > *'
].join(', ');
// Keep one motion layer per content unit, including future Markdown elements.
const candidates = [...root.querySelectorAll(motionSelector)];
const revealElements = candidates.filter(element =>
  !candidates.some(parent => parent !== element && parent.contains(element))
);
const animations = new Set();

// Never fade content that has already been visible. Only prepare elements
// below the viewport, then start their entrance just before they scroll in.
const pendingReveals = new Set();
function showPending() {
  pendingReveals.forEach(element => { element.style.opacity = ''; });
  pendingReveals.clear();
}
if ('IntersectionObserver' in window && finePointer.matches && !reducedMotion.matches) {
  const observer = entranceObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (!pendingReveals.delete(entry.target)) continue;
      entry.target.style.opacity = '';
      if (reducedMotion.matches || !finePointer.matches) continue;
      const image = entry.target instanceof HTMLImageElement;
      // A late-loading image should appear normally instead of finishing its
      // entrance before any pixels have arrived.
      if (image && (!entry.target.complete || !entry.target.naturalWidth)) continue;
      const keyframes = image ? [
        { opacity: 0, filter: 'blur(4px)', transform: 'translateY(4px)' },
        { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' }
      ] : [
        { opacity: 0, transform: 'translateY(5px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ];
      const animation = entry.target.animate(keyframes,
        { duration: image ? 500 : 450, easing: 'cubic-bezier(.22,1,.36,1)' });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    }
  }, { threshold: 0, rootMargin: '0px 0px 40px 0px' });
  // Give images their own layer; do not fade or blur a parent at the same time.
  const entranceElements = [
    ...revealElements.filter(element => !element.matches('img') && !element.querySelector('img')),

  ];
  for (const element of entranceElements) {
    if (element.closest('.image-entrance') || element.getBoundingClientRect().top < innerHeight + 40) continue;
    element.style.opacity = '0';
    pendingReveals.add(element);
    observer.observe(element);
  }
  on(window, 'pageshow', event => { if (event.persisted) showPending(); });
}

// Separate CSS translate from entrance transforms. Measure the resting bounds
// so moving an element never moves its own attraction point.
const magnets = [...revealElements].map(element => ({ element, x: 0, y: 0, tx: 0, ty: 0 }));
let frame = 0;
let lastTime = 0;
const enabled = () => finePointer.matches && !reducedMotion.matches;
function tick(time) {
  const blend = 1 - Math.exp(-Math.min(time - lastTime || 16, 40) / 85);
  lastTime = time;
  let moving = false;
  for (const item of magnets) {
    item.x += (item.tx - item.x) * blend;
    item.y += (item.ty - item.y) * blend;
    if (Math.abs(item.tx - item.x) + Math.abs(item.ty - item.y) < 0.03) {
      item.x = item.tx;
      item.y = item.ty;
    } else moving = true;
    item.element.style.translate = item.x || item.y ? `${item.x}px ${item.y}px` : '';
  }
  frame = moving ? requestAnimationFrame(tick) : 0;
}
function schedule() {
  if (!frame) { lastTime = 0; frame = requestAnimationFrame(tick); }
}
function release() {
  magnets.forEach(item => { item.tx = item.ty = 0; });
  schedule();
}
on(document, 'pointermove', event => {
  if (!enabled() || event.pointerType !== 'mouse' || event.buttons) return;
  for (const item of magnets) {
    const rect = item.element.getBoundingClientRect();
    const left = rect.left - item.x;
    const top = rect.top - item.y;
    const dx = event.clientX - (left + rect.width / 2);
    const dy = event.clientY - (top + rect.height / 2);
    const distance = Math.hypot(Math.max(0, Math.abs(dx) - rect.width / 2), Math.max(0, Math.abs(dy) - rect.height / 2));
    const pull = Math.max(0, 1 - distance / 100);
    const focused = item.element.matches(':focus-within');
    const chrome = Boolean(item.element.closest('header, footer'));
    // Large text blocks should drift as little as a compact navigation link.
    const x = chrome ? dx * 0.035 : dx / Math.max(rect.width / 2, 80) * 2.5;
    const y = chrome ? dy * 0.045 : dy / Math.max(rect.height / 2, 60) * 1.8;
    const maxX = chrome ? 7 : 2.5;
    const maxY = chrome ? 5 : 1.8;
    item.tx = focused ? 0 : Math.max(-maxX, Math.min(maxX, x)) * pull;
    item.ty = focused ? 0 : Math.max(-maxY, Math.min(maxY, y)) * pull;
  }
  schedule();
}, { passive: true });
on(document.documentElement, 'pointerleave', release);
on(document, 'pointerdown', release);
on(document, 'focusin', release);
on(window, 'scroll', release, { passive: true });
on(window, 'blur', release);
function resetMotion() {
  cancelAnimationFrame(frame);
  frame = 0;
  magnets.forEach(item => {
    item.x = item.y = item.tx = item.ty = 0;
    item.element.style.translate = '';
  });
  if (reducedMotion.matches || !finePointer.matches) {
    showPending();
    animations.forEach(animation => animation.cancel());
    animations.clear();
  }
}
on(reducedMotion, 'change', resetMotion);
on(finePointer, 'change', resetMotion);
on(document, 'visibilitychange', () => { if (document.hidden) resetMotion(); });


 return () => { controller.abort(); entranceObserver?.disconnect(); showPending(); resetMotion(); animations.forEach(animation => animation.cancel()); };
 }, []);
}
