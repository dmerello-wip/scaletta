# Secure Authentication System Documentation

## 1. Overview

This document outlines the secure authentication system implemented in the application. The system has transitioned from a localStorage-based token management approach to a more secure server-based authentication mechanism utilizing **httpOnly cookies** for session management and **CSRF (Cross-Site Request Forgery) protection** for state-changing operations.

## 2. Authentication Flow

The authentication flow is designed to be robust and secure, leveraging httpOnly cookies and CSRF tokens.

*   **Login:**
    1.  User submits credentials (username/password) via the frontend.
    2.  Frontend makes a `POST` request to `/api/auth/login`.
    3.  Server validates credentials:
        *   If valid, it generates a JSON Web Token (JWT) and sets it in an httpOnly cookie named `token`.
        *   It also sets an httpOnly cookie named `_csrf-secret` containing the secret for CSRF token validation.
        *   Server returns a success response with user information (e.g., `{ id, username }`).
    4.  Frontend's `AuthContext` updates its state (`isAuthenticated = true`, `currentUser = user_info`, `isLoading = false`).

*   **Logout:**
    1.  User clicks the "Logout" button.
    2.  Frontend makes a `POST` request to `/api/auth/logout`. This request includes an `X-CSRF-Token` header.
    3.  Server validates the CSRF token and the session cookie (`token`).
    4.  Server clears the `token` cookie (by setting it to an empty value with an expired date). The `_csrf-secret` cookie may remain but will be ignored once the `token` is gone, or a new CSRF token process will start on next login.
    5.  Frontend's `AuthContext` updates its state (`isAuthenticated = false`, `currentUser = null`).

*   **Authenticated Requests:**
    1.  For any request to protected backend endpoints, the browser automatically sends the `token` (and `_csrf-secret`) cookies along with the request due to the `credentials: 'include'` option in frontend `fetch` calls.
    2.  For **state-changing requests** (e.g., POST, PUT, DELETE, PATCH), the frontend must also include the `X-CSRF-Token` header, containing the CSRF token previously fetched from `/api/csrf-token`.
    3.  The server validates both the JWT in the `token` cookie (via `authMiddleware.js`) and the `X-CSRF-Token` header against the `_csrf-secret` cookie (via `csurf` middleware).

*   **Session Check (`checkAuthStatus`):**
    1.  On application load, or potentially on route changes, the frontend calls the `checkAuthStatus()` function.
    2.  This function makes a `GET` request to `/api/auth/status`.
    3.  Server validates the JWT from the `token` cookie.
    4.  Server responds with the authentication status and user information (e.g., `{ isAuthenticated: true, user: { id, username } }` or `{ isAuthenticated: false, user: null }`).
    5.  Frontend's `AuthContext` updates its state accordingly.

## 3. Cookie Details

Two main httpOnly cookies are used:

*   **`token`**:
    *   **HttpOnly**: Yes (not accessible via JavaScript).
    *   **Secure**: Yes (sent only over HTTPS in production, controlled by `NODE_ENV=production`).
    *   **SameSite**: `Strict` (prevents the cookie from being sent on cross-site requests, enhancing CSRF protection).
    *   **Purpose**: Stores the JWT used for managing the user's session.
    *   **Path**: `/` (typically).
    *   **MaxAge/Expires**: Set to a reasonable session duration (e.g., 1 hour, extended on activity if implemented).

*   **`_csrf-secret`**:
    *   **HttpOnly**: Yes.
    *   **Secure**: Yes (in production).
    *   **SameSite**: `Strict`.
    *   **Purpose**: Stores the secret string used by the `csurf` middleware to generate and validate CSRF tokens.
    *   **Path**: `/` (typically).

## 4. Frontend Implementation (`AuthContext.tsx`)

The `frontend/src/contexts/AuthContext.tsx` is the central piece for managing authentication state and logic on the client-side.

*   **State Management:**
    *   `isAuthenticated: boolean`: True if the user is logged in, false otherwise.
    *   `currentUser: User | null`: Stores the logged-in user's information (`{ id, username }`) or `null`.
    *   `isLoading: boolean`: Indicates if an authentication-related asynchronous operation (like initial auth check or CSRF token fetching) is in progress.
*   **Core Functions:**
    *   `login(credentials)`: Handles the login API call.
    *   `logout()`: Handles the logout API call.
    *   `checkAuthStatus()`: Checks the current session status with the backend.
    *   `fetchCsrfToken()` (internal): Fetches the CSRF token from `/api/csrf-token`.
