# Huddle Frontend

Huddle is a lightweight collaboration and team messaging workspace built for the Agile Practicum demo sprint. This repository contains the frontend implementation of the Huddle workspace experience, developed from the provided Figma design.

The goal of this frontend is to support the core sprint user journey:

```text
Create Account → Sign In → Enter Workspace → Browse/Join Channels → Send Messages
```

## Project Overview

Huddle is designed as a simple team communication platform for small remote teams. For this sprint, the frontend focuses on authentication screens, workspace states, channel discovery, channel creation, and channel messaging.

The project currently uses mock data so the interface and user flows can be tested before backend API integration.

## My Contribution

As the Frontend Engineer, I implemented the user-facing Huddle interface from the Figma design.

My contribution includes:

- Setting up the React frontend with Vite
- Building the start, create account, and sign in screens
- Implementing form validation states
- Creating success, loading, and error UI states
- Building the workspace layout
- Implementing channel navigation
- Building the channel directory
- Creating the channel creation modal
- Handling duplicate channel error states
- Building the chat interface
- Implementing message sending, failed message, retry, and sending states
- Adding message composer actions such as file selection, emoji picker, and @ mention input
- Making the design responsive for mobile screens
- Adding mobile bottom navigation
- Adding a mobile aside/menu screen
- Adding sign-out confirmation behavior
- Preparing the project for backend API integration

## Features Implemented

### Authentication

- Start screen
- Create account page
- Create account loading state
- Create account validation error state
- Duplicate email/account conflict state
- Account created successfully screen
- Sign in page
- Sign in loading state
- Sign in error state
- Signed in successfully screen

### Workspace

- Workspace home screen
- No channels joined state
- Channels available but none selected state
- No channel selected state
- Desktop sidebar navigation
- Mobile bottom navigation
- Mobile aside/menu screen
- User profile area
- Sign-out confirmation modal

### Channels

- Channel directory
- Channel list
- Join channel action
- Open joined channel action
- Create channel modal
- Duplicate channel name error state
- Empty channel state

### Messaging

- Channel chat screen
- Message list
- Message composer
- Send message action
- Message sending state
- Message sent state
- Message failed state
- Retry failed message action
- File selection button
- Emoji picker
- @ mention button

### Responsive Design

- Desktop workspace layout
- Mobile authentication screens
- Mobile workspace screens
- Mobile channel directory
- Mobile empty channel screen
- Mobile chat screen
- Mobile create channel modal
- Mobile sign-out modal

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Lucide React icons

## Project Structure

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

## Mock Data

The application currently uses mock data for channels, messages, and authentication behavior.

Mock data is stored in:

```text
src/data/mockData.js
```

This makes it possible to test the frontend flow before backend APIs are connected.

## Mock Login Details

The current frontend uses mock login behavior.

Example login:

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

Open the local URL shown in the terminal.

Usually, Vite runs on:

```text
http://localhost:5173
```

## Available Scripts

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Backend Integration Notes

The frontend is ready to be connected to backend APIs.

The mock data should later be replaced with real API calls for:

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

## Testing Checklist

Before submission, test the following:

### Authentication

- Start screen opens first
- Create Account button opens the create account page
- Sign In button opens the sign in page
- Empty create account form shows validation errors
- Valid create account fields show success ticks
- Create account loading state appears
- Account success screen appears
- Sign in error state appears for invalid input
- Sign in loading state appears
- Sign in success screen appears
- Continue to workspace button works

### Workspace

- Workspace home screen appears after login
- Recommended channels are visible
- Browse Channel Directory button works
- Create New Channel button opens the modal
- Sidebar displays correctly on desktop
- Bottom navigation displays on mobile
- Mobile aside/menu opens correctly

### Channels

- Channel directory displays available channels
- Join button updates the channel state
- Joined channel can be opened
- No channel selected screen appears when appropriate
- Empty channel screen appears for a channel without messages
- Create channel modal opens
- Duplicate channel name shows an error

### Messaging

- General channel messages display
- New message sends successfully
- Message sending state appears
- Message failed state appears
- Retry action changes failed message to sending and then sent
- Emoji picker opens
- Selected emoji appears in the input
- @ mention button inserts @
- File selection opens file picker
- Selected file appears before sending

### Responsive Design

- Auth screens work on mobile
- Workspace home works on mobile
- Channel directory works on mobile
- Empty channel works on mobile
- Chat screen works on mobile
- Create channel modal works on mobile
- Sign-out confirmation works on mobile

## Current Status

The Huddle frontend MVP is complete using mock data. The UI has been implemented from the Figma design across desktop and mobile states.

The next major step is backend API integration so authentication, channel actions, messages, and file uploads can persist beyond the frontend mock state.