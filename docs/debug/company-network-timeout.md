# [OPEN] Debug Session: company-network-timeout

## Summary

- Symptom: In company network environment, VPN/proxy nodes appear to time out.
- Expected: Nodes should complete latency test / connection establishment normally, or surface a clear root cause instead of generic timeout behavior.
- Scope: Clash Router runtime behavior under enterprise network constraints.

## Hypotheses

1. The company network blocks direct outbound probes used by node latency testing, causing all delay checks to time out before actual proxy connection logic is exercised.
2. The app is using a test URL, DNS path, or port/protocol that is specifically restricted in the company network, while the node itself may still be usable with a different probe target.
3. A local system proxy / TUN / sidecar interaction issue under corporate network conditions is preventing mihomo from establishing or validating outbound traffic correctly.
4. TLS interception, DNS pollution, or captive enterprise gateway behavior is causing request handshake failures that are currently surfaced only as generic timeouts.
5. The frontend timeout presentation is masking a more specific backend failure from mihomo logs, such as connection refused, EOF, certificate error, or DNS resolve failure.

## Evidence Plan

- Inspect current latency test, proxy selection, and timeout configuration paths.
- Collect runtime logs around delay testing and actual node usage in company network conditions.
- Distinguish frontend timeout display from backend mihomo / sidecar failure causes.
- Verify whether timeout happens only in delay tests or also in real traffic through selected nodes.

## Status

- Session opened.
- No business logic modified yet.
- Existing evidence collected from code and runtime logs.

## Evidence

- Frontend proxy delay logic falls back to `http://cp.cloudflare.com/generate_204` when no custom latency URL is configured.
- Proxy group header writes the test URL into `delayManager`, and group-wide delay checks reuse that URL.
- Runtime sidecar logs repeatedly show failures against `http://www.gstatic.com/generate_204` with `context deadline exceeded`, `context canceled`, and occasional `EOF`.
- This indicates the timeout is happening during the probe request to the latency-check endpoint, not necessarily during all real proxy traffic.

## Interim Assessment

- Hypothesis 1: Supported by runtime logs.
- Hypothesis 2: Strongly supported by code path plus runtime logs.
- Hypothesis 3: Not yet confirmed.
- Hypothesis 4: Plausible because `EOF` appears in sidecar logs, but not yet proven.
- Hypothesis 5: Supported because the UI collapses multiple backend failure kinds into timeout-like delay results.

## Next Step

- Ask the user whether actual browsing / external requests through the selected proxy also fail, or only delay checks show timeout.
- If actual traffic also fails, add instrumentation around selected proxy, test URL, and runtime mode before changing logic.
- If only delay checks fail, prioritize changing probe target / timeout behavior instead of touching connection logic.

## Implemented Mitigation

- Added built-in latency probe fallback URLs so the client no longer hardcodes a single `generate_204` endpoint.
- Allow custom latency test configuration to contain multiple URLs separated by newline or comma.
- Refined delay result presentation into `Timeout`, `DNS`, `TLS`, `Blocked`, `Network`, and `Error`.
- Kept existing sorting and rendering flow compatible by mapping refined failure kinds onto stable sentinel delay values.

## Validation

- `pnpm typecheck` passed.
- `pnpm web:build` passed.
- Debug session remains open because company-network reproduction still needs post-change runtime confirmation.

## Additional Evidence 2026-05-21

- User reported node `香港专线1→新加坡 | 6x` still alternates between timeout and measurable delay.
- Runtime sidecar logs show real TCP traffic through this node succeeds around 12:15-12:16.
- The same log window shows provider/group health checks still failing against `http://cp.cloudflare.com/generate_204` with `EOF` and `use of closed network connection`.
- Root cause refined: provider health-check history and `delayGroup()` can overwrite or race against frontend fallback delay results.

## Follow-up Fix

- Provider nodes now also run through `DelayManager.checkDelay()` fallback probing.
- `DelayManager.getDelayFix()` now prefers fresh fallback cache for provider and non-provider nodes before falling back to mihomo history.
- Proxy group and current proxy card checks now include provider nodes in fallback probing while keeping provider health-check refresh for compatibility.
