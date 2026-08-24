---
title: "The ss Command: Linux Socket Statistics Explained with Practical Examples"
description: "Master ss, the modern replacement for netstat: inspect TCP/UDP sockets, filter by state and port, find listening services, troubleshoot connections and measure buffer usage."
pubDate: 2026-08-24
category: "tutorials"
tags: ["linux", "networking", "troubleshooting", "cli", "cheatsheet"]
author: "Kaonix Team"
---

`ss` (socket statistics) is the modern Linux tool for inspecting network connections. It replaces the aging `netstat`, reads its data directly from the kernel via Netlink (no `/proc/net` parsing), and is dramatically faster on systems with thousands of connections.

If `netstat` is your habit, this post is your migration path — and if you already use `ss`, you'll probably discover a few options you didn't know.

## Basic Syntax

```bash
ss [options] [state <state>] [filter]
```

The command pattern is:

```bash
ss <what> <how to display> <filters>
```

Example:

```bash
ss -tulpn | grep 443
```

## Why Not netstat?

| Aspect            | `netstat`                  | `ss`                          |
| ----------------- | -------------------------- | ----------------------------- |
| Data source       | `/proc/net/*` files        | Kernel Netlink API            |
| Speed             | Slow with many sockets     | Instant, even with 100k+      |
| Maintained        | Deprecated on modern distros | Active (`iproute2` suite)    |
| Filtering         | Mostly grep                | Built-in state/port filters   |
| Buffer details    | No                         | Yes (`-m`, `-i`)              |

On Debian/Ubuntu, `netstat` comes from the optional `net-tools` package. Prefer `ss` from `iproute2`, which is installed everywhere.

⭐ Quick translation table:

```text
netstat -r          → ip route
netstat -i          → ip -s link
netstat -g          → ip maddr
netstat -ltnp       → ss -tlpn
```

## List All Sockets

```bash
ss
```

Every socket, both listening and established, in a compact table:

```text
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port  Process
tcp   LISTEN 0      128    0.0.0.0:22         0.0.0.0:*          users:(("sshd",pid=800,fd=3))
tcp   ESTAB  0      0      10.0.0.5:22        10.0.0.1:51734     users:(("sshd",pid=1904,fd=4))
```

### The columns

```text
Netid     → protocol (tcp, udp, raw, u_unix...)
State     → socket state (LISTEN, ESTAB, TIME-WAIT...)
Recv-Q    → bytes not yet read by the application
Send-Q    → bytes not yet ACKed by the remote host
Local     → local address:port
Peer      → remote address:port
Process   → process using the socket (with -p)
```

⭐ Tip: a persistently non-zero **Recv-Q** on a busy socket means the application is slower than the traffic — a classic saturation signal.

## The Essential Option Combinations

### Listening TCP sockets

```bash
ss -tl
```

### Listening TCP sockets with process names and port numbers

```bash
ss -tlpn
```

This is the single most useful variant: which service owns which port.

```bash
ss -tlpn
```

```text
State  Recv-Q Local Address:Port Peer Address:Port Process
LISTEN 0      128 0.0.0.0:22       0.0.0.0:*         users:(("sshd",pid=800,fd=3))
LISTEN 0      511 *:443             *:*               users:(("nginx",pid=912,fd=6))
```

### All TCP connections

```bash
ss -ta
```

### UDP

```bash
ss -ua
```

### Unix sockets

```bash
ss -xa
```

### Summary statistics per protocol

```bash
ss -s
```

```text
Total: 1234
TCP:   450 (estab 120, closed 12, orphaned 0, timewait 210)

Transport Total IP IPv6
TCP       450   320 130
UDP       45    30  15
```

⭐ Run `ss -s` during an incident: a rising **timewait** or **orphaned** count tells you a lot about connection churn.

## Filter by Protocol

Combine letters: `t` = TCP, `u` = UDP, `w` = raw, `x` = unix.

```bash
ss -t          # connected TCP
ss -tl         # listening TCP
ss -u          # connected UDP
ss -tul        # all listening TCP + UDP
```

⭐ Note the subtlety: without `-a`, `ss -t` shows only *connected* sockets. Add `-l` for listeners, `-a` for everything.

## Filter by Port and Address

### Everything on a specific port

```bash
ss -tan '( dport = :443 or sport = :443 )'
```

### Connections to a remote host

```bash
ss -tan dst 10.0.0.20
```

### Traffic on a local address only

```bash
ss -tl src 10.0.0.5
```

### A subnet

```bash
ss -tan 'dst 10.0.0.0/24'
```

### Multiple ports

```bash
ss -tan '( sport = :80 or sport = :443 )'
```

## Filter by State

List available states:

```bash
ss state help
```

Common ones: `established`, `listening`, `time-wait`, `close-wait`, `fin-wait-1`, `syn-recv`.

### Only established connections

```bash
ss -tan state established
```

### Find leaked connections: CLOSE-WAIT

A pile of `close-wait` sockets means the remote side closed but your application never called `close()` — usually a file-descriptor leak.

```bash
ss -tan state close-wait
```

Count them quickly:

```bash
ss -tan state close-wait | tail -n +1 | wc -l
```

