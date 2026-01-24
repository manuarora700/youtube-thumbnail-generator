#!/bin/bash

# Deployment script for YT Thumbnail Generator
# Server: root@72.60.222.7

set -e

SERVER="root@72.60.222.7"
REMOTE_DIR="/var/www/yt-thumbnail-generator"
LOCAL_DIST="./dist"

echo "🚀 Starting deployment..."

# Check if dist folder exists
if [ ! -d "$LOCAL_DIST" ]; then
    echo "❌ Error: dist folder not found. Please run 'npm run build' first."
    exit 1
fi

echo "📦 Uploading files to server..."
# Create remote directory if it doesn't exist
ssh $SERVER "mkdir -p $REMOTE_DIR"

# Upload dist contents to server
rsync -avz --delete $LOCAL_DIST/ $SERVER:$REMOTE_DIR/

echo "⚙️  Uploading nginx configuration..."
# Upload nginx config
scp nginx.conf $SERVER:/etc/nginx/sites-available/yt-thumbnail-generator

echo "🔧 Configuring nginx on server..."
ssh $SERVER << 'ENDSSH'
    # Enable the site
    ln -sf /etc/nginx/sites-available/yt-thumbnail-generator /etc/nginx/sites-enabled/

    # Test nginx configuration
    nginx -t

    # Reload nginx
    systemctl reload nginx
ENDSSH

echo "✅ Deployment complete!"
echo "🌐 Your app is now available at: http://72.60.222.7"
