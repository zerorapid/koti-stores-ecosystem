#!/bin/bash

# Koti Ecosystem Master Ignition
echo "🚀 Starting Koti Stores Ecosystem..."

# Start Admin (Port 3000)
echo "🏗️ Starting Master Admin..."
(cd koti-admin && npm run dev) &

# Start Store App (Port 8081)
echo "🛍️ Starting Store App..."
(cd koti-stores && npx expo start) &

# Start Delivery App (Port 8082 - assigned automatically)
echo "🛵 Starting Delivery App..."
(cd koti-delivery && npx expo start) &

echo "✅ All systems initiated. Check your browser/emulator."
wait
