---
title: "🚀 Crossplane v2.2 Brings More Capability, Reliability, and Observability"

description: "Crossplane v2.2 introduces the Pipeline Inspector, runtime configuration for package dependencies, richer XRD validation, schema-aware functions, and improved resource tracing."

pubDate: 2026-03-17

category: "news"

tags: ["crossplane", "kubernetes", "platform-engineering", "control-plane", "composition-functions", "observability", "gitops"]

author: "Kaonix Team"

source: "https://blog.crossplane.io/crossplane-v2-2-more-capable-more-reliable-more-observable/"

---

🚀 **Crossplane v2.2** has been released, bringing a set of improvements focused on making Crossplane **more capable, more reliable, and more observable** for production control planes.

This quarterly release puts particular emphasis on **Composition Functions, debugging, package configuration, XRD validation, and developer experience**.

## 🔍 Pipeline Inspector for Composition Functions

One of the most interesting additions is the new **Pipeline Inspector**, currently available as an **alpha feature**.

Composition Functions can generate complex resources, but debugging what happens between each function step has traditionally been difficult.

Crossplane v2.2 can now intercept every function request and response and forward them over gRPC to a configured socket.

This opens the door to:

- 🔍 Function request/response inspection
- 🐛 Easier debugging of compositions
- 📊 Pipeline observability
- 🧾 Pipeline auditing
- 🛠️ Production troubleshooting

The inspector is disabled by default and can be enabled through the Crossplane configuration.

## ⚙️ Runtime Configuration for Package Dependencies

Crossplane v2.2 significantly improves how **package runtime configuration** is managed.

`ImageConfig` can now define a `DeploymentRuntimeConfig` for packages matching a specific image prefix — including packages installed indirectly as dependencies.

This is particularly useful for cloud providers requiring platform-specific configuration.

For example, an Azure platform can declaratively apply **Azure Workload Identity** to all matching Azure provider packages without manually configuring every dependency.

## 🛡️ More Powerful XRD Validation

Crossplane v2.2 expands **CEL validation** capabilities for Composite Resource Definitions.

Previously, `x-kubernetes-validations` could primarily validate fields inside `spec`.

Now, XRDs can also validate metadata-related properties.

This makes it possible to enforce platform rules such as:

- 🏷️ Required labels
- 🔤 Naming conventions
- 🔐 Metadata constraints
- 📋 Stronger API contracts

For example, a platform can enforce that every database resource starts with a specific naming prefix directly at the Kubernetes API level.

## 🧩 OpenAPI Schemas Available to Functions

Composition and Operation Functions can now request **OpenAPI schemas** for resources through the new `RequiredSchemas` field.

This is particularly useful when functions need to:

- 🧠 Make schema-aware decisions
- ✅ Validate generated resources
- 🏗️ Dynamically construct resources
- 🔎 Understand Kubernetes resource structures

Crossplane v2.2 also introduces **capability advertisement**, allowing functions to determine which capabilities are supported by the Crossplane version running them.

## 🔭 Better `crossplane beta trace`

The `crossplane beta trace` command gets two useful improvements.

### 📚 Trace All Resources

Instead of tracing a single resource, you can now trace **all resources of a specific kind**.

For example:

```bash
crossplane beta trace databases.platform.example.org -n platform
```

This is useful when investigating the state of an entire resource type across a control plane.

### 👀 Watch Mode

Trace also gains a `--watch` / `-w` option.

This keeps the dependency tree updated as resources change, making it easier to follow reconciliation in real time.

```bash
crossplane beta trace databases.platform.example.org db-production --watch
```

For platform engineers debugging complex compositions, this can significantly improve the development workflow.

## ⚠️ Breaking Changes to Keep in Mind

Crossplane v2.2 also introduces two notable breaking changes.

### 📦 Function Input CRDs

Function input CRDs included in `Function` packages are no longer installed by the package manager, following the xpkg specification.

Unknown or disallowed resource types in packages are now silently ignored instead of causing package installation to fail.

### 💾 Package Cache Structure

The internal on-disk package cache structure has changed.

This breaks an undocumented behavior that allowed packages to be **side-loaded directly into Crossplane**, which was sometimes used for testing.

Teams relying on that behavior should review their upgrade process before moving to v2.2.

## 👨‍💻 What It Means for Platform Teams

For Kubernetes platform engineers, Crossplane v2.2 delivers several practical improvements.

1. 🔍 **Composition debugging gets better.** The Pipeline Inspector provides visibility into function inputs and outputs.

2. ⚙️ **Provider configuration becomes more declarative.** `ImageConfig` can configure runtime settings for entire groups of packages.

3. 🛡️ **Platform APIs become stricter.** XRD validation can enforce naming and metadata policies at admission time.

4. 🧩 **Functions become more intelligent.** Access to OpenAPI schemas enables schema-aware composition logic.

5. 🔭 **Troubleshooting improves.** `crossplane beta trace` can inspect resource types and continuously watch reconciliation.

6. 🚀 **Crossplane becomes more production-ready.** The release focuses heavily on reliability, observability, and operational experience.

## 🔮 The Bigger Picture

Crossplane v2.2 reinforces an important direction for the project: **Crossplane is evolving from an infrastructure provisioning tool into a programmable Kubernetes control-plane framework**.

Composition Functions, Operations, XRD validation, package runtime configuration, and increasingly sophisticated debugging capabilities give platform teams the building blocks to create **internal APIs and reusable control planes**.

For teams building platform abstractions around Kubernetes, this release is especially interesting because it improves both sides of the equation:

**👨‍💻 Platform Builder Experience → 🧩 Control Plane Capabilities → 🚀 Developer Experience**

> 🎯 **The takeaway:** Crossplane v2.2 makes custom Kubernetes control planes **easier to debug, safer to operate, more expressive, and more observable**, with particularly valuable improvements for teams building sophisticated Composition Functions.

<!-- ### 🔗 Source

📚 **Crossplane — Crossplane v2.2 More Capable, More Reliable, More Observable**

https://blog.crossplane.io/crossplane-v2-2-more-capable-more-reliable-more-observable/ -->
