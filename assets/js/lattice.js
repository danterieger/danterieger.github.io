// Interactive re-entrant honeycomb (auxetic) lattice for the homepage hero.
// Geometry: each bow-tie cell has horizontal ribs of half-length A and inclined ribs of length L
// at angle phi from vertical. Stretching straightens the inclined ribs (phi falls), which makes
// the lattice grow in BOTH directions: a negative Poisson's ratio.
(function () {
  const root = document.querySelector("[data-lattice]");
  if (!root) return;

  const svg = root.querySelector("svg");
  const path = root.querySelector(".lattice-path");
  const cell = root.querySelector(".lattice-cell");
  const range = root.querySelector("input[type=range]");
  const out = root.querySelector("output");
  const stage = root.querySelector(".lattice-stage");

  const A = 0.9, L = 1, PHI_REST = 40, PHI_PULLED = 8, SCALE = 58;
  const W = 480, H = 400, CX = W / 2, CY = H / 2;
  const rad = (d) => (d * Math.PI) / 180;

  function dims(t) {
    const phi = rad(PHI_REST + (PHI_PULLED - PHI_REST) * t);
    const d = L * Math.sin(phi);
    const h = L * Math.cos(phi);
    return { d, h, px: 2 * A - d, py: 2 * h };
  }
  const rest = dims(0);

  function cellPath(x, y, d, h) {
    const p = (dx, dy) => `${(x + dx * SCALE).toFixed(1)},${(y + dy * SCALE).toFixed(1)}`;
    return `M${p(-A, h)}L${p(A, h)}L${p(A - d, 0)}L${p(A, -h)}L${p(-A, -h)}L${p(-A + d, 0)}Z`;
  }

  function draw(value) {
    const t = value / 100;
    const { d, h, px, py } = dims(t);
    let s = "";
    for (let i = -6; i <= 6; i++) {
      for (let j = -5; j <= 5; j++) {
        const x = CX + i * px * SCALE;
        const y = CY + (j * py + (Math.abs(i) % 2 ? h : 0)) * SCALE;
        s += cellPath(x, y, d, h);
      }
    }
    path.setAttribute("d", s);
    cell.setAttribute("d", cellPath(CX, CY, d, h));
    const wPct = Math.round((px / rest.px - 1) * 100);
    const hPct = Math.round((py / rest.py - 1) * 100);
    out.value = value == 0
      ? "At rest. Pull it to the right."
      : `Pulled sideways: ${wPct}% wider and ${hPct}% taller.`;
  }

  range.addEventListener("input", () => draw(+range.value));

  // Drag directly on the lattice.
  let startX = 0, startVal = 0, dragging = false;
  stage.addEventListener("pointerdown", (e) => {
    dragging = true; startX = e.clientX; startVal = +range.value;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const w = stage.getBoundingClientRect().width;
    const v = Math.max(0, Math.min(100, startVal + ((e.clientX - startX) / w) * 160));
    range.value = Math.round(v);
    draw(+range.value);
  });
  const end = () => { dragging = false; };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);

  draw(+range.value);

  // One orchestrated moment on load: a single gentle pull and release.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    const target = 55, settle = 18, dur = 1800, t0 = performance.now() + 500;
    const ease = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
    function step(now) {
      if (dragging) return;
      const x = Math.min(1, Math.max(0, (now - t0) / dur));
      const v = x < 0.5 ? target * ease(x * 2) : target + (settle - target) * ease((x - 0.5) * 2);
      range.value = Math.round(v);
      draw(+range.value);
      if (x < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  } else {
    range.value = 18; draw(18);
  }
})();
