# Deployment Guide

This guide will help you deploy the YT Thumbnail Generator to your Ubuntu server at `72.60.222.7`.

## Prerequisites

- Ubuntu server with SSH access (root@72.60.222.7)
- Server should have Nginx installed

## Quick Deployment

### 1. First-time Server Setup

SSH into your server and run these commands:

```bash
ssh root@72.60.222.7
```

Once connected to the server:

```bash
# Update system
apt update && apt upgrade -y

# Install Nginx
apt install nginx -y

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Allow HTTP traffic through firewall (if UFW is enabled)
ufw allow 'Nginx HTTP'

# Create web directory
mkdir -p /var/www/yt-thumbnail-generator

# Exit from server
exit
```

### 2. Deploy the Application

From your local machine (in the project directory):

```bash
# Make the deploy script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The script will:
- Upload the built files to `/var/www/yt-thumbnail-generator`
- Configure Nginx
- Reload Nginx

### 3. Access Your Application

Open your browser and go to:
```
http://72.60.222.7
```

## Manual Deployment (Alternative)

If you prefer to deploy manually:

### 1. Build the project locally

```bash
npm run build
```

### 2. Upload files to server

```bash
# Create directory on server
ssh root@72.60.222.7 "mkdir -p /var/www/yt-thumbnail-generator"

# Upload dist folder contents
rsync -avz --delete ./dist/ root@72.60.222.7:/var/www/yt-thumbnail-generator/
```

### 3. Configure Nginx

```bash
# Upload nginx config
scp nginx.conf root@72.60.222.7:/etc/nginx/sites-available/yt-thumbnail-generator

# SSH into server
ssh root@72.60.222.7

# Enable the site
ln -sf /etc/nginx/sites-available/yt-thumbnail-generator /etc/nginx/sites-enabled/

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

# Exit
exit
```

## Updating the Application

To deploy updates:

1. Make your changes locally
2. Build the project: `npm run build`
3. Run the deploy script: `./deploy.sh`

## Troubleshooting

### Nginx not starting

```bash
ssh root@72.60.222.7
systemctl status nginx
nginx -t  # Check for configuration errors
```

### Permission issues

```bash
ssh root@72.60.222.7
chown -R www-data:www-data /var/www/yt-thumbnail-generator
chmod -R 755 /var/www/yt-thumbnail-generator
```

### Can't access the site

1. Check if Nginx is running:
```bash
ssh root@72.60.222.7 "systemctl status nginx"
```

2. Check firewall:
```bash
ssh root@72.60.222.7 "ufw status"
```

3. Check Nginx logs:
```bash
ssh root@72.60.222.7 "tail -f /var/log/nginx/error.log"
```

## Adding a Domain (Optional)

If you want to add a domain later:

1. Point your domain's A record to `72.60.222.7`
2. Update `nginx.conf` - change `server_name 72.60.222.7;` to `server_name yourdomain.com;`
3. Run `./deploy.sh` again
4. Install SSL certificate:

```bash
ssh root@72.60.222.7
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

## Security Recommendations

1. **Change SSH port** from default 22
2. **Disable root login** and use a non-root user with sudo
3. **Set up a firewall** properly with UFW
4. **Add SSL certificate** when you have a domain (free with Let's Encrypt)
5. **Keep system updated**: `apt update && apt upgrade`

## Server Commands Reference

```bash
# Check Nginx status
systemctl status nginx

# Restart Nginx
systemctl restart nginx

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check if port 80 is listening
netstat -tlnp | grep :80
```
