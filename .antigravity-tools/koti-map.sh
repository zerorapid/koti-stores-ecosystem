#!/bin/bash
# Koti Context Map - Agentic Tool (External)
# Purpose: Builds a local directory map for Antigravity to navigate without cloud searches.

OUTPUT=".antigravity-tools/maps/project_map.txt"
echo "🛰️ KOTI ECOSYSTEM MAP - GENERATED $(date)" > $OUTPUT
echo "------------------------------------------------" >> $OUTPUT

echo -e "\n📦 CORE MODULES:" >> $OUTPUT
ls -d */ | grep -v "node_modules" >> $OUTPUT

echo -e "\n🔧 FIREBASE CONFIGURATIONS:" >> $OUTPUT
find . -name "*firebase*" -not -path "*/node_modules/*" >> $OUTPUT

echo -e "\n🖥️ ADMIN PANEL (Koti-Admin):" >> $OUTPUT
find koti-admin/src/app -maxdepth 2 -type d >> $OUTPUT

echo -e "\n🛵 DELIVERY APP (Koti-Delivery):" >> $OUTPUT
find koti-delivery/src/screens -maxdepth 1 -type f >> $OUTPUT

echo -e "\n🛍️ STORE APP (Koti-Store):" >> $OUTPUT
find koti-store/src/app -maxdepth 2 -type d >> $OUTPUT

echo -e "\n✅ MAP COMPLETE." >> $OUTPUT
echo "Map saved to $OUTPUT"
