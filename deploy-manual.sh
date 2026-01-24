#!/bin/bash

# Manual Deployment Script with Password Authentication
# You'll be prompted for your password multiple times

set -e

SERVER="root@72.60.222.7"
REMOTE_DIR="/var/www/yt-thumbnail-generator"
LOCAL_DIST="./dist"

echo "🚀 Starting deployment to $SERVER..."
echo "⚠️  You will be prompted for your password multiple times"
echo ""

# Check if dist folder exists
if [ ! -d "$LOCAL_DIST" ]; then
    echo "❌ Error: dist folder not found. Run 'npm run build' first."
    exit 1
fi

echo "Step 1/5: Checking if Nginx is installed..."
if ssh $SERVER "command -v nginx > /dev/null 2>&1"; then
    echo "✅ Nginx is already installed"
else
    echo "📦 Installing Nginx..."
    ssh $SERVER "apt update && apt install nginx -y && systemctl start nginx && systemctl enable nginx"
fi

echo ""
echo "Step 2/5: Creating web directory..."
ssh $SERVER "mkdir -p $REMOTE_DIR"

echo ""
echo "Step 3/5: Uploading application files..."
rsync -avz --delete $LOCAL_DIST/ $SERVER:$REMOTE_DIR/

echo ""
echo "Step 4/5: Uploading nginx configuration..."
scp nginx.conf $SERVER:/etc/nginx/sites-available/yt-thumbnail-generator

echo ""
echo "Step 5/5: Configuring and restarting Nginx..."
ssh $SERVER << 'ENDSSH'
    # Enable the site
    ln -sf /etc/nginx/sites-available/yt-thumbnail-generator /etc/nginx/sites-enabled/

    # Remove default site if it conflicts
    rm -f /etc/nginx/sites-enabled/default

    # Test nginx configuration
    nginx -t

    # Reload nginx
    systemctl reload nginx

    # Show status
    systemctl status nginx --no-pager
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your app should now be available at:"
echo "   - http://thumbnails.aceternity.com"
echo "   - http://72.60.222.7"
echo ""
echo "📝 Next steps:"
echo "   1. Ensure Cloudflare DNS A record points to 72.60.222.7"
echo "   2. Set Cloudflare SSL/TLS mode to 'Full' for HTTPS"
echo "   3. Optional: Install SSL certificate on server (see DEPLOYMENT.md)"
echo ""
echo "To verify, run: curl -I http://thumbnails.aceternity.com"
