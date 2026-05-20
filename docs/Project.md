# Project.md

## 项目概览

- 项目名称：`Clash Router`
- 当前版本目标：`v2.5.1-router.1`
- 项目类型：基于 `clash-verge-rev` 二次开发的 Tauri 2 桌面客户端
- fork 仓库：`https://github.com/gcristiano0624-bot/clash-router`
- 当前目标：在保留 `mihomo` 能力和原有增强链路的前提下，完成 DNS / service 稳定性修复、独立品牌化、扁平化 UI 改造、多语言文档同步，以及 fork 发布链路整理

## 当前状态

- 已完成 DNS / service 后端修复
- 已完成 `Clash Router` 品牌化与 macOS 身份隔离
- 已完成核心页面的扁平化 UI 改造
- 已完成 macOS 本地可运行 `.app` / `.dmg` / `.tar.gz` 产物整理
- 正在推进文档、多语言、图标重制与 GitHub fork 发布

## 本次改造重点

### 1. 后端稳定性修复

- 统一 DNS 配置解析、注入和热应用链路
- 修复 `dns` / `hosts` 顶层结构不一致问题
- 移除默认 DNS 模板中的高风险兼容字段
- 为 service 模式增加非 TUN 场景下的 sidecar 回退
- 在 sidecar、service 与配置校验链路补齐可执行权限兜底

设计文档：

- [2026-05-20-clash-verge-dns-service-design.md](./superpowers/specs/2026-05-20-clash-verge-dns-service-design.md)

### 2. 品牌重塑

- 应用名称统一为 `Clash Router`
- macOS `productName`、`identifier`、应用组与本地配置目录已隔离
- 深链 scheme 已改为 `clash-router`
- 当前 fork 面向独立发布，不与原版 `Clash Verge` 冲突

设计文档：

- [2026-05-20-clash-router-brand-design.md](./superpowers/specs/2026-05-20-clash-router-brand-design.md)

### 3. 文档与多语言

- 根 `README.md` 与英文文档已改为 `Clash Router` 母版
- 其他语言 README 已同步品牌名、下载入口和项目说明
- 应用内公开可见品牌词正在同步清理

设计文档：

- [2026-05-20-clash-router-docs-i18n-design.md](./superpowers/specs/2026-05-20-clash-router-docs-i18n-design.md)

## 技术栈

- 前端：`React 19`、`TypeScript`、`Vite`、`MUI`
- 桌面容器：`Tauri 2`
- 后端：`Rust`
- 核心代理：`mihomo` sidecar / service 双模式
- 配置与增强：`YAML`、Merge、Script、Rules、Proxies 增强链

## 目录结构

### 前端

- `src/pages/`：页面入口与布局壳层
- `src/components/`：通用组件、首页卡片、代理页、设置页等
- `src/assets/`：品牌图标、页面图像与样式文件
- `src/locales/`：多语言文本资源

### Tauri / Rust

- `src-tauri/src/cmd/`：前端命令桥接
- `src-tauri/src/config/`：配置模型与 DNS 归一化逻辑
- `src-tauri/src/core/`：核心运行模式、service、tray、通知、热键
- `src-tauri/src/enhance/`：配置增强链路
- `src-tauri/icons/`：打包图标资源

### 文档与发布

- `docs/Project.md`：当前项目总览
- `docs/README_*.md`：多语言仓库入口文档
- `docs/superpowers/specs/`：设计文档与专项方案
- `release-assets/clash-router-macos/`：保留的 macOS 发布产物

## 当前关键文件

### 品牌与打包

- `src-tauri/tauri.conf.json`
- `src-tauri/tauri.macos.conf.json`
- `src-tauri/packages/macos/info_merge.plist`
- `src-tauri/packages/macos/entitlements.plist`

### UI 与主题

- `src/pages/_theme.tsx`
- `src/pages/_layout/hooks/use-custom-theme.ts`
- `src/assets/styles/layout.scss`
- `src/assets/styles/page.scss`
- `src/pages/_layout.tsx`

### 后端修复

- `src-tauri/src/config/dns_settings.rs`
- `src-tauri/src/cmd/clash.rs`
- `src-tauri/src/enhance/mod.rs`
- `src-tauri/src/core/manager/lifecycle.rs`
- `src-tauri/src/core/validate.rs`
- `src-tauri/src/core/service.rs`
- `src-tauri/src/utils/dirs.rs`

## 本地打包产物

当前仓库内保留：

- `release-assets/clash-router-macos/Clash Router.app`
- `release-assets/clash-router-macos/Clash Router_2.5.1_aarch64.dmg`
- `release-assets/clash-router-macos/Clash Router.app.tar.gz`

说明：

- 本地运行包可直接用于验证 `Clash Router`
- 如果需要 GitHub Release，可直接复用这三类资产
- updater 签名仍需要单独配置 `TAURI_SIGNING_PRIVATE_KEY`

## 构建与验证

### 前端

- `pnpm typecheck`

### Rust

- `$HOME/.cargo/bin/cargo check --manifest-path src-tauri/Cargo.toml --features clippy`

### macOS 打包

```bash
export PATH="$HOME/.cargo/bin:$PATH"
export CI=true
pnpm prebuild
pnpm build
```

说明：项目原始路径如果带空格，建议在无空格目录中执行打包。

## 下一步

- 生成新的白底比熊主图标并替换全部 App icon
- 重新打包 `Clash Router` 最新安装包
- 添加 fork 远端、提交代码、推送到 `gcristiano0624-bot/clash-router`
- 创建 `v2.5.1-router.1` Tag 与 Release，上传安装包并同步中英文说明

