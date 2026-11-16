// Light, purposeful motion: name entrance, chapters easing in, numbers counting up.
// Everything is skipped for visitors who prefer reduced motion.
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  const root = document.documentElement;
  root.classList.add("js-motion");
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-loaded")));

  // Chapters ease in once.
  const chapterIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in-view");
      chapterIO.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".chapter").forEach((el) => chapterIO.observe(el));

  // Numbers count up once when they come into view.
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function countUp(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const dur = target > 50 ? 1400 : 900;
    const t0 = performance.now();
    function step(now) {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(target * ease(t)) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const numIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countUp(e.target);
      numIO.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => {
    el.textContent = "0" + (el.dataset.suffix || "");
    numIO.observe(el);
  });
})();


// Pause and play for the moving tools strip (motion longer than 5 seconds needs a control).
(function () {
  const btn = document.querySelector("[data-ticker-toggle]");
  const ticker = document.querySelector(".ticker");
  if (!btn || !ticker) return;
  btn.addEventListener("click", () => {
    const paused = ticker.classList.toggle("is-paused");
    btn.setAttribute("aria-pressed", String(paused));
    btn.textContent = paused ? "Play" : "Pause";
  });
})();
