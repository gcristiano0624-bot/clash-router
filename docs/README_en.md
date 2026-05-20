<h1 align="center">
  <img src="../src-tauri/icons/icon.png" alt="Clash Router" width="128" />
  <br>
  Clash Router
  <br>
</h1>

<h3 align="center">
  A branded desktop router and proxy client built on top of <a href="https://github.com/clash-verge-rev/clash-verge-rev">clash-verge-rev</a>, powered by <a href="https://github.com/tauri-apps/tauri">Tauri 2</a>, Rust, and React.
</h3>

<p align="center">
  Languages:
  <a href="../README.md">简体中文</a> ·
  <a href="./README_en.md">English</a> ·
  <a href="./README_es.md">Español</a> ·
  <a href="./README_ru.md">Русский</a> ·
  <a href="./README_ja.md">日本語</a> ·
  <a href="./README_ko.md">한국어</a> ·
  <a href="./README_fa.md">فارسی</a>
</p>

## Overview

`Clash Router` is a fork-focused desktop client for `mihomo` with an isolated app identity and a flatter router-console style UI.

This fork currently adds:

- isolated branding, bundle identity, and app data directories
- unified DNS config generation and hot-apply behavior
- fallback from service mode to sidecar in non-TUN scenarios
- auto-fix for missing executable permission on bundled sidecars and services
- refreshed flat visual style for the shell and primary pages
- local macOS deliverables for `.app`, `.dmg`, and update archives

## Preview

| Dark | Light |
| --- | --- |
| ![Dark Preview](./preview_dark.png) | ![Light Preview](./preview_light.png) |

## Install

Download installers from the fork repository:

- Repository: [gcristiano0624-bot/clash-router](https://github.com/gcristiano0624-bot/clash-router)
- Releases: [GitHub Releases](https://github.com/gcristiano0624-bot/clash-router/releases)

Current macOS artifacts are also retained in the repository:

- `release-assets/clash-router-macos/Clash Router.app`
- `release-assets/clash-router-macos/Clash Router_2.5.1_aarch64.dmg`
- `release-assets/clash-router-macos/Clash Router.app.tar.gz`

Supported platforms:

- Windows `x64/x86`
- Linux `x64/arm64`
- macOS `11+` `Intel/Apple Silicon`

## Release Channels

| Channel | Description | Link |
| :--- | :--- | :--- |
| Stable | Regular release channel for daily use | [Releases](https://github.com/gcristiano0624-bot/clash-router/releases) |
| Router Preview | First branded fork release with DNS and permission fixes | [v2.5.1-router.1](https://github.com/gcristiano0624-bot/clash-router/releases/tag/v2.5.1-router.1) |

## Documentation

- Project overview: [Project.md](./Project.md)
- DNS / service design: [2026-05-20-clash-verge-dns-service-design.md](./superpowers/specs/2026-05-20-clash-verge-dns-service-design.md)
- Branding and UI design: [2026-05-20-clash-router-brand-design.md](./superpowers/specs/2026-05-20-clash-router-brand-design.md)
- Docs and i18n design: [2026-05-20-clash-router-docs-i18n-design.md](./superpowers/specs/2026-05-20-clash-router-docs-i18n-design.md)

## Features

- Built with `Rust`, `Tauri 2`, `React`, and `TypeScript`
- Bundled `mihomo` sidecar / service dual runtime model
- Supports system proxy, guard, `TUN`, profile enhancement, rule editing, and proxy editing
- Fixes inconsistent DNS application between generation and runtime hot apply
- Falls back to sidecar when service startup fails outside `TUN` mode
- Auto-recovers executable permission for packaged core binaries on macOS
- Uses a flatter visual language for navigation, home, proxies, and settings pages

## Development

Install dependencies and run the app locally:

```bash
pnpm i
pnpm prebuild
pnpm dev
```

For local macOS packaging:

```bash
export PATH="$HOME/.cargo/bin:$PATH"
export CI=true
pnpm prebuild
pnpm build
```

If your source path contains spaces, packaging from a temporary path without spaces is recommended because `scripts/prebuild.mjs` includes shell operations that are sensitive to path quoting.

## Acknowledgements

`Clash Router` is based on or inspired by these projects:

- [clash-verge-rev/clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev)
- [zzzgydi/clash-verge](https://github.com/zzzgydi/clash-verge)
- [MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo)
- [tauri-apps/tauri](https://github.com/tauri-apps/tauri)
- [vitejs/vite](https://github.com/vitejs/vite)

## License

Licensed under `GPL-3.0`. See [LICENSE](../LICENSE).

