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

  // Headings, rows, cards and photos in the other sections rise in as they arrive.
  // Siblings in the same group are staggered so a list builds up rather than appearing at once.
  const groups = [
    ".section-head h2", ".capabilities > li", ".index-list > li", ".timeline > li",
    ".edu-text > *", ".edu-photos > img", ".certs > h2", ".cert-group", ".project-list > li", ".projects-head > *"
  ];
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in-view");
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  groups.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (el.closest(".intro, .chapter")) return;
      const i = [...el.parentElement.children].filter((c) => c.matches(sel)).indexOf(el);
      el.style.setProperty("--d", Math.min(i, 5) * 0.09 + "s");
      el.classList.add("reveal");
      revealIO.observe(el);
    });
  });

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
    // Screen readers get the final figure; only the visible digits animate.
    const real = document.createElement("span");
    real.className = "sr-only";
    real.textContent = el.textContent;
    el.after(real);
    el.setAttribute("aria-hidden", "true");
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
