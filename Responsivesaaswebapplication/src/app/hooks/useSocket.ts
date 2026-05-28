import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import type { Conversation, Message } from '../types/conversations';

// ---------------------------------------------------------------------------
// Shape of payloads emitted by the backend socketManager
// ---------------------------------------------------------------------------

export type MessageNewPayload = {
  conversationId: string;
  message: Message;
};

export type ConversationUpdatedPayload = {
  conversationId: string;
  changes: Partial<Pick<Conversation, 'lastMessage' | 'status' | 'unread' | 'updatedAt'>>;
};

export type ConversationNewPayload = {
  conversation: Omit<Conversation, 'messages'>;
};

export type AiTypingPayload = {
  conversationId: string;
  isTyping: boolean;
};

export type AgentTypingPayload = {
  conversationId: string;
  isTyping: boolean;
};

// ---------------------------------------------------------------------------
// Hook options — pass callbacks for the events you care about
// ---------------------------------------------------------------------------

type Options = {
  businessId?: string;
  activeConversationId?: string | null;
  onMessageNew?: (payload: MessageNewPayload) => void;
  onConversationUpdated?: (payload: ConversationUpdatedPayload) => void;
  onConversationNew?: (payload: ConversationNewPayload) => void;
  onAiTyping?: (payload: AiTypingPayload) => void;
  onAgentTyping?: (payload: AgentTypingPayload) => void;
};

/**
 * Connects to Socket.IO on mount, joins the business room, and wires up
 * all real-time event callbacks. Cleans up properly on unmount.
 */
export const useSocket = ({
  businessId = 'default',
  activeConversationId,
  onMessageNew,
  onConversationUpdated,
  onConversationNew,
  onAiTyping,
  onAgentTyping,
}: Options) => {
  // Keep latest callbacks in refs so we never need to re-subscribe when they change
  const onMessageNewRef = useRef(onMessageNew);
  const onConvUpdatedRef = useRef(onConversationUpdated);
  const onConvNewRef = useRef(onConversationNew);
  const onAiTypingRef = useRef(onAiTyping);
  const onAgentTypingRef = useRef(onAgentTyping);

  useEffect(() => { onMessageNewRef.current = onMessageNew; }, [onMessageNew]);
  useEffect(() => { onConvUpdatedRef.current = onConversationUpdated; }, [onConversationUpdated]);
  useEffect(() => { onConvNewRef.current = onConversationNew; }, [onConversationNew]);
  useEffect(() => { onAiTypingRef.current = onAiTyping; }, [onAiTyping]);
  useEffect(() => { onAgentTypingRef.current = onAgentTyping; }, [onAgentTyping]);

  // Connect once on mount, disconnect on unmount
  useEffect(() => {
    const socket = connectSocket();

    const handleConnect = () => {
      socket.emit('join:business', businessId);
    };

    // If already connected when effect runs
    if (socket.connected) {
      socket.emit('join:business', businessId);
    }

    socket.on('connect', handleConnect);
    socket.on('message:new', (p: MessageNewPayload) => onMessageNewRef.current?.(p));
    socket.on('conversation:updated', (p: ConversationUpdatedPayload) => onConvUpdatedRef.current?.(p));
    socket.on('conversation:new', (p: ConversationNewPayload) => onConvNewRef.current?.(p));
    socket.on('ai:typing', (p: AiTypingPayload) => onAiTypingRef.current?.(p));
    socket.on('agent:typing', (p: AgentTypingPayload) => onAgentTypingRef.current?.(p));

    return () => {
      socket.off('connect', handleConnect);
      socket.off('message:new');
      socket.off('conversation:updated');
      socket.off('conversation:new');
      socket.off('ai:typing');
      socket.off('agent:typing');
      disconnectSocket();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // Join/leave specific conversation room when active conversation changes
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected || !activeConversationId) return;
    socket.emit('join:conversation', activeConversationId);

    return () => {
      socket.emit('leave:conversation', activeConversationId);
    };
  }, [activeConversationId]);

  /**
   * Emit a typing indicator for the current agent.
   * Call with true when typing starts, false when it stops.
   */
  const emitAgentTyping = (conversationId: string, isTyping: boolean) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('agent:typing', { conversationId, isTyping });
    }
  };

  return { emitAgentTyping };
};
