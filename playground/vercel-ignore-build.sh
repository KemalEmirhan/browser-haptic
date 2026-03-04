#!/usr/bin/env bash
# Vercel "Ignored Build Step": exit 0 = skip, exit 1 = build.
# Skip when (1) commit is a release/tagging commit, or (2) no changes in playground/.
# Run from playground/ (Root Directory); we cd to repo root for git.

set -e
# When Root Directory is playground, cwd is playground; repo root is parent
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MSG="${VERCEL_GIT_COMMIT_MESSAGE:-}"
if [ -n "$MSG" ] && echo "$MSG" | grep -qE "chore: release|\[skip ci\]"; then
  echo "Vercel: skipping (release/tagging commit)"
  exit 0
fi

PREV="${VERCEL_GIT_PREVIOUS_SHA:-}"
CURR="${VERCEL_GIT_COMMIT_SHA:-}"
if [ -z "$CURR" ]; then
  echo "Vercel: building (no commit sha)"
  exit 1
fi
if [ -z "$PREV" ] || [ "$PREV" = "0000000000000000000000000000000000000000" ]; then
  echo "Vercel: building (no previous commit)"
  exit 1
fi

if ! git diff --name-only "$PREV" "$CURR" --quiet -- playground/ 2>/dev/null; then
  echo "Vercel: building (playground has changes)"
  exit 1
fi
echo "Vercel: skipping (no changes in playground/)"
exit 0
