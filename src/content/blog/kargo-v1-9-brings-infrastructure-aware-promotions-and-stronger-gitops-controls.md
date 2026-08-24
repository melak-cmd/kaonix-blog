---
title: "Kargo v1.9 Brings Infrastructure-Aware Promotions and Stronger GitOps Controls"

description: "Kargo v1.9 introduces infrastructure-aware promotions, a new REST API, stronger access controls, live verification logs, webhook support, and improved Argo CD integration."

pubDate: 2026-01-29

category: "news"

tags: ["kargo", "gitops", "kubernetes", "continuous-promotion", "terraform", "opentofu", "argo-cd", "platform-engineering"]

author: "Kaonix-Team"

source: "https://akuity.io/blog/kargo-v1-9-infra-aware-promotions-visibility-controls"

---

🚀 **Kargo-v1.9** is one of the most significant releases since Kargo 1.0, expanding the platform from application promotion toward **coordinated application-and-infrastructure delivery**.

The release introduces infrastructure-aware promotions, a new REST API, stronger security controls, improved observability, and deeper integration with Argo CD.

## 🏗️ Infrastructure-Aware-Promotions

The biggest change in Kargo-v1.9 is the ability to coordinate **infrastructure and application changes within the same promotion workflow**.

With Kargo Enterprise, teams can use **Terraform and OpenTofu** as part of promotions.

A single workflow can now:

- 📝 Update HCL configuration
- 🔍 Run Terraform plans
- 🔀 Attach plans to pull requests
- 🚀 Apply infrastructure changes
- 📤 Pass Terraform outputs to downstream Kubernetes applications

This makes it possible to promote an entire environment rather than treating infrastructure and workloads as completely separate delivery processes.

## 🔗 Application-and-Infrastructure-in-One-Workflow

Traditional delivery often separates infrastructure pipelines from application pipelines:

**Terraform → Infrastructure**

**CI/CD → Application**

Kargo-v1.9 brings these workflows together:

**📦 Application + 🏗️ Infrastructure → 🚀 Single-Promotion**

This can reduce coordination overhead, prevent environment drift, and provide a single auditable promotion process.

## 🖥️ Embedded-Argo-CD-Visibility

Kargo Enterprise now includes an **embedded Argo CD view** directly in the Kargo UI.

Platform engineers can inspect application state without switching between tools.

The embedded view provides access to:

- 🌳 Application trees
- 🔍 Resource diffs
- ☸️ Live Kubernetes objects
- 📡 Kubernetes events
- 📜 Application logs

This creates a much tighter feedback loop between **promotion state and application state**.

## 🏢 ServiceNow-Integration

For enterprises operating under formal change-management processes, Kargo-v1.9 adds **ServiceNow integration** in Kargo Enterprise.

Promotions can interact with ServiceNow tickets to:

- 📝 Create change requests
- 🔄 Update tickets as promotions progress
- ⏸️ Wait for approvals
- 🚦 Gate promotions based on ticket state
- 📋 Maintain an audit trail

This connects modern GitOps workflows with traditional ITSM and compliance requirements.

## 🔌 New-REST-API

Kargo-v1.9 introduces a new **RESTful API** designed for long-term compatibility.

The API provides a more accessible interface for:

- 🤖 Automation
- 🔧 Platform tooling
- 🌐 External integrations
- 💻 CLI workflows
- 🧩 Custom clients

The API is based on OpenAPI, making it easier to generate clients in different programming languages.

The Kargo CLI already uses the new REST API.

## 🔐 Stronger-Access-Control

Kargo-v1.9 improves security and access management with several new capabilities.

### 🔑 Shared-Resources

Administrators can centrally manage shared:

- 🔐 Secrets
- ⚙️ ConfigMaps
- 🔑 Repository credentials

Promotion steps can explicitly reference these shared resources, providing a cleaner model for managing configuration across multiple projects.

### 🎟️ API-Tokens

Kargo now supports **API tokens** for programmatic access.

Tokens can use built-in or custom project roles, making them suitable for:

