# BookFlow — Onboarding UI Fix Guide

## Project Context

BookFlow is a WhatsApp AI booking automation SaaS for small businesses (beauty salons, clinics, barbershops, etc.).
The onboarding flow has 3 steps: **Business Details → Connect WhatsApp → Test AI**.

This document describes exactly what needs to be fixed, added, or replaced in each step.

---

## Tech Stack Assumptions

- Frontend: React (Next.js or Vite)
- Styling: Tailwind CSS (adjust class names if using plain CSS/SCSS)
- Form state: React `useState` or React Hook Form
- Primary color (green): `#22c55e` / Tailwind `green-500`
- Font: Inter or system sans-serif

---

## Step 1 — Business Details (`/onboarding/step-1`)

### What exists now (broken)
- Business Type dropdown ✓
- Currency dropdown ✓
- 3 unlabeled input fields for "Add a popular service" (3rd field shows "45" with no label) ✗
- No business name field ✗
- No working hours ✗
- No repeater for adding multiple services ✗

### What to build

#### Field order (top to bottom)
1. **Business Name** — text input, required, placeholder: `e.g. Beauty Studio by Sarah`
2. **Business Type** — dropdown (keep existing options)
3. **Currency** — dropdown (keep existing, auto-detect from browser locale as default)
4. **Working Hours** — collapsible section (collapsed by default, expandable)
5. **Services** — repeater component (see below)

#### Working Hours Component
- Toggle label: "Set working hours (optional)"
- When expanded: show Mon–Sun rows
- Each row: Day label | Start time input | End time input | "Closed" toggle
- Default: Mon–Fri 09:00–18:00, Sat–Sun closed
- Store as: `{ mon: { open: "09:00", close: "18:00", closed: false }, ... }`

#### Services Repeater Component
- Label: "Your services"
- Each service row has 3 fields in a horizontal grid:
  - `Service name` — text input, placeholder: `e.g. Gel Manicure`
  - `Price` — number input, prefix shows currency symbol from dropdown above
  - `Duration (min)` — number input, placeholder: `45`
  - Delete button (trash icon) — hidden on first row if it's the only row
- Below the last row: `+ Add another service` text button (green, no border)
- Start with 1 pre-filled row, empty
- Max 20 services
- When user selects a Business Type, pre-fill 2–3 common services for that type:
  - Hair Salon → `["Haircut", "Blowout", "Hair Color"]`
  - Nail Studio → `["Gel Manicure", "Acrylic Nails", "Pedicure"]`
  - Barbershop → `["Haircut", "Beard Trim", "Hot Shave"]`
  - Dental Clinic → `["Cleaning", "Consultation", "Whitening"]`
  - Massage Studio → `["Swedish Massage", "Deep Tissue", "Hot Stone"]`
  - Other → start with 1 empty row

#### Validation before Continue
- Business name: required, min 2 chars
- At least 1 service with a name
- Show inline error under each invalid field
- Do NOT show a modal or alert — inline errors only

#### Data to save (localStorage or form state to pass to next step)
```json
{
  "businessName": "Beauty Studio by Sarah",
  "businessType": "Nail Studio",
  "currency": "MUR",
  "currencySymbol": "Rs",
  "workingHours": {
    "mon": { "open": "09:00", "close": "18:00", "closed": false },
    "tue": { "open": "09:00", "close": "18:00", "closed": false },
    "wed": { "open": "09:00", "close": "18:00", "closed": false },
    "thu": { "open": "09:00", "close": "18:00", "closed": false },
    "fri": { "open": "09:00", "close": "18:00", "closed": false },
    "sat": { "open": "10:00", "close": "14:00", "closed": false },
    "sun": { "open": "00:00", "close": "00:00", "closed": true }
  },
  "services": [
    { "id": "1", "name": "Gel Manicure", "price": 800, "duration": 45 },
    { "id": "2", "name": "Pedicure", "price": 600, "duration": 60 }
  ]
}
```

---

## Step 2 — Connect WhatsApp (`/onboarding/step-2`)

### What exists now (broken)
- QR code scan UI — **remove this entirely**
- "I've scanned the code" button — **remove this**

### What to build — WhatsApp Embedded Signup Screen

> **Note:** The Meta Embedded Signup JS SDK requires Meta app approval. Until approval is granted,
> show a "Pending" state instead of launching the real popup. The UI structure remains identical.

#### Layout
- Icon: WhatsApp logo (green, centered, 48px)
- Heading: `Connect your WhatsApp Business number`
- Subheading: `BookFlow will reply to your customers automatically — 24/7, even when you're busy.`
- Primary button: `Connect with WhatsApp` (green, full-width on mobile, 360px max on desktop)
  - Icon: WhatsApp icon left of text
  - On click: launch Meta Embedded Signup popup (see JS below)
- Below button — 3 trust bullets (small, gray, with checkmark icons):
  - `Official Meta Business API — your number stays safe`
  - `No app to install — works on your existing WhatsApp Business number`
  - `You can disconnect at any time from settings`

#### States
1. **Default** — button is active, ready to click
2. **Loading** — button shows spinner, text: `Opening WhatsApp...`
3. **Pending (pre-approval)** — instead of launching popup, show info card:
   - Icon: clock icon (amber)
   - Text: `Your WhatsApp connection is being set up. We'll notify you by email when it's ready.`
   - Button: `Continue anyway →` (ghost/outline style)
   - This lets beta users proceed through onboarding without a real connection
4. **Connected** — green success card:
   - Checkmark icon (green)
   - `Connected: +230 XXXX XXXX` (show masked number)
   - `Your AI assistant is ready.`
   - Continue button becomes active

