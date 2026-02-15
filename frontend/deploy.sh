#!/bin/bash

# Deployment Configuration
HOST="salvin.me"
USER="root"
DIR="/var/www/portfolio/frontend"

echo "🚀 Starting deployment to $HOST..."

# 1. Build the project
echo "📦 Building project..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Build successful."
else
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

# 2. Sync files
echo "cw Syncing files to $USER@$HOST:$DIR..."
rsync -avz --delete \
    .next \
    public \
    package.json \
    next.config.mjs \
    $USER@$HOST:$DIR

# 3. Reload PM2
echo "🔄 Reloading application on server..."
ssh $USER@$HOST "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\" && cd $DIR && npm install --production && pm2 reload frontend"

echo "✨ Deployment complete! Check https://$HOST"
