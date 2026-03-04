#!/usr/bin/env bash
# Vercel "Ignored Build Step": exit 0 = skip, exit 1 = build.
# Skip when (1) commit is a release/tagging commit, or (2) no changes in playground/.

set -e
cd "$(dirname "$0")/.."

MSG="${VERCEL_GIT_COMMIT_MESSAGE:-}"
# Skip tagging/release commits (from GitHub Actions release workflow)
if echo "$MSG" | grep -qE "chore: release|\[skip ci\]"; then
  echo "Vercel: skipping (release/tagging commit)"
  exit 0
fi

# Skip if no changes in playground/
PREV="${VERCEL_GIT_PREVIOUS_SHA:-}"
CURR="${VERCEL_GIT_COMMIT_SHA:-}"
if [ -z "$PREV" ] || [ "$PREV" = "0000000000000000000000000000000000000000" ]; then
  echo "Vercel: building (no previous commit)"
  exit 1
fi
if git diff --name-only "$PREV" "$CURR" --quiet -- playground/ 2>/dev/null; then
  echo "Vercel: skipping (no changes in playground/)"
  exit 0
fi
echo "Vercel: building (playground has changes)"
exit 1
