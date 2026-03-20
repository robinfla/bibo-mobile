#!/bin/bash
# Run all Maestro tests for Bibo Wine Cellar
# Usage: ./run-all.sh [--device <device-id>]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FLOWS_DIR="$SCRIPT_DIR/../flows"

echo "🍷 Bibo Wine Cellar - Maestro Tests"
echo "===================================="

# Check if maestro is installed
if ! command -v maestro &> /dev/null; then
    echo "❌ Maestro not installed. Run: brew install maestro"
    exit 1
fi

# Check for running simulator
if ! xcrun simctl list | grep -q "Booted"; then
    echo "⚠️  No iOS simulator running. Starting one..."
    open -a Simulator
    sleep 5
fi

# Run all test flows in order
for flow in "$FLOWS_DIR"/*.yaml; do
    echo ""
    echo "▶️  Running: $(basename "$flow")"
    echo "---"
    maestro test "$flow" "$@"
done

echo ""
echo "===================================="
echo "✅ All tests completed!"
