# WhatsApp AI SaaS — Phase 3 Frontend Context

## Project Overview

This project is a WhatsApp AI SaaS platform.

Businesses will connect their WhatsApp accounts and manage customer conversations through a web dashboard.

Current backend stack:
- Node.js
- Express.js
- MongoDB
- Mongoose

Frontend stack:
- React
- Tailwind CSS
- Axios

## Current Backend Status

The backend is already working.

Completed features:
- Meta WhatsApp webhook integration
- Incoming WhatsApp messages received successfully
- MongoDB connected
- Messages stored in database
- Conversations stored in database

## Existing Backend APIs

### GET /api/conversations

Returns all conversations.

Example response:

```json
[
  {
    "_id": "...",
    "customerPhone": "16315551181",
    "lastMessage": "hello",
    "updatedAt": "2026-05-27T10:00:00Z"
  }
]