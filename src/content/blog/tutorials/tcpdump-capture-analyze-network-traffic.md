gi---
title: "tcpdump: Capture and Analyze Network Traffic Like a Pro"
description: "Learn tcpdump, the classic packet analyzer: capture filters, reading output, saving pcaps for Wireshark and the recipes every Linux engineer should know."
pubDate: 2021-08-25
category: "tutorials"
tags: ["linux", "networking", "troubleshooting", "tcpdump"]
author: "Kaonix Team"
---

`tcpdump` is the reference command-line packet analyzer. Almost every network problem eventually ends with "let's see what's actually on the wire" — and this is the tool that answers it.

It ships with most distributions (`apk add tcpdump`, `apt install tcpdump`) and is included in the netshoot image.

## Basic Syntax

```bash
tcpdump [options] [filter expression]
```

Capture on the default interface:

```bash
sudo tcpdump
```

⭐ Always start by listing interfaces so you capture the right one:

```bash
tcpdump -D
```

## The Options That Matter

```bash
sudo tcpdump -i eth0        # interface
sudo tcpdump -n             # no DNS resolution (fast, deterministic)
sudo tcpdump -nn            # ports as numbers too
sudo tcpdump -c 100         # stop after 100 packets
sudo tcpdump -A             # print payloads as ASCII (HTTP headers visible)
sudo tcpdump -X             # ASCII + hex payload
sudo tcpdump -w file.pcap   # write to file
sudo tcpdump -r file.pcap   # read from file
sudo tcpdump -v / -vv       # more protocol detail
sudo tcpdump -e             # show MAC addresses
```

The everyday invocation:

```bash
sudo tcpdump -i any -nn -c 50
```

## Reading the Output

```text
14:32:01.123456 IP 10.0.0.5.51734 > 93.184.216.34.443: Flags [S], seq 283471, win 64240, length 0
```

```text
timestamp      → when the packet arrived
10.0.0.5.51734 → source ip.port
>              → direction
93.184...443   → destination ip.port
Flags [S]      → SYN (see table below)
length         → payload bytes
```

TCP flags you'll see:

```text
[S]  SYN        → connection attempt
[S.] SYN-ACK    → accepted
[.]  ACK        → normal traffic
[F]  FIN        → clean close
[R]  RST        → refused or aborted ← investigate!
[P]  PSH        → push data
```

⭐ A stream of `[S]` with no `[S.]` reply means the remote is dropping or unreachable — classic firewall symptom.

## Filter Expressions

Filters use pcap syntax — three primitives: `type`, `dir`, `proto`.

### By host

```bash
sudo tcpdump -nn host 10.0.0.20
sudo tcpdump -nn src 10.0.0.20
sudo tcpdump -nn dst 10.0.0.20
```

### By port

```bash
sudo tcpdump -nn port 443
sudo tcpdump -nn 'port 80 or port 443'
sudo tcpdump -nn 'src port 53 or dst port 53'     # DNS only
```

### By protocol

```bash
sudo tcpdump -nn icmp
sudo tcpdump -nn tcp
sudo tcpdump -nn udp
```

### Combined

```bash
sudo tcpdump -nn -i eth0 'tcp and dst port 443 and not src 10.0.0.1'
```

⭐ `and`, `or`, `not` combine primitives; parentheses need quoting to protect them from the shell.

## Practical Recipes

### Watch an HTTP request live

```bash
sudo tcpdump -i any -nn -A -s0 'tcp port 80 and host example.com'
```

(`-s0` = full packet snap length, no truncation.)

### Diagnose TLS handshake failures

```bash
sudo tcpdump -nn -i any 'host api.example.com and tcp port 443'
```

Look for: ClientHello sent but no ServerHello → SNI/firewall issue; immediate RST after ClientHello → server rejecting (TLS version/cipher).

### Spot MTU problems

```bash
sudo tcpdump -nn -i eth0 'icmp'
```

Fragmentation-needed ICMP messages while sending large packets = PMTUD broken somewhere.

### Capture for Wireshark analysis

```bash
sudo tcpdump -i eth0 -nn -w /tmp/issue.pcap -G 60 -W 10
# rotating files, max 10 × 60 seconds
```

Then open `/tmp/issue*.pcap` in Wireshark or `tshark`.

### Verify keepalives

```bash
sudo tcpdump -nn -i any 'tcp[tcpflags] & (tcp-ack) != 0 and host 10.0.0.9 and port 5432' | grep -c length 0
```

### See who is scanning you

```bash
sudo tcpdump -nn 'tcp[tcpflags] == tcp-syn and not dst net 10.0.0.0/8'
```

## Performance Tips

On busy hosts, filters applied *after* copying packets still burn CPU. Prefer kernel-level filtering (`BPF`) with precise expressions, and always cap with `-c` or `-G/-W` so files don't eat the disk.

For very high traffic, capture a sample instead of everything:

```bash
sudo tcpdump -nn -i eth0 -c 10000 -w sample.pcap
```

## ⭐ Production Tips

1. **Use `-nn` in scripts** — name resolution can hang the capture.
2. **Prefer `-i any`** in containers/Kubernetes; pod traffic often moves between veth devices.
3. **Write pcaps, read later** — analyzing with `tcpdump -r` or Wireshark beats squinting at live output.
4. **RST storms are almost never the client's fault** — chase the middleboxes first.
5. In Kubernetes, run it inside a netshoot sidecar sharing the pod's namespace to capture exactly what the app sees.
