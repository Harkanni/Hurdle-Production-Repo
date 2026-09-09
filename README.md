# Huddle

Huddle is a lightweight collaboration and team messaging workspace built for the Agile Practicum demo sprint. The project is developed by a cross-functional team covering **Frontend**, **Backend**, and **Infrastructure/DevOps**, working from a shared Figma design and sprint plan.

The goal of the product is to support the core user journey:

```text
Create Account → Sign In → Enter Workspace → Browse/Join Channels → Send Messages
```

## Project Overview

Huddle is designed as a simple team communication platform for small remote teams. The sprint scope spans three tracks:

- **Frontend** — authentication screens, workspace states, channel discovery, channel creation, and channel messaging UI.
- **Backend** — API design and implementation for auth, channels, and messaging, backing the frontend once mock data is retired.
- **Infrastructure/DevOps** — environment setup, deployment pipeline, hosting, and CI/CD so the app can run reliably beyond local development.

The frontend currently runs on mock data so flows can be tested ahead of full backend and infra integration.

## Team Structure & Contributions

### Frontend

Responsible for implementing the user-facing Huddle interface from the Figma design.

- Set up the React frontend with Vite
- Built the start, create account, and sign in screens
- Implemented form validation states
- Created success, loading, and error UI states
- Built the workspace layout and channel navigation
- Built the channel directory and channel creation modal
- Handled duplicate channel error states
- Built the chat interface (message list, composer, sending/failed/retry states)
- Added message composer actions: file selection, emoji picker, @ mention input
- Made the design responsive for mobile, including bottom navigation and an aside/menu screen
- Added sign-out confirmation behavior
- Prepared the project for backend API integration

### Backend

Responsible for the services and data the frontend consumes.

- Defines and implements the API endpoints for register, login, channels, and messages
- Owns request/response contracts, error formats, and auth token handling
- Designs the channel and message data models
- Implements file upload handling
- Coordinates with frontend on integration once mock data is replaced

### Infrastructure / DevOps

Responsible for how the application is built, deployed, and run.

- Sets up hosting and deployment environments (staging/production)
- Configures CI/CD pipelines for build, test, and deploy
- Manages environment variables, secrets, and configuration across environments
- Sets up monitoring/logging as the app moves past the mock-data stage
- Supports the team with local dev environment consistency

## Features Implemented (Frontend)

### Authentication

- Start screen
- Create account page, loading, and validation error states
- Duplicate email/account conflict state
- Account created successfully screen
- Sign in page, loading, and error states
- Signed in successfully screen

### Workspace

- Workspace home screen
- No channels joined / none selected states
- Desktop sidebar navigation
- Mobile bottom navigation and aside/menu screen
- User profile area
- Sign-out confirmation modal

### Channels

- Channel directory and list
- Join channel / open joined channel actions
- Create channel modal with duplicate name error state
- Empty channel state

### Messaging

- Channel chat screen with message list and composer
- Message sending, sent, and failed states with retry
- File selection button, emoji picker, @ mention button

### Responsive Design

- Full mobile coverage across auth, workspace, channel directory, chat, and modals

## Tech Stack

**Frontend:** React, Vite, JavaScript, CSS, Lucide React icons
**Backend:** *(to be confirmed by backend team)*
**Infra:** *(to be confirmed by infra team — hosting, CI/CD tooling, etc.)*

## Project Structure (Frontend)

```text
src/
├── components/
│   ├── CreateChannelModal.jsx
│   ├── Input.jsx
│   ├── Logo.jsx
│   ├── MessageItem.jsx
│   └── Sidebar.jsx
│
├── data/
│   └── mockData.js
│
├── pages/
│   ├── ChannelDirectory.jsx
│   ├── ChannelView.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Start.jsx
│   └── Workspace.jsx
│
├── App.jsx
├── index.css
└── main.jsx
```

## Mock Data (Frontend, Pre-Integration)

The frontend currently uses mock data for channels, messages, and authentication behavior, stored in `src/data/mockData.js`. This lets the frontend flow be tested before backend APIs are connected.

**Mock login:**

```text
Email: mike@example.com
Password: password123
```

## How To Run The Project Locally

Clone the repository:

```bash
git clone <repository-url>
```

Move into the project folder:

```bash
cd huddle-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

### Available Scripts

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build
```

*Backend and infra setup instructions should be added here by their respective teams once those repos/services are finalized.*

## Frontend–Backend Integration Notes

The frontend is ready to be connected to backend APIs. Mock data should be replaced with real API calls for:

- Register user
- Sign in user
- Get channels
- Join channel
- Create channel
- Get channel messages
- Send message
- Upload file

Suggested endpoints to confirm with the backend team:

```text
POST /api/register
POST /api/login
GET /api/channels
POST /api/channels
POST /api/channels/:id/join
GET /api/channels/:id/messages
POST /api/channels/:id/messages
POST /api/uploads
```

The backend team should provide:

- Request body format
- Success response format
- Error response format
- Authentication token format
- Channel object structure
- Message object structure
- File upload requirements

The infra team should provide:

- Deployment/environment URLs (staging, production)
- Required environment variables per environment
- CI/CD pipeline status and how to trigger deploys

## Testing Checklist

### Authentication

- Start screen opens first
- Create Account button opens the create account page
- Empty create account form shows validation errors
- Valid create account fields show success ticks
- Create account loading and success states appear
- Sign in error, loading, and success states appear
- Continue to workspace button works

### Workspace

- Workspace home screen appears after login
- Recommended channels are visible
- Browse Channel Directory / Create New Channel buttons work
- Sidebar displays correctly on desktop; bottom nav on mobile
- Mobile aside/menu opens correctly

### Channels

- Channel directory displays available channels
- Join button updates channel state
- Joined channel can be opened
- No channel selected / empty channel states appear when appropriate
- Create channel modal opens; duplicate name shows an error

### Messaging

- General channel messages display
- New message sends successfully; sending/failed states appear
- Retry action moves a failed message to sending, then sent
- Emoji picker opens and inserts emoji
- @ mention button inserts @
- File selection opens file picker and shows selected file before sending

### Responsive Design

- Auth, workspace, channel directory, chat, create-channel, and sign-out modal all work on mobile

## Current Status

- **Frontend:** MVP complete using mock data, implemented from the Figma design across desktop and mobile states.
- **Backend:** *(status to be filled in by backend team — e.g. endpoints in progress, data models drafted, etc.)*
- **Infra:** *(status to be filled in by infra team — e.g. staging environment live, CI/CD pipeline set up, etc.)*

The next major milestone is full integration: connecting the frontend to live backend APIs deployed through the infra pipeline, so authentication, channel actions, messages, and file uploads persist beyond the frontend mock state.