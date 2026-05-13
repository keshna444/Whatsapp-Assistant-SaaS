# Whatsapp-Assistant-SaaS
AI-powered WhatsApp booking assistant for salons, barbers, and SMEs.

---

## Project Structure

```
Whatsapp-Assistant-SaaS/
├── Responsivesaaswebapplication/   # React + Vite frontend
└── backend/                        # Node.js + Express + MongoDB backend
```

---

## Backend Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas connection string

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in your values:

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | A long random string used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifespan e.g. `7d` |
| `WHATSAPP_VERIFY_TOKEN` | Token you set in Meta Developer Console for webhook verification |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Cloud API access token (add when ready) |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID from Meta Console |
| `FRONTEND_URL` | Frontend origin for CORS e.g. `http://localhost:5173` |

### 3. Run the backend

**Development (auto-restart on change):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The API will be available at `http://localhost:5000`.

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login, returns JWT |
| GET | `/api/auth/me` | Bearer token | Get current user |

### Business Profile
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/business` | Bearer token | Create business profile |
| GET | `/api/business/me` | Bearer token | Get my profile |
| PUT | `/api/business/me` | Bearer token | Update my profile |
| DELETE | `/api/business/me` | Bearer token | Delete my profile |

### Appointments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/appointments` | Bearer token | Create appointment |
| GET | `/api/appointments` | Bearer token | Get all appointments |
| PATCH | `/api/appointments/:id/status` | Bearer token | Update appointment status |
| DELETE | `/api/appointments/:id` | Bearer token | Delete appointment |

### Chatbot
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/chat` | None | Send a message, receive booking assistant reply |

**Request body:**
```json
{ "message": "hello", "businessId": "<optional>", "sessionData": {} }
```

### WhatsApp Webhook
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/webhook` | None | Webhook verification (Meta handshake) |
| POST | `/webhook` | None | Receive incoming WhatsApp messages |

---

## Frontend Setup

```bash
cd Responsivesaaswebapplication
npm install   # or pnpm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.
