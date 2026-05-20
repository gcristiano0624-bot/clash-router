<h1 align="center">
  <img src="../src-tauri/icons/icon.png" alt="Clash Router" width="128" />
  <br>
  Clash Router
  <br>
</h1>

<h3 align="center">
<a href="https://github.com/clash-verge-rev/clash-verge-rev">clash-verge-rev</a> をベースにした、<a href="https://github.com/tauri-apps/tauri">Tauri 2</a> / Rust / React 製のデスクトップ向けルーター・プロキシクライアントです。
</h3>

<p align="center">
  言語:
  <a href="../README.md">简体中文</a> ·
  <a href="./README_en.md">English</a> ·
  <a href="./README_es.md">Español</a> ·
  <a href="./README_ru.md">Русский</a> ·
  <a href="./README_ja.md">日本語</a> ·
  <a href="./README_ko.md">한국어</a> ·
  <a href="./README_fa.md">فارسی</a>
</p>

## 概要

`Clash Router` は `mihomo` 向けの fork クライアントで、独立したアプリ識別子、よりフラットな UI、安定性向上の修正を備えています。

## インストール

- リポジトリ: [gcristiano0624-bot/clash-router](https://github.com/gcristiano0624-bot/clash-router)
- リリース: [Releases](https://github.com/gcristiano0624-bot/clash-router/releases)
- プロジェクト文書: [Project.md](https://github.com/gcristiano0624-bot/clash-router/blob/main/docs/Project.md)

リポジトリ内の macOS 成果物:

- `release-assets/clash-router-macos/Clash Router.app`
- `release-assets/clash-router-macos/Clash Router_2.5.1_aarch64.dmg`
- `release-assets/clash-router-macos/Clash Router.app.tar.gz`

## リリースチャンネル

| チャンネル | 説明 | リンク |
| :--- | :--- | :--- |
| Stable | 日常利用向けの安定版 | [Releases](https://github.com/gcristiano0624-bot/clash-router/releases) |
| Router Preview | ブランド化と DNS 修正を含む最初の fork 版 | [v2.5.1-router.1](https://github.com/gcristiano0624-bot/clash-router/releases/tag/v2.5.1-router.1) |

## 特徴

- Rust、Tauri 2、React ベースのデスクトップクライアント
- `mihomo` の sidecar / service 両モードを同梱
- DNS 修正と macOS 実行権限の自動回復
- ナビゲーション、ホーム、プロキシ、設定のフラットな UI

## 開発

```bash
pnpm i
pnpm prebuild
pnpm dev
```

## ライセンス

`GPL-3.0` ライセンス。詳細は [LICENSE](../LICENSE) を参照してください。

