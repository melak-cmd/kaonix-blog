---
title: "Getting Started with Docker: A Complete Beginner's Tutorial"
description: "Learn Docker from scratch: install it, run your first container, build custom images, and understand the core concepts every developer needs."
pubDate: 2026-08-10
category: "tutorials"
tags: ["docker", "containers", "devops"]
technologies: ["Docker"]
author: "Kaonix Team"
---

Docker has become an essential tool in modern software development. In this tutorial, you'll go from zero to running your own containerized applications.

## What is Docker?

Docker packages an application and all its dependencies into a **container** — a lightweight, portable unit that runs consistently anywhere. Unlike virtual machines, containers share the host OS kernel, making them fast and resource-efficient.

## Installation

Download Docker Desktop from the [official website](https://www.docker.com/products/docker-desktop/) or install via your package manager:

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker run hello-world
```

## Your First Container

Let's run a simple web server:

```bash
# Pull and run nginx on port 8080
docker run -d -p 8080:80 --name my-web nginx

# Check what's running
docker ps
```

Visit `http://localhost:8080` and you'll see the nginx welcome page.

### Useful commands

```bash
docker stop my-web        # Stop a container
docker start my-web       # Start it again
docker rm my-web          # Remove it
docker logs my-web        # View logs
docker exec -it my-web bash  # Open a shell inside
```

## Building Your Own Image

Create a `Dockerfile` for a Node.js app:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Then build and run:

```bash
docker build -t my-app .
docker run -d -p 3000:3000 my-app
```

## Volumes: Persisting Data

Containers are ephemeral — data disappears when they're removed. Use volumes to persist it:

```bash
docker volume create app-data
docker run -v app-data:/app/data my-app
```

## Next Steps

Once you're comfortable with single containers, look into **Docker Compose** for multi-container apps, then **Kubernetes** for orchestration at scale.

> **Tip:** Always use official base images from trusted registries, and pin specific versions rather than using `latest` in production.
