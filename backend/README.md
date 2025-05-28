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