### TIME-WAIT flood check

Many `time-wait` entries are normal for high-churn HTTP traffic; they last 60 seconds by default.

```bash
ss -tan state time-wait | wc -l
```

### Who is connecting right now (SYN-RECV)?

A burst of `syn-recv` from scattered IPs can indicate a SYN flood.

```bash
ss -tn state syn-recv
```

## Identify the Process Behind a Socket

```bash
sudo ss -tlpn sport = :8080
```

⭐ `-p` requires root (or at least the process owner's privileges) to see other users' processes. Without sudo you get empty Process columns.

Find what occupies a port before starting your app:

```bash
sudo ss -lpn 'sport = :3000'
```

## Resolve or Don't Resolve Names

By default `ss` tries to resolve IPs to hostnames and ports to service names, which can be slow.

```bash
ss -n        # numeric only, no resolution — fastest
ss -r        # resolve hosts
ss -p        # show processes
```

⭐ In scripts, always use `-n`: name resolution adds latency and DNS dependencies.

## Extended Information

### Timer info (keepalive, retransmits)

```bash
ss -to state established
```

```text
ESTAB 0 0 10.0.0.5:22 10.0.0.1:51734 timer:(keepalive,119min,0)
```

### Interface and cgroup information

```bash
ss -ti state established
```

Shows RTT, retransmission counters, congestion window — invaluable for latency debugging:

```text
cubic wscale:7,7 rto:364 rtt:63.5/127 ato:40 mss:1448 ... retrans:0/3 ...
```

### Memory buffers

```bash
ss -tm
```

```text
skmem:(r0,rb212992,t0,tb212992,f0,w0,o0,bl0)
```

### Detailed socket internals

```bash
ss -e          # extended details (uid, inode, cgroup)
ss -i          # TCP internal info
ss -m          # memory usage
```

## IPv4 vs IPv6

```bash
ss -4 -tlpn    # IPv4 only
ss -6 -tlpn    # IPv6 only
```

Check whether your service listens on both stacks:

```bash
ss -tlpn | grep -E '::|\*'
```

⭐ A listener on `*:443` with `v6only=0` accepts IPv4 too (dual stack). If you only see `[::]:443`, that's normal for dual-stack Linux sockets.

## Monitor Continuously

`ss` is point-in-time; wrap it in `watch`:

```bash
watch -n 1 'ss -tan state established | wc -l'
```

Live view of new connections to port 443:

```bash
watch -n 1 "ss -tan '( dport = :443 or sport = :443 )'"
```

Or log snapshots for later analysis:

```bash
while true; do date >> /tmp/ss.log; ss -tan >> /tmp/ss.log; sleep 5; done
```

## Practical Recipes

### What is listening on my server?

```bash
sudo ss -tlpn4
```

Audit anything bound to `0.0.0.0` or `*` that should be on `127.0.0.1` instead — databases and caches are frequent offenders.

### Who is connected to my SSH?

```bash
ss -tn state established '( sport = :22 )'
```

### Is my service reachable locally?

```bash
ss -tln 'sport = :5432'
```

If Postgres shows `127.0.0.1:5432` only, remote containers cannot reach it — change `listen_addresses` or bind explicitly.

### Count connections per client IP

```bash
ss -tn state established | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -rn | head
```

Great for spotting a misbehaving client hammering your API.

### Compare before/after a config change

```bash
ss -s > /tmp/before.txt
# apply change, generate load...
ss -s > /tmp/after.txt
diff /tmp/before.txt /tmp/after.txt
```

### Find sockets of a specific user

```bash
sudo ss -tpn state established | grep "users:((\"www-data\""
```

Or by UID:

```bash
sudo ss -epn | awk '$5 == 33'
```

(33 = www-data on most Debian systems.)

## Troubleshooting Workflow

When connectivity breaks, walk through it in order:

```text
1. Is anything listening?
      sudo ss -tlnp 'sport = :<port>'
        ↓ nothing → service down or wrong bind address
2. Is it bound where you expect?
      127.0.0.1 vs 0.0.0.0 vs container IP
        ↓ localhost-only → fix bind/listen config
3. Are clients connecting?
      ss -tn state established '( sport = :<port> )'
        ↓ no ESTAB under load → firewall/routing problem
4. Are connections piling up?
      Recv-Q growing, syn-recv climbing
        ↓ yes → application too slow or backlog exhausted
5. Any leaks?
      close-wait count rising over time
        ↓ yes → missing close() in application code
```

The key principle is the same as any diagnosis: **observe first, change one thing, verify**.

## ⭐ Production Tips

### 1. Use `sudo` with `-p`

Without privileges, process attribution silently disappears — don't confuse "no process" with "kernel socket".

### 2. Always add `-n` in scripts

DNS lookups make output nondeterministic and slow.

### 3. Watch Recv-Q/Send-Q, not just counts

Zero growth in connections with growing queues means the app, not the network, is the bottleneck.

### 4. Check both stacks

An IPv6-only listener is the classic "works in curl, fails in the container" mystery.

### 5. Baseline `ss -s` on healthy systems

You can only recognize abnormal timewait/orphaned numbers if you know the normal ones.
