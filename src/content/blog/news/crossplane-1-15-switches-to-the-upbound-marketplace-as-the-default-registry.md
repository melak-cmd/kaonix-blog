---
title: "🚀 Crossplane 1.15 Switches to the Upbound Marketplace as the Default Registry"

description: "Crossplane 1.15 changes the default package registry from Docker Hub to the Upbound Marketplace, bringing richer package metadata and a better package-management experience."

pubDate: 2024-02-15

category: "news"

tags: ["crossplane", "kubernetes", "platform-engineering", "control-plane", "upbound", "xpkg", "registry"]

author: "Kaonix Team"

source: "https://blog.crossplane.io/new-default-crossplane-registry-in-crossplane-1-15/"

---

🚀 **Crossplane 1.15** introduces an important change to the way Crossplane packages are distributed.

Starting with Crossplane 1.15, the default package registry changes from **Docker Hub** to the **Upbound Marketplace**, available at `xpkg.upbound.io`.

This change affects the default location used by Crossplane to download **Providers, Configuration packages, and Composition Functions**.

## 📦 A New Default Registry

Until Crossplane 1.15, packages were pulled by default from:

`index.docker.io`

With Crossplane 1.15, the default becomes:

`xpkg.upbound.io`

The change is transparent for most users who have not explicitly configured another registry.

Crossplane's package manager will now automatically use the Upbound Marketplace when resolving package dependencies.

## 🧩 Why a Dedicated Crossplane Registry?

Crossplane packages are more than ordinary container images.

Providers, Functions, and Configuration packages can contain important metadata such as:

- 📋 Package dependencies
- 🔢 Minimum Crossplane version
- 🧩 Custom APIs
- 📚 Documentation
- ☸️ Kubernetes resource definitions

Traditional container registries can store these packages, but they don't necessarily understand the additional Crossplane-specific metadata.

The Upbound Marketplace is designed to understand this package structure and expose that information directly.

## 🔍 Better Package Visibility

The move to `xpkg.upbound.io` enables a richer experience around Crossplane packages.

Instead of treating a Provider simply as a container image, the registry can expose information about the package itself and the APIs it provides.

This is particularly useful for platform engineers who need to understand:

**📦 Package → 🧩 APIs → ☁️ Resources → 🔗 Dependencies**

before installing something into a control plane.

## 🔄 Existing Private Registries Still Work

The change does **not** prevent organizations from using their own registries.

If you already explicitly configure a package location, Crossplane continues to use it.

For example:

```yaml
apiVersion: pkg.crossplane.io/v1
kind: Configuration
metadata:
  name: myPlatform
spec:
  package: index.docker.io/my-private-org/myPlatform
```

This means organizations with private package repositories do not need to migrate their existing packages simply because of the new default.

## 🔐 Network Policies May Need an Update

One important operational consideration is network access.

If Crossplane runs behind a proxy, firewall, or strict egress policy, platform teams need to make sure:

`xpkg.upbound.io`

is allowed.

Otherwise, new package installations or dependency resolution can fail after upgrading to Crossplane 1.15.

This is particularly important for **restricted Kubernetes clusters** where external registry access is controlled through allow-lists.

## ↩️ You Can Keep Docker Hub

Organizations that need to retain the previous behavior can explicitly configure Crossplane to use Docker Hub again.

The Crossplane pod can be started with:

```text
--registry=index.docker.io
```

This restores Docker Hub as the default registry.

## 🧑‍💻 What It Means for Platform Teams

For Kubernetes platform engineers, this change has several practical implications.

1. 📦 **Package management becomes more Crossplane-aware.** The registry understands Crossplane-specific package metadata.

2. 🔍 **Package discovery improves.** Providers and Functions can expose richer information than a traditional container registry.

3. 🔐 **Network policies need attention.** Restricted clusters should allow access to `xpkg.upbound.io`.

4. 🔄 **Existing registries remain supported.** Explicit package references continue to work.

5. 🧩 **The Crossplane ecosystem gets a dedicated distribution layer.** This becomes increasingly valuable as Providers, Functions, and Configuration packages continue to grow.

## 🌐 The Bigger Picture

The registry change may look like a small implementation detail, but it reflects the growing maturity of the Crossplane ecosystem.

Crossplane packages are becoming increasingly sophisticated building blocks for **Kubernetes control planes and internal developer platforms**.

The architecture increasingly looks like:

**👨‍💻 Platform Team → 📦 Crossplane Packages → 🧩 Control Plane APIs → ☁️ Infrastructure**

A registry that understands those packages can therefore provide much more value than a generic container registry.

> 🎯 **The takeaway:** Crossplane 1.15's move to `xpkg.upbound.io` makes package distribution **more Crossplane-aware and discoverable**, while keeping existing private registries and explicit package references fully viable.

<!-- ### 🔗 Source

📚 **Crossplane — New Default Crossplane Registry in Crossplane 1.15**

https://blog.crossplane.io/new-default-crossplane-registry-in-crossplane-1-15/ -->
