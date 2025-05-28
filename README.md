# My Project Monorepo

This project is a monorepo containing a backend Express application and a frontend React application.

## Project Structure

- `my-project/` (Root directory)
  - `backend/`        # Node.js Express application
  - `frontend/`       # React application
  - `package.json`    # Root package.json for managing both apps
  - `README.md`       # This file

## Getting Started

### Prerequisites

- Node.js (v18.x or later recommended)
- npm (comes with Node.js)
- MongoDB (for the backend application)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory-name>
    ```
2.  **Install all dependencies:**
    This command will install dependencies for the root, backend, and frontend applications using the `postinstall` script in the root `package.json`.
    ```bash
    npm install
    ```
3.  **Backend Configuration (.env):**
    The backend application requires a `.env` file for configuration (e.g., database connection URI, JWT secret).
    - Navigate to the `backend` directory: `cd backend`
    - Create a `.env` file by copying the example if one exists, or create it manually.
    - It should contain variables like:
      ```env
      MONGO_URI="your_mongodb_connection_string"
      JWT_SECRET="your_very_strong_and_secret_jwt_key"
      PORT=5001 # Or your preferred port for the backend
      ```
    - Replace placeholder values with your actual configuration.
    - Return to the root directory: `cd ..`

### Running the Applications

**To run both backend and frontend concurrently (recommended for development):**

From the root directory:
```bash
npm run dev
```
This command uses `concurrently` to start:
- The backend development server (e.g., on `http://localhost:5001` as per your backend's `.env` or `server.js`).
- The frontend React development server (usually on `http://localhost:3000`).

**To run the applications individually:**

From the root directory:

-   **Backend:**
    ```bash
    npm run dev:backend
    ```
    This script typically runs the backend server in development mode (e.g., using `nodemon`).
    To run the backend's start script (e.g., for production builds, if configured):
    ```bash
    npm run start:backend
    ```
    The backend's `package.json` is located at `backend/package.json`.

-   **Frontend:**
    ```bash
    npm run dev:frontend
    ```
    This script starts the React development server. The frontend's `package.json` is located at `frontend/package.json`.

## Available Scripts (Root `package.json`)

The root `package.json` provides the following main scripts:

-   `npm install`: Installs dependencies for the root project and triggers `postinstall` which installs dependencies for both `backend/` and `frontend/`.
-   `npm run dev`: Starts both backend and frontend development servers concurrently. Ideal for active development.
-   `npm run dev:backend`: Starts only the backend development server.
-   `npm run dev:frontend`: Starts only the frontend development server (React dev server).
-   `npm run start:backend`: Runs the `start` script defined in `backend/package.json` (often used for running production builds).
-   `npm start`: An alias for `npm run start:backend`.

### Utility Scripts (Root `package.json`)

-   `npm run install:backend`: Installs dependencies for the `backend/` application only.
-   `npm run install:frontend`: Installs dependencies for the `frontend/` application only.

(Note: The `postinstall` script in the root `package.json` automatically runs `install:backend` and `install:frontend` after the root `npm install` completes.)

## API Endpoints

For details on the backend API endpoints, please refer to the documentation or `README.md` potentially located within the `backend/` directory. The original API included features for:
*   User registration and login (JWT authentication)
*   CRUD operations for Songs

This section can be expanded or moved to `backend/README.md` as appropriate.
