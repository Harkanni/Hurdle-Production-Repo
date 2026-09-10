# Hurdle Backend Service

This is the unified backend service for the Hurdle app, handling **Authentication, Sessions, and Real-Time Channel Messaging**. It was collaboratively built for the Agile Practicum demo sprint.

## 👥 Contributors
- **Auth & Session Module:** Toluwani
- **Channel Messages Module:** Raphael

## 🛠 Tech Stack
- NestJS
- TypeScript
- MongoDB (via Mongoose)
- Socket.IO (for real-time WebSockets)
- JWT (via `@nestjs/jwt` and Passport)
- bcrypt (password hashing)

---

## ⚙️ Environment Variables & Setup

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hurdle
JWT_SECRET=your_super_secret_key_here
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server runs on (default: `3000` or `5000`) |
| `MONGODB_URI` | MongoDB Atlas connection string (must include db name, e.g. `/hurdle`) |
| `JWT_SECRET` | Secret for signing and verifying JWTs |

### Running the server

```bash
# 1. Install dependencies
npm install

# 2. Start in dev/watch mode
npm run start:dev
```

A successful start ends with:
```
[Nest] ... Nest application successfully started
```

---

## 🔐 Part 1: Auth & Session (by Toluwani)

Backend service for Hurdle's user registration, login, and session management.

### API Endpoints

| Method | Route | Auth required | Purpose |
|---|---|---|---|
| POST | `/api/register` | No | Create an account |
| POST | `/api/login` | No | Get a JWT |
| GET | `/api/me` | Yes | Get current user info |
| POST | `/api/logout` | Yes | Client-side token discard |

### Testing Auth
Using Thunder Client or any REST client:
1. `POST /api/register` with `{"email": "...", "password": "..."}` → expect `201`
2. `POST /api/login` with the same credentials → expect `200` with a `token`
3. `GET /api/me` with header `Authorization: Bearer <token>` → expect your user data back

---

## 💬 Part 2: Channel Messages (by Raphael)

This module handles **real-time channel messaging**. It exposes REST endpoints for channel management and message CRUD, plus a WebSocket gateway for live chat.

### 🔐 Authentication Setup for Channels
All endpoints and WebSocket connections are **JWT protected**.

**REST requests** — include in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

**WebSocket connections** — pass the token in the handshake:
```js
const socket = io('http://localhost:3000/chat', {
  auth: { token: '<your_jwt_token>' }
});
```

### 📡 REST API Endpoints

#### Channels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/channels` | Create a new channel |
| `GET` | `/api/channels` | List all channels (with `isMember` flag) |
| `GET` | `/api/channels/:channelId` | Get a single channel by ID |
| `POST` | `/api/channels/:channelId/join` | Join a channel |
| `DELETE` | `/api/channels/:channelId/leave` | Leave a channel |
| `GET` | `/api/channels/:channelId/members` | Get channel members |

#### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/channels/:channelId/messages` | Send a message to a channel |
| `GET` | `/api/channels/:channelId/messages` | Get message history (paginated) |
| `DELETE` | `/api/channels/:channelId/messages/:messageId` | Delete a message (sender only) |

*(Note: Sending or deleting messages via REST automatically emits real-time WebSocket events to all clients in the channel!)*

---

### 🔌 WebSocket Gateway (Real-Time)

**Namespace:** `/chat`  
**URL:** `ws://localhost:3000/chat`

Connect using the [Socket.IO](https://socket.io/docs/v4/client-api/) client library.

#### Events You **Emit** (Client → Server)
| Event | Payload | Description |
|-------|---------|-------------|
| `join_channel` | `{ channelId: string }` | Join a channel room to receive live messages |
| `leave_channel` | `{ channelId: string }` | Leave a channel room |
| `typing_start` | `{ channelId: string }` | Notify others you are typing |
| `typing_stop` | `{ channelId: string }` | Notify others you stopped typing |

#### Events You **Listen For** (Server → Client)
| Event | Payload | When it fires |
|-------|---------|---------------|
| `connected` | `{ message: string }` | On successful connection |
| `joined_channel` | `{ channelId, message }` | After you emit `join_channel` |
| `left_channel` | `{ channelId }` | After you emit `leave_channel` |
| `new_message` | Message object | A new message was sent in a channel you joined |
| `message_deleted` | `{ messageId, channelId }` | A message was deleted in a channel you joined |
| `user_joined` | `{ channelId, user }` | Another user joined your channel room |
| `user_left` | `{ channelId, user }` | Another user left your channel room |
| `user_typing` | `{ channelId, user }` | Another user started typing |
| `user_stopped_typing` | `{ channelId, user }` | Another user stopped typing |
| `error` | `{ message: string }` | Auth failure or bad event payload |

---

## 📝 Key Notes for Frontend Devs

- **Use cursor-based pagination** with the `before` query param — not page numbers for messages.
- **REST send → auto WebSocket emit**: When a message is sent via `POST /messages`, the server automatically emits `new_message` to all WebSocket clients in that channel — no need to duplicate with a socket emit from the frontend. Same applies for deleting messages.