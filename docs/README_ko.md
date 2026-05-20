<h1 align="center">
  <img src="../src-tauri/icons/icon.png" alt="Clash Router" width="128" />
  <br>
  Clash Router
  <br>
</h1>

<h3 align="center">
<a href="https://github.com/clash-verge-rev/clash-verge-rev">clash-verge-rev</a>를 기반으로 한 데스크톱 라우팅 및 프록시 클라이언트로, <a href="https://github.com/tauri-apps/tauri">Tauri 2</a>, Rust, React로 구성됩니다.
</h3>

<p align="center">
  언어:
  <a href="../README.md">简体中文</a> ·
  <a href="./README_en.md">English</a> ·
  <a href="./README_es.md">Español</a> ·
  <a href="./README_ru.md">Русский</a> ·
  <a href="./README_ja.md">日本語</a> ·
  <a href="./README_ko.md">한국어</a> ·
  <a href="./README_fa.md">فارسی</a>
</p>

## 개요

`Clash Router`는 독립적인 앱 정체성, 더 평평한 UI, 안정성 개선을 갖춘 `mihomo`용 포크 클라이언트입니다.

## 설치

- 저장소: [gcristiano0624-bot/clash-router](https://github.com/gcristiano0624-bot/clash-router)
- 릴리스: [Releases](https://github.com/gcristiano0624-bot/clash-router/releases)
- 프로젝트 문서: [Project.md](https://github.com/gcristiano0624-bot/clash-router/blob/main/docs/Project.md)

저장소에 보관된 macOS 산출물:

- `release-assets/clash-router-macos/Clash Router.app`
- `release-assets/clash-router-macos/Clash Router_2.5.1_aarch64.dmg`
- `release-assets/clash-router-macos/Clash Router.app.tar.gz`

## 릴리스 채널

| 채널 | 설명 | 링크 |
| :--- | :--- | :--- |
| Stable | 일상 사용을 위한 안정 채널 | [Releases](https://github.com/gcristiano0624-bot/clash-router/releases) |
| Router Preview | 브랜드화와 DNS 수정이 포함된 첫 번째 fork 릴리스 | [v2.5.1-router.1](https://github.com/gcristiano0624-bot/clash-router/releases/tag/v2.5.1-router.1) |

## 기능

- Rust, Tauri 2, React 기반 데스크톱 클라이언트
- `mihomo` sidecar / service 이중 실행 모드
- DNS 수정과 macOS 실행 권한 자동 복구
- 내비게이션, 홈, 프록시, 설정에 적용된 플랫 UI

## 개발

```bash
pnpm i
pnpm prebuild
pnpm dev
```

## 라이선스

`GPL-3.0` 라이선스. 자세한 내용은 [LICENSE](../LICENSE)를 참고하세요.

