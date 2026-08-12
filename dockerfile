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

COPY package.json bun.lockb* ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile
RUN bunx prisma generate

COPY . .

CMD ["bun", "run", "start"]