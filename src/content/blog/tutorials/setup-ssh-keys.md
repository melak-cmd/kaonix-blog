---
title: "How to Set Up SSH Keys for Secure Server Access"
description: "Stop using passwords. Learn how to generate, deploy, and harden SSH keys for secure remote access in under 10 minutes."
pubDate: 2026-07-25
category: "tutorials"
tags: ["ssh", "security", "linux"]
technologies: ["SSH", "Linux"]
author: "Kaonix Team"
---

SSH keys are the standard for secure server authentication — stronger than passwords and immune to brute-force attacks. Here's the complete setup.

## Step 1: Generate a Key Pair

On your local machine:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

- `ed25519` is modern and fast. Use `ssh-keygen -t rsa -b 4096` only for legacy systems.
- You'll be asked where to save it (default: `~/.ssh/id_ed25519`) and for an optional **passphrase** — always set one.

## Step 2: Copy Your Public Key to the Server

```bash
ssh-copy-id user@your-server-ip
```

Or manually append your public key to the server:

```bash
cat ~/.ssh/id_ed25519.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## Step 3: Test the Login

```bash
ssh user@your-server-ip
```

You should connect without a password (you'll enter your key passphrase instead).

## Step 4: Harden the SSH Config

Edit `/etc/ssh/sshd_config` on the server:

```text
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
MaxAuthTries 3
```

Then restart the daemon:

```bash
sudo systemctl restart sshd
```

> **Warning:** Keep your current SSH session open while testing that new connections still work before closing it.

## Bonus: Simplify with a Config File

Create `~/.ssh/config` on your local machine:

```text
Host myserver
    HostName your-server-ip
    User amine
    IdentityFile ~/.ssh/id_ed25519
    Port 22
```

Now you can simply type:

```bash
ssh myserver
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Permission denied | Check `~/.ssh` permissions: `chmod 700`, keys `chmod 600` |
| Still asks for password | Ensure `PubkeyAuthentication yes` on server |
| Works locally, fails elsewhere | Copy your private key securely, never email it |

That's it — you've upgraded your server security in minutes.
