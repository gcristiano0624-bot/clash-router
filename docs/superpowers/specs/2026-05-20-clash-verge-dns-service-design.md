# Clash Verge DNS and Service Recovery Design

## Summary

This document defines a backend-focused patch for `clash-verge-rev` that resolves three related classes of failures:

1. DNS settings are applied through inconsistent code paths, causing runtime structure mismatches.
2. Generated runtime config and hot-applied runtime config do not behave the same way.
3. Service mode lacks a product-safe fallback when startup fails in non-TUN scenarios.

The patch is intentionally general and product-oriented. It does not add enterprise-network-specific heuristics. Instead, it fixes config correctness, unifies application flow, and adds controlled recovery behavior.

## Goals

- Unify DNS config parsing and application across startup, reload, and settings toggle flows.
- Ensure `dns` and `hosts` are always injected into the correct top-level runtime keys.
- Remove known compatibility hazards from the default DNS template.
- Add automatic fallback from service mode to sidecar mode when service startup fails and TUN is not required.
- Improve logging so users and maintainers can distinguish DNS parsing failures, runtime apply failures, and service-mode failures.

## Non-Goals

- No automatic detection of corporate networks, VPN vendors, or blocked DoH endpoints.
- No redesign of the settings UI.
- No forced migration of existing user DNS config files.
- No automatic silent fallback in TUN-required scenarios.
- No new DNS reachability probes in the first patch.

## Problem Statement

Current DNS behavior is split between two paths:

- `src-tauri/src/enhance/mod.rs` applies DNS during generated config assembly.
- `src-tauri/src/cmd/clash.rs` applies DNS when the user toggles DNS settings in the UI.

These two paths do not use the same data model. The generated-config path correctly handles top-level `dns` and `hosts`, while the hot-apply path currently nests the entire DNS payload under `dns`. This can produce invalid or unintended runtime structure and makes runtime behavior diverge from cold-start behavior.

Separately, service-mode startup currently treats service availability as the primary execution path, but the product does not have a sufficiently explicit recovery rule for cases where service startup fails in environments that do not require TUN. This increases the chance that the application becomes unavailable even though sidecar mode could still run safely.

The default generated DNS template also includes `use-system-hosts`, which is known to be risky for compatibility with some mihomo versions.

## Existing Code Paths

### DNS Settings Toggle

- Frontend toggle: `src/components/setting/setting-clash.tsx`
- Backend command: `src-tauri/src/cmd/clash.rs::apply_dns_config`

### Runtime Config Generation

- Main generation entry: `src-tauri/src/config/config.rs::generate`
- Enhancement pipeline: `src-tauri/src/enhance/mod.rs::enhance`
- DNS injection during generation: `src-tauri/src/enhance/mod.rs::apply_dns_settings`

### Service Startup

- Running-mode selection: `src-tauri/src/core/manager/lifecycle.rs`
- Service manager and IPC status handling: `src-tauri/src/core/service.rs`

### Default DNS Template Initialization

- DNS config initialization: `src-tauri/src/utils/init.rs::init_dns_config`

## Design Principles

- Prefer one canonical backend implementation over duplicated logic.
- Keep the patch explainable as a general correctness and resilience improvement.
- Preserve existing config-file compatibility wherever possible.
- Make fallback behavior explicit and bounded by runtime requirements.
- Prefer deterministic config regeneration over ad hoc patch mutation.

## Proposed Architecture

### 1. Shared DNS Normalization Layer

Introduce a shared backend helper module for DNS config loading and normalization. A suitable location is:

- `src-tauri/src/config/dns_settings.rs`

This module is responsible for:

- Loading `dns_config.yaml`
- Parsing both supported shapes:
  - full top-level shape with `dns` and optional `hosts`
  - legacy shape where the root itself is the DNS mapping
- Returning one normalized representation
- Filtering or ignoring known compatibility-risk fields
- Producing warnings for non-fatal issues

Suggested internal model:

```rust
pub struct NormalizedDnsConfig {
    pub dns: Option<serde_yaml_ng::Mapping>,
    pub hosts: Option<serde_yaml_ng::Mapping>,
    pub warnings: Vec<String>,
}
```

### 2. Shared DNS Injection Helper

Add a helper that takes `NormalizedDnsConfig` and injects it into a runtime config mapping using only top-level keys:

- `config["dns"]`
- `config["hosts"]`

This helper must never produce nested forms such as:

```yaml
dns:
  dns: ...
  hosts: ...
```

### 3. Config Regeneration as the Only Apply Path

Refactor `apply_dns_config()` so that enabling or disabling DNS settings no longer builds a one-off partial runtime patch. Instead:

- The command validates that `dns_config.yaml` can be parsed and normalized.
- If validation succeeds, it triggers the standard config regeneration flow.
- Regeneration then passes through the same enhancement pipeline used on startup.

This makes startup behavior and runtime apply behavior identical.

### 4. Bounded Service Fallback

Add explicit service-start fallback rules:

- If the selected mode is service and startup succeeds, continue in service mode.
- If service startup fails and `enable_tun_mode` is `false`, log the failure and retry using sidecar mode.
- If service startup fails and `enable_tun_mode` is `true`, do not silently downgrade. Return the error and surface that service is required.

This ensures recovery only in scenarios where sidecar mode is an acceptable operational substitute.

### 5. Safer Default DNS Template

Update the default initialized DNS template so that:

- `use-system-hosts` is not emitted
- `hosts: {}` remains present at the top level
- the template includes at least one pure-IP nameserver path instead of being effectively DoH-only

This does not try to guess the user's environment. It simply reduces the chance that a fresh configuration is invalid or overly dependent on one DNS transport style.

## Detailed Changes

### A. `src-tauri/src/cmd/clash.rs`

