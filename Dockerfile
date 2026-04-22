# Stage 1: Build the React Application
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Express Node.js Backend
FROM node:22-alpine
WORKDIR /app

# Copy backend dependencies and install
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY . .

# Copy built React app from the frontend-build stage
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 5000
CMD ["node", "index.js"]
