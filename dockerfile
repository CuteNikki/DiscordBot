FROM oven/bun:1-alpine

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

WORKDIR /app

COPY package.json bun.lock* ./
COPY prisma ./prisma/

# Prisma's migrations engine isn't needed to generate its client, nor by the
# bot. Saying it's there keeps Prisma from downloading it as it installs and
# generates, which from Docker's network, with no IPv6, can time out. Only for
# the build, so a migration run by hand in the container gets the real engine
ARG PRISMA_SCHEMA_ENGINE_BINARY=/bin/true

RUN bun install --frozen-lockfile
RUN bunx prisma generate

COPY . .

CMD ["bun", "run", "start"]