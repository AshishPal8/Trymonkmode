FROM oven/bun:1-alpine AS base
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

COPY . .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["bun", "src/server.ts"]
