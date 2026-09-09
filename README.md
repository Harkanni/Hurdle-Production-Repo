# Hurdle Backend — Channel Messages Service

> **Module owner:** Raphael
> **Branch:** `backend/channel-messages`
> **Stack:** NestJS · TypeScript · MongoDB (Mongoose) · Socket.IO · JWT Auth

This module handles **real-time channel messaging** for the Hurdle app. It exposes REST endpoints for channel management and message CRUD, plus a WebSocket gateway for live chat.

---

## 📁 Module Structure

```
src/
├── auth/
│   ├── jwt.strategy.ts           # JWT validation strategy
│   ├── jwt-auth.guard.ts         # Route guard (attach to protected routes)
│   ├── current-user.decorator.ts # @CurrentUser() decorator
│   └── schemas/user.schema.ts    # User Mongoose schema
├── channels/
│   ├── channels.controller.ts    # Channel REST endpoints
│   ├── channels.service.ts       # Channel business logic
│   └── schemas/channel.schema.ts
├── messages/
│   ├── messages.controller.ts    # Message REST endpoints
│   ├── messages.gateway.ts       # WebSocket gateway (real-time)
│   ├── messages.service.ts       # Message business logic
│   └── schemas/message.schema.ts
└── main.ts                       # App bootstrap (port, CORS, prefix)
```

---

## 🚀 Base URL

```
http://localhost:3000/api
```

All REST routes are prefixed with `/api`.

---

## 🔐 Authentication

All endpoints and WebSocket connections are **JWT protected**.

### How to send the token

**REST requests** — include in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

**WebSocket connections** — pass the token in the handshake:
```js
// Option 1: handshake auth (preferred)
const socket = io('http://localhost:3000/chat', {
  auth: { token: '<your_jwt_token>' }
});

// Option 2: authorization header
const socket = io('http://localhost:3000/chat', {
  extraHeaders: { authorization: 'Bearer <your_jwt_token>' }
});
```

> The JWT must contain `sub` (user ID), `email`, and `username` fields.
> It is signed with the `JWT_SECRET` environment variable.

---

## 📡 REST API Endpoints

### Channels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/channels` | Create a new channel |
| `GET` | `/api/channels` | List all channels (with `isMember` flag) |
| `GET` | `/api/channels/:channelId` | Get a single channel by ID |
| `POST` | `/api/channels/:channelId/join` | Join a channel |
| `DELETE` | `/api/channels/:channelId/leave` | Leave a channel |
| `GET` | `/api/channels/:channelId/members` | Get channel members |

---

#### `POST /api/channels` — Create Channel

**Request body:**
```json
{
  "name": "general",
  "description": "General discussion"
}
```

**Response `201`:**
```json
{
  "_id": "channel_id",
  "name": "general",
  "description": "General discussion",
  "createdBy": "user_id",
  "members": ["user_id"]
}
```

---

#### `GET /api/channels` — List All Channels

**Response `200`:**
```json
[
  {
    "_id": "channel_id",
    "name": "general",
    "description": "General discussion",
    "isMember": true
  }
]
```

---

#### `POST /api/channels/:channelId/join` — Join Channel

**Response `200`:**
```json
{ "message": "Joined channel successfully" }
```

---

#### `DELETE /api/channels/:channelId/leave` — Leave Channel

> The channel **creator cannot leave** their own channel.

**Response `200`:**
```json
{ "message": "Left channel successfully" }
```

---

#### `GET /api/channels/:channelId/members` — Get Members

> You must be a **member** of the channel to view its members.

**Response `200`:**
```json
[
  { "id": "user_id", "username": "john_doe", "email": "john@example.com" }
]
```

