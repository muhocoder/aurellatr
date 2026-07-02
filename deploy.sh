#!/bin/bash
# ═══════════════════════════════════════════════════
# AURELLE — GitHub Pages Deploy Script
# ═══════════════════════════════════════════════════
# Bu scripti çalıştırmadan önce:
# 1. git kurulu olduğundan emin olun
# 2. GitHub kullanıcı adınızı girin
# ═══════════════════════════════════════════════════

set -e

GITHUB_TOKEN="******************"
REPO_NAME="aurellatr"

echo "GitHub kullanıcı adınızı girin:"
read GITHUB_USERNAME

# Build
echo "→ Proje derleniyor..."
npm run build

# Copy config files to dist
mkdir -p dist/config
cp public/config/shopier.json dist/config/
cp public/config/admin.json dist/config/

# Create 404.html for SPA routing
cp dist/index.html dist/404.html

# Create GitHub repo (if not exists)
echo "→ GitHub repo oluşturuluyor..."
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/user/repos" \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Aurelle Jewelry Store\",\"homepage\":\"https://$GITHUB_USERNAME.github.io/$REPO_NAME\",\"private\":false}" \
  > /dev/null

# Deploy to gh-pages
echo "→ GitHub Pages'e yükleniyor..."
cd dist

git init
git checkout -b gh-pages
git config user.email "deploy@aurella.com"
git config user.name "Aurelle Deploy"
git add -A
git commit -m "Deploy Aurelle $(date '+%Y-%m-%d %H:%M')"
git push -f "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git" gh-pages

cd ..

echo ""
echo "✓ Deploy tamamlandı!"
echo "→ Siteniz birkaç dakika içinde şu adreste hazır olacak:"
echo "  https://$GITHUB_USERNAME.github.io/$REPO_NAME"
echo ""
echo "⚠️  GitHub'da repo ayarlarından Pages > Branch: gh-pages seçtiğinizden emin olun."
