# Cloudflare + SSL Setup Guide

Your domain `thumbnails.aceternity.com` is configured in Cloudflare. Here's how to set up SSL properly.

## Quick Setup (Cloudflare Proxy Enabled)

If you're using Cloudflare's proxy (orange cloud), you have two options:

### Option 1: Cloudflare Flexible SSL (Easiest - 5 minutes)

This is the simplest option but less secure (HTTP between Cloudflare and your server).

1. **In Cloudflare Dashboard:**
   - Go to SSL/TLS → Overview
   - Set SSL/TLS encryption mode to **"Flexible"**

2. **Deploy your app:**
   ```bash
   ./deploy-manual.sh
   ```

3. **Done!** Your site will be accessible at:
   - ✅ https://thumbnails.aceternity.com (Cloudflare handles SSL)
   - The current nginx.conf (HTTP only) works fine

**Pros:** No server configuration needed
**Cons:** Traffic between Cloudflare and your server is unencrypted

---

### Option 2: Cloudflare Full SSL with Let's Encrypt (Recommended - 10 minutes)

This encrypts traffic end-to-end for better security.

#### Step 1: Deploy with current HTTP config

```bash
./deploy-manual.sh
```

#### Step 2: Install SSL certificate on server

SSH into your server:

```bash
ssh root@72.60.222.7
```

Then run these commands:

```bash
# Install certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (you'll be asked for email)
certbot --nginx -d thumbnails.aceternity.com

# Certbot will automatically:
# - Obtain certificate from Let's Encrypt
# - Configure nginx for HTTPS
# - Set up auto-renewal

# Test auto-renewal
certbot renew --dry-run

# Exit server
exit
```

#### Step 3: Configure Cloudflare

In Cloudflare Dashboard:
- Go to SSL/TLS → Overview
- Set SSL/TLS encryption mode to **"Full (strict)"**

**Done!** Your site is now fully encrypted: Browser ↔ Cloudflare ↔ Your Server

---

### Option 3: Cloudflare Origin Certificate (Alternative - 15 minutes)

Use Cloudflare's own certificate (valid for 15 years, free).

#### Step 1: Generate Origin Certificate in Cloudflare

1. Go to SSL/TLS → Origin Server
2. Click "Create Certificate"
3. Choose:
   - Private key type: RSA
   - Hostnames: `thumbnails.aceternity.com` and `*.aceternity.com`
   - Certificate Validity: 15 years
4. Click "Create"
5. Copy both the certificate and private key

#### Step 2: Install on server

SSH into server:

```bash
ssh root@72.60.222.7

# Create directory for certificates
mkdir -p /etc/ssl/cloudflare

# Create certificate file
nano /etc/ssl/cloudflare/cert.pem
# Paste the Origin Certificate, save (Ctrl+X, Y, Enter)

# Create private key file
nano /etc/ssl/cloudflare/key.pem
# Paste the Private Key, save (Ctrl+X, Y, Enter)

# Set proper permissions
chmod 600 /etc/ssl/cloudflare/key.pem
chmod 644 /etc/ssl/cloudflare/cert.pem
```

#### Step 3: Update nginx configuration

Still on the server:

```bash
nano /etc/nginx/sites-available/yt-thumbnail-generator
```

Replace the contents with:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name thumbnails.aceternity.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name thumbnails.aceternity.com;

    # Cloudflare Origin Certificate
    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    root /var/www/yt-thumbnail-generator;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~ /\. {
        deny all;
    }
}
```

Save and exit (Ctrl+X, Y, Enter)

#### Step 4: Test and reload nginx

```bash
# Test configuration
nginx -t

# If test passes, reload nginx
systemctl reload nginx

# Exit server
exit
```

#### Step 5: Configure Cloudflare

In Cloudflare Dashboard:
- Go to SSL/TLS → Overview
- Set SSL/TLS encryption mode to **"Full (strict)"**

**Done!** Origin certificate is valid for 15 years.

---

## Cloudflare DNS Configuration

Make sure your DNS is configured correctly:

1. Go to Cloudflare Dashboard → DNS
2. Add/verify A record:
   - Type: `A`
   - Name: `thumbnails` (or `@` if using root domain)
   - IPv4 address: `72.60.222.7`
   - Proxy status: **Proxied** (orange cloud) - Recommended
   - TTL: Auto

## Cloudflare Additional Settings (Optional but Recommended)

### 1. Enable Always Use HTTPS
- Go to SSL/TLS → Edge Certificates
- Enable "Always Use HTTPS"

### 2. Enable HTTP/3
- Go to Network
- Enable "HTTP/3 (with QUIC)"

### 3. Enable Auto Minify
- Go to Speed → Optimization
- Enable Auto Minify for HTML, CSS, JavaScript

### 4. Enable Brotli Compression
- Go to Speed → Optimization
- Enable "Brotli"

### 5. Set up Page Rules (optional)
- Go to Rules → Page Rules
- Create rule for `thumbnails.aceternity.com/*`
- Cache Level: Standard
- Browser Cache TTL: 1 hour

## Verification

After setup, verify your SSL:

```bash
# Check if site loads with HTTPS
curl -I https://thumbnails.aceternity.com

# Check SSL certificate
openssl s_client -connect 72.60.222.7:443 -servername thumbnails.aceternity.com
```

Online tools:
- https://www.ssllabs.com/ssltest/analyze.html?d=thumbnails.aceternity.com
- https://www.cloudflare.com/ssl/encrypted-sni/

## Troubleshooting

### "Too many redirects" error
- Check Cloudflare SSL mode matches your server config
- Flexible SSL = HTTP on server
- Full/Full (strict) = HTTPS on server

### "Your connection is not private" error
- Wait 5-10 minutes for DNS propagation
- Clear browser cache
- Check certificate installation on server

### Site not loading
```bash
# Check nginx status
ssh root@72.60.222.7 "systemctl status nginx"

# Check nginx error logs
ssh root@72.60.222.7 "tail -f /var/log/nginx/error.log"

# Check if port 443 is open
ssh root@72.60.222.7 "netstat -tlnp | grep :443"
```

## My Recommendation

For your use case, I recommend:

**Start with Option 1 (Flexible SSL)** to get your site live quickly, then upgrade to **Option 2 (Let's Encrypt)** or **Option 3 (Origin Certificate)** later for better security.

Simply run:
```bash
./deploy-manual.sh
```

Then in Cloudflare: Set SSL mode to "Flexible"

Your site will be live at **https://thumbnails.aceternity.com** immediately!
