# danterieger.github.io

Personal website of Dante Rieger, mechatronics engineer. Live at **https://danterieger.github.io**.

Plain HTML and CSS, no build step. GitHub Pages serves the `main` branch.

## Structure

```
index.html                     Home: intro and portrait, what I do, featured work,
                               all projects, experience, education and certifications, contact
projects/index.html            All projects, filterable by sector
404.html                       Page-not-found page (GitHub Pages serves it automatically)
robots.txt, sitemap.xml        Let search engines find every page; add new case studies to sitemap.xml
projects/<project>.html        One case study per major project
assets/css/site.css            All styles and design tokens
assets/js/lattice.js           Interactive lattice in the capstone section
assets/js/seams.js             Smooth, dithered colour transitions between sections
assets/js/motion.js            Name entrance, scroll reveals, count-ups and the ticker pause button
assets/js/projects.js          Builds the sector filters on the projects page
assets/img/me/                 Portrait, headshot and social-card.jpg (the LinkedIn link preview)
assets/img/education/          Graduation photos
assets/img/projects/<project>/ Images for each project (keep each under ~1 MB)
```

All motion respects the visitor's reduced-motion setting. When CSS or JS changes, bump the `?v=` number on the asset links so browsers fetch the new file.

## Adding a project

1. Copy a `<li class="project">` block in `projects/index.html`.
2. Set `data-sectors` to one or more sectors, comma-separated. Filter buttons appear automatically for any new sector (for example `Electrical & controls` or `Software & integration`).
3. For a full case study, copy `projects/dynamic-rescuer.html`, rename it, link to it, and add a matching write-up to the [projects repo](https://github.com/danterieger/projects).
4. Put images in `assets/img/projects/<project-name>/`. Large CAD/STL files stay out of the repo.
