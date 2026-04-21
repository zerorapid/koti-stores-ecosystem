#!/bin/bash
# Koti Environment Pulse - Agentic Tool (External)
# Purpose: Checks the local environment health for Antigravity.

LOG=".antigravity-tools/logs/pulse_$(date +%Y%m%d).log"
echo "💓 KOTI ENVIRONMENT PULSE - $(date)" > $LOG

# Check Directories
for dir in koti-admin koti-store koti-delivery; do
  if [ -d "$dir" ]; then
    echo "✅ [DIR] $dir exists." >> $LOG
  else
    echo "❌ [DIR] $dir MISSING." >> $LOG
  fi
done

# Check Dependencies
if [ -d "koti-admin/node_modules" ]; then
  echo "✅ [DEPS] koti-admin node_modules found." >> $LOG
else
  echo "⚠️ [DEPS] koti-admin node_modules MISSING." >> $LOG
fi

# Check Firebase Sync Files
if [ -f "koti-admin/src/lib/koti-firebase.ts" ]; then
  echo "✅ [SYNC] Firebase Master Config found." >> $LOG
fi

echo "Environment Audit Logged to $LOG"
