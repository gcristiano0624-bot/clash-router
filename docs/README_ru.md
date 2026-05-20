<h1 align="center">
  <img src="../src-tauri/icons/icon.png" alt="Clash Router" width="128" />
  <br>
  Clash Router
  <br>
</h1>

<h3 align="center">
Брендированный настольный клиент маршрутизации и прокси на базе <a href="https://github.com/clash-verge-rev/clash-verge-rev">clash-verge-rev</a>, построенный на <a href="https://github.com/tauri-apps/tauri">Tauri 2</a>, Rust и React.
</h3>

<p align="center">
  Языки:
  <a href="../README.md">简体中文</a> ·
  <a href="./README_en.md">English</a> ·
  <a href="./README_es.md">Español</a> ·
  <a href="./README_ru.md">Русский</a> ·
  <a href="./README_ja.md">日本語</a> ·
  <a href="./README_ko.md">한국어</a> ·
  <a href="./README_fa.md">فارسی</a>
</p>

## Обзор

`Clash Router` — это форк-клиент для `mihomo` с собственной идентичностью приложения, более плоским интерфейсом и исправлениями стабильности.

## Установка

- Репозиторий: [gcristiano0624-bot/clash-router](https://github.com/gcristiano0624-bot/clash-router)
- Релизы: [Releases](https://github.com/gcristiano0624-bot/clash-router/releases)
- Документация проекта: [Project.md](https://github.com/gcristiano0624-bot/clash-router/blob/main/docs/Project.md)

Файлы macOS, сохраненные в репозитории:

- `release-assets/clash-router-macos/Clash Router.app`
- `release-assets/clash-router-macos/Clash Router_2.5.1_aarch64.dmg`
- `release-assets/clash-router-macos/Clash Router.app.tar.gz`

## Каналы релизов

| Канал | Описание | Ссылка |
| :--- | :--- | :--- |
| Stable | Стабильный канал для повседневного использования | [Releases](https://github.com/gcristiano0624-bot/clash-router/releases) |
| Router Preview | Первый брендированный релиз форка с DNS-исправлениями | [v2.5.1-router.1](https://github.com/gcristiano0624-bot/clash-router/releases/tag/v2.5.1-router.1) |

## Возможности

- Настольный клиент на Rust, Tauri 2 и React
- Встроенный `mihomo` с режимами sidecar и service
- Исправления DNS и автоматическое восстановление исполняемых прав в macOS
- Плоский стиль для навигации, главной страницы, прокси и настроек

## Разработка

```bash
pnpm i
pnpm prebuild
pnpm dev
```

## Лицензия

Лицензия `GPL-3.0`. См. [LICENSE](../LICENSE).

