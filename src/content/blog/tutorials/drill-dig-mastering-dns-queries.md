---
title: "drill & dig: Mastering DNS Queries from the Command Line"
description: "Query DNS like an engineer: drill and dig syntax, record types, tracing resolution paths, debugging split-horizon setups and validating DNSSEC."
pubDate: 2019-05-04
category: "tutorials"
tags: ["linux", "dns", "networking", "troubleshooting"]
author: "Kaonix Team"
---

`drill` (from ldns) and `dig` (from BIND tools) do the same job: send raw DNS queries to any server and show you the complete, unfiltered answer. Unlike `ping` or `getent`, they tell you *which server* answered, *what it returned*, and *how long it took* — which is exactly what you need when resolution breaks.

Both are in distro repos (`apk add drill bind-tools`, `apt install drill dnsutils`) and in netshoot.

## Basic Syntax

```bash
dig [@server] [name] [type]
drill [@server] [name] [type]
```

Examples:

```bash
drill example.com                    # A record via resolv.conf servers
dig @1.1.1.1 example.com AAAA        # specific resolver + record type
```

## Reading the Answer

```text
;; QUESTION SECTION:
;example.com.                   IN      A

;; ANSWER SECTION:
example.com.            3600    IN      A       93.184.216.34
```

```text
name          → what was asked
3600          → TTL in seconds (how long caches keep it)
IN            → internet class
A             → record type
93.184.216.34 → value
```

⭐ Watch the flags line: `qr rd ra` means query+recursion-allowed+recursion-available. Missing `aa` on a direct authoritative answer hints at caching layers.

## Essential Record Types

```bash
drill example.com A           # IPv4 address
drill example.com AAAA        # IPv6
drill example.com MX          # mail servers
drill example.com TXT         # SPF, DKIM, verification tokens
drill example.com NS          # nameservers
drill example.com CNAME       # alias
drill -x 10.0.0.5             # reverse lookup (PTR)
```

## The Debugging Moves That Matter

### Compare resolvers

If your app sees different answers than you expect:

```bash
drill api.internal.corp @10.0.0.10     # corporate DNS
drill api.internal.corp @1.1.1.1       # public DNS
```

Split-horizon setups return private IPs internally and NXDOMAIN publicly — this one-liner proves which side you're on.

### Trace the full delegation path

```bash
drill -T example.com        # trace from root servers down
dig +trace example.com
```

You see every hop: root → TLD → authoritative. Broken delegations and lame servers become obvious.

### Query the authoritative server directly

Bypass all caches:

```bash
drill example.com @ns1.example.com +norecurse
```

(`+norecurse`/`-o norec` asks without recursion — what the zone actually contains.)

### Time the answer

The last section shows **Query time**. Compare cached vs uncached:

```bash
drill example.com | grep "Query time"     # first: maybe 40ms
drill example.com | grep "Query time"     # second: 0-1ms if cached locally
```

### Kubernetes service checks

Inside a pod:

```bash
cat /etc/resolv.conf                       # which cluster DNS?
drill my-svc.my-namespace.svc.cluster.local
drill @10.96.0.10 kubernetes.default.svc.cluster.local
```

NXDOMAIN vs timeout distinguishes "wrong name" from "CoreDNS is down".

## Useful Flags Cheat Sheet

```text
+short / -Q          → just the values
+norecurse           → no recursion (authoritative view)
+noall +answer       → clean output, answer only
-x <ip>              → reverse PTR lookup
-T (drill)           → full trace from root
@<ip>                → target a specific server
```

Scripting favorite:

```bash
dig +short myservice.default.svc.cluster.local
# → 10.96.14.22   (empty output = resolution failed)
```

## DNSSEC Validation

`drill` verifies DNSSEC signatures when the zone provides them:

```bash
drill -S example.com        # -S = chase signatures
```

Look for `RRSIG`, `DNSKEY` records and a validation result in the header flags (`ad` bit = authentic data).

## Practical Recipes

### Verify email deliverability prerequisites

```bash
drill example.com MX +short
drill example.com TXT +short          # check SPF
drill default._domainkey.example.com TXT +short
```

### Check TTL before a migration

Low TTLs make cutovers forgiving:

```bash
drill app.example.com @ns1.example.com +noall +answer
# watch this number days BEFORE moving traffic
```

### Find all nameservers for a zone

```bash
drill example.com NS +short
```

Then query each one — inconsistent answers between them = replication problem.

### Prove DNS is (or isn't) the problem

```bash
time drill api.example.com > /dev/null      # DNS slow?
curl -s -o /dev/null -w "%{time_namelookup}\n" https://api.example.com
```

If `time_namelookup` dominates total request time, stop blaming the API.

## ⭐ Production Tips

1. **Always test against multiple resolvers** — local stub, cluster DNS, public. Differences reveal split-horizon or poisoning issues.
2. **`+short` for scripts, full output for humans** — parse-friendly vs diagnostic-rich.
3. **Check TTLs before relying on fast failover** — a 86400s TTL means yesterday's mistake lives until tomorrow.
4. In containers, remember `/etc/resolv.conf` search domains: short names resolve through several queries; use FQDNs to reduce lookups.
5. `getent hosts` tests what the *system* resolves (nsswitch included); `drill`/`dig` test pure DNS. Use both to separate layers.
