FROM node:20-alpine AS build-frontend
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001
EXPOSE 4321

CMD ["npm", "run", "dev"]
