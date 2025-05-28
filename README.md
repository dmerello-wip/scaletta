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
      PORT=3001 # Or your preferred port for the backend
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
