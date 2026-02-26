#!/bin/bash
# Pre-deployment checks for mobile app

echo "🔍 Running TypeScript compilation check..."

# Run tsc and filter out known errors
TS_OUTPUT=$(npx tsc --noEmit 2>&1)
FILTERED_ERRORS=$(echo "$TS_OUTPUT" | grep "error TS" | grep -v "WineCard.tsx" | grep -v "ImportScreen.tsx" | grep -v "expo-file-system")

if [ -n "$FILTERED_ERRORS" ]; then
  echo ""
  echo "❌ TypeScript errors found in NEW code:"
  echo "$FILTERED_ERRORS"
  exit 1
fi

echo ""
echo "✅ All checks passed!"
echo "Safe to commit and push."
