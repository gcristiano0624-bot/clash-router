# Clash Router Three-Theme UX Refactor Design

## Goal

Refactor the full primary UX of Clash Router using `clash-verge-three-themes.html` as the visual reference while keeping all existing app features clickable and functional.

## Scope

The refactor covers the main user flows:

- Dashboard / Home
- Proxies
- Profiles
- Connections
- Rules
- Logs
- Unlock
- Settings

The implementation must not replace real data or handlers with static mock UI. Existing API calls, route navigation, profile actions, proxy switching, mode switching, log filtering, connection controls, settings toggles, and update actions must continue to work.

## Recommended Approach

Use a shell-and-component adaptation strategy:

- Rebuild the global app shell around a compact dark sidebar, top action bar, and dense content surface.
- Add a three-theme token layer matching the HTML reference: macOS, Modern Dark, and Warm Magazine.
- Preserve existing React page components and data hooks.
- Adapt page containers and component styles so the current business UI visually follows the reference.
- Add only lightweight interaction wrappers when the reference introduces new UX affordances, such as theme swatches in the sidebar.

This approach avoids a static rewrite and keeps the app operational.

## Theme Model

The three UX themes are stored locally as `clash-router-ux-theme` and applied as classes on the root layout:

- `ux-theme-macos`
- `ux-theme-dark`
- `ux-theme-warm`

The existing app light/dark mode remains available for compatibility with current settings and MUI theme generation. The UX theme layer controls the shell color tokens, surface density, sidebar style, borders, and component visual treatment.

## Layout

The shell follows the HTML reference:

- Left sidebar: fixed compact width, dark brand surface, logo, app title, version, navigation, theme swatches, and traffic area.
- Main region: top bar derived from each page's existing `BasePage` title/header, plus dense scrollable content.
- Content surfaces: square-to-subtle radius cards, low shadow, dense spacing, strong state colors.

Right-click navigation customization, nav collapse, menu ordering, and route navigation remain unchanged.

## Page Adaptation

### Dashboard

Keep existing home cards and handlers. Restyle card surfaces, spacing, and typography to match the dense dashboard grid.

### Proxies

Keep `ProviderButton`, mode switching, chain mode, `ProxyGroups`, node selection, and delay interactions. Restyle the page as a two-pane strategy group and node list.

### Profiles

Keep all profile import, update, edit, activate, and delete behavior. Restyle profile rows as dense list items.

### Connections

Keep realtime connection data and close controls. Restyle as a compact table with sticky header and monospaced metrics.

### Rules

Keep rule data display and filtering behavior. Restyle rules as compact rows with type badges and proxy/hit metadata.

### Logs

Keep log stream, level filter, search, auto-scroll, and clear controls. Restyle toolbar and output as dense console UI.

### Unlock

Keep existing test cards and actions. Restyle as a compact capability grid.

### Settings

Keep all existing setting modules and error handling. Restyle setting sections as dense grouped rows while preserving each module's controls.

## Interaction Requirements

- Theme swatches must be clickable and persistent.
- Navigation items must remain clickable and draggable when reorder mode is unlocked.
- Page header actions must remain clickable.
- Proxy mode, chain mode, node selection, profile actions, connection controls, log filters, unlock tests, and settings controls must retain real handlers.
- No UX element that looks clickable should be a dead mock unless it is purely decorative.

## Validation

Run:

- `pnpm typecheck`
- local app launch or dev preview if packaging is not required

Manual checks:

- Switch each theme.
- Navigate through all primary pages.
- Click proxy mode buttons.
- Toggle chain mode.
- Open settings actions.
- Use log filters/search.
- Confirm no obvious console or type errors.

