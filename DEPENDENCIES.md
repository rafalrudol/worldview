# Dependency and license audit

## Shipped runtime

No third-party packages, scripts, fonts, images, CDN resources or client runtime. HTML, CSS, public JSON and original PNG rasterizer/font only. Code and synthetic demo: MIT. All UI font stacks use fonts already installed on the reader's device; no font files are redistributed.

## Project toolchain packages

`package.json` has no dependencies or devDependencies; lockfile has only this root package. `npm ls --all` should report empty. Thus there are no direct or transitive npm licenses to permit or reject. No Astro/Vite/native image libraries were added specifically to avoid a larger mixed-license dependency tree.

GitHub workflow actions: checkout v4.2.2, setup-node v4.4.0, upload-artifact v4.6.2, all MIT repositories, pinned to commit SHAs. Their distributed action bundles and the GitHub-hosted runner are external CI platform tooling, not copied into the site or package lock. Their bundled/transitive notices include licenses beyond MIT/Apache; do not describe the entire platform stack as MIT-only.

## Baseline platform/toolchain caveat

Node.js is MIT at the top level, with bundled third-party libraries/notices (including BSD-style, ISC, Unicode/ICU and zlib terms). Git, the OS, browser used for manual validation, and hosting providers also have their own licenses/terms; they are not project dependencies or redistributed runtime assets. A literal requirement that every underlying build/hosting/browser component be MIT/Apache cannot be claimed satisfied. The project-added dependency tree is empty; acceptance of baseline/platform tooling must be explicit if the restriction is meant to cover that stack too.

## Data and hosting

Public live results require provider-output/IP review independent of software licensing. Demo contains only newly authored synthetic responses and two questions from the newly drafted Worldview set. No third-party benchmark content or private runner data is bundled. Hosting accounts are not configured and no production deployment is performed by CI.
