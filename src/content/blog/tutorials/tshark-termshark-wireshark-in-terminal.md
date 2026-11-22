---
title: "tshark & termshark: Wireshark Power in Your Terminal"
description: "Dissect protocols, extract fields and analyze pcaps from the command line with tshark — plus termshark's interactive TUI when you want Wireshark without leaving the terminal."
pubDate: 2022-11-28
category: "tutorials"
tags: ["linux", "networking", "troubleshooting", "tshark", "wireshark"]
author: "Kaonix Team"
---

`tshark` is Wireshark's command-line twin: the same deep protocol dissectors, the same display filters, but scriptable. `termshark` wraps it in an interactive TUI that feels like Wireshark inside your terminal.

Both ship in Alpine/APK and most distro repos (`apk add tshark termshark`, `apt install tshark termshark`) and are part of the netshoot image.

## Basic Syntax

```bash
tshark [options] -i <interface> [capture filter]
```

Live capture on eth0:

```bash
sudo tshark -i eth0
```

⭐ Capture filters (`-f`, BPF syntax) decide what gets *recorded*; display filters (`-Y`) select what gets *shown* from what was recorded. Learn both.

## Display Filters: The Real Superpower

Wireshark display filters inspect dissected fields:

```bash
sudo tshark -i eth0 -Y "http.request"
sudo tshark -i eth0 -Y "dns.flags.response == 0"          # DNS queries only
sudo tshark -i eth0 -Y "tcp.flags.reset == 1"             # RST packets
sudo tshark -i eth0 -Y "http.request.uri contains \"api/\""
sudo tshark -i eth0 -Y "tls.handshake.type == 1"          # TLS ClientHellos
```

Tab-complete field names with `tshark -G fields | grep ...`, or type them into Wireshark once to discover what exists.

## Extract Fields with -T

Turn packet captures into structured output:

```bash
# Which hosts are clients talking to?
sudo tshark -i eth0 -T fields -e ip.dst -e tcp.dstport | sort | uniq -c | sort -rn | head

# All HTTP requests as host + URI pairs
sudo tshark -i eth0 -Y http.request -T fields -e http.host -e http.request.uri

# DNS query names
sudo tshark -i eth0 -Y "dns.flags.response == 0" -T fields -e dns.qry.name

# TLS SNI values (which server names clients ask for)
sudo tshark -i eth0 -Y "tls.handshake.extensions_server_name" -T fields -e tls.handshake.extensions_server_name
```

Output formats: `-T fields|json|csv|tabs|ek`. JSON is perfect for piping into `jq`.

## Analyze Capture Files

```bash
tshark -r /tmp/capture.pcap                          # summary
tshark -r /tmp/capture.pcap -Y "http"                # filtered
tshark -r /tmp/capture.pcap -z conv,tcp              # TCP conversations
tshark -r /tmp/capture.pcap -z io,phs                # protocol hierarchy stats
tshark -r /tmp/capture.pcap -q -z endpoints,ip       # endpoint table
```

The IO statistics are gold for capacity questions:

```bash
tshark -r /tmp/capture.pcap -q -z io,stat,10,"COUNT(tcp.analysis.retransmission)tcp.analysis.retransmission"
# retransmissions per 10-second bucket
```

## Follow Streams

Reconstruct a conversation:

```bash
tshark -r capture.pcap -q -z follow,tcp,ascii,<stream-number>
```

Find the stream number first:

```bash
tshark -r capture.pcap -Y "http.request" -T fields -e tcp.stream | head -1
```

## termshark: Interactive Mode

```bash
sudo termshark -i eth0                    # live capture
termshark -r /tmp/capture.pcap            # open a file
```

You get panes for packet list, detail tree, bytes and filter bar — with display-filter autocomplete. When you'd otherwise say "let me copy this pcap somewhere with a GUI", just run termshark where it is.

## Practical Recipes

### Prove who resets a connection

```bash
sudo tshark -i any -Y "tcp.flags.reset==1" -T fields -e frame.time -e ip.src -e ip.dst -e tcp.srcport
```

### Measure DNS latency from real traffic

```bash
sudo tshark -i eth0 -Y "dns" -T fields -e frame.time_relative -e dns.id -e dns.flags.response | head -40
```

Match query/response IDs and diff timestamps — or simply:

```bash
sudo tshark -i eth0 -Y "dns.time" -T fields -e dns.time
```

### Export HTTP objects (files transferred)

```bash
tshark -r capture.pcap --export-objects http,/tmp/http-objects
```

### Decrypt-ready TLS capture

```bash
sudo tshark -i eth0 -w tls.pcapng -f "tcp port 443"
tshark -r tls.pcapng -o tls.keylog_file:/path/keylog.txt -Y "http2"
```

(Requires SSLKEYLOGFILE from the client or app-provided keys.)

### Top talkers on an interface

```bash
sudo tshark -i eth0 -q -z conv,ip -c 5000 | head -20
```

## tshark vs tcpdump

```text
tcpdump → fast capture, BPF filtering, always available, low overhead
tshark  → deep dissection, field extraction, protocol-aware stats
```

⭐ The pro pattern: **capture with tcpdump, analyze with tshark**. Keep capture overhead minimal; spend the CPU on analysis instead.

## ⭐ Production Tips

1. Running as root? tshark warns and disables dissectors by default (`--no-discard-comments` territory) — read the message, use `-a duration:` limits.
2. Cap live captures (`-c N` or `-a duration:60`) so a forgotten session doesn't fill the disk.
3. `-P` (or `-V`) prints the full dissector tree per packet — heavy but definitive.
4. In Kubernetes, run tshark in a netshoot container sharing the pod namespace; add `-i eth0` explicitly since pod interfaces are named.
5. Learn 5 display filters by heart: RSTs, DNS responses, TLS ClientHello, HTTP requests, retransmissions — they cover 80% of incidents.
