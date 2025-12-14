# Quiz Practice English Service API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /api/auth/register`  
**Full URL:** `http://localhost:3000/api/auth/register`

**Description:** Đăng ký tài khoản người dùng

**Request Body:**
```json
{
  "fullName": "string (required) - Họ và tên đầy đủ",
  "username": "string (required) - Tên đăng nhập",
  "email": "string (required) - Địa chỉ email",
  "password": "string (required, minLength: 6) - Mật khẩu"
}
```

**Responses:**

- **201 Created** - Đăng ký thành công
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "_id": "string",
      "fullName": "string",
      "username": "string",
      "email": "string",
      "createdAt": "string (date-time)"
    }
  }
  ```

- **400 Bad Request** - Dữ liệu không hợp lệ
  ```json
  {
    "success": false,
    "message": "All fields are required"
  }
  ```

- **409 Conflict** - Email hoặc username đã tồn tại
  ```json
  {
    "success": false,
    "message": "User with this email or username already exists"
  }
  ```

- **500 Internal Server Error** - Lỗi server
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

### 2. Login User
**Endpoint:** `POST /api/auth/login`  
**Full URL:** `http://localhost:3000/api/auth/login`

**Description:** Đăng nhập tài khoản

**Request Body:**
```json
{
  "identifier": "string (required) - Email hoặc username",
  "password": "string (required) - Mật khẩu"
}
```

**Responses:**

- **200 OK** - Đăng nhập thành công
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "string - JWT token",
    "user": {
      "_id": "string",
      "fullName": "string",
      "username": "string",
      "email": "string"
    }
  }
  ```

- **400 Bad Request** - Dữ liệu không hợp lệ
  ```json
  {
    "success": false,
    "message": "Identifier and password are required"
  }
  ```

- **401 Unauthorized** - Sai thông tin đăng nhập
  ```json
  {
    "success": false,
    "message": "Invalid credentials"
  }
  ```

- **500 Internal Server Error** - Lỗi server
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

## Quiz Endpoints

### 3. Generate Quiz
**Endpoint:** `POST /api/quiz/generate-quiz`  
**Full URL:** `http://localhost:3000/api/quiz/generate-quiz`

**Description:** Tạo bộ câu hỏi kiểm tra tiếng Anh

**Request Body:**
```json
{
  "level": "string (required) - Trình độ tiếng Anh (A1, A2, B1, B2, C1, C2)"
}
```

**Responses:**

- **200 OK** - Bộ câu hỏi được tạo thành công
  ```json
  [
    {
      "question": "string",
      "Choice": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "Correct": "string (A, B, C, D)"
    }
  ]
  ```

- **400 Bad Request** - Lỗi đầu vào
  ```json
  {
    "error": "Invalid level. Must be one of A1, A2, B1, B2, C1, C2"
  }
  ```

- **500 Internal Server Error** - Lỗi server
  ```json
  {
    "error": "Failed to generate quiz"
  }
  ```