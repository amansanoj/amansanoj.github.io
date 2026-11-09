# Personal Website

Static portfolio at https://amansanoj.is-a.dev/, hosted on GitHub Pages.

## Development

Run `python3 -m http.server 8000` from this directory and open the site locally.
No package installation is required. Content lives in `index.html`, styling in
`styles.css`, and certificate loading in `site.js`.

## Certificates

Add images to `assets/certificates/` and run `node generate-certs-json.js`.
The existing GitHub workflow regenerates the list on pushes to `master`.

## Deployment

Push changes to `master` for the existing GitHub Pages deployment.
Preserve `CNAME`, `.nojekyll`, `.well-known/`, and Google verification files.
Project screenshot: Macro Pad, from amansanoj/macro-pad.

## Design Dependencies

Colors, fonts, and radius tokens come from the published `@amansanoj/brand` CSS in `assets/vendor/brand-globals.css`. Keep that file unmodified when upgrading. Theme preference is stored locally; System follows the device setting. The package CSS loads its font families from Google Fonts.

Icons are Phosphor duotone SVGs. Package versions, registry URLs, and verified SHA-512 integrity values are recorded in `assets/vendor/sources.json`; the Phosphor license is included alongside the assets.
