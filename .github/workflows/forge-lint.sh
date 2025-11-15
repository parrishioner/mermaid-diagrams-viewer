#!/bin/bash
set -euox pipefail

cd app

output=$(forge lint 2>&1)
echo "$output"

if echo "$output" | grep -iq "Warning:"; then
  echo ""
  echo "⚠️ Found warnings, forcing build failure"
  exit 1
fi
