#!/bin/bash
set -euox pipefail

cd app
forge install \
  --non-interactive \
  --upgrade \
  --product confluence \
  --site "${FORGE_INSTALLATION_SITE}" \
  --environment "${FORGE_ENVIRONMENT}"
