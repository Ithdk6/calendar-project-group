FROM node:20-alpine AS build-frontend
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "./dist/server/entry.mjs"]
