FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

ENV NEXT_PUBLIC_API_URL=http://localhost:3001

RUN npm install
RUN cd /app/apps/frontend && npm run build

WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["/app/node_modules/.bin/next", "start"]