# Clash Router Brand and Flat UI Design

## Goal

This document defines the first branded desktop release of `Clash Router`, a fork of `clash-verge-rev` that keeps the existing Mihomo-based capabilities while shipping as an isolated macOS app with a flatter and more dashboard-like interface.

The scope of this phase is intentionally focused on four outcomes:

1. Rename the app to `Clash Router` and isolate the macOS bundle identity so it can coexist with an installed `Clash Verge`.
2. Replace the primary app icon and in-app brand assets with a new routing-oriented identity.
3. Introduce a flatter visual system across the shell, theme, and core pages.
4. Rebuild a local runnable macOS `.app` using the already validated Tauri packaging path.

## Product Direction

`Clash Router` should feel like a dedicated routing control console instead of a generic proxy client skin.

The target visual qualities are:

- flat instead of layered
- structured instead of decorative
- calm instead of glossy
- dense but readable
- modern desktop utility instead of mobile-style cards

The branding should emphasize path aggregation, distribution, and control. The icon and wordmark should communicate routing without inheriting the visual identity of Clash Verge.

## Scope

### Included

- app display name and macOS bundle identity
- deep-link scheme isolation for the branded app
- app icon replacement for bundle artifacts
- in-app logo and wordmark replacement
- global theme token updates
- flatter shell layout for sidebar and content canvas
- core page refresh for home, proxies, and settings
- rebuild of a local macOS app bundle

### Excluded

- core proxy logic rewrites
- settings architecture refactors
- tray icon redesign beyond what is necessary for app packaging
- updater signing and release-channel changes
- enterprise-network heuristics or other non-branding backend work outside the already merged DNS and service fixes

## Brand Identity

### Naming

- product name: `Clash Router`
- macOS app bundle: `Clash Router.app`
- bundle identifier: use a new independent namespace so Launch Services treats it as a different app

### Visual Motif

The icon and logo use a simplified routing metaphor:

- a central route spine
- branching paths or lanes
- circular or rounded geometry for approachability
- cool blue-green tones with neutral support colors

This keeps the meaning aligned with network routing while avoiding direct visual overlap with the original brand.

## Visual System

### Color

Use a cool routing palette:

- primary: deep cyan-blue
- secondary: soft teal
- success: clean green
- warning: amber
- error: muted red
- neutrals: light gray for light mode, slate gray for dark mode

Accent color should be reserved for selected state, primary actions, focus, and status chips. Large gradient surfaces are out of scope.

### Surface Model

Adopt a flatter surface hierarchy:

- shell background: quiet neutral
- page canvas: slightly elevated by contrast, not by shadow
- cards: low-contrast blocks with border emphasis
- dialogs: subtle edge definition with restrained radius

Shadows should be minimal. Border, spacing, and contrast should communicate hierarchy.

### Shape

- medium radius for primary surfaces
- small-to-medium radius for controls
- rounded chips for statuses
- no oversized bubble shapes

### Typography

- strong section titles
- compact secondary text
- clean data presentation for latency, traffic, and modes
- no oversized hero text

## Shell Redesign

### Sidebar

The sidebar becomes a flatter navigation rail:

- stronger vertical rhythm
- less visual bulk
- selected item shown with accent-tinted fill and clearer icon/text contrast
- brand block simplified into icon + wordmark + small status affordance

### Content Area

The main canvas should feel like a work surface:

- more breathing room around page headers
- lighter dividers
- fewer nested white cards
- more consistent content widths and section spacing

## Core Page Redesign

### Home

Home becomes a routing dashboard:

- top-level overview of active profile, current route, network mode, and traffic
- flatter cards with better section grouping
- less ornamental chrome around controls

### Proxies

Proxies becomes a route control page:

- toolbar-like header for mode and chain actions
- flatter list and control surfaces
- emphasize scanability over stacked decoration

### Settings

Settings becomes a cleaner desktop settings center:

- grouped sections with clearer boundaries
- consistent paddings and background treatment
- flatter action icons and section containers

## Technical Design

### Branding Layer

Update the Tauri metadata and runtime strings that define visible app identity:

- `src-tauri/tauri.conf.json`
- `src-tauri/tauri.macos.conf.json`
- runtime title strings in Rust where the app name is hardcoded
- app identifier paths used for config storage on desktop platforms

For coexistence, the branded build must not reuse the old app identifier or macOS app name.

### Asset Layer

Replace these assets with new `Clash Router` branding:

- `src/assets/image/icon_dark.svg`
- `src/assets/image/icon_light.svg`
- `src/assets/image/logo.svg`
- packaged icons under `src-tauri/icons/`

The app icon set should be generated from a single new design source to keep bundle artifacts consistent.

### Theme Layer

Update the shared theme hooks and CSS variables so the flat style is systemic rather than page-local:

- default light and dark palette values
- component overrides for Paper, Button, Chip, Dialog, ListItemButton, TextField, and Select
- shell CSS variables for background, divider, and accent alpha

### Page Layer

Adjust core pages to consume the new visual language:

- shell layout and sidebar
- base page container
- enhanced home cards
- home dashboard page
- proxies page toolbar and framing
- settings page section blocks

## Implementation Order

1. Write this design doc.
2. Update app identity and bundle metadata.
3. Create and replace brand assets and icon set.
4. Apply theme and shell changes.
5. Refresh home, proxies, and settings pages.
6. Run type and lint checks for touched frontend files.
7. Rebuild the macOS app from a path without spaces.

## Risks

- Tauri packaging still depends on the existing prebuild sidecar flow.
- The repository path with spaces can break packaging scripts, so the final app build should continue to run from a temporary no-space clone.
- Some strings remain upstream-facing by design, such as project links, unless they directly affect brand identity.

## Validation

The phase is complete when all of the following are true:

- macOS shows the app as `Clash Router`
- the new app installs and runs alongside an existing Clash Verge installation
- the primary app icon is visibly different from Clash Verge
- the shell and core pages present a flatter visual style
- frontend type checks pass for touched files
- a local runnable macOS `.app` is produced
