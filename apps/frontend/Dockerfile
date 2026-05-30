FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm install
RUN cd /app/apps/frontend && npm run build

WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["/app/node_modules/.bin/next", "start"] 