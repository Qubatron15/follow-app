# REST API Plan

## 1. Resources

| Resource | DB Table | Description |
|----------|----------|-------------|
| `Thread` | `threads` | Top-level container created by a user to group meeting transcripts and their derived Action Points (APs). Max 20 per user, unique name per user. |
| `Transcript` | `transcripts` | Raw meeting transcript text (≤ 30 000 chars) associated with a single thread. |
| `ActionPoint` | `action_points` | A single actionable item extracted (automatically or manually) from transcripts. |

## 2. Endpoints

All endpoints are prefixed with `/api` and require a valid Supabase auth JWT (Bearer or cookie-based). Responses follow JSON:API style (`data`, `errors`). `id` fields are UUID strings.

### 2.1 Threads

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/threads` | List current user’s threads (paginated). |
| POST | `/api/threads` | Create a thread. |
| GET | `/api/threads/{threadId}` | Get single thread with aggregated counts. |
| PATCH | `/api/threads/{threadId}` | Rename thread. |
| DELETE | `/api/threads/{threadId}` | Hard-delete thread and cascade children. |

**Query Parameters (list)**
- `page` (number, default 1)
- `pageSize` (number, default 20, max 50)
- `sort` (enum `created_at`\|`name` , default `created_at`)

**Request → POST /api/threads**
```json
{
  "name": "Project Alpha"
}
```
Validation: non-empty, ≤ 20 chars, unique for user.

**Response (201)**
```json
{
  "data": {
    "id": "…",
    "name": "Project Alpha",
    "createdAt": "2025-12-29T19:12:11Z"
  }
}
```

**Possible errors**
- 400 `THREAD_NAME_INVALID`
- 409 `THREAD_NAME_DUPLICATE`
- 429 `THREAD_LIMIT_REACHED` (trigger violation)
- 404/403 if thread not found/unauthorised

### 2.2 Transcripts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/threads/{threadId}/transcripts` | List transcripts in a thread (paginated). |
| POST | `/api/threads/{threadId}/transcripts` | Add new transcript. |
| GET | `/api/transcripts/{transcriptId}` | Fetch single transcript. |
| DELETE | `/api/transcripts/{transcriptId}` | Delete transcript.

Request → POST
```json
{
  "content": "<raw meeting text>"
}
```
Validation: non-empty, ≤ 30 000 chars.

### 2.3 Action Points

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/threads/{threadId}/action-points` | List APs for thread (paginated / filter completed). |
| POST | `/api/threads/{threadId}/action-points` | Manually add AP. |
| PATCH | `/api/action-points/{apId}` | Update content or `isCompleted`. |
| DELETE | `/api/action-points/{apId}` | Delete AP.

Request → POST
```json
{
  "title": "Send updated roadmap",
  "isCompleted": false
}
```

### 2.4 AI Generation

Two design variants were considered:
1. Action on Transcript (`POST /api/transcripts/{id}/generate-action-points`)
2. Action on Thread (`POST /api/threads/{id}/action-points:generate`)

Variant 1 chosen – closer coupling with transcript that supplies content, avoids ambiguity when multiple transcripts exist.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/transcripts/{transcriptId}/generate-action-points` | Invoke OpenAI to extract and upsert APs. Returns operation status object. |
| GET | `/api/generations/{jobId}` | Poll generation job until `status=done`. (server-less edge function or queue)

**Response (202)**
```json
{
  "data": {
    "jobId": "…",
    "estimatedSeconds": 600
  }
}
```

Errors: 400 if transcript too long, 500 on OpenAI failure (also surfaced to user per F-06).

## 3. Validation & Business Logic

### 3.1 Validation rules
| Field | Rule | Source |
|-------|------|--------|
| `Thread.name` | required, 1-20 chars, unique per user | DB constraint `check`, index `uniq_threads_user_name` |
| Thread count | ≤ 20 threads/user | DB trigger `threads_limit_per_user_bi` |
| `Transcript.content` | required, ≤ 30 000 chars | PRD F-03 |
| `ActionPoint.title` | required, ≤ 255 chars | DB varchar |

Errors surfaced as 4xx with code mirroring DB/PRD condition.

### 3.2 Business logic mapping

| PRD Function | Endpoint(s) |
|--------------|-------------|
| F-01 Create thread | POST `/api/threads` |
| F-02 List threads | GET `/api/threads` |
| F-03 Add transcript | POST `/api/threads/{threadId}/transcripts` |
| F-04/05 Generate (re-generate) APs | POST `/api/transcripts/{id}/generate-action-points` + polling |
| F-06 AI timeout/error handling | Generation job & error codes |
| F-07 Edit / mark / delete AP | PATCH & DELETE `/api/action-points/{id}` |
| F-08 Manual add AP | POST `/api/threads/{threadId}/action-points` |

## 4. Error Model

```json
{
  "errors": [
    {
      "code": "THREAD_LIMIT_REACHED",
      "detail": "User may have max 20 threads"
    }
  ]
}
```

DB constraint violations are translated to semantic codes; unexpected errors return 500 `INTERNAL_SERVER_ERROR`.

## 5. Rate Limiting & Performance

- One transcript generation at a time per thread (mutex via DB `advisory_lock`).
- Supabase row-level indexes ensure O(log n) fetches; composite index on `(user_id, name)` already present.
- Additional index considered for `action_points(thread_id, is_completed)` if list filtering degrades.

## 6. Assumptions

1. Supabase Edge Functions or Astro server routes can execute long-running OpenAI calls (≤10 min) asynchronously.
2. Web client polls `/api/generations/{jobId}`; alternative – WebSocket – deferred.
3. No soft-delete; deletions are irreversible per DB design & PRD.
