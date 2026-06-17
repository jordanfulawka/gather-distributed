# Gather (distributed)

_A horizontally scalable, multi-node realtime chat platform built to demonstrate distributed systems concepts - Socket.IO + Redis pub/sub + nginx load balancing, all runnable via Docker Compose._

  <p align="center">
    <a href="https://gather-chat.dev/">Live Demo</a>
    &middot;
    <a href="https://github.com/jordanfulawka/gather-distributed/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/jordanfulawka/gather-distributed/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>

Real-time chat applications are fairly simple to build for a single server once the basic concepts are understood: websockets, rooms, presence. However, once we need to scale past one process, all of the aforementioned things that "just worked" - break, because they all assume that everything lives in the memory of a single node process. I wanted to actually feel this problem and solve it, rather than just read about it in a system design textbook. So, I build Gather Distributed: a multi-node, horizontally scalable realtime chat playform designed to demonstrate core distributed systems concepts in a runnable, hands-on way. It's a distributed evolution of an original single-server Gather chat app, now built with Next.js, Node.js/Express, Socket.IO, Redis, and PostgreSQL, fully orchestrated with Docker Compose. In its current state, Gather Distributed comes with the following features:

- Multi-Node Chat servers - Two independent Socket.IO server instances (server-a, server-b) run behind an nginx load balancer with sticky sessions and WebSocket proxying, so clicnets can connect to either node transparently
- Cross-Server Room Sync - Redis pub/sub propagates room events between nodes, solving the problem of Socket.IO rooms normally being process local
- Authentication - JWT-based auth with clear error handling and messaging on invalid login/register attempts
- Live Join Notifications - System messages broadcast in-room when a user joins, synced across whichever server instance other members are connected to
- Dockerized Multi-Service Architecture - One docker-compose command spins up the frontend, two chat server nodes, Redis, PostgreSQL, and nginx together, with a hot-reload dev variant for active development

## Build With

### Frontend (client)

- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS
- Socket.IO Client

### Backend (chat server)

- Node.js + Express 5
- TypeScript
- Socket.IO + @socket.io/redis-adapter (cross-server room sync)
- ioredis (Redis pub/sub coordination)
- pg (PostgreSQL client)
- jsonwebtoken + bcryptjs (auth)
- CORS, dotenv

### Infrastructure

- Redis (pub/sub, presence)
- PostgreSQL (persistence)
- nginx (load balancing, sticky sessions, WebSocket proxying)
- Docker + Docker Compose (orchestration)

## Getting Started

#### Prerequisites

- Docker (https://www.docker.com/) and Docker Compose
- Node.js 20+ (only needed if you want to run things outside of Docker)

#### Running Locally

1. Clone the repo
2. Start with full stack with the dev Docker Compose file (includes hot reload for the frontend and chat servers)  
    `docker compose -f docker-compose.dev.yml up -d --build`  
   This spins up:
   - postgres - database (port 5432)
   - redis - pub/sub coordination (port 6379)
   - server-a / server-b - two chat server nodes (port 3001 / 3002)
   - nginx - load balancer in front of the chat servers (port 80)
   - frontend - Next.js app (port 3000)
3. Open the app at `http://localhost:3000`
4. To stop everything  
   `docker compose -f docker-compose.dev.yml down`  
   _Optionally add a -v flag to the above command to clear the database_

_All required environment variables (DB credentials, JWT secret, Redis URL, etc.) are already set in the docker-compose.dev.yuml file for local development, no .env file is needed to get running._

## Roadmap

- [ ] Profile Customization - Avatars, display names, status messages
- [ ] Message Reactions - emoji reactions on messages
- [ ] Read receipts - per-user "seen" tracking on messages
- [ ] File/Image sharing - upload and share images/files in chat
- [ ] Message Search - Full-text search across room history
- [ ] Admin/Moderation Tools - Kick/ban users, delete messages, room ownership controls

## Contact

Jordan Fulawka - [jordan.fulawka@outlook.com](mailto:jordan.fulawka@outlook.com)

Portfolio - [jordanfulawka.ca](https://jordanfulawka.ca)

LinkedIn: [linkedin.com/in/jordan-fulawka](https://www.linkedin.com/in/jordanfulawka/)

GitHub: [@jordanfulawka](https://github.com/jordanfulawka)

Project Link: [github.com/jordanfulawka/gather-distributed](https://github.com/jordanfulawka/gather-distributed)
