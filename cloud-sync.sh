#!/bin/bash
# Koti Ecosystem: Universal Cloud Sync
echo "🛰️  Initiating Universal Sync..."

# 1. Clean local junk
echo "🧹 Cleaning local artifacts..."
find . -name "node_modules" -type d -prune -o -name "build" -type d -exec rm -rf {} +

# 2. Sync Sub-modules (Ensuring no 'Ghost Repos')
echo "🔗 Locking Sub-modules..."
for dir in koti-admin koti-delivery koti-stores; do
  if [ -d "$dir" ]; then
    echo "  - Syncing $dir"
    (cd $dir && git add . && git commit -m "Auto-Sync: $(date)" || echo "    (No changes in $dir)")
  fi
done

# 3. Master Push
echo "🚀 Pushing to Cloud..."
git add .
git commit -m "Universal Master Sync: $(date)"
git push origin main

echo "✅ ALL SYSTEMS SYNCED. Refresh IDX now!"
