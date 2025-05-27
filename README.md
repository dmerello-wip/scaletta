# Songs and Users API

## Description
A Node.js Express application for managing songs and user authentication via a RESTful API.

## Features
*   User registration and login (JWT authentication)
*   CRUD operations for Songs (Create, Read, Update, Delete)
*   Protected song routes

## Project Structure
*   `models/`: Contains Mongoose schemas for database models (User, Song).
*   `routes/`: Defines API routes for different resources (authentication, songs).
*   `controllers/`: Implements the logic for handling requests and interacting with models.
*   `middleware/`: Contains custom middleware, such as the authentication middleware.
*   `server.js`: The main entry point for the application, sets up the server and database connection.
*   `.env`: Stores environment variables (not committed to Git).

## Prerequisites
*   Node.js and npm (Node Package Manager)
*   MongoDB (a local instance or a cloud-hosted one like MongoDB Atlas)

## Setup and Installation
1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd <project-directory>
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Create a `.env` file** in the root directory. You will need to create this file manually.
    It should contain the following variables:
    ```env
    MONGO_URI="your_mongodb_connection_string"
    JWT_SECRET="your_very_strong_and_secret_jwt_key"
    PORT=5000
    ```
5.  **Update the `.env` file:**
    *   Replace `"your_mongodb_connection_string"` with your actual MongoDB connection URI.
    *   Replace `"your_very_strong_and_secret_jwt_key"` with a long, random, and strong string for JWT signing.
    *   You can change `PORT` if needed, otherwise it defaults to 5000.

## Running the Application
1.  **Start the server:**
    ```bash
    npm start
    ```
    (This assumes you have a `start` script in your `package.json` like `"start": "node server.js"`.)

2.  The server will typically start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication (`/api/auth`)
*   **`POST /api/auth/register`**
    *   Description: Register a new user.
    *   Access: Public
    *   Request Body:
        ```json
        {
          "username": "testuser",
          "password": "password123"
        }
        ```
    *   Response: `201 Created` with a success message.

*   **`POST /api/auth/login`**
    *   Description: Login an existing user.
    *   Access: Public
    *   Request Body:
        ```json
        {
          "username": "testuser",
          "password": "password123"
        }
        ```
    *   Response: `200 OK` with a JWT token.
        ```json
        {
          "token": "your_jwt_token_here"
        }
        ```

### Songs (`/api/songs`)
*All song routes require a Bearer Token in the `Authorization` header for authentication (e.g., `Authorization: Bearer your_jwt_token_here`).*

*   **`POST /api/songs`**
    *   Description: Create a new song.
    *   Access: Private
    *   Request Body:
        ```json
        {
          "title": "Song Title",
          "author": "Author Name",
          "words": "HTML or plain text lyrics",
          "category": "Pop",
          "typology": "Ballad",
          "tone": "Major"
        }
        ```
    *   Response: `201 Created` with the newly created song object.

*   **`GET /api/songs`**
    *   Description: Get all songs.
    *   Access: Private
    *   Response: `200 OK` with an array of song objects.

*   **`GET /api/songs/:id`**
    *   Description: Get a specific song by its ID.
    *   Access: Private
    *   Response: `200 OK` with the song object, or `404 Not Found`.

*   **`PUT /api/songs/:id`**
    *   Description: Update a specific song by its ID.
    *   Access: Private
    *   Request Body: (Include fields to update)
        ```json
        {
          "title": "Updated Song Title",
          "category": "Rock"
        }
        ```
    *   Response: `200 OK` with the updated song object, or `404 Not Found`.

*   **`DELETE /api/songs/:id`**
    *   Description: Delete a specific song by its ID.
    *   Access: Private
    *   Response: `200 OK` with a success message, or `404 Not Found`.

## Error Handling
The API returns standard HTTP status codes to indicate the success or failure of a request. Error responses are in JSON format and typically include a `msg` field with details about the error. For example:
*   `400 Bad Request`: For validation errors or malformed requests.
*   `401 Unauthorized`: For missing or invalid authentication tokens.
*   `404 Not Found`: When a requested resource does not exist.
*   `500 Internal Server Error`: For unexpected server-side issues.
