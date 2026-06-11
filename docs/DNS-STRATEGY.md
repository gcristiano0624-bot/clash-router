# DNS 策略

> 适用版本：Clash Router **v2.5.1-router.2+**
>
> 相关 verge 字段：`dns_upstream_strategy`、`enable_dns_settings`

## 背景

Clash Router / mihomo 的 DNS 解析依赖 `nameserver` 列表。常见上游：

| 类型 | 示例 | 优点 | 缺点 |
|------|------|------|------|
| **UDP DNS** | `223.5.5.5` / `8.8.8.8` | 简单、延迟低、企业网络可达 | 无加密、易污染 |
| **DoH** | `https://dns.alidns.com/dns-query` | 加密、防污染 | 需 HTTPS，企业网络常屏蔽 |
| **DoT** | `tls://223.5.5.5` | 加密、防污染 | 需 TLS，企业网络常屏蔽 |

在企业网络 / 公司 VPN 环境下，**DoH 和 DoT 服务器的 HTTPS 端口（443）经常被屏蔽**，导致 mihomo DNS 解析全失败，节点全部 timeout。

`dns_upstream_strategy` 让你在不同网络环境间切换。

## 策略对比

### `udp_only`（默认，新增）

适合企业网络 / 公司 VPN：

```yaml
# verge.yaml
dns_upstream_strategy: udp_only

# 自动生成的 dns_config.yaml:
# default-nameserver: [223.5.5.5, 119.29.29.29, 8.8.8.8]
# nameserver:        [223.5.5.5, 119.29.29.29, 8.8.8.8]
# fallback:          [1.1.1.1, 9.9.9.9, 208.67.222.222]
# proxy-server-nameserver: [223.5.5.5, 119.29.29.29, 8.8.8.8]
```

✅ 纯 UDP，国内 + 国际 DNS 都可达
✅ 适合 DoH 屏蔽环境
❌ 无加密

### `doh`（原版行为）

适合家用 / 公网：

```yaml
# verge.yaml
dns_upstream_strategy: doh

# 自动生成的 dns_config.yaml:
# default-nameserver: [system, 223.6.6.6, 8.8.8.8, ...]
# nameserver:        [8.8.8.8, https://doh.pub/dns-query, https://dns.alidns.com/dns-query]
# fallback:          [1.1.1.1, https://cloudflare-dns.com/dns-query]
```

✅ DoH/DoT 加密、防污染
❌ 企业网络下被屏蔽

### `auto`

透传 mihomo 决策（mihomo 默认会混合 UDP 和 DoH）。

```yaml
dns_upstream_strategy: auto
```

## 升级迁移

如果你从 v2.5.1-router.1 升级，已有 `dns_config.yaml` 含 DoH 配置：

**自动检测**：v2.5.1-router.2+ 启动时会检测到 DoH 配置，打 warning：

```
WARN  Existing dns_config.yaml uses DoH upstream, which is blocked in many
      corporate networks. To switch to udp_only DNS, delete
      /.../dns_config.yaml and restart, or set dns_upstream_strategy: doh
      in verge.yaml and manually edit dns_config.yaml.
```

**手动重置**：

```bash
# macOS
rm ~/Library/Application\ Support/io.github.clash-verge-rev.clash-verge-rev/dns_config.yaml
launchctl unload ~/Library/LaunchAgents/com.clash.mihomo.plist
launchctl load ~/Library/LaunchAgents/com.clash.mihomo.plist

# Linux
rm ~/.local/share/io.github.clash-verge-rev.clash-verge-rev/dns_config.yaml
systemctl --user restart clash-router
```

下次启动会用 `dns_upstream_strategy` 指定的策略生成新 `dns_config.yaml`。

## enable_dns_settings

控制 `dns_config.yaml` 是否生效：

```yaml
# verge.yaml
enable_dns_settings: true   # 默认
```

| 值 | 行为 |
|----|------|
| `true` | 用 `dns_config.yaml` 接管 DNS 段 |
| `false` | 用 profile 自带的 `dns:` 段 |

**何时关闭**：
- 想用订阅自带的 DNS 配置
- 调试 DNS 时想直接改 profile 而不走 dns_config.yaml

**何时开启**（默认）：
- 想统一管理 DNS 段
- 想用 udp_only 策略（需配合 `dns_upstream_strategy: udp_only`）

## 配合 TUN 模式的系统 DNS

启用 TUN 模式时，Clash Router 会调用 `set_public_dns` 改系统 DNS（macOS 通过 `networksetup`）。

v2.5.1-router.2 不再硬编码 `114.114.114.114`，改为根据策略：

| `dns_upstream_strategy` | 系统 DNS |
|-------------------------|----------|
| `udp_only`（默认） | `223.5.5.5`（阿里，国内可达） |
| `doh` / `auto` | `114.114.114.114`（原行为） |

## 验证

```bash
# 1. 检查 mihomo 实际 nameserver
curl -s http://127.0.0.1:9090/configs | python3 -m json.tool | grep -A 5 '"dns"'

# 2. 检查 mihomo 是否在用 DoH（如果用 DoH 会看到 "doh" 或 "https"）
# mihomo 日志: ~/Library/Logs/io.github.clash-verge-rev.clash-verge-rev/sidecar/latest.log
tail -100 sidecar/latest.log | grep -E "DoH|dns-query" | head -10

# 3. 检查 mihomo 实际 UDP 上游是否可达
nc -zuv 223.5.5.5 53 2>&1
nc -zuv 8.8.8.8 53 2>&1
```

## 故障排除

### mihomo 日志报 `dns resolve failed`

```text
WARN [TCP] dial ... www.gstatic.com:80 error: hk-1.zzjc.top:8003 connect error: 
dns resolve failed: all DNS requests failed
```

**可能原因**：
1. `dns_upstream_strategy: doh`，但企业网络屏蔽了 DoH 服务器
2. UDP DNS 也不可达（公司网络封锁 53 端口）
3. `enable_dns_settings: false`，profile 的 dns 段配置错误

**排查**：
```bash
# 直接用 mihomo 上游 DNS 解析
dig @223.5.5.5 google.com
dig @119.29.29.29 google.com
```

如果 UDP DNS 也不通，配置无效，需要找公司网络可达的 DNS。

## 相关代码

- `src-tauri/src/utils/init.rs` — `init_dns_config()` 根据 strategy 生成 DNS 内容
- `src-tauri/src/enhance/mod.rs` — `apply_dns_settings()` 决定是否注入 dns_config.yaml
- `src-tauri/src/enhance/tun.rs` — `use_tun()` 启用 TUN 时调 `set_public_dns`
- `src/components/setting/setting-clash.tsx` — UI 开关（enable_dns_settings）
