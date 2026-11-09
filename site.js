'use strict';
document.getElementById('year').textContent = new Date().getFullYear();

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
// Animate content units individually; nested links and icons travel with their
// parent so their movement never compounds.
const motionSelector = [
  '.home', 'nav a', '.intro h1', '.intro > p', '.links a',
  '.project-heading', '.featured > p', '.project > p', '.screenshot',
  'main h2', '.other-projects h3', '.other-projects li', '.other-projects > a',
  '#about > p', '#contact > p', 'footer > *'
].join(', ');
const revealElements = document.querySelectorAll(motionSelector);
const animations = new Set();

// Content stays visible if JavaScript or the observer is unavailable.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (reducedMotion.matches) continue;
      const animation = entry.target.animate([
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    }
  }, { threshold: 0.08 });
  revealElements.forEach(element => observer.observe(element));
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
document.addEventListener('pointermove', event => {
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
    item.tx = focused ? 0 : Math.max(-7, Math.min(7, dx * 0.035)) * pull;
    item.ty = focused ? 0 : Math.max(-5, Math.min(5, dy * 0.045)) * pull;
  }
  schedule();
}, { passive: true });
document.documentElement.addEventListener('pointerleave', release);
document.addEventListener('pointerdown', release);
document.addEventListener('focusin', release);
window.addEventListener('scroll', release, { passive: true });
window.addEventListener('blur', release);
function resetMotion() {
  cancelAnimationFrame(frame);
  frame = 0;
  magnets.forEach(item => {
    item.x = item.y = item.tx = item.ty = 0;
    item.element.style.translate = '';
  });
  if (reducedMotion.matches) {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  }
}
reducedMotion.addEventListener('change', resetMotion);
finePointer.addEventListener('change', resetMotion);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetMotion(); });
