
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY config ./config
COPY models ./models
COPY routes ./routes
COPY server.js ./

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server.js"]
