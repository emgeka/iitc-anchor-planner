# IITC Anchor Planner

[English](README.md) | [Deutsch](README.de.md)

Anchor Planner is an IITC userscript for evaluating planned links from Draw
Tools and Auto Draw. It resolves link endpoints to portals, considers bookmarks
and currently loaded Intel links, and turns the result into actionable portal,
blocker, route, and key overviews.

## Current status

- Current version: **0.1.46**
- Development source: `src/iitc-anchor-planner.user.js`
- Published builds: `releases/`
- Userscript ID: `iitc-plugin-anchor-planner`
- IITC plugin ID: `anchor-planner`
- GitHub release: <https://github.com/emgeka/iitc-anchor-planner/releases/tag/v0.1.46>

## Features

- Reads Draw Tools lines, including Auto Draw plans, and merges duplicate
  segments.
- Resolves plan endpoints using loaded IITC portals and portal bookmarks;
  uncertain endpoints are diagnosed with coordinates and candidates.
- Detects existing planned links and calculates the remaining key demand per
  portal.
- Detects crossing links currently loaded in IITC as blockers and highlights
  them together with affected planned links and intersection points on the map.
- Prioritizes blocker endpoints by the number of unique blocking links and lets
  you add suitable endpoints to the shared work route.
- Provides a compact readiness check for unresolved endpoints, blockers,
  missing keys, missing names, and limited link coverage.
- Localizes the interface, status messages, diagnostics, dialogs, map hints,
  and text exports in German, English, Spanish, French, Italian, Japanese,
  Polish, Brazilian Portuguese, Russian, and Simplified Chinese. The language
  is detected automatically or can be selected permanently under
  **More → Language**.
- Keeps frequently used information and actions in a compact main view and
  groups less common scan, naming, export, sorting, deletion, and tolerance
  functions under **More**.
- Refreshes the names of already detected blocker portals when new IITC map
  data becomes available without closing expanded details.
- Filters portals by open, blocked, missing keys, and completed, and manages
  keys, order, and completion state.
- Dynamically selects the next target from open plan portals and selected
  blocker portals using the official IITC User Location plugin, with manual
  order as a fallback. With a valid location it also shows straight-line
  distance and an estimated remaining route.
- Optionally sorts the portal list once as an approximate straight-line route
  from the current IITC location.
- Offers Waze, Intel, Google Maps, Apple Maps, and geo navigation as well as
  sharing.
- Copies or downloads the plan and detailed blocker information as readable
  text or JSON.

## Requirements and data coverage

- IITC with the Draw Tools plugin enabled is required for scanning.
- Portal Bookmarks improve endpoint resolution but are optional.
- Location-based target selection exclusively uses the official IITC User
  Location plugin. Location data is neither stored permanently nor exported.
- Existing links and blockers can only be detected from `window.links`
  currently loaded in IITC. A blocker that is not shown is therefore not a
  definitive all-clear.

## Typical workflow

1. Create a link plan with Draw Tools or Auto Draw.
2. Load the relevant map area and select **Scan**.
3. Check unresolved endpoints. If necessary, zoom in, load the portals, and
   scan again or use **Load names**.
4. Review the readiness check and the compact **Blockers** section; add useful
   blocker endpoints to the work route when needed.
5. Check the automatically highlighted planned links, blocking links, and
   intersection points on the map, maintain keys and completed portals, and
   navigate to the next plan or blocker portal.
6. Export the plan as text or JSON when needed.

## Installation

Install the published `.user.js` file using a userscript manager or the
corresponding IITC plugin installation method:

<https://raw.githubusercontent.com/emgeka/iitc-anchor-planner/main/releases/iitc-anchor-planner.user.js>

An identical `.txt` build is included in the release for environments where
downloading a `.user.js` file is problematic.

The stable installation URL always points to the latest published version and
is intended as the source for the IITC Community Plugins catalog.

## Updates and Community Plugins

- Community ID: `anchor-planner@emgeka`
- Required plugin: `draw-tools@breunigs`
- Recommended plugin: `bookmarks@ZasoGD`
- Declared anti-features: `scraper` for automatically loading missing portal
  names and `export` for user-initiated plan exports

`scraper` follows the terminology used by the IITC Community Plugins catalog.
Anchor Planner only requests missing names for portals recognized in the
current plan through IITC's own portal detail functions. Requests run
sequentially after a scan or explicitly through **Load names**. The plugin does
not search external websites, permanently collect unrelated portal data, or
perform continuous background requests. Therefore, `highLoad` is not declared.

The `@updateURL` and `@downloadURL` metadata point to the stable release build.
Development changes under `src/` do not reach installed plugins until they
have been tested and published as a release.

## Support and contributions

Bug reports, translation corrections, and focused feature suggestions are
welcome in [GitHub Issues](https://github.com/emgeka/iitc-anchor-planner/issues).
If you would like to support development financially, a GitHub Sponsors option
is planned and will be linked here once it is publicly available.

## Development

The rules in `AGENTS.md` apply to the entire project. Functional changes are
first made only under `src/`. Identical `.user.js` and `.txt` release builds are
created only after successful practical tests with desktop IITC and IITC
Mobile. The stable files without a version number are then updated to the same
content.

Translations are maintained separately under `src/locales/*.json`. Every file
contains the same semantic keys and placeholders and provides its native name
under `language.name`. `node src/build-locales.mjs` validates all files and
bundles them into the single userscript; `node src/build-locales.mjs --check`
also verifies that the bundle is current. No language files are loaded from
the internet at runtime. English is the required fallback language.
