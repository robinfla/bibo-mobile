#!/bin/bash
# Run a single Maestro test
# Usage: ./run-single.sh <flow-name>
# Example: ./run-single.sh 04-tasting-sheet

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FLOWS_DIR="$SCRIPT_DIR/../flows"

if [ -z "$1" ]; then
    echo "Usage: ./run-single.sh <flow-name>"
    echo ""
    echo "Available flows:"
    ls -1 "$FLOWS_DIR"/*.yaml | xargs -n1 basename | sed 's/.yaml$//'
    exit 1
fi

FLOW="$FLOWS_DIR/$1.yaml"

if [ ! -f "$FLOW" ]; then
    echo "❌ Flow not found: $1"
    echo "Available flows:"
    ls -1 "$FLOWS_DIR"/*.yaml | xargs -n1 basename | sed 's/.yaml$//'
    exit 1
fi

echo "🍷 Running: $1"
maestro test "$FLOW"
