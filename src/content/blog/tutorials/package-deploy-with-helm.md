---
title: "Package and Deploy Apps with Helm: A Practical Tutorial"
description: "Stop copy-pasting YAML between environments. Learn Helm charts, values, templates, and rollbacks by packaging a real application."
pubDate: 2026-08-23
category: "tutorials"
tags: ["kubernetes", "k8s", "helm", "devops"]
author: "Kaonix Team"
---

Helm is the package manager for Kubernetes. One chart can deploy your app to dev, staging, and production — each with different settings.

## Install Helm

```bash
brew install helm
# or
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

## Create Your First Chart

```bash
helm create my-app
```

The generated structure:

```text
my-app/
├── Chart.yaml          # Chart metadata (name, version)
├── values.yaml         # Default configuration
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── _helpers.tpl    # Reusable template snippets
└── .helmignore
```

## How Templating Works

Templates are YAML with Go-template placeholders fed from `values.yaml`:

```yaml
# templates/deployment.yaml (excerpt)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-web
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

```yaml
# values.yaml
replicaCount: 2

image:
  repository: nginx
  tag: 1.27-alpine
```

## Customize Per Environment

Override any value without touching templates:

```bash
# Dev: 1 replica, latest tag
helm install myapp ./my-app \
  --set replicaCount=1 --set image.tag=latest

# Production: values file + more replicas
helm install myapp ./my-app \
  -f values-production.yaml \
  --set replicaCount=5
```

Preview what will be rendered before installing:

```bash
helm template myapp ./my-app -f values-production.yaml
helm install myapp ./my-app --dry-run --debug   # simulate install
```

## The Release Lifecycle

```bash
helm list -A                          # all releases
helm upgrade myapp ./my-app --set image.tag=1.29-alpine
helm history myapp                    # revision history
helm rollback myapp 1                 # back to revision 1
helm uninstall myapp                  # remove everything
```

Every `upgrade` creates a numbered revision — rollback is instant, no Git archaeology needed.

## Use Public Charts

Thousands of prebuilt charts exist in repositories like [Artifact Hub](https://artifacthub.io/):

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Deploy PostgreSQL in one command
helm install db bitnami/postgresql \
  --set auth.database=myapp \
  --set primary.persistence.size=10Gi
```

> **Best practice:** Pin chart versions (`--version 15.5.0`) in production. Floating versions make deployments unreproducible.

## Organizing for Teams

A common production layout:

```text
deploy/
├── charts/my-app/        # your chart
├── values-dev.yaml
├── values-staging.yaml
└── values-prod.yaml
```

Commit all of it to Git — this is the foundation for **GitOps** with tools like ArgoCD or Flux, which watch that folder and sync your cluster automatically.

## Next Steps

- Add liveness/readiness probes to your chart's deployment
- Explore chart **dependencies** for multi-component apps
- Try **Helmfile** or ArgoCD when values files multiply

Helm turns Kubernetes manifests from copy-paste chaos into versioned, parameterized packages.
