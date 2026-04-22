#!/bin/bash

# Koti Admin Firebase Deployer
echo "🚀 Building Koti Admin for Production..."

cd koti-admin

# Install firebase-tools if not present
if ! command -v firebase >/dev/null 2>&1; then
  echo "🔌 Installing Firebase Tools..."
  npm install -g firebase-tools
fi

# Build and Deploy
echo "🏗️ Starting Build & Deploy Sequence..."
firebase deploy --only hosting

echo "✅ Admin Panel is LIVE on Firebase Hosting!"
