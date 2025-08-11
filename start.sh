!/usr/bin/zsh

source ~/.zshrc

set -e

(cd ./server && NODE_ENV=production bun index.ts) &
(cd ./nextjs && bun --bun run dev)