#### Embedded Signup JS (attach to button onClick)
```javascript
// Only run this when Meta App is approved and SDK is loaded
function launchWhatsAppSignup() {
  window.FB.login(
    function (response) {
      if (response.authResponse) {
        const code = response.authResponse.code;
        // Send `code` to your backend
        // Backend exchanges it for: access_token, phone_number_id, waba_id
        // Store these per user in your DB
        fetch('/api/whatsapp/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setConnectionState('connected');
              setConnectedNumber(data.phoneNumber);
            }
          });
      }
    },
    {
      config_id: 'YOUR_META_CONFIG_ID', // from Meta App Dashboard
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: '',
        sessionInfoVersion: '3',
      },
    }
  );
}
```

#### Required in `<head>` or loaded via useEffect
```html
<script>
  window.fbAsyncInit = function () {
    FB.init({ appId: 'YOUR_META_APP_ID', autoLogAppEvents: true, xfbml: true, version: 'v18.0' });
  };
</script>
<script async defer src="https://connect.facebook.net/en_US/sdk.js"></script>
```

---

## Step 3 — Test AI (`/onboarding/step-3`)

### What exists now (broken)
- Live chat UI that doesn't respond because API is not connected ✗
- "What's happening?" sidebar with bullet points ✗
- Input field with no simulated response ✗

### What to build — Simulated AI Chat Demo

> **Goal:** Make the user feel the product works. This is a DEMO — it does not need a real API.
> Use the business data saved in Step 1 to personalize it.

#### Layout (keep the 2-column layout from the screenshot)
- Left column: "What's happening?" — rename to `How your AI works`
- Right column: WhatsApp-style chat UI

#### Left column — "How your AI works"
Replace the generic bullet list with a 3-step animated reveal:
- Step 1 highlights when the user sends a message
- Step 2 highlights during the typing indicator
- Step 3 highlights when the booking confirmation appears
- Use a simple CSS class toggle (`.active`) to highlight the current step
- Each step: icon + bold label + 1-line description

```
Step 1 — Reads the message
         AI understands what the customer wants and when

Step 2 — Checks availability
         Looks at your calendar and available services

Step 3 — Confirms the booking
         Replies with details and sends a reminder
```

#### Right column — Simulated Chat
- Show business name from Step 1 in the WhatsApp header (e.g. `Beauty Studio by Sarah`)
- Pre-fill the input with: `Can I book a [first service name from Step 1] for tomorrow?`
- Do NOT make the user type — pre-fill it so they just press Send

##### Conversation script (use business data from Step 1)
Replace `{service}`, `{price}`, `{currency}`, `{duration}` with real values:

```
[User sends message]

[Typing indicator — 1500ms delay]

AI: Hi! Thanks for reaching out to {businessName} 👋
    I can book you in for a {service} ({duration} mins, {currencySymbol}{price}).

    Which date works best for you?
    1. Tomorrow
    2. Day after tomorrow
    3. Choose a different date

[User input disappears, replaced with quick-reply buttons: "1", "2", "3"]
[User taps "1"]

[Typing indicator — 1000ms delay]

AI: Perfect! And what time suits you?
    1. 10:00 AM
    2. 12:00 PM
    3. 3:00 PM

[User taps "1" or "2" or "3"]

[Typing indicator — 1200ms delay]

AI: You're booked! ✅
    {service} tomorrow at [selected time]
    You'll receive a reminder 2 hours before. See you then! 🎉
```

##### After the booking confirmation appears
- Highlight Step 3 in the left column
- Show a success banner below the chat:
  - `Your AI just handled a booking automatically.`
  - Green background, checkmark icon
- "Go to Dashboard" button appears (replaces Continue)

#### Technical implementation notes
- All timing via `setTimeout` — no real API needed
- Store the conversation in local React state `useState([])` as an array of message objects
- Message object shape: `{ id, role: 'user'|'ai', text, timestamp }`
- Typing indicator: show a `div` with 3 animated dots, remove it when AI message is added
- Quick-reply buttons: render as pill buttons below the last AI message, remove them after user taps one

---

## Progress Bar (applies to all 3 steps)

### What exists now
- 3-circle stepper with labels — visually fine

### Fix
- Step numbers should animate to checkmarks (✓) when completed
- The connecting line between steps should fill with green as the user progresses
- On mobile: hide the labels, show only the circles + line
- Active step circle: filled green with white number
- Completed step circle: filled green with white checkmark icon
- Upcoming step circle: gray outline with gray number

---

## General UI Rules (apply across all 3 steps)

- **No page reload between steps** — use client-side routing or conditional rendering
- **Back button** on Steps 2 and 3 should return to the previous step without losing data
- **Continue button** should be disabled (grayed out) until validation passes
- **Loading states** — every async action (form submit, WhatsApp connect) must show a spinner on the button
- **Mobile-first** — the entire onboarding must work at 375px width
- **Error states** — show errors inline under the field, never as browser alerts
- **No horizontal scroll** at any screen width
- **Font size minimum** — 14px for all input labels, 16px for input text (prevents iOS zoom)

---

## File Structure Suggestion

```
/components
  /onboarding
    OnboardingLayout.jsx       ← progress bar + shared wrapper
    Step1BusinessDetails.jsx   ← business name, type, currency, hours, services
    Step2ConnectWhatsApp.jsx   ← embedded signup or pending state
    Step3TestAI.jsx            ← simulated chat demo
    ServicesRepeater.jsx       ← reusable service add/remove component
    WorkingHours.jsx           ← collapsible working hours picker
    SimulatedChat.jsx          ← the WhatsApp demo UI
```

---

## What NOT to change

- Overall color palette (green `#22c55e`, dark heading `#0f172a`)
- BookFlow logo and navbar
- The 3-step structure — do not add or remove steps
- The WhatsApp-style chat UI appearance in Step 3 — only the functionality changes

