// WhatsApp Cloud API webhook handlers.
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks

const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { getAiReply } = require('./chatController');
const demoStore = require('../store/demoStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified.');
    return res.status(200).send(challenge);
  }

  res.status(403).json({ message: 'Webhook verification failed.' });
};

const handleIncomingMessage = (req, res) => {
  const body = req.body;

  if (body.object !== 'whatsapp_business_account') {
    return res.sendStatus(404);
  }

  // WhatsApp requires a fast 200 OK — process async after responding
  res.sendStatus(200);

  processMessage(body).catch(err =>
    console.error('Webhook processing error:', err.message)
  );
};

const processMessage = async (body) => {
  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const messages = value?.messages;

  if (!messages || messages.length === 0) return;

  const msg = messages[0];
  const from = msg.from;
  const text = msg.text?.body || '';

  if (!text) return;

  console.log(`Incoming WhatsApp message from ${from}: ${text}`);

  if (isDbConnected()) {
    await Message.create({
      businessId: entry?.id || 'default',
      customerPhone: from,
      message: text,
      direction: 'inbound',
      timestamp: new Date(),
    });
  }

  const reply = getAiReply(text);

  // Persist to conversation store
  if (isDbConnected()) {
    let conv = await Conversation.findOne({ phone: from });
    if (!conv) {
      conv = await Conversation.create({
        phone: from,
        name: from,
        status: 'ai_active',
        unread: 1,
        lastMessage: text,
      });
    }
    conv.messages.push({ text, sender: 'user' });
    conv.messages.push({ text: reply, sender: 'bot' });
    conv.lastMessage = text;
    await conv.save();
  } else {
    // Demo mode — persist in-memory
    let conv = demoStore.conversations.find(c => c.phone === from);
    if (!conv) {
      conv = {
        _id: demoStore.nextId(),
        phone: from,
        name: from,
        status: 'ai_active',
        unread: 1,
        lastMessage: text,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoStore.conversations.push(conv);
    }
    conv.messages.push({ _id: demoStore.nextId(), text, sender: 'user', createdAt: new Date().toISOString() });
    conv.messages.push({ _id: demoStore.nextId(), text: reply, sender: 'bot', createdAt: new Date().toISOString() });
    conv.lastMessage = text;
    conv.updatedAt = new Date().toISOString();
  }

  // Send reply via WhatsApp Cloud API (only if real tokens are configured)
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (token && token !== 'your_whatsapp_access_token' && phoneNumberId && phoneNumberId !== 'your_phone_number_id') {
    await sendWhatsAppReply(from, reply, token, phoneNumberId);
  }
};

const sendWhatsAppReply = async (to, text, token, phoneNumberId) => {
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('WhatsApp send error:', err?.error?.message || res.status);
  }
};

module.exports = { verifyWebhook, handleIncomingMessage };
