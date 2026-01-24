# Complete Deployment Guide for YT Thumbnail Generator

This guide explains how to deploy the YouTube Thumbnail Generator to your Ubuntu server at `72.60.222.7` with the domain `thumbnails.aceternity.com`.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Understanding the Architecture](#understanding-the-architecture)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [What Each Script Does](#what-each-script-does)
6. [Cloudflare Configuration](#cloudflare-configuration)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance & Updates](#maintenance--updates)

---

## Overview

This is a **static site deployment** - your React app is compiled into HTML, CSS, and JavaScript files that Nginx serves directly. No Node.js runtime is needed on the server.

**Deployment Flow:**
```
Your Computer                    Ubuntu Server
┌─────────────┐                 ┌──────────────┐
│             │                 │              │
│  npm build  │ ──────────────> │    Nginx     │
│             │   (Upload via   │  Web Server  │
│ dist/       │    SSH/rsync)   │              │
└─────────────┘                 └──────────────┘
                                       │
                                       ▼
                                 Cloudflare CDN
                                       │
                                       ▼
                                    Users
```

---

## Prerequisites

### On Your Local Machine

- ✅ Node.js v20.19+ or v22.12+ installed
- ✅ npm (comes with Node.js)
- ✅ SSH access to server (password or SSH key)
- ✅ rsync installed (usually pre-installed on macOS/Linux)

### On Your Server (72.60.222.7)

- ✅ Ubuntu Linux (18.04+, 20.04, or 22.04 recommended)
- ✅ Root or sudo access
- ✅ SSH access enabled
- ✅ Port 80 open (HTTP)
- ✅ Port 443 open (HTTPS) - for SSL later

### Cloudflare

- ✅ Account created at cloudflare.com
- ✅ Domain added to Cloudflare
- ✅ Nameservers pointed to Cloudflare

---

## Understanding the Architecture

### What Gets Deployed

When you run `npm run build`, Vite compiles your React application into:

```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Bundled JavaScript (~635KB)
│   └── index-[hash].css    # Bundled CSS (~22KB)
└── favicon files
```

These static files are uploaded to `/var/www/yt-thumbnail-generator/` on your server.

### How Nginx Serves Your App

Nginx is a **web server** that:
1. Listens on port 80 (HTTP) and/or 443 (HTTPS)
2. Serves static files from `/var/www/yt-thumbnail-generator/`
3. Handles all routes by redirecting to `index.html` (for React Router)
4. Adds caching headers for better performance
5. Compresses files with gzip for faster loading

### How Cloudflare Works

```
User Browser
     │
     ▼
Cloudflare (CDN + SSL + DDoS Protection)
     │
     ▼
Your Server (72.60.222.7)
     │
     ▼
Nginx serves files
```

Cloudflare acts as a **proxy** that:
- Provides SSL/HTTPS certificates (free)
- Caches static files globally (faster for users)
- Protects against DDoS attacks
- Provides analytics

---

## Step-by-Step Deployment

### Phase 1: Cloudflare DNS Setup (5 minutes)

1. **Log into Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com

2. **Select your domain** (`aceternity.com`)

3. **Go to DNS settings**
   - Click "DNS" in the left sidebar

4. **Add/Edit A Record**
   ```
   Type:     A
   Name:     thumbnails
   IPv4:     72.60.222.7
   Proxy:    Proxied (orange cloud) ✅
   TTL:      Auto
   ```

   Click "Save"

5. **Configure SSL Mode**
   - Go to SSL/TLS → Overview
   - Select **"Flexible"** (for now, we'll upgrade later)

   This means:
   - Browser → Cloudflare: HTTPS (encrypted)
   - Cloudflare → Your Server: HTTP (not encrypted yet)

**Why Flexible SSL?**
- Gets your site live quickly
- No server configuration needed initially
- You can upgrade to Full SSL later for end-to-end encryption

---

### Phase 2: Server Initial Setup (10 minutes)

This only needs to be done **once** per server.

1. **SSH into your server**
   ```bash
   ssh root@72.60.222.7
   ```

   Enter your password when prompted.

2. **Update system packages**
   ```bash
   apt update && apt upgrade -y
   ```

   This ensures you have the latest security patches.

3. **Install Nginx**
   ```bash
   apt install nginx -y
   ```

   Nginx is a lightweight, high-performance web server.

4. **Start and enable Nginx**
   ```bash
   systemctl start nginx
   systemctl enable nginx
   ```

   - `start`: Starts Nginx now
   - `enable`: Makes Nginx start automatically on server reboot

5. **Configure firewall (if UFW is enabled)**
   ```bash
   # Check if UFW is active
   ufw status

   # If active, allow Nginx
   ufw allow 'Nginx Full'
   ```

   This opens ports 80 (HTTP) and 443 (HTTPS).

6. **Create web directory**
   ```bash
   mkdir -p /var/www/yt-thumbnail-generator
   ```

   This is where your app files will live.

7. **Verify Nginx is running**
   ```bash
   systemctl status nginx
   ```

   You should see "active (running)" in green.

8. **Exit the server**
   ```bash
   exit
   ```

---

### Phase 3: Build Your Application (2 minutes)

On your local machine, in the project directory:

1. **Ensure dependencies are installed**
   ```bash
   npm install
   ```

2. **Build the production bundle**
   ```bash
   npm run build
   ```

   This creates the `dist/` folder with optimized files.

3. **Verify the build**
   ```bash
   ls -lh dist/
   ```

   You should see:
   - `index.html`
   - `assets/` folder with JS and CSS files

---

### Phase 4: Deploy to Server (3 minutes)

1. **Make the deployment script executable** (first time only)
   ```bash
   chmod +x deploy-manual.sh
   ```

2. **Run the deployment script**
   ```bash
   ./deploy-manual.sh
   ```

3. **What happens during deployment:**

   You'll be prompted for your password **4-5 times** (for each SSH/SCP command):

   - **Step 1:** Checks if Nginx is installed (installs if missing)
   - **Step 2:** Creates `/var/www/yt-thumbnail-generator` directory
   - **Step 3:** Uploads your `dist/` files using `rsync`
     - `rsync` is efficient: only uploads changed files
     - `--delete` flag removes old files not in current build
   - **Step 4:** Uploads `nginx.conf` to server
   - **Step 5:**
     - Creates symbolic link in `/etc/nginx/sites-enabled/`
     - Tests nginx configuration
     - Reloads nginx to apply changes

4. **Deployment complete!**

   You should see:
   ```
   ✅ Deployment complete!
   🌐 Your app should now be available at:
      - http://thumbnails.aceternity.com
      - http://72.60.222.7
   ```

---

### Phase 5: Verify Deployment (2 minutes)

1. **Test DNS resolution**
   ```bash
   nslookup thumbnails.aceternity.com
   ```

   Should show Cloudflare IPs (not your server IP directly).

2. **Test HTTP connection**
   ```bash
   curl -I http://72.60.222.7
   ```

   Should return `HTTP/1.1 200 OK`

3. **Open in browser**
   - Visit: https://thumbnails.aceternity.com
   - You should see your app load!

4. **Check SSL certificate**
   - Click the padlock icon in browser
   - Should show "Cloudflare Inc ECC CA-3"

---

## What Each Script Does

### deploy-manual.sh

This is your **main deployment script**. Here's what each section does:

```bash
# Variables
SERVER="root@72.60.222.7"                    # Your server SSH address
REMOTE_DIR="/var/www/yt-thumbnail-generator" # Where files go on server
LOCAL_DIST="./dist"                          # Your built files locally

# Check dist exists
if [ ! -d "$LOCAL_DIST" ]; then
    echo "❌ Error: dist folder not found"
    exit 1
fi
```

**Why check for dist?** Prevents uploading nothing if build failed.

```bash
# Install Nginx (if needed)
if ssh $SERVER "command -v nginx > /dev/null 2>&1"; then
    echo "✅ Nginx already installed"
else
    ssh $SERVER "apt update && apt install nginx -y"
fi
```

**Smart check:** Only installs Nginx if it's not already there.

```bash
# Create directory
ssh $SERVER "mkdir -p $REMOTE_DIR"
```

**mkdir -p:** Creates directory and parent directories, doesn't fail if exists.

```bash
# Upload files
rsync -avz --delete $LOCAL_DIST/ $SERVER:$REMOTE_DIR/
```

**rsync flags explained:**
- `-a`: Archive mode (preserves permissions, timestamps)
- `-v`: Verbose (shows what's being uploaded)
- `-z`: Compress during transfer (faster over slow connections)
- `--delete`: Remove files on server that don't exist locally

**Note the trailing slashes:**
- `$LOCAL_DIST/` = upload contents of dist
- `$SERVER:$REMOTE_DIR/` = into this directory

```bash
# Upload nginx config
scp nginx.conf $SERVER:/etc/nginx/sites-available/yt-thumbnail-generator
```

**scp:** Secure copy - simple file copy over SSH.

```bash
# Configure Nginx
ssh $SERVER << 'ENDSSH'
    ln -sf /etc/nginx/sites-available/yt-thumbnail-generator /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl reload nginx
ENDSSH
```

**Heredoc syntax:** `<< 'ENDSSH'` runs multiple commands on server.

- `ln -sf`: Create symbolic link (shortcut)
- `rm -f`: Remove default nginx site (prevents conflicts)
- `nginx -t`: Test configuration syntax
- `systemctl reload`: Apply changes without downtime

### nginx.conf

This is your **Nginx configuration** that tells the server how to serve your app:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name thumbnails.aceternity.com;
```

**Listen directives:**
- `80`: IPv4 HTTP port
- `[::]:80`: IPv6 HTTP port
- `server_name`: Domain this config responds to

```nginx
    root /var/www/yt-thumbnail-generator;
    index index.html;
```

**Root directive:** Base directory for files.
**Index directive:** Default file to serve.

```nginx
    location / {
        try_files $uri $uri/ /index.html;
    }
```

**SPA routing:**
- Try to serve the exact file (`$uri`)
- If not found, try as directory (`$uri/`)
- If still not found, serve `index.html` (React Router handles it)

**Example:**
- User visits `/about`
- No file `/about` exists
- Nginx serves `index.html`
- React Router sees `/about` and shows About page

```nginx
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
```

**Static asset caching:**
- `~*`: Case-insensitive regex match
- `expires 1y`: Browser caches for 1 year
- `immutable`: Tells browser file never changes

**Why this works?** Vite adds hash to filenames (e.g., `index-abc123.js`). When you update your app, the hash changes, so browsers fetch the new file.

```nginx
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
```

**Compression:** Reduces file size by ~70% for faster loading.

---

## Cloudflare Configuration

### DNS Record Explained

```
Type:  A
Name:  thumbnails
IPv4:  72.60.222.7
Proxy: Proxied (orange cloud)
```

**A Record:** Maps domain name to IP address.

**Proxied vs DNS Only:**
- **Proxied (orange cloud):** Traffic goes through Cloudflare
  - ✅ Free SSL
  - ✅ DDoS protection
  - ✅ Global CDN
  - ✅ Analytics
  - ⚠️ Users see Cloudflare IPs, not your server IP

- **DNS Only (gray cloud):** Direct connection to your server
  - ❌ No Cloudflare benefits
  - ✅ Users see your real IP
  - ✅ Slightly lower latency

**Recommendation:** Use Proxied (orange cloud).

### SSL Modes Explained

**Flexible SSL (Current Setup)**
```
Browser ←[HTTPS]→ Cloudflare ←[HTTP]→ Your Server
```
- ✅ Quick setup
- ✅ Users see HTTPS
- ⚠️ Cloudflare to server is unencrypted
- ⚠️ Vulnerable to MITM attacks between Cloudflare and server

**Full SSL**
```
Browser ←[HTTPS]→ Cloudflare ←[HTTPS]→ Your Server (any cert)
```
- ✅ End-to-end encryption
- ✅ Accepts self-signed certificates
- ⚠️ Doesn't verify certificate validity

**Full SSL (Strict) - Recommended**
```
Browser ←[HTTPS]→ Cloudflare ←[HTTPS]→ Your Server (valid cert)
```
- ✅ End-to-end encryption
- ✅ Validates certificate
- ✅ Most secure
- ⚠️ Requires valid SSL cert on server

### Upgrading to Full SSL (Strict)

Follow the **CLOUDFLARE-SSL-SETUP.md** guide. Quick summary:

**Option 1: Let's Encrypt (Free, Auto-renewal)**

```bash
ssh root@72.60.222.7
apt install certbot python3-certbot-nginx -y
certbot --nginx -d thumbnails.aceternity.com
# Follow prompts, certbot configures everything automatically
```

**Option 2: Cloudflare Origin Certificate (15 years)**

1. Cloudflare Dashboard → SSL/TLS → Origin Server → Create Certificate
2. Copy certificate and private key
3. Upload to server in `/etc/ssl/cloudflare/`
4. Update nginx config to use them
5. Reload nginx

Both options are explained in detail in **CLOUDFLARE-SSL-SETUP.md**.

---

## Troubleshooting

### Problem: Site not loading at all

**Check 1: Is Nginx running?**
```bash
ssh root@72.60.222.7 "systemctl status nginx"
```

If not running:
```bash
ssh root@72.60.222.7 "systemctl start nginx"
```

**Check 2: Are files uploaded?**
```bash
ssh root@72.60.222.7 "ls -la /var/www/yt-thumbnail-generator/"
```

Should see `index.html` and `assets/` folder.

**Check 3: Nginx configuration errors?**
```bash
ssh root@72.60.222.7 "nginx -t"
```

Fix any syntax errors in nginx.conf.

**Check 4: Check error logs**
```bash
ssh root@72.60.222.7 "tail -50 /var/log/nginx/error.log"
```

### Problem: "Too many redirects"

**Cause:** SSL mode mismatch between Cloudflare and server.

**Solution:**
- If server has HTTP only → Cloudflare SSL = Flexible
- If server has HTTPS → Cloudflare SSL = Full or Full (Strict)

### Problem: 404 errors on page refresh

**Cause:** Nginx isn't redirecting to `index.html`.

**Check nginx config has:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Fix:**
```bash
./deploy-manual.sh  # Re-upload correct config
```

### Problem: Old version showing after deployment

**Cause:** Browser or Cloudflare cache.

**Solution 1: Clear browser cache**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

**Solution 2: Clear Cloudflare cache**
- Cloudflare Dashboard → Caching → Purge Everything

**Solution 3: Wait 5 minutes**
- Cloudflare cache usually expires quickly for HTML

### Problem: Can't SSH into server

**Check 1: Server is running**
```bash
ping 72.60.222.7
```

**Check 2: SSH service running**
```bash
ssh -v root@72.60.222.7  # Verbose mode shows connection details
```

**Check 3: Firewall blocking SSH**
- Default SSH port 22 should be open
- Check with your hosting provider

### Problem: API key not working in deployed app

**Cause:** API keys are stored in browser localStorage, not on server.

**Solution:**
1. Visit https://thumbnails.aceternity.com
2. Enter your Gemini API key in the sidebar
3. Click "Save"

The key is stored locally in the user's browser, not on your server. Each user needs to add their own API key.

---

## Maintenance & Updates

### How to Deploy Updates

Whenever you make changes to your app:

```bash
# 1. Make your code changes
# 2. Build new version
npm run build

# 3. Deploy
./deploy-manual.sh
```

That's it! The script handles everything.

### Monitoring Your Site

**Check if site is up:**
```bash
curl -I https://thumbnails.aceternity.com
```

**Check Nginx logs:**
```bash
# Access logs (who visited, when)
ssh root@72.60.222.7 "tail -100 /var/log/nginx/access.log"

# Error logs (what went wrong)
ssh root@72.60.222.7 "tail -100 /var/log/nginx/error.log"
```

**Check server resources:**
```bash
ssh root@72.60.222.7 "df -h"        # Disk space
ssh root@72.60.222.7 "free -h"      # Memory usage
ssh root@72.60.222.7 "uptime"       # Server uptime & load
```

### Backup Strategy

Your source code is your backup! Since this is a static site, you can always rebuild and redeploy.

**What to backup:**
1. ✅ Git repository (your code) - **Most important**
2. ✅ Nginx configuration - Already in `nginx.conf`
3. ⚠️ Server files - Not critical, can be regenerated

**Optional: Backup nginx config from server**
```bash
scp root@72.60.222.7:/etc/nginx/sites-available/yt-thumbnail-generator ./backup-nginx.conf
```

### Server Maintenance

**Update system packages monthly:**
```bash
ssh root@72.60.222.7 "apt update && apt upgrade -y"
```

**Renew SSL certificate (if using Let's Encrypt):**
```bash
# Check when certificate expires
ssh root@72.60.222.7 "certbot certificates"

# Renew (certbot usually does this automatically)
ssh root@72.60.222.7 "certbot renew"
```

**Clean old logs (if disk space low):**
```bash
ssh root@72.60.222.7 "truncate -s 0 /var/log/nginx/access.log"
ssh root@72.60.222.7 "truncate -s 0 /var/log/nginx/error.log"
```

### Rollback to Previous Version

If something goes wrong after deployment:

**Option 1: Redeploy from previous commit**
```bash
git checkout <previous-commit-hash>
npm run build
./deploy-manual.sh
git checkout main  # Return to main branch
```

**Option 2: Use git tags for releases**
```bash
# Before deploying, tag the release
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# To rollback later
git checkout v1.0.0
npm run build
./deploy-manual.sh
git checkout main
```

---

## Advanced Topics

### Setting Up SSH Keys (Avoid Password Prompts)

**Generate SSH key on your machine:**
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter to accept defaults
```

**Copy key to server:**
```bash
ssh-copy-id root@72.60.222.7
# Enter password one last time
```

**Test:**
```bash
ssh root@72.60.222.7
# Should connect without password!
```

Now `./deploy-manual.sh` won't ask for password!

### Setting Up Automatic Deployments with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to server
        uses: easingthemes/ssh-deploy@main
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: 72.60.222.7
          REMOTE_USER: root
          SOURCE: "dist/"
          TARGET: "/var/www/yt-thumbnail-generator/"
```

Add your SSH private key to GitHub Secrets.

### Adding Analytics

**Option 1: Cloudflare Web Analytics (Free, Privacy-friendly)**
1. Cloudflare Dashboard → Analytics → Web Analytics
2. Add site, get tracking code
3. Add to `index.html` before deployment

**Option 2: Google Analytics**
1. Create GA4 property
2. Add tracking code to `index.html`

### Performance Optimization

**Enable Brotli compression in Cloudflare:**
- Dashboard → Speed → Optimization → Enable Brotli

**Enable Rocket Loader:**
- Dashboard → Speed → Optimization → Enable Rocket Loader

**Set up caching rules:**
- Dashboard → Rules → Page Rules
- Cache everything for `*.js`, `*.css`

---

## Quick Reference

### Common Commands

```bash
# Build project
npm run build

# Deploy
./deploy-manual.sh

# SSH to server
ssh root@72.60.222.7

# Check Nginx status
ssh root@72.60.222.7 "systemctl status nginx"

# Restart Nginx
ssh root@72.60.222.7 "systemctl restart nginx"

# View Nginx logs
ssh root@72.60.222.7 "tail -f /var/log/nginx/error.log"

# Test site
curl -I https://thumbnails.aceternity.com
```

### File Locations

**Local:**
- Source code: `src/`
- Built files: `dist/`
- Nginx config: `nginx.conf`
- Deploy script: `deploy-manual.sh`

**Server:**
- Website files: `/var/www/yt-thumbnail-generator/`
- Nginx config: `/etc/nginx/sites-available/yt-thumbnail-generator`
- Nginx enabled sites: `/etc/nginx/sites-enabled/`
- Nginx logs: `/var/log/nginx/`
- SSL certificates: `/etc/letsencrypt/` or `/etc/ssl/cloudflare/`

### Support

If you need help:
1. Check this guide's troubleshooting section
2. Check Nginx error logs
3. Check Cloudflare dashboard for errors
4. Search error messages online

---

## Summary

**Deployment in 3 steps:**

1. **Configure Cloudflare DNS** (one time)
   - Add A record pointing to your server
   - Set SSL mode to Flexible

2. **Setup server** (one time)
   - Install Nginx
   - Create web directory

3. **Deploy** (every update)
   ```bash
   npm run build
   ./deploy-manual.sh
   ```

Your app is now live at **https://thumbnails.aceternity.com** 🎉

**Next steps:**
- ✅ Test your app thoroughly
- ✅ Upgrade to Full SSL (see CLOUDFLARE-SSL-SETUP.md)
- ✅ Set up SSH keys to avoid password prompts
- ✅ Monitor Nginx logs occasionally
- ✅ Keep server updated monthly

---

Made with ❤️ for easy deployments
