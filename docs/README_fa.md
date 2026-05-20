<h1 align="center">
  <img src="../src-tauri/icons/icon.png" alt="Clash Router" width="128" />
  <br>
  Clash Router
  <br>
</h1>

<h3 align="center">
یک کلاینت دسکتاپ برای مسیریابی و پروکسی بر پایه <a href="https://github.com/clash-verge-rev/clash-verge-rev">clash-verge-rev</a> که با <a href="https://github.com/tauri-apps/tauri">Tauri 2</a>، Rust و React ساخته شده است.
</h3>

<p align="center">
  زبان‌ها:
  <a href="../README.md">简体中文</a> ·
  <a href="./README_en.md">English</a> ·
  <a href="./README_es.md">Español</a> ·
  <a href="./README_ru.md">Русский</a> ·
  <a href="./README_ja.md">日本語</a> ·
  <a href="./README_ko.md">한국어</a> ·
  <a href="./README_fa.md">فارسی</a>
</p>

## معرفی

`Clash Router` یک کلاینت فورک‌شده برای `mihomo` است که هویت مستقل برنامه، رابط کاربری تخت‌تر و اصلاحات پایداری را ارائه می‌کند.

## نصب

- مخزن: [gcristiano0624-bot/clash-router](https://github.com/gcristiano0624-bot/clash-router)
- انتشارها: [Releases](https://github.com/gcristiano0624-bot/clash-router/releases)
- مستندات پروژه: [Project.md](https://github.com/gcristiano0624-bot/clash-router/blob/main/docs/Project.md)

خروجی‌های macOS نگه‌داری‌شده در مخزن:

- `release-assets/clash-router-macos/Clash Router.app`
- `release-assets/clash-router-macos/Clash Router_2.5.1_aarch64.dmg`
- `release-assets/clash-router-macos/Clash Router.app.tar.gz`

## کانال‌های انتشار

| کانال | توضیح | لینک |
| :--- | :--- | :--- |
| Stable | کانال پایدار برای استفاده روزمره | [Releases](https://github.com/gcristiano0624-bot/clash-router/releases) |
| Router Preview | اولین انتشار برندشده فورک با اصلاحات DNS | [v2.5.1-router.1](https://github.com/gcristiano0624-bot/clash-router/releases/tag/v2.5.1-router.1) |

## ویژگی‌ها

- کلاینت دسکتاپ مبتنی بر Rust، Tauri 2 و React
- هسته `mihomo` با دو حالت sidecar و service
- اصلاحات DNS و بازیابی خودکار مجوز اجرایی در macOS
- رابط کاربری تخت برای ناوبری، خانه، پروکسی و تنظیمات

## توسعه

```bash
pnpm i
pnpm prebuild
pnpm dev
```

## مجوز

مجوز `GPL-3.0`. برای جزئیات بیشتر [LICENSE](../LICENSE) را ببینید.

