#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

npm run lint
npm run test:unit -- --run
npm run build

echo "verify: ok"
