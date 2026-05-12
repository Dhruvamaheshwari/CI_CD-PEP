<!-- @format -->

# Chat App (pep-devops-rev)

A comprehensive real-time chat application built using the MERN stack (MongoDB, Express.js, React, Node.js) architecture with Socket.IO for real-time bidirectional event-based communication. The frontend is powered by Vite for fast bundling and Tailwind CSS for utility-first styling.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery across chat rooms using WebSockets (Socket.IO).
- **Room Management**: Join various chat rooms, with automatic real-time updates when new rooms are created.
- **Message & User Management**: Delete messages, clear rooms, and remove users.
- **Modern Frontend**: Built with React 19, Vite, and Tailwind CSS 4 for a fast, highly responsive, and beautiful user interface.
- **API Endpoints**: RESTful API built with Express 5 to retrieve chat history, fetch active rooms, and handle entity deletions.
- **Database Integration**: Data modeling and storage facilitated by Mongoose for MongoDB.

## 🛠️ Technologies Used

### Backend

- **Node.js**: JavaScript runtime environment.
- **Express.js (v5)**: Web application framework for seamless API routing.
- **Socket.IO**: Enables real-time, bidirectional communication between web clients and the server.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **Jest & Supertest**: Used for comprehensive backend test suites.

### Frontend

- **React 19**: A JavaScript library for building user interfaces.
- **Vite 8**: A lightning-fast frontend tooling and build runner.
- **Tailwind CSS 4**: A utility-first CSS framework for rapid UI development.
- **Axios**: Promise-based HTTP client for making API requests.
- **Lucide React**: Beautiful & consistent iconography.
- **Socket.IO-Client**: Frontend client for real-time WebSocket connection to the server.

## 📁 Project Structure Explained

```text
chat-app/
├── index.js                  # Application entry point: Express server and Socket.IO initialization.
├── package.json              # Backend dependencies and scripts.
├── README.md                 # Project documentation.
├── Dockerfile                # Docker configuration for containerization.
├── depoy.py                 # Deployment script (Python).
├── write-frontend.js         # Script to interact with/build frontend assets.
│
├── controllers/              # Handles incoming HTTP requests and executes business logic.
│   ├── productController.js  # Controller for product-related operations.
│   └── todoController.js     # Controller for todo-related operations.
│
├── models/                   # Defines Mongoose schemas for MongoDB collections.
│   ├── chatModel.js          # Chat and Message models.
│   └── todoModel.js          # Todo tasks model.
│
├── routes/                   # Defines Express API endpoints routing.
│   └── todoRoutes.js         # Routes mapping for Todo operations.
│
├── test/                     # Backend test suites.
│   ├── app.test.js           # Integration tests for the main application.
│   └── product.test.js       # Unit/Integration tests for products logic.
│
└── frontend/                 # Self-contained React application.
    ├── index.html            # Main HTML template.
    ├── package.json          # Frontend dependencies.
    ├── vite.config.js        # Vite bundler configuration.
    ├── tailwind.config.js    # Tailwind CSS design system configuration.
    ├── eslint.config.js      # Code linting rules.
    └── src/                  # React source code.
        ├── main.jsx          # React app mounting point.
        ├── App.jsx           # Main Application component & layouts.
        ├── App.css           # Global application styles.
        └── index.css         # Tailwind directives and base styles.
```

## 📋 Prerequisites

Before starting, ensure you have the following installed on your local machine:

- Node.js (v18.0.0 or higher recommended)
- npm (Node Package Manager) or yarn
- MongoDB (Running locally or a MongoDB Atlas URI if specified in environment variables)

## 🏁 Getting Started

### 1. Backend Setup

From the root directory, install the backend dependencies:

```bash
npm install
```

Start the backend development server (uses `nodemon` for auto-restarts upon file changes):

```bash
npm run start
```

_(The server runs on `http://localhost:5000` by default)_

### 2. Frontend Setup

Open a new terminal, navigate to the `frontend` directory, and install the required dependencies:

```bash
cd frontend
npm install
```

Start the Vite development server (usually runs on `http://localhost:5173`):

```bash
npm run dev
```

### 3. Production Build

To serve the frontend static files directly through the Express backend, you must build the React app first:

```bash
cd frontend
npm run build
```

Once built, the production bundle translates into the `frontend/dist` directory. The Node.js Express server is configured to serve these static bundles out of the box whenever it's run via `node index.js`.

## 🧪 Testing

The backend is thoroughly tested using **Jest**. To run the tests, execute the following command from the root directory:

```bash
npm test
```

This command runs tests present in the `test/` directory, validating the APIs and socket events configuration.

## 🐳 Docker Support (Optional)

The project includes a `Dockerfile` for containerization. You can build and run the application as a Docker container, making it entirely platform-independent.

Build the image:

```bash
docker build -t chat-app .
```

Run the container:

```bash
docker run -p 5000:5000 chat-app
```

## 📜 License

This project is licensed under the **ISC License**.