- 🤖 CI/CD automation
- 🔧 Platform integrations
- 🔌 External tooling
- ⚙️ Automated promotion workflows

This avoids depending on individual user credentials for automation.

## 📡 Live-Log-Streaming-for-Verifications

Verification jobs can now expose **live logs while they are running**.

Instead of waiting for a verification to finish, engineers can monitor its progress in real time.

This makes troubleshooting long-running verification jobs significantly easier.

It also helps teams identify problems earlier during progressive promotion.

## 🪝 Generic-Webhook-Receiver

Kargo-v1.9 introduces a **generic webhook receiver**.

This allows external systems to send arbitrary POST requests to Kargo and trigger actions such as Warehouse refreshes.

This is particularly useful when integrating with registries or internal systems that don't provide a standard webhook format.

Examples include:

- 📦 Amazon ECR
- 📦 Google Artifact Registry
- 🔧 Internal CI systems
- 🤖 Custom automation
- 🏢 Enterprise tooling

This makes Kargo easier to integrate into heterogeneous delivery environments.

## ⚡ Configurable-Image-Metadata-Caching

Kargo now provides optional image metadata caching through:

`cacheByTag: true`

For environments where image tags are guaranteed to be immutable, this can reduce unnecessary registry queries and improve Warehouse refresh performance.

The feature is **opt-in**, preserving the existing behavior for environments where tags may be overwritten.

## 🎯 Label-Based-Argo-CD-Application-Selection

The `argocd-update` promotion step can now select Argo CD Applications using **labels instead of exact application names**.

This is especially useful with:

- 🧩 ApplicationSets
- 🌍 Dynamic environments
- 📦 Large application fleets
- ☸️ Multi-cluster deployments

Instead of hardcoding application names, promotion logic can target applications dynamically based on their labels.

## 🧩 Alternative-Expression-Delimiters

Kargo-v1.9 adds alternative expression delimiters:

`${% ... %}`

This is particularly useful when Kargo expressions are embedded inside other templating systems such as **Helm**, where `{{ ... }}` is already heavily used.

The feature reduces escaping complexity and makes complex templates easier to maintain.

## 👨‍💻 What-It-Means-for-Platform-Teams

For Kubernetes platform engineers, Kargo-v1.9 represents a significant evolution.

1. 🏗️ **Infrastructure becomes part of promotion.** Terraform and OpenTofu can participate in the same workflow as Kubernetes applications.

2. 🔗 **Argo CD and Kargo become more tightly connected.** Embedded visibility makes troubleshooting promotions easier.

3. 🔐 **Automation becomes safer.** API tokens and shared resources provide better security boundaries.

4. 📡 **Observability improves.** Live verification logs provide immediate feedback during promotions.

5. 🔌 **Integration becomes easier.** The REST API and generic webhooks make Kargo easier to integrate with existing platforms.

6. ⚡ **Large environments become more manageable.** Image caching and label-based application selection help reduce operational overhead.

## 🔮 The-Bigger-Picture

Kargo-v1.9 pushes the project beyond **Kubernetes application promotion** toward a broader **environment-promotion platform**.

The model increasingly looks like:

**🏗️ Infrastructure → 📦 Application → 🔍 Verification → 🚀 Promotion → ☸️ Environment**

Instead of managing infrastructure, applications, approvals, and promotions through disconnected pipelines, Kargo can coordinate these operations as one declarative delivery process.

> 🎯 **The-takeaway:** Kargo-v1.9 makes GitOps promotion **more infrastructure-aware, secure, observable, and extensible**, bringing application and infrastructure delivery closer together in a single promotion workflow.

<!-- ### 🔗 Source

📚 **Akuity — Kargo-v1.9-Released:-Infrastructure-Aware-Promotions,-Better-Visibility,-and-Stronger-Controls**

[Kargo-v1.9-Release-Article](https://akuity.io/blog/kargo-v1-9-infra-aware-promotions-visibility-controls?utm_source=chatgpt.com) -->