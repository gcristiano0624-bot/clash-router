<h1 align="center">
  <img src="./src-tauri/icons/icon.png" alt="Clash Router" width="128" />
  <br>
  Clash Router
  <br>
</h1>

<h3 align="center">
  基于 <a href="https://github.com/clash-verge-rev/clash-verge-rev">clash-verge-rev</a> 二次开发的路由与代理桌面客户端，采用 <a href="https://github.com/tauri-apps/tauri">Tauri 2</a>、Rust 与 React 构建。
</h3>

<p align="center">
  语言:
  <a href="./README.md">简体中文</a> ·
  <a href="./docs/README_en.md">English</a> ·
  <a href="./docs/README_es.md">Español</a> ·
  <a href="./docs/README_ru.md">Русский</a> ·
  <a href="./docs/README_ja.md">日本語</a> ·
  <a href="./docs/README_ko.md">한국어</a> ·
  <a href="./docs/README_fa.md">فارسی</a>
</p>

## 项目定位

`Clash Router` 是一个面向个人设备与多网络环境的 `mihomo` 图形客户端。

当前 fork 在上游 `clash-verge-rev` 基础上重点完成了这些工作：

- 独立品牌化：应用名、Bundle ID、配置目录与打包身份已隔离
- 稳定性修复：统一 DNS 配置应用路径，增加 service 失败时的 sidecar 回退
- 兼容性修复：自动补齐 sidecar / service 可执行权限，避免 `Permission denied` 校验失败
- 视觉升级：全局主题与核心页面切换为更扁平的路由控制台风格
- 本地交付：已产出 macOS `.app`、`.dmg` 与更新归档

## 预览

| Dark | Light |
| --- | --- |
| ![预览](./docs/preview_dark.png) | ![预览](./docs/preview_light.png) |

## 安装

请前往 fork 仓库的发布页下载适合你平台的安装包：

- 仓库主页：[gcristiano0624-bot/clash-router](https://github.com/gcristiano0624-bot/clash-router)
- 发布页：[Releases](https://github.com/gcristiano0624-bot/clash-router/releases)

当前已整理的 macOS 产物也保存在仓库内：

- `release-assets/clash-router-macos/Clash Router.app`
- `release-assets/clash-router-macos/Clash Router_2.5.1_aarch64.dmg`
- `release-assets/clash-router-macos/Clash Router.app.tar.gz`

支持平台：

- Windows `x64/x86`
- Linux `x64/arm64`
- macOS `11+` `Intel/Apple Silicon`

## 版本渠道

| 渠道 | 说明 | 链接 |
| :--- | :--- | :--- |
| Stable | 面向日常使用的正式发布版本 | [Releases](https://github.com/gcristiano0624-bot/clash-router/releases) |
| Router Preview | 用于验证品牌化与兼容性修复的 fork 版本 | [v2.5.1-router.1](https://github.com/gcristiano0624-bot/clash-router/releases/tag/v2.5.1-router.1) |

## 文档

- 项目总览：[docs/Project.md](./docs/Project.md)
- DNS / service 方案：[2026-05-20-clash-verge-dns-service-design.md](./docs/superpowers/specs/2026-05-20-clash-verge-dns-service-design.md)
- 品牌与 UI 方案：[2026-05-20-clash-router-brand-design.md](./docs/superpowers/specs/2026-05-20-clash-router-brand-design.md)
- 文档与多语言方案：[2026-05-20-clash-router-docs-i18n-design.md](./docs/superpowers/specs/2026-05-20-clash-router-docs-i18n-design.md)

## 主要特性

- 基于 `Rust`、`Tauri 2`、`React` 与 `TypeScript`
- 内置 `mihomo` sidecar / service 双运行模式
- 支持系统代理、守卫、`TUN`、配置增强、规则与代理编辑
- 修复 DNS 热应用与配置生成不一致问题
- 非 `TUN` 场景下支持 service 启动失败自动回退 sidecar
- 自动补齐 sidecar 与 service 可执行权限，减少 macOS 首次运行故障
- 扁平化主题、导航与核心页面视觉

## 开发

安装依赖后执行：

```bash
pnpm i
pnpm prebuild
pnpm dev
```

如果需要本地打包 macOS 版本：

```bash
export PATH="$HOME/.cargo/bin:$PATH"
export CI=true
pnpm prebuild
pnpm build
```

说明：如果项目路径包含空格，建议在无空格目录中执行打包，以避免 `scripts/prebuild.mjs` 中的系统命令路径问题。

## 致谢

`Clash Router` 基于或受以下项目启发：

- [clash-verge-rev/clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev)
- [zzzgydi/clash-verge](https://github.com/zzzgydi/clash-verge)
- [MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo)
- [tauri-apps/tauri](https://github.com/tauri-apps/tauri)
- [vitejs/vite](https://github.com/vitejs/vite)

## 许可证

本项目遵循 `GPL-3.0`。详见 [LICENSE](./LICENSE)。

