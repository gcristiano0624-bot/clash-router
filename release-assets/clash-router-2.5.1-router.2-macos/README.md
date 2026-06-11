# Clash Router v2.5.1-router.2 — macOS Release Assets

本目录保存 `Clash Router v2.5.1-router.2` 的 macOS arm64 (Apple Silicon) 本地构建产物。

## 文件

| 文件 | 大小 | 用途 |
|---|---|---|
| `Clash Router_2.5.1-router.2_aarch64.dmg` | 62 MB | macOS arm64 安装包（推荐分发）|
| `Clash Router.app` | — | 已解包的应用，可直接本地运行测试 |
| `Clash Router.app.tar.gz` | 63 MB | Tauri updater 增量更新归档 |
| `SHA256SUMS.txt` | — | 上述两个分发文件的 SHA-256 校验和 |

## 构建信息

| 项 | 值 |
|---|---|
| 版本 | `v2.5.1-router.2` |
| 目标 | `aarch64-apple-darwin` (Apple Silicon only) |
| Rust | `1.91.0` |
| Tauri | `2.x`（构建于 macOS 26.5.1）|
| 签名 | **ad-hoc 自签**（无 Apple Developer 证书与公证）|
| Updater 签名 | 未启用（缺 `TAURI_SIGNING_PRIVATE_KEY`）|
| 构建耗时 | 约 14 分钟（M1, single codegen unit, LTO thin）|

## 安装说明

1. 双击 `.dmg`，将 `Clash Router.app` 拖入 `/Applications`
2. 首次启动若提示「无法打开」：
   - 前往「系统设置 → 隐私与安全性」
   - 在底部找到 `Clash Router was blocked from use`，点击「仍要打开」
3. 重新打开 `Clash Router.app`

## 校验

```bash
shasum -a 256 -c SHA256SUMS.txt
```

应输出两行 `OK`。

## 启用 Updater 签名（可选）

如需让 Tauri updater 自动验证 `.app.tar.gz` 增量更新，需在构建前设置：

```bash
export TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/clash-router.key)"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="<your-key-password>"
pnpm tauri build --target aarch64-apple-darwin
```

构建完成后会在 `bundle/macos/` 同目录额外生成 `Clash Router.app.tar.gz.sig`。

## 相关文档

- [完整 Changelog](../../Changelog.md)
- [Sidecar 模式](../../docs/SIDE-MODE.md)
- [DNS 策略](../../docs/DNS-STRATEGY.md)
- [企业网络故障排查](../../docs/debug/)
