# danterieger.github.io

Personal website of Dante Rieger, mechatronics engineer. Live at **https://danterieger.github.io**.

Plain HTML and CSS, no build step. GitHub Pages serves the `main` branch.

## Structure

```
index.html                     Home: hero, what I do, selected work, experience, contact
projects/index.html            All projects, filterable by sector
projects/<project>.html        One case study per major project
assets/css/site.css            All styles and design tokens
assets/js/lattice.js           Interactive auxetic lattice in the hero
assets/js/projects.js          Builds the sector filters on the projects page
assets/img/projects/<project>/ Images for each project (keep each under ~1 MB)
```

## Adding a project

1. Copy a `<li class="project">` block in `projects/index.html`.
2. Set `data-sectors` to one or more sectors, comma-separated. Filter buttons appear automatically for any new sector (for example `Electrical & controls` or `Software & integration`).
3. For a full case study, copy `projects/uav-vibration-damper.html`, rename it, and link to it.
4. Put images in `assets/img/projects/<project-name>/`. Large CAD/STL files stay out of the repo.
