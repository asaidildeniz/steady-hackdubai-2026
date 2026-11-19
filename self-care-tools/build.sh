#!/usr/bin/env sh
# Copies only the public site into dist/ so internal docs (*.md) never ship.
set -e
cd "$(dirname "$0")"
rm -rf dist
mkdir -p dist
cp -r index.html _headers css js fonts walkthroughs dist/
echo "Built dist/:"
find dist -type f | sort
