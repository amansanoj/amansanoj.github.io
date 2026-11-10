# Personal Website

Portfolio and Markdown blog built with Vite, React, and Bun. Deployed as prerendered
static HTML on GitHub Pages, with React hydrating the interactive components.

## Development

```sh
bun install --frozen-lockfile
bun run dev
```

```sh
bun run check
bun run build
bun run preview
bun run test
```

The portfolio content is in `src/components/Home.tsx`, React pages in `src/App.tsx`,
and styles in `src/styles.css`. Existing page URLs and the design are preserved.
After changing posts or projects during development, restart `bun run dev` to regenerate content.

## Publishing Posts

Create `posts/YYYY-MM-DD-post-slug/README.md`, starting with `# Post Title`.
Write Markdown below it. Images belong alongside the README, using relative paths.
Push to `master`; the GitHub Action builds and deploys the complete site.

Optional covers are named `cover.jpg`, `cover.png`, or `cover.webp`.
The Bun content builder uses Sharp to apply EXIF orientation and generate:

- A WebP thumbnail at one-quarter of the original width and height, without padding.
- A 1200 × 630 OG image with the complete image centered and remaining space filled
  using `color.hex.dark.base.primary` from the brand tokens.

The original cover opens in the image dialog. Generated content lives in
`src/generated/` and `public/blog/`, both ignored by Git. Do not edit `dist/`.

## Components and Design

Colors, fonts, and radius tokens come from `@amansanoj/brand` in
`public/assets/vendor/brand-globals.css`. No palette substitutions are applied.
Light and Dark preferences are saved locally, with a synchronous theme
initializer to avoid a theme flash. Icons use Phosphor duotone.

Magic UI components are installed as React source from upstream commit
`1ac985adca3cdfab9b1739253fd14209687c4e9c` in `src/components/magicui/`:
Highlighter, Blur Fade, Progressive Blur, Scroll Progress, Animated Theme Toggler, Backlight, and Lens. Their MIT license
is retained in `public/assets/vendor/magicui-LICENSE.md`. Local adjustments keep
our token colors, multiline highlights, article-based reading progress, and
non-replaying resize behavior. Image blur uses inline wrappers so Markdown
paragraphs remain valid HTML. The image dialog uses the supplied Magic UI Lens component unchanged.

Touch and reduced-motion users get immediate image display. Visible content
never disappears to start an entrance. The subtle cursor motion, image dialog,
reading-progress bar, bottom blur, and 404 paddle game are retained.

## Deployment

The Action uses Bun with its frozen lockfile, checks TypeScript, builds with Vite,
and prerenders `/`, `/blog/`, `/projects/`, each post and project, and `404.html` before deploying `dist/`.
GitHub Pages must use **GitHub Actions** as its deployment source.
Posts remain readable without JavaScript, and social crawlers receive per-page
metadata. Public files include `CNAME`, `.nojekyll`, `.well-known/`, and the Google
verification file. Preserve these when changing domains or deployment settings.

Browser regression tests: run `bunx playwright install chromium`, then `bun run test:e2e` against a production build. Tests cover theme persistence, hydration, image zoom, post routes, highlights, and the 404 game.

The theme control uses a top-to-bottom View Transition only when the resolved theme changes. Reduced motion and unsupported browsers switch instantly; First load follows the operating system; the control then switches between Light and Dark.

Content images and covers use Magic UI Backlight with a 20px blur and 22% glow intensity. The source image stays crisp; list thumbnails and the zoom dialog do not receive a glow.



Cursors are native, with `zoom-in` on clickable images. Magnification stays inside the image dialog.

## Publishing Projects

Each project lives in `projects/project-slug/README.md`, beginning with `# Project Title`.
Use Markdown for the overview, implementation details, and images. Optional `cover.jpg`,
`cover.png`, or `cover.webp` files receive the same thumbnail and OG variants as blog covers.

An optional `project.json` controls the directory order and project details:

```json
{
  "order": 1,
  "kind": "macOS App & Firmware",
  "stack": ["SwiftUI", "C++", "ESP32"],
  "links": [{"label": "GitHub", "url": "https://github.com/amansanoj/macro-pad"}]
}
```

`period` can provide a date range for older projects. Push changes to `master` to
publish `/projects/project-slug/`. Generated files in `public/projects/` are ignored.
The homepage contains three projects; `/projects/` contains all project entries.

## Cover Images

Blog and project covers use the same build pipeline and image viewer. Add a
`cover.jpg`, `cover.png`, or `cover.webp` alongside either README and push to
`master`. The site Action automatically detects the cover, generates the
quarter-size WebP thumbnail and 1200 × 630 OG image, and includes the sharing
metadata. Generated assets are deployed without being committed to the source.

New covers should be 4:5 portrait or 4:3 landscape. Directory thumbnails preserve
the original ratio. Detail-page covers are centered, fit the available width,
and are limited to 70% of the viewport height (up to 640px). Existing covers in
other proportions still render without cropping. Source image files are never
modified by the build. The full original opens in the image dialog.

## Brand Updates

The site vendors the CSS and JSON from `@amansanoj/brand`. Deployment runs
`bun scripts/sync-brand.ts` before building, checks the npm archive's SHA-512
integrity, and uses the latest stable release when it is newer than the local
copy. Both CSS and JSON update together; the site has no local palette overrides.

A daily scheduled build picks up published brand updates automatically. A push
or manual run of **Build and Deploy Site** also checks for a newer release.
Local development uses the checked-in copy without needing registry access.
