# Kaonix Blog

![CI](https://github.com/melak-cmd/kaonix-blog/actions/workflows/deploy.yml/badge.svg)

**IT tutorials, best practices, and the latest news in technology** — built with [Astro](https://astro.build), themed after the Matrix, deployed anywhere.

🔗 **Live**: https://melak-cmd.github.io/kaonix-blog/ · https://doli.kaonix.local (local Docker)

---

## ✨ Features

- 📚 **Content collections** — type-safe Markdown posts validated at build time
- 🏷️ **3 categories** — Tutorials, Best Practices, Tech News
- 🌗 **Theme system** — Auto / Light / Dark toggle, persisted in localStorage, no flash on load
- 🌧️ **Matrix banner** — animated code rain (katakana + Arabic + hex) on canvas with CRT scanlines
- 🔍 **Search** — `Ctrl+K` overlay filtering posts & tips, full keyboard navigation
- 📄 **Pagination** — Crossplane-style listing, 6 posts per page (`/blog/page/N/`)
- 💡 **Tips section** — daily rotating tip + dedicated archive at `/tips`
- ⏱️ **Reading time**, table of contents, prev/next navigation, copy-to-clipboard code blocks
- 📈 **SEO ready** — Open Graph, Twitter cards, canonical URLs, sitemap, RSS feed
- ♿ **Accessible** — skip-link, ARIA labels, `prefers-reduced-motion` respected everywhere
- 🐳 **Docker + TLS** — multi-stage nginx image with mkcert HTTPS
- 🚀 **CI/CD** — GitHub Actions: build → smoke test → deploy to Pages
- 🔥 **Load tested** — k6 suite included (`make load-test`)

## 🚀 Quick start

```bash
# Prerequisites: Node 22+, npm

make install        # install dependencies
make dev            # dev server → http://localhost:4321
```

### Production build locally

```bash
make build          # static output in dist/
make preview        # serve the build → http://localhost:4321
```

### Docker with HTTPS (mkcert)

```bash
make certs          # generate local CA + certificates (first time only)
make up             # → http://localhost → redirects to https://localhost
```

For the nice domain name, add to `/etc/hosts`:

```
127.0.0.1 doli.kaonix.local
```

then open **https://doli.kaonix.local** — trusted automatically by your browser via the mkcert local CA.

> Regenerated certificates? Restart nginx so it reloads them: `docker compose restart web`

## ✍️ Writing content

Drop a Markdown file into `src/content/blog/` — the filename becomes the URL slug:

```markdown
---
title: "My Awesome Post"
description: "One-line summary used in cards, SEO and RSS."
pubDate: 2026-08-24
category: "tutorials"    # tutorials | best-practices | news
tags: ["linux", "security"]
author: "Your Name"       # optional, defaults to Kaonix Team
draft: false              # true = excluded from build
---

## It just works

Regular Markdown with syntax-highlighted code blocks...
```

Posts are validated against the schema in `src/content.config.ts` — a bad frontmatter fails the build, not production.

## 🗂️ Project structure

```text
├── astro.config.mjs         # site/base config (env-driven)
├── docker-compose.yml       # web service, ports 80/443, certs volume
├── Dockerfile               # multi-stage: node build → nginx runtime
├── Makefile                 # all common tasks (make help)
├── nginx.conf               # TLS, security headers, gzip, caching
├── public/
│   ├── favicon.svg          # matrix logo
│   └── robots.txt
├── src/
│   ├── components/          # Header, Footer, PostCard, Timeline,
│   │                        # MatrixRain, ThemeToggle, SearchModal…
│   ├── content/blog/        # ← your Markdown posts
│   ├── data/tips.ts         # tips archive (daily rotation source)
│   ├── layouts/             # BaseLayout (SEO + theme init + scripts)
│   ├── pages/
│   │   ├── blog/            # paginated listing + post routes
│   │   ├── categories/      # per-category listings
│   │   ├── tips/            # tips archive page
│   │   └── rss.xml.js       # RSS feed endpoint
│   ├── styles/global.css    # design tokens (dark + light palettes)
│   └── utils/               # reading time, dates, base-path helper
└── tests/load-test.js       # k6 scenario
```

## 🔧 Makefile targets

| Target | Description |
|--------|-------------|
| `make help` | List all targets |
| `make install` | Install npm dependencies |
| `make dev` | Dev server with hot reload |
| `make build` | Production build to `dist/` |
| `make preview` | Preview the production build |
| `make certs` | Generate mkcert TLS certificates |
| `make up` | Start container with TLS (build if needed) |
| `make down` | Stop and remove the container |
| `make logs` | Follow container logs |
| `make load-test` | k6 load test (60s, up to 40 VUs) |

## 🌍 Multi-environment config

`astro.config.mjs` reads environment variables, so one codebase serves every target:

| Target | `SITE_URL` | `PUBLIC_BASE_PATH` | URLs |
|--------|-----------|--------------------|------|
| Local dev / Docker | *(default)* | *(unset)* | `/blog/...` |
| GitHub Pages | `https://melak-cmd.github.io` | `/kaonix-blog` | `/kaonix-blog/blog/...` |

Internal links always go through the `withBase()` helper (`src/utils.ts`) — never hardcode a leading `/`.

## 🚢 Deployment

### GitHub Pages (automatic)

Push to `main` → [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

1. `npm ci && npm run build`
2. Smoke test (index, RSS, categories, brand check must exist in output)
3. Deploy via official Pages actions

### Docker (self-hosted)

```bash
make up      # builds the image and starts nginx with TLS
```

Image is ~63 MB (nginx:alpine serving static files). Certificates are mounted as a read-only volume — never baked into the image.

## 🧪 Testing

```bash
make load-test   # k6: ramps to 40 VUs over 60s, thresholds p95 < 300ms, errors < 1%
```

Last run: **473 requests · 0% failures · p95 ≈ 5ms** against the local TLS stack.

## 🛠️ Tech stack

[Astro 5](https://astro.build) · TypeScript (strict) · vanilla CSS custom properties · [k6](https://k6.io) · Docker + nginx · mkcert · GitHub Actions

---

Made with ☕ and green pixels.
