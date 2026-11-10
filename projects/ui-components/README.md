# UI Components

A shared React component workspace built around my brand’s OKLCH design tokens. It includes a component package and a Vite playground for inspecting components during development.

## Shared Styling and Behavior

The package uses the brand’s color, typography, and radius variables rather than maintaining a separate palette for each application. Interactive components build on Base UI primitives.

The workspace separates the published package from the playground. That lets the package build and release independently of the application used to preview it.

## Build Boundaries

The package targets React 19 and produces ESM, CommonJS, type declarations, and compiled CSS. Its build preserves client-component boundaries for interactive controls such as dialogs and dropdown menus.

Presentational components, including cards and separators, are kept separate from controls that need client-side state and browser APIs. This matters when the library is consumed by applications using React Server Components.

## Releases

Changesets records versioned package changes, with a GitHub Action handling publication and provenance. The playground provides a place to inspect styling and interaction before a release.

The library currently covers eight component suites. The playground keeps their examples alongside the package so changes can be checked against the same tokens and build.
