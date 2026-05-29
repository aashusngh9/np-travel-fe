# Infrastructure & Deployment Guide

## Overview

```
Browser
  │  HTTPS (443)
  ▼
EC2 instance  ──  Docker: nginx:alpine  ──  React SPA (static files)
  │
  │  API calls  →  :8081  →  Backend (same host)
```

| Item | Value |
|---|---|
| Domain | `farecompare.site` |
| DNS registrar | Hostinger |
| Cloud provider | AWS EC2 — `eu-north-1` (Stockholm) |
| EC2 public IP | `13.62.28.33` |
| Frontend container | `airfare-fe` (nginx:alpine) |
| TLS | Let's Encrypt via certbot — auto-renewed |

---

## 1. DNS Setup (Hostinger)

**Hostinger → Domains → farecompare.site → DNS / Nameservers**

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `13.62.28.33` | 14400 |
| CNAME | `www` | `farecompare.site` | 300 |

The `www` CNAME chains to the A record — no separate A record needed for `www`.

Verify propagation:

```bash
dig farecompare.site +short        # → 13.62.28.33
dig www.farecompare.site +short    # → 13.62.28.33
```

---

## 2. EC2 Security Group

| Port | Protocol | Source | Purpose |
|---|---|---|---|
| 22 | TCP | Your IP | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP → HTTPS redirect + ACME challenge |
| 443 | TCP | 0.0.0.0/0 | HTTPS frontend |
| 8081 | TCP | 0.0.0.0/0 | Backend API |

---

## 3. First-Time Server Setup

SSH into EC2:

```bash
ssh -i ~/projects/personal/aws/default.pem ec2-user@ec2-13-62-28-33.eu-north-1.compute.amazonaws.com
```

Install Docker if not present:

```bash
sudo yum update -y && sudo yum install -y docker
sudo systemctl enable docker && sudo systemctl start docker
sudo usermod -aG docker ec2-user
# Log out and back in for the group change to take effect
```

---

## 4. TLS Certificates (Let's Encrypt)

Run once on EC2, after DNS is resolving and port 80 is open:

```bash
bash ~/certbot-setup.sh you@example.com
```

What it does:
- Installs `certbot` and `cronie`
- Stops any running container (frees port 80 for the ACME HTTP-01 challenge)
- Obtains a cert for `farecompare.site` and `www.farecompare.site`
- Writes certs to `/etc/letsencrypt/live/farecompare.site/`
- Wires pre/post renewal hooks that stop and restart the container
- Adds a daily cron at 03:00 (`certbot renew --quiet` only acts when < 30 days remain)
- Starts the container with `/etc/letsencrypt` mounted read-only

### Why the whole `/etc/letsencrypt` is mounted

Let's Encrypt stores the live certs as symlinks into an `archive/` subdirectory:

```
/etc/letsencrypt/
  live/farecompare.site/fullchain.pem  →  ../../archive/farecompare.site/fullchain1.pem
  archive/farecompare.site/fullchain1.pem  (actual file)
```

Mounting only `live/` breaks the symlinks inside the container. Mounting the full `/etc/letsencrypt` tree keeps both `live/` and `archive/` accessible.

nginx.conf references:

```
ssl_certificate     /etc/letsencrypt/live/farecompare.site/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/farecompare.site/privkey.pem;
```

Renewal causes ~60 seconds of downtime every ~60 days (pre-hook stops container, certbot renews, post-hook restarts it). Test without renewing:

```bash
sudo certbot renew --dry-run
```

---

## 5. Build & Deploy

### On your Mac — build and upload

```bash
bash build.sh
```

1. Builds the Docker image for `linux/amd64` with `REACT_APP_API_BASE_URL=https://farecompare.site:8081`
2. Saves to `airfare-fe.tar`, SCPs tar + `deploy.sh` to EC2
3. Deletes the local tar

SSH key: `~/projects/personal/aws/default.pem`

### On EC2 — load and run

```bash
bash ~/deploy.sh
```

1. Loads the image from `~/airfare-fe.tar`
2. Stops and removes the old container
3. Starts a fresh container with `/etc/letsencrypt` mounted read-only

> Run `certbot-setup.sh` before the first `deploy.sh` so the certs exist.

---

## 6. NGINX Routing

```
HTTP  :80  (farecompare.site, www)  →  301 https://farecompare.site
HTTPS :443 (www.farecompare.site)   →  301 https://farecompare.site
HTTPS :443 (farecompare.site)       →  React SPA (try_files → index.html)
```

---

## 7. Verifying the Deployment

```bash
docker ps
docker logs -f airfare-fe

curl -I https://farecompare.site        # 200
curl -I https://www.farecompare.site    # 301 → https://farecompare.site
curl -I http://farecompare.site         # 301 → https://farecompare.site
```

---

## 8. Troubleshooting

| Symptom | Check |
|---|---|
| Port 443 unreachable | EC2 security group port 443 open? `docker ps` — is container running? |
| NGINX cert error in logs | Did certbot-setup.sh complete? Check `/etc/letsencrypt/live/farecompare.site/` exists on host |
| ACME challenge failed | Port 80 open in security group when certbot ran? DNS resolved at that time? |
| Symlink error in container | Is `/etc/letsencrypt` (not just `live/`) mounted? Check `docker inspect airfare-fe` |
| API calls failing | Backend running on `:8081`? Security group allows `:8081`? |
| Renewal not working | `sudo crontab -l` — check entry exists; `sudo certbot renew --dry-run` |
