dev:
    tmux new-window -n client 'cd packages/client && pnpm run dev'
    tmux new-window -n server 'cd packages/server && pnpm run dev'

stop:
    tmux kill-window -t client || true
    tmux kill-window -t server || true
