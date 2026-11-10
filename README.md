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
After changing posts during development, restart `bun run dev` to regenerate content.

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
System, Light, and Dark preferences are saved locally, with a synchronous theme
initializer to avoid a theme flash. Icons use Phosphor duotone.

Magic UI components are installed as React source from upstream commit
`1ac985adca3cdfab9b1739253fd14209687c4e9c` in `src/components/magicui/`:
Highlighter, Blur Fade, Progressive Blur, Scroll Progress, and Animated Theme Toggler. Their MIT license
is retained in `public/assets/vendor/magicui-LICENSE.md`. Local adjustments keep
our token colors, multiline highlights, article-based reading progress, and
non-replaying resize behavior. Image blur uses inline wrappers so Markdown
paragraphs remain valid HTML. No Lens component is included.

Touch and reduced-motion users get immediate image display. Visible content
never disappears to start an entrance. The subtle cursor motion, image dialog,
reading-progress bar, bottom blur, and 404 paddle game are retained.

## Deployment

The Action uses Bun with its frozen lockfile, checks TypeScript, builds with Vite,
and prerenders `/`, `/blog/`, each post, and `404.html` before deploying `dist/`.
GitHub Pages must use **GitHub Actions** as its deployment source.
Posts remain readable without JavaScript, and social crawlers receive per-page
metadata. Public files include `CNAME`, `.nojekyll`, `.well-known/`, and the Google
verification file. Preserve these when changing domains or deployment settings.

Browser regression tests: run `bunx playwright install chromium`, then `bun run test:e2e` against a production build. Tests cover theme persistence, hydration, image zoom, post routes, highlights, and the 404 game.

The theme control uses a top-to-bottom View Transition only when the resolved theme changes. Reduced motion and unsupported browsers switch instantly; System mode still follows the operating system.

Content images and covers use Magic UI Backlight with a 20px blur and 22% glow intensity. The source image stays crisp; list thumbnails and the zoom dialog do not receive a glow.