*   **Fetch Configuration:** All `fetch` requests to the backend API use the `credentials: 'include'` option to ensure cookies are automatically sent and received.
*   **CSRF Token Handling:**
    1.  On initialization, `AuthContext` calls `fetchCsrfToken()` to get a CSRF token from `/api/csrf-token`.
    2.  This token is stored internally within the context.
    3.  For `login()` and `logout()` functions (and would be for any other state-changing API calls originating from or using the context's logic), the stored CSRF token is included in the `X-CSRF-Token` header.
    4.  New CSRF tokens are typically fetched after login and logout to ensure token validity.

## 5. Backend API Endpoints

The following backend API endpoints are crucial for the authentication system:

*   **`POST /api/auth/register`**
    *   **Description**: Registers a new user.
    *   **Protection**: Typically does not require CSRF protection as it doesn't operate on an existing session.
*   **`POST /api/auth/login`**
    *   **Description**: Logs in an existing user.
    *   **Actions**: Validates credentials, sets `token` and `_csrf-secret` cookies on successful authentication.
    *   **Protection**: Protected by `csurf` (as it's a POST request and `csurf` is global).
*   **`POST /api/auth/logout`**
    *   **Description**: Logs out the currently authenticated user.
    *   **Actions**: Clears the `token` cookie.
    *   **Protection**: Requires a valid `X-CSRF-Token` header and session cookies.
*   **`GET /api/auth/status`**
    *   **Description**: Checks if the current user (identified by the `token` cookie) is authenticated. Returns user info if authenticated.
    *   **Protection**: Does not require CSRF protection (it's a GET request). Relies on the `token` cookie.
*   **`GET /api/csrf-token`**
    *   **Description**: Provides a CSRF token to the frontend.
    *   **Actions**: Generates a CSRF token using `csurf` middleware and ensures the `_csrf-secret` cookie is set.
    *   **Protection**: This route itself is what generates the token, so it's part of the CSRF mechanism.

## 6. CSRF Protection

The system uses the **Double Submit Cookie** pattern for CSRF protection, facilitated by the `csurf` library on the backend.

1.  **Token Generation**: The server generates a CSRF token and a corresponding secret stored in the `_csrf-secret` httpOnly cookie. The token itself is provided to the frontend via the `/api/csrf-token` endpoint.
2.  **Token Submission**: The frontend client includes this CSRF token in a custom HTTP header (`X-CSRF-Token`) for all state-changing requests (e.g., POST, PUT, DELETE).
3.  **Token Validation**: On receiving a state-changing request, the server validates the token from the `X-CSRF-Token` header by comparing it against the secret stored in the `_csrf-secret` cookie. If they don't match or the token/secret is missing, the request is rejected (typically with a 403 Forbidden error).

This ensures that only requests originating from the legitimate frontend (which has access to the CSRF token via the dedicated endpoint) can successfully execute state-changing operations.

## 7. Security Benefits

This authentication system provides several key security benefits:

*   **XSS Mitigation for Tokens**: Since the session token (`token`) and CSRF secret (`_csrf-secret`) are `httpOnly`, they cannot be accessed by client-side JavaScript. This significantly reduces the risk of token theft via Cross-Site Scripting (XSS) attacks.
*   **Centralized Session Management**: Session state is primarily managed on the server, tied to the httpOnly session cookie.
*   **CSRF Protection**: The double submit cookie pattern effectively protects against CSRF attacks, ensuring that state-changing requests are legitimately initiated by the user's application instance.
*   **Reduced Attack Surface**: By not storing tokens in `localStorage`, we avoid vulnerabilities associated with scripts accessing stored tokens.

## 8. Key Environment Variables

Ensure these environment variables are correctly configured:

*   **Frontend (`.env` file, typically):**
    *   `VITE_API_BASE_URL`: The base URL for all backend API calls (e.g., `http://localhost:3001`).
*   **Backend (`.env` file, typically):**
    *   `MONGO_URI`: MongoDB connection string.
    *   `FRONTEND_URL`: The URL of the frontend application, used for CORS configuration.
    *   `JWT_SECRET`: A strong, unique secret key used for signing and verifying JSON Web Tokens. **This must be kept confidential.**
    *   `PORT`: The port on which the backend server will run (e.g., `3001`).
    *   `NODE_ENV`: Set to `development` or `production`. This affects cookie security settings (e.g., the `Secure` attribute is typically only set if `NODE_ENV=production`).

This documentation provides a comprehensive guide to the secure authentication system. Developers should adhere to these patterns to maintain the security and integrity of user sessions.
