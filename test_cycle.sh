#!/bin/bash
#
# goed om later toe te voegen analyzeDocStatus.js
#
set -x
# Test cycle
DOTHIS="docs-internal/beveiliging"
./scripts/generate-categories.sh remove ${DOTHIS}
./scripts/generate-categories.sh full ${DOTHIS}

echo "IMPROVE"
claude -p --verbose < <(./scripts/improve-prompt.sh ${DOTHIS})

echo "EXECUTE"
claude -p --verbose < <(cat ${DOTHIS}/PROMPT.md)

#for category in $(cat categories.txt); do
#  echo "Processing: $category"
#  ./scripts/improve-prompt.sh "$category" | claude --model claude-3-sonnet
#done

