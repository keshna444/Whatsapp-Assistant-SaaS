const BusinessProfile = require('../models/BusinessProfile');

// Deterministic AI reply logic. Returns a reply string.
// Swap this function for an LLM call (OpenAI, Claude, etc.) when ready.
const getAiReply = (message, businessName = 'our business') => {
  const text = message.toLowerCase().trim();

  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening))/.test(text)) {
    return `Hello! Welcome to ${businessName}. I can help you book an appointment. Just type "book" to get started, or "services" to see what we offer.`;
  }
  if (/service|offer|what do you (do|offer|have)/.test(text)) {
    return `We offer a range of services. Type "services" in the dashboard to view our full list with prices and durations. Type "book" to make an appointment.`;
  }
  if (/book|appointment|reserve|schedule/.test(text)) {
    return 'Great! To book an appointment please provide:\n1. Your full name\n2. Your phone number\n3. The service you want\n4. Your preferred date and time (e.g. 2026-06-15 10:00)';
  }
  if (/hour|open|available|timing/.test(text)) {
    return 'We are open Monday–Saturday, 9 AM – 7 PM. Type "book" to schedule your appointment.';
  }
  if (/price|cost|how much|rate|fee/.test(text)) {
    return 'Pricing varies by service. Type "services" to see our full list with prices.';
  }
  if (/cancel|refund/.test(text)) {
    return 'To cancel an appointment please call us directly or ask the business owner for assistance.';
  }
  if (/thank|thanks/.test(text)) {
    return 'You are welcome! Is there anything else I can help you with?';
  }
  return 'I am your booking assistant. I can help you with appointments, services, and business hours. Type "book" to get started.';
};

// POST /api/chat — stateless endpoint (no DB save)
const chat = async (req, res) => {
  const { message, businessId } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  let businessName = 'our business';
  if (businessId) {
    const profile = await BusinessProfile.findById(businessId).catch(() => null);
    if (profile) businessName = profile.businessName;
  }

  const reply = getAiReply(message, businessName);
  res.json({ reply });
};

module.exports = { chat, getAiReply };
