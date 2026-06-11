## v2.5.1-router.2

### 🆕 新增功能

- **强制 Sidecar 模式** (`verge.prefer_sidecar_mode`)：新增 verge 配置项，启用后 Clash Router 直接以用户态 mihomo 启动，绕开 `clash-verge-service` helper 在企业网络下的网络隔离问题。Settings → Clash 中提供对应 UI 开关
- **DNS 上游策略** (`verge.dns_upstream_strategy`)：新增 verge 配置项，支持 `udp_only`（默认，纯 UDP DNS，适合企业网络）与 `doh`（DoH/DoT，适合家用网络）两种策略

### 🐞 稳定性修复

- **默认 DNS 改为纯 UDP**：首次安装时 `dns_config.yaml` 默认值从 `doh.pub` / `dns.alidns.com` 等 DoH 改为 `223.5.5.5` / `119.29.29.29` / `8.8.8.8` 等纯 UDP DNS。修复企业网络下 DoH 服务器被屏蔽导致 mihomo DNS 解析全失败的根因
- **DoH 升级迁移检测**：启动时检测到现有 `dns_config.yaml` 含 DoH 配置时打 warning 提示用户手动重置
- **TUN 模式下系统 DNS 可配**：`use_tun` 启用时不再硬编码 `114.114.114.114`，改用 `dns_upstream_strategy` 决定：udp_only 走 `223.5.5.5`（国内可达），doh 走 `114.114.114.114`（原行为）
- **TUN 模式改为 async**：`use_tun` 改 async，正确读取 verge 配置

### ⚙️ 配置变更

- `verge.enable_dns_settings` 默认值从 `false` 改为 `true`，让 `dns_config.yaml` 真正接管 DNS 段
- 默认 `dns_config.yaml` 的 `fake-ip-filter` 新增 `*.bytedance.net` / `*.byted.org` / `*.bytedance.com` / `*.volces.com` / `*.volcengine.com` 等公司内网域名，避免内网 DNS 被 mihomo 接管

### 📦 发布说明

- 目标 fork：`https://github.com/gcristiano0624-bot/clash-router`
- 目标 Tag：`v2.5.1-router.2`
- 主要安装包：macOS `.app`、`.dmg` 与 `.app.tar.gz`
- 配套文档：[`docs/SIDE-MODE.md`](docs/SIDE-MODE.md) 和 [`docs/DNS-STRATEGY.md`](docs/DNS-STRATEGY.md)

## v2.5.1-router.1

### ✨ 品牌与体验

- 应用统一更名为 `Clash Router`，隔离 macOS 应用身份与配置目录
- 引入更扁平的路由控制台视觉风格，重做首页、代理页、设置页和全局主题
- 更新项目文档、多语言 README 与项目总览文档

### 🐞 稳定性修复

- 统一 DNS 配置生成与热应用链路，修复 `dns` / `hosts` 结构不一致问题
- 增加 service 启动失败时的非 TUN sidecar 回退
- 在配置校验、sidecar 启动和 service 启动前自动修复可执行权限，避免 `Permission denied`

### 📦 发布说明

- 目标 fork：`https://github.com/gcristiano0624-bot/clash-router`
- 目标 Tag：`v2.5.1-router.1`
- 主要安装包：macOS `.app`、`.dmg` 与 `.app.tar.gz`

## v2.5.1

### 🐞 修复问题

- 备份设置功能异常

<details>
<summary><strong> ✨ 新增功能 </strong></summary>

</details>

<details>
<summary><strong> 🚀 优化改进 </strong></summary>

</details>
