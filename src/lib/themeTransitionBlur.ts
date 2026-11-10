// Backdrop filters need a live backdrop. Root snapshots alone lose the blur.
// Give each existing layer a transition group that filters the moving snapshots.
export function preserveTransitionBlur() {
  const edge = document.querySelector<HTMLElement>('.bottom-blur');
  if (!edge || getComputedStyle(edge).display === 'none' || Number(getComputedStyle(edge).opacity) === 0) return () => {};
  const height = edge.getBoundingClientRect().height;
  const stylesheet = document.createElement('style');
  const restore: Array<() => void> = [];
  const rules: string[] = [];
  for (const [index, layer] of [...edge.children].entries()) {
    if (!(layer instanceof HTMLElement)) continue;
    const style = getComputedStyle(layer);
    const filter = style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter');
    const mask = style.maskImage || style.getPropertyValue('-webkit-mask-image');
    const name = `theme-edge-blur-${index}`;
    const previous = layer.style.getPropertyValue('view-transition-name');
    layer.style.setProperty('view-transition-name', name);
    restore.push(() => previous ? layer.style.setProperty('view-transition-name', previous) : layer.style.removeProperty('view-transition-name'));
    rules.push(`
      html[data-magicui-theme-vt="active"]::view-transition-group(${name}) {
        position: fixed; inset: auto 0 0; width: 100%; height: ${height}px;
        transform: none; animation: none; z-index: ${10 + index};
        backdrop-filter: ${filter}; -webkit-backdrop-filter: ${filter};
        mask-image: ${mask}; -webkit-mask-image: ${mask};
        pointer-events: none;
      }
      html[data-magicui-theme-vt="active"]::view-transition-image-pair(${name}) {
        display: none;
      }
    `);
  }
  stylesheet.textContent = rules.join('\n');
  document.head.append(stylesheet);
  return () => { restore.forEach(reset => reset()); stylesheet.remove(); };
}