Refactor `apply_dns_config()`:

- Remove manual construction of `patch["dns"] = patch_config`
- Load and normalize DNS config through the shared helper
- On `apply = true`, validate then trigger `CoreManager::global().update_config_checked()`
- On `apply = false`, trigger config regeneration without loading DNS settings
- Preserve refresh behavior for frontend state updates after successful apply

Expected outcome:

- No more structural mismatch between toggle-applied DNS and startup-generated DNS
- Fewer hidden runtime-only failures

### B. `src-tauri/src/enhance/mod.rs`

Refactor `apply_dns_settings()`:

- Replace local YAML parsing logic with the shared normalization helper
- Apply normalized `dns` and `hosts` using the shared injector
- Log warnings returned by normalization

Expected outcome:

- Startup, reload, and toggle flows all share the same backend DNS interpretation

### C. `src-tauri/src/utils/init.rs`

Update `init_dns_config()`:

- Remove `use-system-hosts`
- Keep top-level `hosts`
- Keep default values valid for the supported mihomo range
- Ensure the default DNS template is not dependent on DoH only

Expected outcome:

- Better out-of-box compatibility
- Lower chance of hidden parser rejection in older or stricter mihomo versions

### D. `src-tauri/src/core/manager/lifecycle.rs`

Update `start_core()`:

- Try `start_core_by_service()` when running mode is `Service`
- If it fails and TUN is disabled, log the failure and retry with `start_core_by_sidecar()`
- If it fails and TUN is enabled, return the original error

Expected outcome:

- Non-TUN users are no longer blocked by service-mode startup failures
- TUN-required users still get correct failure semantics

### E. `src-tauri/src/core/service.rs`

Improve service-mode diagnostics:

- Log explicit events for service-ready, service-start-failed, fallback-to-sidecar, and service-required-but-unavailable
- Preserve current service status checks and reinstall logic
- Do not broaden service health logic into a network reachability checker in this patch

Expected outcome:

- Better operational visibility
- Lower support and debugging cost

## Runtime Flow After Patch

### Cold Start

1. The app loads verge settings.
2. If DNS settings are enabled, the enhancement pipeline loads and normalizes `dns_config.yaml`.
3. Normalized `dns` and `hosts` are injected into the final runtime config.
4. Core startup attempts service mode when selected.
5. If service startup fails and TUN is disabled, sidecar mode is used automatically.

### DNS Toggle

1. Frontend updates `enable_dns_settings`.
2. Backend validates `dns_config.yaml` through the shared normalizer.
3. Backend regenerates runtime config through the standard pipeline.
4. Runtime config now matches cold-start semantics.

### DNS File Update and Reapply

1. User saves edited DNS config.
2. Validation runs through the shared parser.
3. On success, config regeneration applies the same normalized data path.
4. On failure, the old runtime config remains active.

## Compatibility Strategy

- Accept both top-level `{ dns, hosts }` and root-DNS-only file layouts.
- Treat unsupported or risky fields as ignorable when safe.
- Do not rewrite the user's DNS config file automatically in the first patch.
- Preserve existing behavior when DNS settings are disabled.

## Error Handling

### Missing DNS Config File

- Return a clear error from apply/validation commands.
- Do not modify current runtime config.

### Invalid DNS YAML

- Return parse error details.
- Do not update runtime config.

### Normalization Warning

- Log warnings for ignored fields or ambiguous layout.
- Continue only if the normalized result is still valid.

### Service Startup Failure

- If TUN is disabled, retry with sidecar and log the reason.
- If TUN is enabled, stop and surface the error.

### Config Regeneration Failure

- Keep the current running config intact.
- Return an error to the caller.

## Test Plan

### Unit Tests

- Add tests for the shared DNS normalizer covering:
  - top-level `{ dns, hosts }`
  - root-level DNS mapping
  - presence of `use-system-hosts`
  - empty `hosts`
  - malformed structures

### Enhancement Tests

- Verify that `enable_dns_settings = false` leaves runtime config untouched by external DNS file data.
- Verify that `enable_dns_settings = true` injects normalized top-level `dns` and `hosts`.

### Command Tests

- Verify that `apply_dns_config(true)` no longer creates nested DNS shape.
- Verify that invalid DNS config prevents runtime update.

### Lifecycle Tests

- Verify service failure falls back to sidecar when TUN is disabled.
- Verify service failure does not silently downgrade when TUN is enabled.

## Acceptance Criteria

- DNS toggle and cold start produce the same runtime `dns` and `hosts` layout.
- No runtime path produces nested `dns: { dns: ..., hosts: ... }`.
- Default initialized DNS config no longer emits `use-system-hosts`.
- Non-TUN service startup failure automatically falls back to sidecar.
- TUN-required service failure remains explicit and user-visible.
- Logs clearly distinguish DNS parsing failure, config apply failure, and service fallback behavior.

## Risks and Trade-Offs

- Regenerating full config on DNS apply is heavier than partial patching, but it is much more reliable and easier to reason about.
- Service fallback is intentionally limited to non-TUN scenarios, which is conservative but safe.
- Default DNS template changes improve compatibility but do not guarantee reachability in every restricted network.

## Implementation Order

1. Add shared DNS normalization and injection helpers.
2. Refactor `apply_dns_settings()` to use the shared helpers.
3. Refactor `apply_dns_config()` to trigger unified config regeneration.
4. Update default DNS template initialization.
5. Add bounded service fallback in lifecycle startup.
6. Add or update targeted tests.

## Open Decisions Resolved

- DNS application should be unified in the backend, not duplicated between enhancement and command layers.
- Hot apply should regenerate config rather than mutate a one-off draft patch.
- Service fallback is allowed only when TUN is not required.
- The first patch should remain generic and upstream-friendly rather than environment-specialized.
