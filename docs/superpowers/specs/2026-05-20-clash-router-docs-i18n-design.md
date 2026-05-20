# Clash Router Docs and I18n Update Design

## Goal

This document defines the documentation and localization update plan for the first branded `Clash Router` release that will be published from the user's fork repository.

The goals of this phase are:

1. Update public-facing repository documentation from `Clash Verge Rev` to `Clash Router`.
2. Align root README, multilingual READMEs, and `Project.md` with the new fork identity and release path.
3. Update user-visible localization strings where legacy brand wording is still exposed in the app UI.
4. Prepare release-facing text that can be reused in the fork's GitHub Release.

This phase does not yet cover icon production or GitHub publishing mechanics; those are separate follow-up phases.

## Scope

### Included

- `README.md`
- `docs/Project.md`
- `docs/README_en.md`
- `docs/README_es.md`
- `docs/README_ru.md`
- `docs/README_ja.md`
- `docs/README_ko.md`
- `docs/README_fa.md`
- user-visible brand strings in `src/locales/*/*.json`
- release-oriented wording for installation and distribution references

### Excluded

- app icon redesign and replacement
- screenshot regeneration
- GitHub Actions workflow changes
- Tag / Release creation
- application logic changes unrelated to exposed brand wording

## Current State

The repository is currently in a mixed branding state:

- runtime app identity has already been moved to `Clash Router`
- `docs/Project.md` already describes the forked product direction
- root `README.md` and multilingual README files still present upstream-facing project description and release links
- localization files still use generic wording for validation and notifications, and some public docs still point to upstream download and documentation channels

## Update Strategy

### 1. Documentation Hierarchy

Documentation will be updated in three layers:

- root project entry: `README.md`
- internal project overview: `docs/Project.md`
- multilingual landing pages: `docs/README_*.md`

The root README and English README become the canonical reference texts for release messaging. Other README variants will be updated to keep the same structure and the same fork-facing distribution links.

### 2. Branding Rules

Public-facing wording should follow these rules:

- product name: `Clash Router`
- upstream reference: mention `clash-verge-rev` only as the project base or upstream source
- repository and release links: point to the user's fork repository instead of upstream
- installation copy: describe the app as a branded desktop client based on `clash-verge-rev`

Avoid replacing technical dependency names that still legitimately refer to upstream projects, such as `mihomo`, `Tauri`, or historical acknowledgements.

### 3. README Update Policy

#### Root README

The root `README.md` should be fully updated:

- new title and intro
- fork repository and release links
- revised install section
- revised channel description
- updated FAQ/doc links
- refreshed project feature summary
- preserved acknowledgement and licensing context

#### English README

`docs/README_en.md` should be fully updated in lockstep with the root README.

#### Other Language READMEs

`docs/README_es.md`, `docs/README_ru.md`, `docs/README_ja.md`, `docs/README_ko.md`, and `docs/README_fa.md` will be updated using the following priority:

- product name
- intro paragraph
- install and release links
- documentation / FAQ links
- release channel description

These files should stay structurally aligned with the canonical README content, but the work should avoid rewriting every paragraph from scratch if the existing translation is otherwise acceptable.

### 4. Project.md Policy

`docs/Project.md` should be updated to reflect the latest actual state:

- remove stale references to temporary build output paths that no longer exist
- point local release artifacts to the retained `release-assets/clash-router-macos/` directory
- include the current fork publishing direction
- clarify that the next phase includes icon redesign and GitHub Release sync

### 5. In-App Localization Policy

Localization updates are limited to user-visible branding and release-facing terminology.

Priority areas:

- notifications and validation copy
- import / update / release related wording
- places where the old app brand is shown to end users

Do not attempt a wholesale rewrite of all locale files in this phase.

### 6. Link Update Policy

The following links should be updated to the user's fork:

- repository home
- releases page
- documentation references when they are fork-owned

External third-party links that are not under the fork's control should remain unchanged unless they incorrectly imply ownership or release origin.

## Files Expected To Change

- `README.md`
- `docs/Project.md`
- `docs/README_en.md`
- `docs/README_es.md`
- `docs/README_ru.md`
- `docs/README_ja.md`
- `docs/README_ko.md`
- `docs/README_fa.md`
- selected files under `src/locales/{zh,en,...}/*.json`

## Risks

- multilingual README updates can drift if translated too aggressively
- some upstream references are historically valid and should not be erased blindly
- fork release URLs must remain consistent with the final repository name and release strategy

## Validation

This phase is complete when:

- the root README clearly presents `Clash Router`
- all README download links point to the fork release location
- `docs/Project.md` reflects the current fork architecture and artifact layout
- visible app strings no longer expose obvious legacy public branding
- documentation remains internally consistent across Chinese and English primary copies
