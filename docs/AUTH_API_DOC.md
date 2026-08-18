# SmartScore Authentication API Documentation

## Overview

The SmartScore Authentication system uses JWT (JSON Web Tokens) for authentication. It features:
- Short-lived **Access Tokens** for authorizing API requests.
- Long-lived **Refresh Tokens** stored securely with rotation and revocation capabilities.
- **Role-based Access Control (RBAC)** supporting 5 user roles (`STUDENT`, `TEACHER`, `INVIGILATOR`, `INSTITUTION_ADMIN`, `PLATFORM_ADMIN`).

---

## Base URL

```text
http://localhost:<PORT>/api/v1/auth
```

---

## Authentication Header

For authenticated endpoints (e.g. `GET /me`), pass the access token in the `Authorization` header:

```http
Authorization: Bearer <accessToken>
```

---

## Summary of Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/signup` | ❌ No | Register a new user account |
| `POST` | `/login` | ❌ No | Log in with email and password |
| `GET` | `/me` | 🔐 Yes | Retrieve current logged-in user profile |
| `POST` | `/refresh` | ❌ No | Refresh access token & get a new token pair |
| `POST` | `/logout` | ❌ No | Revoke refresh token and log out user |

---

## Endpoint Details

### 1. User Signup (Register)

Registers a new user account and returns user details alongside access and refresh tokens.

- **Method**: `POST`
- **URL**: `/api/v1/auth/signup`
- **Auth Required**: No

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body Schema

| Field | Type | Required | Description / Rules |
| :--- | :--- | :---: | :--- |
| `email` | `string` | **Yes** | Valid email address (automatically trimmed and lowercased). |
| `password` | `string` | **Yes** | User password. Minimum 8 characters. |
| `name` | `string` | No | Full name of the user. |
| `role` | `string` | No | User role. Options: `"STUDENT"`, `"TEACHER"`, `"INVIGILATOR"`, `"INSTITUTION_ADMIN"`, `"PLATFORM_ADMIN"`. Default: `"STUDENT"`. |
| `instituteId` | `string` | No | Optional CUID of the associated institute. Defaults automatically to **AKGEC** (`"Ajay Kumar Garg Engineering College"`). |

#### Example Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "role": "STUDENT"
}
```

#### Responses

##### 🟢 201 Created — Success
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "cm7890abcdef12345",
      "email": "john.doe@example.com",
      "role": "STUDENT",
      "status": "ACTIVE",
      "instituteId": "cm_akgec_institute_id"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### 🔴 400 Bad Request — Validation Error
```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": {
    "fieldErrors": {
      "email": ["Invalid email address"],
      "password": ["Password must be at least 8 characters"]
    },
    "formErrors": []
  }
}
```

##### 🔴 409 Conflict — Duplicate Email
```json
{
  "success": false,
  "message": "Email is already registered"
}
```

##### 🔴 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

### 2. User Login

Authenticates credentials and returns access & refresh tokens.

- **Method**: `POST`
- **URL**: `/api/v1/auth/login`
- **Auth Required**: No

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body Schema

| Field | Type | Required | Description / Rules |
| :--- | :--- | :---: | :--- |
| `email` | `string` | **Yes** | Registered email address (trimmed and lowercased). |
| `password` | `string` | **Yes** | User password. Minimum 1 character. |

#### Example Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

#### Responses

##### 🟢 200 OK — Success
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cm7890abcdef12345",
      "email": "john.doe@example.com",
      "role": "STUDENT",
      "status": "ACTIVE",
      "instituteId": "cm1234567890abcdef"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### 🔴 400 Bad Request — Validation Error
```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": {
    "fieldErrors": {
      "email": ["Invalid email address"]
    },
    "formErrors": []
  }
}
```

##### 🔴 401 Unauthorized — Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

##### 🔴 403 Forbidden — Account Inactive
```json
{
  "success": false,
  "message": "Account is not active"
}
```

##### 🔴 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

### 3. Get Current User (`/me`)

Fetches profile data for the authenticated user based on the provided Access Token.

- **Method**: `GET`
- **URL**: `/api/v1/auth/me`
- **Auth Required**: Yes (`Bearer <accessToken>`)

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request Body
None.

#### Responses

##### 🟢 200 OK — Success
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm7890abcdef12345",
      "email": "john.doe@example.com",
      "role": "STUDENT",
      "status": "ACTIVE",
      "instituteId": "cm1234567890abcdef"
    }
  }
}
```

##### 🔴 401 Unauthorized — Missing / Invalid Token
```json
{
  "success": false,
  "message": "Authentication required"
}
```
*Note: Possible error messages include:*
- `"Authentication required"`
- `"Invalid authorization header"`
- `"Invalid or expired access token"`
- `"User not found"`

##### 🔴 403 Forbidden — Inactive Account
```json
{
  "success": false,
  "message": "Account is not active"
}
```

---

### 4. Refresh Token

Exchanges a valid refresh token for a fresh Access Token and a new Refresh Token (Token Rotation). The previous refresh token is revoked.

- **Method**: `POST`
- **URL**: `/api/v1/auth/refresh`
- **Auth Required**: No

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body Schema

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `refreshToken` | `string` | **Yes** | Active, valid refresh token string. |

#### Example Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Responses

##### 🟢 200 OK — Success
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### 🔴 400 Bad Request — Validation Error
```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": {
    "fieldErrors": {
      "refreshToken": ["Refresh token is required"]
    },
    "formErrors": []
  }
}
```

##### 🔴 401 Unauthorized — Invalid / Revoked / Expired Token
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```
*Note: Possible error messages include:*
- `"Invalid or expired refresh token"`
- `"Invalid refresh token"`
- `"Refresh token has been revoked"`
- `"Refresh token has expired"`
- `"User not found"`

##### 🔴 403 Forbidden — Account Inactive
```json
{
  "success": false,
  "message": "Account is not active"
}
```

---

### 5. Logout

Revokes the given refresh token, preventing any further token refreshes.

- **Method**: `POST`
- **URL**: `/api/v1/auth/logout`
- **Auth Required**: No

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body Schema

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `refreshToken` | `string` | **Yes** | The refresh token to be invalidated. |

#### Example Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Responses

##### 🟢 200 OK — Success
```json
{
  "success": true,
  "message": "Logout successful"
}
```

##### 🔴 400 Bad Request — Validation Error
```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": {
    "fieldErrors": {
      "refreshToken": ["Refresh token is required"]
    },
    "formErrors": []
  }
}
```

##### 🔴 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```
