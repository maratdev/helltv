FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:22-alpine AS development

RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

FROM node:22-alpine AS production

RUN apk add --no-cache wget

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/src/main.js"]
