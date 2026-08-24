---
title: "Build Your First REST API with Node.js and Express"
description: "A hands-on tutorial covering routing, middleware, error handling, and testing — everything you need to ship a production-ready API."
pubDate: 2026-07-18
category: "tutorials"
tags: ["nodejs", "express", "api", "backend"]
technologies: ["Node.js", "Express"]
author: "Kaonix Team"
---

In this tutorial, you'll build a complete REST API from scratch using Node.js and Express.

## Project Setup

```bash
mkdir my-api && cd my-api
npm init -y
npm install express
npm install -D nodemon
```

Update `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js"
  }
}
```

## Create the Server

`server.js`:

```javascript
import express from "express";

const app = express();
app.use(express.json()); // Parse JSON bodies

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on :${PORT}`));
```

Run `npm run dev` — your API is live.

## Define Routes

Let's build a simple tasks resource:

```javascript
let tasks = [
  { id: 1, title: "Learn Express", done: true },
  { id: 2, title: "Build an API", done: false },
];

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/api/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const task = { id: Date.now(), title, done: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  tasks = tasks.filter((t) => t.id !== Number(req.params.id));
  res.status(204).send();
});
```

## Add Middleware

Middleware runs on every request — perfect for logging:

```javascript
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});
```

## Centralized Error Handling

Always add an error handler **last**:

```javascript
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});
```

## Test It

```bash
curl http://localhost:3000/api/tasks
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Ship it"}'
```

## Next Steps

For production readiness, add input validation (Zod), a real database (Prisma + PostgreSQL), authentication (JWT), and automated tests (Vitest).

The full pattern stays the same: route → validate → business logic → respond.
