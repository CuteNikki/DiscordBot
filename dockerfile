FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lockb* ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile --production
RUN bunx prisma generate

COPY . .

CMD ["bun", "run", "start"]