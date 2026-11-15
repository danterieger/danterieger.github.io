// Renders each colour seam as a dithered, smoothly eased gradient on a canvas.
// CSS gradients band on large colour changes (8-bit steps + linear segments between stops).
// Here the colour follows a smooth spline in OKLab, eased so it leaves and joins the solid
// sections with zero slope, and every pixel gets a little triangular noise (dithering) so
// no step between shades is visible. Without JS, the CSS gradient fallback still shows.
(function () {
  const seams = [...document.querySelectorAll(".seam")];
  if (!seams.length || !window.HTMLCanvasElement) return;

  // sRGB <-> OKLab
  const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  function hexToOklab(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = toLin(((n >> 16) & 255) / 255), g = toLin(((n >> 8) & 255) / 255), b = toLin((n & 255) / 255);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
  }
  function oklabToRgb255([L, A, B]) {
    const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3);
    const m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3);
    const s = Math.pow(L - 0.0894841775 * A - 1.291485548 * B, 3);
    const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
    return [r, g, b].map((c) => 255 * toSrgb(Math.min(1, Math.max(0, c))));
  }

  // Centripetal-ish Catmull-Rom through the stops: smooth, no corners at the via colours.
  function spline(points, t) {
    const n = points.length - 1;
    if (n === 1) return points[0].map((v, i) => v + (points[1][i] - v) * t);
    const x = t * n, k = Math.min(n - 1, Math.floor(x)), u = x - k;
    const p0 = points[Math.max(0, k - 1)], p1 = points[k], p2 = points[k + 1], p3 = points[Math.min(n, k + 2)];
    return p1.map((_, i) => 0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * u + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * u * u + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * u * u * u));
  }
  // Ease with zero slope at both ends so the seam melts into the flat colours above and below.
  const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);

  function render(el) {
    const style = getComputedStyle(el);
    const from = (el.dataset.from || style.getPropertyValue("--from")).trim();
    const to = (el.dataset.to || style.getPropertyValue("--to")).trim();
    if (!from || !to) return;
    const via = (el.dataset.via || "").split(",").map((s) => s.trim()).filter(Boolean);
    const stops = [from, ...via, to].map(hexToOklab);

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const h = Math.max(2, Math.round(el.clientHeight * dpr));
    if (el._h === h) return;
    el._h = h;
    const w = 192;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let y = 0; y < h; y++) {
      const rgb = oklabToRgb255(spline(stops, ease(y / (h - 1))));
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        for (let i = 0; i < 3; i++) {
          const noise = Math.random() + Math.random() - 1; // triangular dither, about one shade
          d[o + i] = Math.max(0, Math.min(255, Math.round(rgb[i] + noise)));
        }
        d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    c.toBlob((blob) => {
      if (!blob) return;
      if (el._url) URL.revokeObjectURL(el._url);
      el._url = URL.createObjectURL(blob);
      el.style.backgroundImage = `url(${el._url})`;
      el.style.backgroundSize = `${w / dpr}px 100%`;
      el.style.backgroundRepeat = "repeat-x";
      el.classList.add("is-rendered");
    });
  }

  const renderAll = () => seams.forEach(render);
  renderAll();
  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(renderAll, 200); });
})();
