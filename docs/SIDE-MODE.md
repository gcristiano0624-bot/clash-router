# 强制 Sidecar 模式

> 适用版本：Clash Router **v2.5.1-router.2+**
>
> 相关 verge 字段：`prefer_sidecar_mode`

## 背景

Clash Router 启动 mihomo 有两种模式：

| 模式 | 启动方式 | 进程身份 | 网络权限 |
|------|----------|----------|----------|
| **Service 模式** | `clash-verge-service` helper | root | 高（可接管网络栈） |
| **Sidecar 模式** | `tauri_plugin_shell::sidecar()` | 当前用户 | 受限（仅系统代理） |

Service 模式在某些企业网络 / 公司 VPN 环境下，root 进程可能因网络沙箱、路由表冲突等原因无法访问外网，导致 mihomo 启动后所有节点 timeout。

`prefer_sidecar_mode` 字段让你**强制走 Sidecar 模式**，绕开 service helper 的限制。

## 何时使用

✅ **适合启用**：
- 公司网络（VPN/UTUN 隧道）下 service 模式超时
- 不想授权管理员密码安装 `clash-verge-service` helper
- 不需要 TUN 模式（系统代理 + PAC 已够用）
- macOS / Linux 用户态 mihomo 调试

❌ **不适合启用**：
- 需要 TUN 模式接管全局流量（system proxy 模式下 Docker / 部分应用流量绕过 mihomo）
- Windows（必须用 service 模式）
- `enable_tun_mode: true` 已开（TUN 需要 root 权限或 Network Extension，sidecar 模式无 root 无法启用 TUN）

## 配置

`verge.yaml`：

```yaml
# 强制用户态 mihomo 启动
prefer_sidecar_mode: true
```

或在 UI 中：**Settings → Clash → Force Sidecar Mode → ON**，然后重启 Clash Router。

## 验证

### macOS

```bash
# 1. 检查 mihomo 进程用户（不应是 root）
ps -o user,pid,command -p $(pgrep -f verge-mihomo) | head -5

# 2. 检查 mihomo 启动模式
launchctl list | grep clash | head -5

# 3. 检查 mihomo 日志，应出现:
#    "prepare_startup: service_status=Unavailable, prefer_sidecar=true, running_mode=Sidecar"
tail -f ~/Library/Logs/io.github.clash-verge-rev.clash-verge-rev/sidecar/latest.log
```

### Linux

```bash
ps -o user,pid,command -p $(pgrep -f verge-mihomo) | head -5
journalctl --user -u clash-router -f
```

## 配合 TUN 使用

TUN 模式接管所有流量（包括 Docker、命令行工具），但需要：

- macOS: 需 Network Extension（`enable_niche_tun` / NEMode） 或 root 启动
- Linux: 需要 `setcap cap_net_admin,cap_net_bind_service=+ep` 给 mihomo 二进制

`prefer_sidecar_mode: true` 下启用 TUN 的步骤：

1. `sudo setcap cap_net_admin,cap_net_bind_service=+ep /Applications/Clash\ Router.app/Contents/MacOS/verge-mihomo`
2. verge.yaml 设 `enable_tun_mode: true`
3. 重启 Clash Router

如果 setcap 失败，恢复 `prefer_sidecar_mode: false` 走 service 模式。

## 故障排除

### 节点全部 timeout

```bash
# 检查 mihomo 是否用户态
ps -o user -p $(pgrep -f verge-mihomo)
# 期望: 你的用户名（不是 root）

# 检查 DNS 解析
dig @127.0.0.1 -p 7874 google.com
# 期望: 返回有效 IP
```

如果 DNS 也失败，参考 [DNS-STRATEGY.md](DNS-STRATEGY.md) 切换 udp_only。

### TUN 启用失败

macOS 上 sidecar 模式无 root 权限启用 TUN，会报 `operation not permitted`。两个选择：
- 改回 `prefer_sidecar_mode: false` 走 service 模式
- 用 Network Extension（参考上节"配合 TUN 使用"）

## 与 LaunchAgent 方式的对比

如果不想用 Clash Router UI，可以完全绕开 GUI 用 LaunchAgent 跑：

```bash
# 已有 ~/.clash/start-mihomo.sh（用户态跑 mihomo）
# 比 service 模式 + UI 更轻量，但失去 UI 切节点/测速能力
```

`prefer_sidecar_mode` 的优势：保留 UI 能力的同时用用户态 mihomo。

## 相关代码

- `src-tauri/src/core/manager/lifecycle.rs` — `prepare_startup()` 决策点
- `src-tauri/src/core/manager/state.rs` — `start_core_by_sidecar()` 用户态启动实现
- `src/components/setting/setting-clash.tsx` — UI 开关
