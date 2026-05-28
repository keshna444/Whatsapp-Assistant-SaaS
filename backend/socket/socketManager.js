const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO on the given HTTP server.
 * Called once from server.js at startup.
 */
const init = (httpServer, corsOptions) => {
  io = new Server(httpServer, {
    cors: corsOptions,
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Agent joins the shared business room so they receive all conversation events
    socket.on('join:business', (businessId) => {
      const room = `business:${businessId || 'default'}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room ${room}`);
    });

    // Agent joins a specific conversation room for typing indicators
    socket.on('join:conversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Agent is typing — broadcast to everyone else in that conversation room
    socket.on('agent:typing', ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit('agent:typing', { conversationId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Emit a new message event to the shared business room.
 * Used by controllers after persisting a message.
 */
const emitNewMessage = (businessId, conversationId, message) => {
  if (!io) return;
  io.to(`business:${businessId || 'default'}`).emit('message:new', {
    conversationId,
    message,
  });
};

/**
 * Emit a conversation-level update (lastMessage, status, unread, updatedAt).
 * Used by controllers after any conversation metadata change.
 */
const emitConversationUpdated = (businessId, conversationId, changes) => {
  if (!io) return;
  io.to(`business:${businessId || 'default'}`).emit('conversation:updated', {
    conversationId,
    changes,
  });
};

/**
 * Emit a brand-new conversation (created by webhook or API).
 */
const emitNewConversation = (businessId, conversation) => {
  if (!io) return;
  io.to(`business:${businessId || 'default'}`).emit('conversation:new', { conversation });
};

/**
 * Emit an ai:typing indicator for the active conversation.
 */
const emitAiTyping = (businessId, conversationId, isTyping) => {
  if (!io) return;
  io.to(`business:${businessId || 'default'}`).emit('ai:typing', { conversationId, isTyping });
};

const getIO = () => io;

module.exports = { init, getIO, emitNewMessage, emitConversationUpdated, emitNewConversation, emitAiTyping };
