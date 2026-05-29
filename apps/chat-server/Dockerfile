FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/chat-server/ ./apps/chat-server/

RUN npm install
RUN cd /app/apps/chat-server && npm run build

WORKDIR /app/apps/chat-server
EXPOSE 3001
CMD ["node", "dist/index.js"]