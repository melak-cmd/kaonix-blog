---
title: "mtr: The Traceroute That Never Lies"
description: "mtr combines ping and traceroute into a live network path monitor — learn to read hop statistics, spot loss vs latency, and generate reports for tickets."
pubDate: 2017-09-11
category: "tutorials"
tags: ["linux", "networking", "troubleshooting", "diagnostics"]
author: "Kaonix Team"
---

`traceroute` shows you a snapshot; `ping` shows you one destination. `mtr` (My Traceroute) merges both into a **continuously refreshing view of every hop** on the path, with loss and latency percentages per router. When "the network is slow" needs evidence, mtr is your instrument.

Included in distro repos (`apk add mtr`, `apt install mtr`) and in netshoot.

## Basic Syntax

```bash
mtr [options] <host>
```

Interactive mode refreshes every second:

```bash
sudo mtr example.com
```

⭐ Needs root for raw sockets by default. Use `--udp` or `--tcp` modes when ICMP is filtered.

## Reading the Columns

```text
HOST: server-01        Loss%  Snt  Last  Avg  Best  Wrst  StDev
 1. gateway.local       0.0%   50   0.4   0.5  0.3   1.2   0.2
 2. isp-core.net        0.0%   50   4.1   4.3  3.9   8.7   0.6
 3. transit.example    10.0%   50  12.3  13.1 11.9  44.2   4.8
 4. edge.example        0.0%   50  12.5  12.8 12.0  15.1   0.7
 5. web.example         0.0%   50  12.6  12.9 12.1  16.0   0.8
```

```text
Loss% → packets not answered at this hop
Snt   → probes sent
Last/Avg/Best/Wrst → RTT in milliseconds
StDev → jitter indicator
```

## The Golden Rule: Loss at Hop N Only ≠ Real Loss

Routers often deprioritize ICMP TTL-expired replies while forwarding traffic normally. So:

```text
Loss at hop 3 AND all later hops  → real congestion/loss at hop 3
Loss ONLY at hop 3, later hops clean → cosmetic rate-limiting, ignore it
```

Judge the path by the **destination's** row, and by whether loss persists to the end.

## Latency Jumps Between Hops

Compare Avg across hops:

```text
hop 2: 4ms  → hop 3: 60ms  → hop 4: 61ms
```

The +56ms happened crossing hop 3 — but part of it may be that router's reply delay. If hop 4+ stays high, the latency genuinely appears there.

## The Modes

### Report mode (for tickets & CI)

```bash
mtr --report --report-cycles 20 example.com
```

Runs 20 cycles, prints a final table. Attach this output instead of screenshots.

### TCP / UDP mode (when ICMP is blocked)

```bash
mtr --tcp -P 443 example.com          # probe with TCP SYN to 443
mtr --udp -P 53 dns.example.com
```

⭐ TCP mode probes the actual service path — load balancers may route TCP differently than ICMP, so this reflects reality better.

### No DNS (faster, cleaner)

```bash
mtr -n --report example.com
```

### Wide output (no truncation)

```bash
mtr -w --report example.com
```

### JSON/XML for automation

```bash
mtr --json --report-cycles 10 example.com > mtr.json
```

## Practical Recipes

### Prove where packet loss starts

Run report mode from BOTH ends:

```bash
# on client:
mtr -n --report --report-cycles 100 server.example.com
# on server:
mtr -n --report --report-cycles 100 client-ip
```

Loss visible symmetrically on the same middle hop = real problem there. Loss only near one endpoint = that endpoint's access link or its ICMP handling.

### Distinguish congestion from queueing

High `Avg` with high `StDev` (Wrst ≫ Best) = buffer bloat/jitter. High loss with LOW avg RTT = drops, not delay. Different fixes entirely.

### Watch a deployment live

```bash
watch -n 5 'mtr -n --report -c 10 api.internal'
```

Baseline before the change, compare after.

### Test the path your app actually uses

```bash
mtr --tcp -P 5432 db-primary.internal     # database port
mtr --tcp -P 443 api.example.com          # API through LB
```

ICMP may take a different route than your TCP session — always test the real port.

### Check both IPv4 and IPv6 paths

```bash
mtr -4 --report example.com
mtr -6 --report example.com
```

IPv6 peering issues are common and invisible to IPv4 tests.

## trippy: The Modern TUI Alternative

netshoot also ships `trip`, a Rust-based TUI traceroute with per-hop history graphs, multiple protocols and filtering:

```bash
trip example.com
trip --tcp --target-port 443 api.example.com
```

Same mental model as mtr with prettier visuals and parallel probing.

## ⭐ Production Tips

1. **Always use `--report` for documentation** — interactive screens don't attach to incidents.
2. **Probe with the app's protocol/port** (`--tcp -P`) — paths differ per QoS class.
3. **Run from both endpoints** before accusing any ISP.
4. **Ignore single-hop-only loss** — ICMP deprecation on routers is normal.
5. Baseline healthy paths once (`mtr -n -c 100 -r host > baseline.txt`); during incidents, diff against it.
