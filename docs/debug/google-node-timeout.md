# Debug Session: google-node-timeout [OPEN]

## Summary
- Symptom: after switching to specific Hong Kong premium nodes, Google-related sites still disconnect intermittently and UI/node checks still show occasional timeout.
- Scope: current local `Clash Router.app` on macOS with system proxy enabled.
- Session ID: `google-node-timeout`

## Reproduction
1. Launch `Clash Router.app`.
2. Enable system proxy.
3. Switch to `香港专线1→美国 | 6x` or similar Hong Kong premium node.
4. Visit Google-related sites and observe intermittent disconnects / timeout.

## Hypotheses
- H1: real node traffic is intermittently failing at the sidecar/mihomo layer, not just UI delay display.
- H2: Google-family domains are taking a different route or DNS/TLS path than the tested probe URLs, so fallback latency looks healthy while real browsing still breaks.
- H3: provider healthcheck or proxy refresh still overwrites part of the UI/runtime state after fallback delay succeeds.
- H4: system proxy mode exposes a browser connection pattern (HTTP/2, QUIC fallback, IPv6, parallel connects) that this node handles poorly under company network conditions.
- H5: repeated short disconnects come from node/provider-side instability and will appear as bursts in sidecar logs around Google domains.

## Evidence Log
- Evidence A: `www.google.com`, `fonts.gstatic.com`, `googleusercontent.com`, `googleapis.com`, `gvt2.com` requests are observed using `AI-SELECT[⚡️🇸🇬 香港专线1→新加坡丨6x]` in `sidecar_latest.log`.
- Evidence B: `c.gle` requests fall through to `dial DIRECT ... dns resolve failed`, which matches intermittent Google page breakage under company network conditions.
- Evidence C: `beacons5.gvt3.com` is routed with `match Match using DIRECT`, proving Google-family domains are only partially covered by the current ruleset.
- Evidence D: runtime config is `mode: rule`, and current rules cover `google.com`, `googleapis.com`, `googleusercontent.com`, `gstatic.com`, `gvt1.com`, `gvt2.com`, but do not cover `c.gle` or `gvt3.com`.
- Evidence E: active local profile selected node is `⚡️🇺🇸 香港专线1→美国丨6x` for `AI-AUTO` and `⚡️🇸🇬 香港专线1→新加坡丨6x` for `AI-SELECT`, confirming the browser is operating under rule mode rather than forced-global mode.
- Evidence F: `linux.do` repeatedly falls through to `dial DIRECT (match Match/) ... dns resolve failed`, proving the latest failure is caused by missing site routing coverage rather than node-only instability.
- Evidence G: `cdn.ldstatic.com` and `cdn3.ldstatic.com` also fail through `DIRECT`, which explains incomplete page load for `linux.do`.

## Plan
1. Read recent app and sidecar logs around the failure window.
2. Patch runtime config generation to auto-append missing Google-family rules before `MATCH,DIRECT` when `AI-SELECT` exists.
3. Extend the same runtime rule patching to known foreign sites that are failing through `DIRECT` under company DNS, starting with `linux.do` and its static domains.

## Status
- Root cause narrowed: partial Google-family rule coverage leaks some requests to `DIRECT`, causing real browsing disconnects independent of latency display.
