ARG NODE_VERSION=22.19.0
ARG NGINX_VERSION=alpine3.21

# --- shared deps stage ---
FROM node:${NODE_VERSION}-slim AS deps
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    CI=true \
    NODE_ENV=production
RUN corepack enable
WORKDIR /usr/src

# install workspace dependencies
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# --- client build stage ---
FROM deps AS client-build
RUN pnpm -w --filter @shopping-list/client build
# výstup: /usr/src/apps/client/dist

# --- runtime stage (nginx) ---
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS client
USER nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --from=client-build /usr/src/apps/client/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]

# --- server build stage ---
FROM deps AS server-build
RUN pnpm -w --filter @shopping-list/server build
RUN pnpm --filter @shopping-list/server deploy --prod /out/server
RUN rm -f /out/server/.env

# --- runtime stage (node) ---
FROM node:${NODE_VERSION}-slim AS server
ENV NODE_ENV=production
WORKDIR /app
COPY --from=server-build /out/server /app
EXPOSE 3000
CMD ["node", "dist/src/index.js"]
