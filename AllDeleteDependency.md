Get-ChildItem -Path . -Include node_modules,dist,.turbo,.vite -Recurse -Directory -Force | Remove-Item -Recurse -Force
Get-ChildItem -Path . -Include pnpm-lock.yaml -Recurse -File -Force | Remove-Item -Force

pnpm store prune

pnpm install
