# Chat App (pep-devops-rev)

A real-time chat application built with a Node.js/Express backend (using Socket.IO for real-time communication) and a React frontend (powered by Vite and Tailwind CSS).

## Features

- **Real-time Messaging**: Instant message delivery across chat rooms using Socket.IO.
- **Room Management**: Join various chat rooms, with automatic real-time updates when new rooms are created.
- **Message & User Management**: Delete messages, clear rooms, and remove users.
- **Modern Frontend**: Built with React, Vite, and Tailwind CSS for a fast, responsive user interface.
- **API Endpoints**: RESTful API to retrieve chat history, fetch active rooms, and handle deletions.

## Project Structure

- `index.js` - Main Express server and Socket.IO initialization.
- `models/` - Data models (e.g., `chatModel.js` for handling chat data).
- `controllers/` & `routes/` - Controllers and API route definitions.
- `frontend/` - React frontend application code built with Vite.
- `test/` - Jest test suites for backend logic.

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

## Getting Started

### 1. Backend Setup

From the root directory, install the backend dependencies:

```bash
npm install
```

Start the backend development server:

```bash
npm run start
```
*(The server runs on `http://localhost:5000` by default)*

### 2. Frontend Setup

Navigate to the `frontend` directory and install the frontend dependencies:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

### 3. Production Build

To serve the frontend through the Express backend, build the React app:

```bash
cd frontend
npm run build
```
Once built, the production bundle in `frontend/dist` will be served by the Node server whenever it runs.

## Testing

Run the test suite using Jest:

```bash
npm test
```

## License

ISC
