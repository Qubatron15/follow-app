# API Documentation: POST /api/threads

## Overview
Creates a new thread for the user. Each thread represents a conversation context with a unique name.

## Endpoint Details
- **Method:** `POST`
- **URL:** `/api/threads`
- **Content-Type:** `application/json`
- **Authentication:** Not required (simplified for MVP)

## Request Body
```json
{
  "name": "My Project Thread"
}
```

### Parameters
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | string | Yes | 1-20 characters, unique per user | Thread name |

## Response Formats

### Success Response (201 Created)
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user_id",
    "name": "My Project Thread",
    "createdAt": "2025-12-29T21:00:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Input
```json
{
  "error": {
    "code": "THREAD_NAME_INVALID",
    "message": "Thread name must be between 1 and 20 characters"
  }
}
```

#### 409 Conflict - Duplicate Name
```json
{
  "error": {
    "code": "THREAD_NAME_DUPLICATE",
    "message": "Thread with name \"My Project Thread\" already exists"
  }
}
```

#### 429 Too Many Requests - Limit Reached
```json
{
  "error": {
    "code": "THREAD_LIMIT_REACHED",
    "message": "Maximum number of threads (20) reached"
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred while creating the thread"
  }
}
```

## Business Rules
1. **Name Uniqueness:** Thread names must be unique per user (case-sensitive)
2. **Character Limit:** Thread names must be 1-20 characters long
3. **Thread Limit:** Each user can have maximum 20 threads
4. **Name Validation:** Names are automatically trimmed of whitespace

## Example Usage

### cURL
```bash
curl -X POST http://localhost:4321/api/threads \
  -H "Content-Type: application/json" \
  -d '{"name": "My New Thread"}'
```

### JavaScript/Fetch
```javascript
const response = await fetch('/api/threads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My New Thread'
  })
});

const result = await response.json();

if (response.ok) {
  console.log('Thread created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Implementation Details

### Files Structure
```
src/
├── pages/api/threads/
│   └── post.ts                 # API endpoint implementation
├── lib/
│   ├── schemas/
│   │   └── threads.schema.ts   # Zod validation schema
│   ├── services/
│   │   └── threads.service.ts  # Business logic
│   └── errors/
│       └── index.ts            # Error handling utilities
└── types.ts                    # TypeScript type definitions
```

### Database Schema
The endpoint interacts with the `threads` table:
```sql
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(20) NOT NULL CHECK (char_length(name) BETWEEN 1 AND 20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint for thread names per user
CREATE UNIQUE INDEX uniq_threads_user_name ON threads (user_id, name);
```

### Error Handling
- **Input Validation:** Uses Zod schema for request body validation
- **Business Rules:** Enforced at service layer with custom error types
- **Database Constraints:** Handled with appropriate HTTP status codes
- **Logging:** All errors are logged with context for debugging

### Performance Considerations
- **Indexes:** Optimized queries with proper database indexes
- **Validation:** Early validation to prevent unnecessary database calls
- **Error Responses:** Consistent error format for client handling

## Testing

### Test Scenarios
1. **Happy Path:** Create thread with valid name
2. **Validation Errors:** Invalid JSON, empty name, name too long
3. **Duplicate Name:** Attempt to create thread with existing name
4. **Limit Reached:** Create 21st thread for user
5. **Database Errors:** Handle connection issues, constraint violations

### Manual Testing
```bash
# Test successful creation
curl -X POST http://localhost:4321/api/threads \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Thread"}'

# Test validation error
curl -X POST http://localhost:4321/api/threads \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'

# Test duplicate name
curl -X POST http://localhost:4321/api/threads \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Thread"}'
```

## Notes
- Authentication is currently disabled for MVP simplicity
- All threads are created with hardcoded `user_id` = `'user_id'`
- RLS policies exist in database but are bypassed in current implementation
- Ready for authentication integration when needed
