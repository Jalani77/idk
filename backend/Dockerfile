# YiriAI Backend
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY src ./src
COPY .env.example ./.env
EXPOSE 4000
ENV NODE_ENV=production
CMD ["npm", "start"]
