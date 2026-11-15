// Builds sector filter buttons from the data-sectors on each project and filters the list.
(function () {
  const list = document.querySelector("[data-projects]");
  const bar = document.querySelector("[data-filters]");
  const status = document.querySelector("[data-filter-status]");
  if (!list || !bar) return;

  const items = [...list.querySelectorAll(".project")];
  const sectorsOf = (el) => el.dataset.sectors.split(",").map((s) => s.trim()).filter(Boolean);

  const counts = new Map();
  items.forEach((el) => sectorsOf(el).forEach((s) => counts.set(s, (counts.get(s) || 0) + 1)));
  const sectors = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b));

  const sectorColour = {
    "Mechanical design": "var(--c-mech)", "Research & simulation": "var(--c-mech)",
    "Manufacturing": "var(--c-mfg)", "Lean & continuous improvement": "var(--c-mfg)",
    "Project management": "var(--c-pm)",
    "Product implementation": "var(--c-elec)", "Electrical & controls": "var(--c-elec)", "Product design": "var(--c-elec)",
  };

  // Colour the sector names under each project to match the homepage colour code.
  items.forEach((el) => {
    const line = el.querySelector(".sectors");
    if (!line) return;
    line.innerHTML = sectorsOf(el)
      .map((s) => `<span class="sector-tag" style="--sector: ${sectorColour[s] || "var(--graphite)"}">${s.replace(/&/g, "&amp;")}</span>`)
      .join("");
  });

  function makeButton(label, value, n) {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.value = value;
    b.setAttribute("aria-pressed", value === "" ? "true" : "false");
    if (value) b.style.setProperty("--sector", sectorColour[value] || "var(--graphite)");
    b.innerHTML = `${value ? '<span class="chip" aria-hidden="true"></span>' : ""}${label} <span class="count">${n}</span>`;
    b.addEventListener("click", () => apply(value));
    li.appendChild(b);
    bar.appendChild(li);
  }

  makeButton("All", "", items.length);
  sectors.forEach((s) => makeButton(s, s, counts.get(s)));

  function apply(value) {
    bar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === value)));
    let shown = 0;
    items.forEach((el) => {
      const match = value === "" || sectorsOf(el).includes(value);
      el.hidden = !match;
      if (match) shown++;
    });
    status.hidden = value === "";
    status.textContent = value === "" ? "" : `Showing ${shown} ${shown === 1 ? "project" : "projects"} in ${value}.`;
    const url = new URL(location.href);
    if (value) url.searchParams.set("sector", value); else url.searchParams.delete("sector");
    history.replaceState(null, "", url);
  }

  const initial = new URL(location.href).searchParams.get("sector");
  if (initial && counts.has(initial)) apply(initial);
})();
