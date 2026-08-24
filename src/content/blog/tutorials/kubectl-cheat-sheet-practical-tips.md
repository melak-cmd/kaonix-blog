---
title: "kubectl — Cheat Sheet & Practical Tips"
description: "A practical kubectl reference for Kubernetes administrators, developers, SREs and platform engineers: contexts, pods, rollouts, RBAC, troubleshooting workflows and production tips."
pubDate: 2026-08-24
category: "tutorials"
tags: ["kubernetes", "k8s", "kubectl", "devops", "cheatsheet"]
technologies: ["Kubernetes", "kubectl"]
author: "Kaonix Team"
---

A practical `kubectl` reference for Kubernetes administrators, developers, SREs and platform engineers.

`kubectl` is the Kubernetes CLI used to communicate with the Kubernetes API Server.

The basic command pattern is:

```bash
kubectl <verb> <resource> [name] [options]
```

Example:

```bash
kubectl get pod my-app -n production -o wide
```

## Table of Contents

* [1. Golden Rules](#1-golden-rules)
* [2. Context & Cluster](#2-context--cluster)
* [3. Explore Resources](#3-explore-resources)
* [4. Namespaces](#4-namespaces)
* [5. Pods](#5-pods)
* [6. Deployments](#6-deployments)
* [7. Services & Networking](#7-services--networking)
* [8. Logs & Debugging](#8-logs--debugging)
* [9. Exec & Debug Containers](#9-exec--debug-containers)
* [10. YAML & Manifests](#10-yaml--manifests)
* [11. JSONPath & Custom Output](#11-jsonpath--custom-output)
* [12. Labels & Selectors](#12-labels--selectors)
* [13. Rollouts & Updates](#13-rollouts--updates)
* [14. Nodes & Maintenance](#14-nodes--maintenance)
* [15. Events & Troubleshooting](#15-events--troubleshooting)
* [16. RBAC](#16-rbac)
* [17. CI/CD](#17-cicd)
* [18. Server-Side Apply](#18-server-side-apply)
* [19. Port Forwarding](#19-port-forwarding)
* [20. Dangerous Commands](#20-dangerous-commands)
* [21. Useful Aliases](#21-useful-aliases)
* [22. Production Workflow](#22-production-workflow)
* [23. Troubleshooting Decision Tree](#23-troubleshooting-decision-tree)
* [24. Recommended Tools](#24-recommended-tools)

## 1. Golden Rules

Before executing a potentially destructive command:

```bash
kubectl config current-context
kubectl config view --minify
```

Always verify:

```text
Cluster
Namespace
Resource
Action
```

### ⭐ Tip

In production, avoid relying on your current context:

```bash
kubectl get pods -n production
```

Prefer making the target explicit:

```bash
kubectl --context=prod-eu get pods -n production
```

For destructive operations:

```bash
kubectl --context=prod-eu delete deployment my-app -n production
```

## 2. Context & Cluster

### List contexts

```bash
kubectl config get-contexts
```

### Current context

```bash
kubectl config current-context
```

### Switch context

```bash
kubectl config use-context my-cluster
```

### List clusters

```bash
kubectl config get-clusters
```

### Current cluster information

```bash
kubectl cluster-info
```

### Kubernetes version

```bash
kubectl version
```

Or:

```bash
kubectl version --short
```

### API resources

```bash
kubectl api-resources
```

Find resources supporting a verb:

```bash
kubectl api-resources --verbs=list
```

Find namespaced resources:

```bash
kubectl api-resources --namespaced=true
```

### ⭐ Tip

When dealing with CRDs:

```bash
kubectl api-resources | grep -i crossplane
```

Then:

```bash
kubectl explain <resource>
```

Example:

```bash
kubectl explain deployment.spec.strategy
```

## 3. Explore Resources

### List resources

```bash
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get nodes
```

Short names:

```bash
kubectl get po
kubectl get deploy
kubectl get svc
kubectl get ns
```

### All namespaces

```bash
kubectl get pods -A
```

### Wide output

```bash
kubectl get pods -o wide
```

Useful to see:

* Node
* Pod IP
* Restart count
* Additional information

### YAML

```bash
kubectl get pod my-pod -o yaml
```

### JSON

```bash
kubectl get pod my-pod -o json
```

### Describe

```bash
kubectl describe pod my-pod
```

### ⭐ Tip

When debugging a Pod, `describe` is usually one of the first commands to run:

```bash
kubectl describe pod my-pod -n my-namespace
```

Pay particular attention to:

```text
Events
Conditions
Containers
State
Last State
Restart Count
Volumes
Mounts
```

## 4. Namespaces

### List namespaces

```bash
kubectl get namespaces
```

### Create

```bash
kubectl create namespace my-app
```

### Delete

```bash
kubectl delete namespace my-app
```

⚠️ Deleting a namespace deletes its namespaced resources.

### Default namespace for a command

```bash
kubectl get pods -n production
```

### Set default namespace for the current context

```bash
kubectl config set-context --current --namespace=production
```

### ⭐ Tip

Be extremely careful with:

```bash
kubectl config set-context --current --namespace=production
```

Your subsequent commands may now target production.

## 5. Pods

### List Pods

```bash
kubectl get pods
```

### Detailed

```bash
kubectl get pods -o wide
```

### Watch

```bash
kubectl get pods -w
```

### Find Pods by label

```bash
kubectl get pods -l app=backend
```

Multiple labels:

```bash
kubectl get pods -l app=backend,environment=production
```

### Pod status

```bash
kubectl get pod my-pod \
  -o jsonpath='{.status.phase}'
```

### Restart count

```bash
kubectl get pods \
  -o custom-columns='NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount'
```

## 6. Deployments

### List

```bash
kubectl get deployments
```

### Inspect

```bash
kubectl describe deployment my-app
```

### Scale

```bash
kubectl scale deployment my-app --replicas=5
```

### Update image

```bash
kubectl set image deployment/my-app \
  app=my-registry/my-app:v2
```

### Rollout status

```bash
kubectl rollout status deployment/my-app
```

### Rollout history

```bash
kubectl rollout history deployment/my-app
```

### Rollback

```bash
kubectl rollout undo deployment/my-app
```

Specific revision:

```bash
kubectl rollout undo deployment/my-app --to-revision=3
```

### Restart

```bash
kubectl rollout restart deployment/my-app
```

### ⭐ Tip

Prefer:

```bash
kubectl rollout restart deployment/my-app
```

over manually deleting Pods.

The Deployment controller remains responsible for maintaining the desired state.

## 7. Services & Networking

### List services

```bash
kubectl get svc
```

### Endpoints

```bash
kubectl get endpoints
```

For newer Kubernetes versions, also inspect EndpointSlices:

```bash
kubectl get endpointslices
```

### Describe Service

```bash
kubectl describe svc my-service
```

### Check DNS

From a debug Pod:

```bash
kubectl run dns-test \
  --rm -it \
  --image=busybox:1.36 \
  -- nslookup my-service
```

Fully qualified Kubernetes DNS:

```text
my-service.my-namespace.svc.cluster.local
```

### ⭐ Tip

When a Service doesn't work, check in this order:

```bash
kubectl get svc
kubectl describe svc my-service
kubectl get endpointslice
kubectl get pods --show-labels
```

Most Service problems are ultimately caused by a selector that doesn't match the Pod labels.

## 8. Logs & Debugging

### Logs

```bash
kubectl logs my-pod
```

Follow:

```bash
kubectl logs -f my-pod
```

Last 100 lines:

```bash
kubectl logs my-pod --tail=100
```

Since 10 minutes:

```bash
kubectl logs my-pod --since=10m
```

Previous container:

```bash
kubectl logs my-pod --previous
```

Specific container:

```bash
kubectl logs my-pod -c app
```

Follow a Deployment:

```bash
kubectl logs deployment/my-app
```

### ⭐ Tip

For a `CrashLoopBackOff`:

```bash
kubectl logs my-pod --previous
```

is often more useful than normal logs because the current container may have just restarted.

## 9. Exec & Debug Containers

### Shell

```bash
kubectl exec -it my-pod -- sh
```

Bash:

```bash
kubectl exec -it my-pod -- bash
```

Specific container:

```bash
kubectl exec -it my-pod -c app -- sh
```

### Important

Use `--` before the command executed inside the container:

```bash
kubectl exec my-pod -- ls /
```

This separates `kubectl` arguments from container arguments.

### Run a temporary debug Pod

```bash
kubectl run debug \
  --rm -it \
  --image=busybox:1.36 \
  -- sh
```

Network debugging:

```bash
kubectl run netshoot \
  --rm -it \
  --image=nicolaka/netshoot \
  -- bash
```

## 10. YAML & Manifests

### Generate YAML without creating the resource

```bash
kubectl create deployment nginx \
  --image=nginx \
  --dry-run=client \
  -o yaml
```

Save:

```bash
kubectl create deployment nginx \
  --image=nginx \
  --dry-run=client \
  -o yaml > deployment.yaml
```

### Apply

```bash
kubectl apply -f deployment.yaml
```

Directory:

```bash
kubectl apply -f manifests/
```

Recursive:

```bash
kubectl apply -R -f manifests/
```

### Delete from manifest

```bash
kubectl delete -f deployment.yaml
```

### Validate without changing the cluster

```bash
kubectl apply \
  --dry-run=server \
  -f deployment.yaml
```

### ⭐ Tip

For CI/CD, prefer server-side validation:

```bash
kubectl apply --dry-run=server -f manifests/
```

It validates against the actual Kubernetes API and installed CRDs.

## 11. JSONPath & Custom Output

JSONPath is extremely useful for automation.

### Get Pod IPs

```bash
kubectl get pods \
  -o jsonpath='{range .items[*]}{.status.podIP}{"\n"}{end}'
```

### Pod names

```bash
kubectl get pods \
  -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}'
```

### Node names

```bash
kubectl get pods \
  -o custom-columns='POD:.metadata.name,NODE:.spec.nodeName'
```

### Images

```bash
kubectl get pods \
  -o jsonpath='{range .items[*].spec.containers[*]}{.image}{"\n"}{end}'
```

### ⭐ Tip

For scripts, prefer:

```bash
-o jsonpath=...
```

or:

```bash
-o custom-columns=...
```

instead of parsing the default human-readable output with `grep`/`awk`.

## 12. Labels & Selectors

### Show labels

```bash
kubectl get pods --show-labels
```

### Filter

```bash
kubectl get pods -l app=frontend
```

### Set label

```bash
kubectl label pod my-pod environment=dev
```

Overwrite:

```bash
kubectl label pod my-pod environment=prod --overwrite
```

### Remove label

```bash
kubectl label pod my-pod environment-
```

### ⭐ Tip

Labels are the foundation of Kubernetes relationships:

```text
Deployment
    ↓ selector
ReplicaSet
    ↓ selector
Pods
    ↑ selector
Service
```

If something doesn't connect, inspect the labels first.

## 13. Rollouts & Updates

### Status

```bash
kubectl rollout status deployment/my-app
```

### History

```bash
kubectl rollout history deployment/my-app
```

### Pause

```bash
kubectl rollout pause deployment/my-app
```

### Resume

```bash
kubectl rollout resume deployment/my-app
```

### Rollback

```bash
kubectl rollout undo deployment/my-app
```

### ⭐ Production tip

Before modifying a Deployment:

```bash
kubectl rollout history deployment/my-app
```

After modifying:

```bash
kubectl rollout status deployment/my-app
```

If something goes wrong:

```bash
kubectl rollout undo deployment/my-app
```

## 14. Nodes & Maintenance

### List nodes

```bash
kubectl get nodes
```

### Details

```bash
kubectl describe node node-01
```

### Cordon

Prevent new Pods from being scheduled:

```bash
kubectl cordon node-01
```

### Drain

```bash
kubectl drain node-01 \
  --ignore-daemonsets \
  --delete-emptydir-data
```

### Uncordon

```bash
kubectl uncordon node-01
```

### ⭐ Tip

Typical maintenance workflow:

```text
cordon
   ↓
drain
   ↓
maintenance
   ↓
uncordon
```

Never confuse:

```bash
cordon
```

with:

```bash
drain
```

`cordon` prevents scheduling.

`drain` also evicts workloads.

## 15. Events & Troubleshooting

### Events

```bash
kubectl get events
```

Sort by time:

```bash
kubectl get events \
  --sort-by='.lastTimestamp'
```

All namespaces:

```bash
kubectl get events -A \
  --sort-by='.lastTimestamp'
```

### Events for a Pod

```bash
kubectl describe pod my-pod
```

Look for:

```text
FailedScheduling
FailedMount
FailedAttachVolume
BackOff
Unhealthy
Failed
Pulling
Pulled
```

### ⭐ Troubleshooting tip

For a `Pending` Pod:

```bash
kubectl describe pod my-pod
```

Then inspect:

```text
Events
Node selectors
Affinity
Taints
Resources
PVCs
```

For `ImagePullBackOff`:

```bash
kubectl describe pod my-pod
```

Check:

```text
Image name
Registry
ImagePullSecrets
Network
Credentials
```

For `CrashLoopBackOff`:

```bash
kubectl logs my-pod --previous
kubectl describe pod my-pod
```

## 16. RBAC

### Check your permissions

```bash
kubectl auth can-i get pods
```

Specific namespace:

```bash
kubectl auth can-i get pods -n production
```

Specific user:

```bash
kubectl auth can-i get pods \
  --as=user@example.com
```

Everything:

```bash
kubectl auth can-i --list
```

### ⭐ Tip

When you see:

```text
Error from server (Forbidden)
```

don't immediately modify RBAC.

First run:

```bash
kubectl auth can-i <verb> <resource> -n <namespace>
```

Example:

```bash
kubectl auth can-i create deployments -n production
```

## 17. CI/CD

### Validate

```bash
kubectl apply \
  --dry-run=server \
  -f manifests/
```

### Diff

```bash
kubectl diff -f manifests/
```

### ⭐ Recommended pipeline

```text
Render
  ↓
Validate
  ↓
Diff
  ↓
Approval
  ↓
Apply
  ↓
Wait
  ↓
Verify
```

Example:

```bash
kubectl diff -f manifests/

kubectl apply -f manifests/

kubectl rollout status \
  deployment/my-app \
  --timeout=5m
```

### Wait for a resource

```bash
kubectl wait \
  --for=condition=available \
  deployment/my-app \
  --timeout=300s
```

### ⭐ Tip

Avoid:

```bash
sleep 60
```

Use:

```bash
kubectl wait
```

This makes CI/CD faster and deterministic.

## 18. Server-Side Apply

Server-side apply lets Kubernetes track field ownership.

```bash
kubectl apply \
  --server-side \
  -f deployment.yaml
```

With a field manager:

```bash
kubectl apply \
  --server-side \
  --field-manager=platform \
  -f deployment.yaml
```

Force ownership when appropriate:

```bash
kubectl apply \
  --server-side \
  --force-conflicts \
  -f deployment.yaml
```

⚠️ Do not use `--force-conflicts` blindly.

First understand which manager owns the field.

### ⭐ Platform Engineering Tip

Use distinct field managers for different controllers:

```text
argocd
terraform
platform
operator
human
```

This makes ownership conflicts easier to diagnose.

## 19. Port Forwarding

### Pod

```bash
kubectl port-forward pod/my-pod 8080:8080
```

### Service

```bash
kubectl port-forward svc/my-service 8080:80
```

### Deployment

```bash
kubectl port-forward deployment/my-app 8080:8080
```

Access locally:

```text
http://localhost:8080
```

### ⭐ Tip

`port-forward` is excellent for debugging private services without exposing them through:

* Ingress
* Gateway
* LoadBalancer
* NodePort

## 20. Dangerous Commands

Be especially careful with:

```bash
kubectl delete namespace production
```

```bash
kubectl delete pod --all
```

```bash
kubectl delete deployment --all
```

```bash
kubectl delete -f manifests/
```

```bash
kubectl delete pod my-pod --force --grace-period=0
```

### ⚠️ Force delete

Avoid:

```bash
--force --grace-period=0
```

unless you understand the consequences.

A force deletion can bypass normal graceful termination.

## 21. Useful Aliases

Add to `.bashrc` / `.zshrc`:

```bash
alias k=kubectl

alias kg='kubectl get'
alias kgp='kubectl get pods'
alias kgn='kubectl get nodes'
alias kgs='kubectl get svc'
alias kgd='kubectl get deployment'

alias kd='kubectl describe'
alias kdp='kubectl describe pod'

alias kl='kubectl logs'
alias ke='kubectl exec -it'
```

Examples:

```bash
k get pods
kgp -A
kd pod my-pod
kl my-pod
```

### Namespace shortcuts

If using `kubens`:

```bash
kubens production
```

### Context shortcuts

If using `kubectx`:

```bash
kubectx production-cluster
```

## 22. Production Workflow

When something breaks, avoid randomly executing commands.

Use a structured workflow.

### Step 1 — Verify context

```bash
kubectl config current-context
```

### Step 2 — Check namespace

```bash
kubectl get namespace
```

### Step 3 — Check workload

```bash
kubectl get pods -n production
```

### Step 4 — Check status

```bash
kubectl get deployment -n production
```

### Step 5 — Describe

```bash
kubectl describe pod <pod> -n production
```

### Step 6 — Logs

```bash
kubectl logs <pod> -n production
```

If restarted:

```bash
kubectl logs <pod> -n production --previous
```

### Step 7 — Events

```bash
kubectl get events \
  -n production \
  --sort-by='.lastTimestamp'
```

### Step 8 — Network

```bash
kubectl get svc -n production
kubectl get endpointslice -n production
```

### Step 9 — Resources

```bash
kubectl top pods -n production
kubectl top nodes
```

### Step 10 — Rollout

```bash
kubectl rollout status deployment/<deployment> \
  -n production
```

## 23. Troubleshooting Decision Tree

### Pod is `Pending`

```text
Pending
  │
  ├── describe pod
  │
  ├── Events?
  │     ├── FailedScheduling
  │     ├── FailedMount
  │     └── insufficient resources
  │
  ├── Check nodes
  │
  ├── Check taints
  │
  ├── Check affinity
  │
  └── Check PVC
```

Commands:

```bash
kubectl describe pod <pod>
kubectl get nodes
kubectl describe node <node>
kubectl get pvc
```

### Pod is `CrashLoopBackOff`

```text
CrashLoopBackOff
       │
       ├── logs --previous
       │
       ├── describe
       │
       ├── exit code?
       │
       ├── OOMKilled?
       │
       ├── probe failure?
       │
       └── configuration/secret?
```

Commands:

```bash
kubectl logs <pod> --previous
kubectl describe pod <pod>
```

### Pod is `ImagePullBackOff`

Check:

```bash
kubectl describe pod <pod>
```

Then verify:

```text
Image name
Tag
Registry
Credentials
ImagePullSecrets
Network access
```

### Service is unreachable

Check:

```bash
kubectl get svc
kubectl describe svc <service>
kubectl get endpointslice
kubectl get pods --show-labels
```

Most common problem:

```text
Service selector
        ≠
Pod labels
```

### Ingress / Gateway doesn't work

Check:

```bash
kubectl get ingress -A
kubectl describe ingress <name>
```

For Gateway API:

```bash
kubectl get gateway -A
kubectl get httproute -A
kubectl describe gateway <name>
kubectl describe httproute <name>
```

Then verify:

```text
DNS
TLS
Gateway
Route
Service
Endpoints
NetworkPolicy
```

## 24. Recommended Tools

`kubectl` is the foundation, but several tools complement it:

| Tool        | Purpose                 |
| ----------- | ----------------------- |
| `kubectl`   | Official Kubernetes CLI |
| `k9s`       | Interactive cluster UI  |
| `helm`      | Package management      |
| `kustomize` | Manifest customization  |
| `stern`     | Multi-Pod logs          |
| `kubectx`   | Context switching       |
| `kubens`    | Namespace switching     |
| `jq`        | JSON processing         |

Example:

```bash
kubectl get pods -o json | jq '.items[].metadata.name'
```

Multi-Pod logs:

```bash
stern -n production "backend-.*"
```

Kustomize:

```bash
kubectl apply -k overlays/production/
```

## 🚀 My 20 Commands to Memorize

If you only remember a few commands, remember these:

```bash
# Context
kubectl config current-context

# Resources
kubectl get pods -A
kubectl get pods -o wide

# Details
kubectl describe pod <pod>

# Logs
kubectl logs <pod>
kubectl logs <pod> --previous

# Shell
kubectl exec -it <pod> -- sh

# Events
kubectl get events --sort-by='.lastTimestamp'

# Deployment
kubectl get deployment
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>
kubectl rollout undo deployment/<name>

# YAML
kubectl get <resource> <name> -o yaml
kubectl apply -f manifest.yaml

# Validation
kubectl apply --dry-run=server -f manifest.yaml
kubectl diff -f manifest.yaml

# Network
kubectl get svc
kubectl get endpointslice

# RBAC
kubectl auth can-i get pods

# Node maintenance
kubectl cordon <node>
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data

# Debugging
kubectl port-forward svc/<service> 8080:80
```

## 🧠 Mental Model

Think about Kubernetes troubleshooting in this order:

```text
             Context
                │
                ▼
            Namespace
                │
                ▼
            Workload
                │
        ┌───────┴───────┐
        ▼               ▼
      Pod             Service
        │               │
   ┌────┼────┐          ▼
   ▼    ▼    ▼       Endpoint
 Logs Describe Events
        │
        ▼
     Container
        │
        ▼
     Network
        │
        ▼
     Storage
        │
        ▼
       RBAC
```

The key principle is:

> **Observe first → understand the desired state → identify the controller responsible → change the smallest possible thing → verify the result.**

## ⭐ Production Tips

### 1. Always verify the context

```bash
kubectl config current-context
```

### 2. Prefer declarative changes

Prefer:

```bash
kubectl apply -f manifests/
```

over a long sequence of imperative mutations.

### 3. Use `diff` before production changes

```bash
kubectl diff -f manifests/
```

### 4. Use `rollout status`

Don't assume a successful `apply` means a successful deployment.

```bash
kubectl rollout status deployment/my-app
```

### 5. Use `--previous` for crashes

```bash
kubectl logs <pod> --previous
```

### 6. Don't parse human output in automation

Avoid:

```bash
kubectl get pods | grep my-app
```

Prefer:

```bash
kubectl get pods -l app=my-app -o json
```

### 7. Prefer selectors over Pod names

Pods are ephemeral.

Prefer:

```bash
kubectl get pods -l app=backend
```

rather than hardcoding:

```bash
kubectl get pod backend-7f8d9c6b5f-x2abc
```

### 8. Use `kubectl wait` instead of `sleep`

```bash
kubectl wait \
  --for=condition=available \
  deployment/my-app \
  --timeout=5m
```

### 9. Debug before restarting

Don't automatically run:

```bash
kubectl rollout restart
```

First understand why the workload is unhealthy.

### 10. In production, make the target explicit

```bash
kubectl \
  --context=prod-eu \
  -n production \
  get pods
```

This dramatically reduces the risk of operating on the wrong cluster.
