export function initGame(root) {
  const controller = new AbortController();
  const on = (target, type, listener, options = {}) => target.addEventListener(type, listener, { ...options, signal: controller.signal });
  const panel = root;
  const court = root.querySelector('#game-court');
  const ball = root.querySelector('#game-ball');
  const paddle = root.querySelector('#game-paddle');
  const button = root.querySelector('#game-start');
  const status = root.querySelector('#game-status');
  let x = 320, y = 150, vx = 115, vy = 175, px = 268;
  let score = 0, running = false, over = false, frame = 0, previous = 0;
  const keys = new Set();
  function draw() {
    ball.setAttribute('cx', x);
    ball.setAttribute('cy', y);
    paddle.setAttribute('x', px);
  }
  function move(value) { px = Math.max(8, Math.min(528, value)); draw(); }
  function pause() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(frame);
    keys.clear();
    button.textContent = 'Resume';
    status.textContent = `Paused. Score: ${score}`;
  }
  function tick(time) {
    if (!running) return;
    const dt = Math.min((time - previous) / 1000 || 0, 0.025);
    previous = time;
    if (keys.has('ArrowLeft')) move(px - 360 * dt);
    if (keys.has('ArrowRight')) move(px + 360 * dt);
    const oldY = y;
    x += vx * dt; y += vy * dt;
    if (x < 15 || x > 625) { x = Math.max(15, Math.min(625, x)); vx = -vx; }
    if (y < 15) { y = 15; vy = Math.abs(vy); }
    if (vy > 0 && oldY + 7 <= 286 && y + 7 >= 286 && x + 7 >= px && x - 7 <= px + 104) {
      y = 279;
      const offset = Math.max(-1, Math.min(1, (x - px - 52) / 52));
      vx = offset * 220;
      vy = -Math.min(330, 185 + score * 9);
      score++;
      status.textContent = `Score: ${score}`;
    }
    if (y > 327) {
      running = false; over = true; keys.clear();
      button.textContent = 'Play Again';
      status.textContent = `Game over. Score: ${score}`;
      return;
    }
    draw();
    frame = requestAnimationFrame(tick);
  }
  on(button, 'click', () => {
    if (running) { pause(); return; }
    if (over) {
      x = 320; y = 150; vx = 115; vy = 175; px = 268; score = 0; over = false;
    }
    running = true; previous = 0;
    button.textContent = 'Pause';
    status.textContent = `Score: ${score}`;
    draw(); court.focus({ preventScroll: true });
    frame = requestAnimationFrame(tick);
  });
  on(court, 'pointermove', event => {
    if (event.pointerType !== 'mouse' && !court.hasPointerCapture(event.pointerId)) return;
    const bounds = court.getBoundingClientRect();
    move((event.clientX - bounds.left) / bounds.width * 640 - 52);
  });
  on(court, 'pointerdown', event => {
    court.setPointerCapture(event.pointerId);
    court.focus({ preventScroll: true });
    const bounds = court.getBoundingClientRect();
    move((event.clientX - bounds.left) / bounds.width * 640 - 52);
  });
  on(court, 'keydown', event => {
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault(); keys.add(event.key);
      if (!running) move(px + (event.key === 'ArrowLeft' ? -20 : 20));
    }
    if (event.key === 'Escape') pause();
  });
  on(court, 'keyup', event => keys.delete(event.key));
  on(court, 'blur', () => keys.clear());
  on(panel, 'toggle', () => { if (!panel.open) pause(); });
  on(window, 'blur', pause);
  on(document, 'visibilitychange', () => { if (document.hidden) pause(); });
  return () => { pause(); controller.abort(); };
}
