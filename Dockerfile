FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npx prisma generate --config prisma7.config.ts
RUN npm run build

EXPOSE 8080
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma7.config.ts && npm start"]