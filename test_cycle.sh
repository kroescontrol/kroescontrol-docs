#!/bin/bash
#
# goed om later toe te voegen analyzeDocStatus.js
#
set -x
# Test cycle
DOTHIS="docs-internal/beveiliging"
./scripts/generate-categories.sh remove ${DOTHIS}
./scripts/generate-categories.sh full ${DOTHIS}
