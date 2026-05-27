# WhatsApp AI SaaS — Project Context

## Current Stack

Backend:
- Node.js
- Express.js
- MongoDB + Mongoose

WhatsApp:
- Meta WhatsApp Cloud API
- Webhook already verified and working

Frontend:
- React frontend planned later
- Not connected yet

## Current Status

The webhook successfully receives WhatsApp messages.

Current flow:

WhatsApp
→ Meta Cloud API
→ Express webhook
→ terminal console.log()

Example received message:
- customer phone number
- message text

MongoDB connection is already working.

ngrok is used for local webhook testing.

## Goal Of Phase 2

Build database persistence for WhatsApp chats.

When a message arrives:
1. Save message into MongoDB
2. Update/create conversation
3. Prepare API endpoints for frontend dashboard

## Features To Build

### 1. Message Model

Fields:
- businessId
- customerPhone
- message
- direction
- timestamp

### 2. Conversation Model

Fields:
- businessId
- customerPhone
- lastMessage
- updatedAt

### 3. Update Webhook Logic

Current webhook only logs messages.

Need to:
- save incoming message
- update conversation automatically

### 4. Create API Routes

GET /api/conversations
GET /api/messages/:phone

## Important Rules

- Use CommonJS syntax (require/module.exports)
- Do NOT convert project to TypeScript
- Do NOT change existing webhook verification logic
- Keep project structure simple
- Use Mongoose models
- Explain where each file should go

## Expected Result

After implementation:

- Incoming WhatsApp messages are stored in MongoDB
- Conversations are updated automatically
- Backend APIs return chat data
- Frontend dashboard can later consume these APIs