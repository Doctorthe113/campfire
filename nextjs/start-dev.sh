#!/bin/zsh

source ~/.zshrc

set -e

(cd ../server && NODE_ENV=development bun --watch index.ts) &
(bun --bun run dev)