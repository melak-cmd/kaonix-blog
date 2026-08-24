---
title: "10 kubectl Commands Every Developer Should Know"
description: "Stop copy-pasting YAML blindly. Master the kubectl commands that make daily Kubernetes work faster — from debugging pods to live manifest editing."
pubDate: 2026-08-21
category: "tutorials"
tags: ["kubernetes", "k8s", "kubectl", "cli"]
author: "Kaonix Team"
---

`kubectl` is your window into the cluster. These ten commands cover 90% of daily work.

## 1. `get` — List Resources

```bash
kubectl get pods                          # current namespace
kubectl get deployments -A                # all namespaces
kubectl get svc,pvc,ingress               # multiple types
kubectl get pods -o wide                  # node + IP columns
kubectl get pods --watch                  # live updates
```

## 2. `describe` — The Full Story

When a pod misbehaves, start here:

```bash
kubectl describe pod my-app-7d9f8b6c5-xk2pz
```

Scroll to **Events** at the bottom — CrashLoopBackOff, ImagePullBackOff, and scheduling failures all show their cause here.

## 3. `logs` — Stream Output

```bash
kubectl logs my-pod -f                    # follow
kubectl logs my-pod --previous            # crashed container's last output
kubectl logs -l app=web --tail=100        # by label, last 100 lines
```

## 4. `exec` — Shell Into a Pod

```bash
kubectl exec -it my-pod -- sh
kubectl exec -it my-pod -- curl localhost:8080/healthz
```

## 5. `apply` / `delete` — Declarative Management

```bash
kubectl apply -f manifests/
kubectl apply -f https://example.com/manifest.yaml
kubectl delete -f deployment.yaml
```

Prefer `apply` over imperative `run`/`create` — it's idempotent and Git-friendly.

## 6. `rollout` — Safe Deployments

```bash
kubectl rollout status deployment/web     # wait for rollout
kubectl rollout history deployment/web    # revision list
kubectl rollout undo deployment/web       # rollback to previous
kubectl rollout restart deployment/web    # rolling restart (e.g. after secret change)
```

## 7. `port-forward` — Local Access

Test services without exposing them:

```bash
kubectl port-forward svc/database 5432:5432
# Now connect to localhost:5432
```

## 8. `edit` — Live Patching

```bash
kubectl edit deployment web
```

Opens your `$EDITOR` on the live manifest. Saves trigger an immediate rollout — great for quick fixes, but always backport changes to Git.

## 9. `top` — Resource Usage

```bash
kubectl top nodes
kubectl top pods --sort-by=memory
```

Requires metrics-server (pre-installed in most managed clusters).

## 10. `context` — Switch Clusters

```bash
kubectl config get-contexts
kubectl config use-context production
kubectl config set-context --current --namespace=api
```

> **Pro tip:** Install [`kubectx`](https://github.com/ahmetb/kubectx) for instant context/namespace switching, and add `alias k=kubectl` to your shell.

## Bonus: Dry Run Before You Write

Generate boilerplate instead of memorizing syntax:

```bash
kubectl create deployment nginx --image=nginx:alpine --dry-run=client -o yaml > deploy.yaml
```

Master these and you'll spend time fixing real problems — not fighting the CLI.
