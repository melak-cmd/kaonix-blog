---
title: "Getting Started with Kubernetes: From Zero to Your First Deployment"
description: "Understand core Kubernetes concepts and run a real cluster on your laptop — pods, deployments, services, and scaling explained hands-on."
pubDate: 2026-08-22
category: "tutorials"
tags: ["kubernetes", "k8s", "devops", "containers"]
technologies: ["Kubernetes", "kubectl"]
author: "Kaonix Team"
---

Kubernetes orchestrates containers at scale. In this tutorial you'll spin up a local cluster and deploy a real application.

## Core Concepts in 2 Minutes

| Object | Purpose |
|--------|---------|
| **Pod** | Smallest unit — one or more containers sharing network/storage |
| **Deployment** | Manages replica sets, rolling updates, rollbacks |
| **Service** | Stable network endpoint for a set of pods |
| **Ingress** | HTTP routing from outside the cluster |
| **Namespace** | Virtual cluster separation |

## Step 1: Create a Local Cluster

[kind](https://kind.sigs.k8s.io/) (Kubernetes in Docker) is the fastest way to start:

```bash
# Install kind
brew install kind          # macOS
# or
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.25.0/kind-linux-amd64
chmod +x ./kind && sudo mv ./kind /usr/local/bin/

# Create the cluster
kind create cluster --name dev
kubectl cluster-info
```

Alternatives: **minikube**, **k3d** (lightweight), **Docker Desktop** (built-in).

## Step 2: Deploy Your First App

Create `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 250m
              memory: 256Mi
```

Apply it:

```bash
kubectl apply -f deployment.yaml
kubectl get pods
```

You'll see 3 pods starting — Kubernetes maintains this count automatically.

## Step 3: Expose It with a Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
```

```bash
kubectl apply -f service.yaml
curl http://localhost:30080   # via kind extraPortMappings or minikube service
```

## Step 4: Scale and Update

```bash
# Scale up
kubectl scale deployment web-app --replicas=5

# Rolling update — zero downtime
kubectl set image deployment/web-app nginx=nginx:1.29-alpine

# Watch it roll out
kubectl rollout status deployment/web-app

# Rollback if something breaks
kubectl rollout undo deployment/web-app
```

## Essential Debugging Commands

```bash
kubectl describe pod <pod-name>     # Events, errors, config
kubectl logs <pod-name> -f          # Stream logs
kubectl exec -it <pod-name> -- sh   # Shell inside the pod
kubectl top pods                    # Resource usage
```

## Next Steps

- Add an **Ingress controller** for proper HTTP routing
- Manage secrets with **External Secrets** or Sealed Secrets
- Try **Helm** to package applications (see our Helm tutorial)
- Explore **H PA** for automatic scaling based on CPU/memory

> **Tip:** Never run bare pods in production. Always use Deployments so Kubernetes can heal and update your workloads.
