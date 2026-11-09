# Personal Website

Static portfolio at https://amansanoj.is-a.dev/, hosted on GitHub Pages.

## Development

Run `python3 -m http.server 8000` from this directory and open the site locally.
The portfolio needs no package installation; blog rendering uses Python Markdown. Content lives in `index.html`, styling in
`styles.css`, with theme selection in `theme.js` and the footer year in `site.js`.

## Deployment

Push changes to `master`; GitHub Actions builds and deploys the site to Pages.
Preserve `CNAME`, `.nojekyll`, `.well-known/`, and Google verification files.
Project screenshot: Macro Pad, from amansanoj/macro-pad.

## Design Dependencies

Colors, fonts, and radius tokens come from the published `@amansanoj/brand` CSS in `assets/vendor/brand-globals.css`. Keep that file unmodified when upgrading. Theme preference is stored locally; System follows the device setting. The package CSS loads its font families from Google Fonts.

Icons are Phosphor duotone SVGs. Package versions, registry URLs, and verified SHA-512 integrity values are recorded in `assets/vendor/sources.json`; the Phosphor license is included alongside the assets.

## Blog

Create a folder such as `posts/2026-11-09-macro-pad/` with a `README.md`:

```markdown
# Building the Macro Pad

Write your post here. Markdown headings, links, lists, fenced code blocks,
and tables are supported.

![The controller](controller.png)
```

Place images alongside that README and reference them with relative paths.
The folder date is the publication date; posts appear newest first. Use lowercase
letters, numbers, and hyphens in the slug. Remove the folder to remove a post.
There are no sample posts published on the site.

Preview locally:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/build_blog.py
python3 -m http.server 8000
```

Open `/blog/`. Re-run the renderer after editing a post. The Build and Deploy Site
Action renders Markdown and deploys the public files to GitHub Pages on each push
to `master`. It also supports manual runs. If GitHub blocks automatic Pages setup,
select **GitHub Actions** under **Settings → Pages → Build and Deployment → Source**.
Generated `blog/` files are build output; edit `posts/` instead.

Add `cover.jpg`, `cover.png`, or `cover.webp` beside a post’s README to show a cover on the post, a blog-list preview, and a social sharing image.

Every cover is also downscaled to one-quarter of its original width and height
as `thumbnail.webp` for the blog list, preserving its aspect ratio without padding,
and rendered as a 1200 × 630 `og.jpg` for social sharing. OG images are fitted without cropping,
centered, and padded with the brand’s dark-theme primary (`color.hex.dark.base.primary`).
EXIF orientation is applied before resizing. Upload only the original cover beside
`README.md` in `posts/`; the Action generates both variants on each deployment.

The bottom-edge progressive blur adapts Magic UI’s layered-mask technique
([source](https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/progressive-blur.tsx)).
Its MIT license is included in `assets/vendor/magicui-LICENSE.md`.
The effect is decorative, ignores pointer input, and hides around the footer,
keyboard focus, and the 404 game. Reduced-transparency preferences disable it.

Image entrances adapt Magic UI’s [Blur Fade](https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/blur-fade.tsx) using native animation. They run once for loaded images entering from below the viewport on desktop; touch, reduced motion, and already-visible images stay immediate.