---

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/channels/:channelId/messages` | Send a message to a channel |
| `GET` | `/api/channels/:channelId/messages` | Get message history (paginated) |
| `DELETE` | `/api/channels/:channelId/messages/:messageId` | Delete a message (sender only) |

---

#### `POST /api/channels/:channelId/messages` — Send Message

> You must be a **member** of the channel to send messages.

**Request body:**
```json
{
  "content": "Hello everyone!"
}
```

- `content` — required, string, max **2000 characters**

**Response `201`:**
```json
{
  "_id": "message_id",
  "channelId": "channel_id",
  "senderId": "user_id",
  "content": "Hello everyone!",
  "createdAt": "2026-09-09T10:00:00.000Z"
}
```

> Sending a message also **emits a `new_message` WebSocket event** to all users in the channel room automatically. You do NOT need to emit it yourself after calling this endpoint.

---

#### `GET /api/channels/:channelId/messages` — Get Message History

Supports **cursor-based pagination** (not page numbers).

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | `50` | Number of messages to return (max 100) |
| `before` | string | — | Message ID cursor — returns messages older than this ID |

**Example:**
```
GET /api/channels/abc123/messages?limit=20&before=message_id_xyz
```

**Response `200`:**
```json
[
  {
    "_id": "message_id",
    "channelId": "channel_id",
    "senderId": "user_id",
    "content": "Hello!",
    "createdAt": "2026-09-09T10:00:00.000Z"
  }
]
```

**How to implement infinite scroll / load more:**
1. Load initial messages: `GET /messages?limit=50`
2. When user scrolls up, take the oldest message `_id` in the list
3. Fetch older: `GET /messages?limit=50&before=<oldest_message_id>`

---

#### `DELETE /api/channels/:channelId/messages/:messageId` — Delete Message

> Only the **original sender** can delete their message.

**Response `200`:**
```json
{ "message": "Message deleted successfully" }
```

> Also emits a `message_deleted` WebSocket event to all users in the channel room.

---

## 🔌 WebSocket Gateway

**Namespace:** `/chat`
**URL:** `ws://localhost:3000/chat`

Connect using the [Socket.IO](https://socket.io/docs/v4/client-api/) client library — **not** plain WebSocket.

```bash
npm install socket.io-client
```

---

### Connection Example

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: { token: 'your_jwt_token_here' }
});

socket.on('connected', (data) => {
  console.log(data.message); // "Successfully connected to Hurdle chat"
});

socket.on('error', (err) => {
  console.error(err.message); // e.g. "Invalid or expired token"
});
```

---

### Events You **Emit** (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `join_channel` | `{ channelId: string }` | Join a channel room to receive live messages |
| `leave_channel` | `{ channelId: string }` | Leave a channel room |
| `typing_start` | `{ channelId: string }` | Notify others you are typing |
| `typing_stop` | `{ channelId: string }` | Notify others you stopped typing |

**Example:**
```js
// Join a channel room (do this before expecting to receive messages)
socket.emit('join_channel', { channelId: 'abc123' });

// Typing indicators
socket.emit('typing_start', { channelId: 'abc123' });
socket.emit('typing_stop', { channelId: 'abc123' });
```

---

### Events You **Listen For** (Server → Client)

| Event | Payload | When it fires |
|-------|---------|---------------|
| `connected` | `{ message: string }` | On successful connection |
| `joined_channel` | `{ channelId, message }` | After you emit `join_channel` |
| `left_channel` | `{ channelId }` | After you emit `leave_channel` |
| `new_message` | Message object | A new message was sent in a channel you joined |
| `message_deleted` | `{ messageId, channelId }` | A message was deleted in a channel you joined |
| `user_joined` | `{ channelId, user: { id, username } }` | Another user joined your channel room |
| `user_left` | `{ channelId, user: { id, username } }` | Another user left your channel room |
| `user_typing` | `{ channelId, user: { id, username } }` | Another user started typing |
| `user_stopped_typing` | `{ channelId, user: { id, username } }` | Another user stopped typing |
| `error` | `{ message: string }` | Auth failure or bad event payload |

**Full listener setup example:**
```js
socket.on('new_message', (message) => {
  // Append message to chat UI
  console.log(`${message.senderId}: ${message.content}`);
});

socket.on('message_deleted', ({ messageId }) => {
  // Remove the message with this ID from UI
});

socket.on('user_typing', ({ user }) => {
  // Show "username is typing..." indicator
  console.log(`${user.username} is typing...`);
});

socket.on('user_stopped_typing', ({ user }) => {
  // Hide typing indicator for this user
});

socket.on('user_joined', ({ user }) => {
  console.log(`${user.username} joined the channel`);
});

socket.on('user_left', ({ user }) => {
  console.log(`${user.username} left the channel`);
});
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the backend project:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hurdle
JWT_SECRET=your_super_secret_key_here
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server runs on (default: `3000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing and verifying JWTs |

---

## 🛠️ Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file (see Environment Variables above)

# 3. Start in dev/watch mode
npm run start:dev
```

Server will be available at: `http://localhost:3000/api`

---

## 📝 Key Notes for Frontend Devs

- **Every REST endpoint requires** `Authorization: Bearer <token>` header
- **Use cursor-based pagination** with the `before` query param — not page numbers
- **WebSocket namespace is `/chat`** — connect to `ws://localhost:3000/chat`, not the root
- **REST send → auto WebSocket emit**: When a message is sent via `POST /messages`, the server automatically emits `new_message` to all WebSocket clients in that channel — no need to duplicate with a socket emit from the frontend
- **Same for delete**: `DELETE /messages/:id` automatically fires `message_deleted` to the channel room