#!/bin/zsh

source ~/.zshrc

# Run Next.js in the background
(cd ./nextjs && bun --bun run start) &

# Run Bun server in the background
(cd ./bun_server && bun index.ts) &

# Wait for all background jobs started by this script to finish
# Press Ctrl+C to kill them all
wait