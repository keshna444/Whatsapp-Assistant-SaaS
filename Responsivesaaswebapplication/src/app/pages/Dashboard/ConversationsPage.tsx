import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../../components/ui';
import { ConversationList } from './Conversations/ConversationList';
import { ChatWindow } from './Conversations/ChatWindow';
import { EmptyChat } from './Conversations/EmptyChat';
import { conversationsApi } from '../../services/conversations';
import { useSocket } from '../../hooks/useSocket';
import type { Conversation, Message, ConversationStatus } from '../../types/conversations';

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showList, setShowList] = useState(true);

  // Track the active conversation id in a ref so socket callbacks always see the latest value
  const activeConvIdRef = useRef<string | null>(null);
  // Track message ids we already rendered optimistically to avoid duplicates
  const pendingUserMsgRef = useRef<string | null>(null);

  // ── Initial load ──────────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const data = await conversationsApi.getAll();
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ── Socket integration ────────────────────────────────────────────────────
  const { emitAgentTyping } = useSocket({
    businessId: 'default',
    activeConversationId: activeConv?._id ?? null,

    // A new message arrived via webhook or another agent session
    onMessageNew: ({ conversationId, message }) => {
      if (conversationId === activeConvIdRef.current) {
        setMessages(prev => {
          // Skip if we already have this message (by _id) to avoid duplicates
          if (message._id && prev.some(m => m._id === message._id)) return prev;
          // Also skip if this is the user message we added optimistically
          if (message._id && pendingUserMsgRef.current === message._id) {
            pendingUserMsgRef.current = null;
            return prev;
          }
          return [...prev, message];
        });
      }
    },

    // Conversation metadata updated (lastMessage, status, unread)
    onConversationUpdated: ({ conversationId, changes }) => {
      setConversations(prev => {
        const updated = prev.map(c =>
          c._id === conversationId ? { ...c, ...changes } : c
        );
        // Re-sort so the most recently updated conversation floats to top
        return [...updated].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      // Keep activeConv in sync too
      if (conversationId === activeConvIdRef.current) {
        setActiveConv(prev => prev ? { ...prev, ...changes } : prev);
      }
    },

    // Brand-new conversation created elsewhere (e.g. a real WhatsApp user messaged)
    onConversationNew: ({ conversation }) => {
      setConversations(prev => {
        if (prev.some(c => c._id === conversation._id)) return prev;
        return [conversation, ...prev];
      });
    },

    // AI is generating a reply for the active conversation
    onAiTyping: ({ conversationId, isTyping: typing }) => {
      if (conversationId === activeConvIdRef.current) {
        setIsTyping(typing);
      }
    },
  });

  // Keep ref in sync with state
  useEffect(() => {
    activeConvIdRef.current = activeConv?._id ?? null;
  }, [activeConv]);

  // ── Conversation selection ────────────────────────────────────────────────
  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setShowList(false);
    setInputText('');
    setIsTyping(false);
    setLoadingMsgs(true);
    try {
      const full = await conversationsApi.getById(conv._id);
      setMessages(full.messages ?? []);
      setActiveConv(full);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // ── Create conversation ───────────────────────────────────────────────────
  const createConversation = async (phone: string, name: string) => {
    const conv = await conversationsApi.create(phone, name || phone);
    setConversations(prev => {
      if (prev.some(c => c._id === conv._id)) return prev;
      return [conv, ...prev];
    });
    await selectConversation(conv);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !activeConv) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimistic: Message = { text, sender: 'user', time: now };

    setMessages(prev => [...prev, optimistic]);
    setInputText('');
    // Don't set isTyping here — the backend emits ai:typing via socket

    try {
      const data = await conversationsApi.sendMessage(activeConv._id, text);

      // Track the real user message _id so the socket event doesn't double-render it
      if (data.userMessage?._id) {
        pendingUserMsgRef.current = data.userMessage._id;
      }

      setMessages(prev => {
        // Replace optimistic entry with real user message, then append bot reply
        const withoutOptimistic = prev.slice(0, -1);
        const realUser: Message = data.userMessage
          ? { ...data.userMessage, time: now }
          : { text, sender: 'user', time: now };
        const botMsg: Message = {
          _id: data.botMessage?._id,
          text: data.reply,
          sender: 'bot',
          time: now,
        };
        return [...withoutOptimistic, realUser, botMsg];
      });

      // Update sidebar (socket will also do this, belt-and-suspenders)
      setConversations(prev =>
        prev.map(c =>
          c._id === activeConv._id
            ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch {
      setMessages(prev => [
        ...prev,
        { text: '⚠️ Could not reach the server. Please check your backend.', sender: 'bot', time: now },
      ]);
      setIsTyping(false);
    }
  };

  // ── AI / Human takeover — now persisted to backend ────────────────────────
  const toggleAI = async () => {
    if (!activeConv) return;
    const newStatus: ConversationStatus = activeConv.status === 'ai_active' ? 'human_needed' : 'ai_active';

    // Optimistic update — immediately reflects in the UI
    const optimisticConv = { ...activeConv, status: newStatus };
    setActiveConv(optimisticConv);
    setConversations(prev =>
      prev.map(c => (c._id === activeConv._id ? { ...c, status: newStatus } : c))
    );

    try {
      await conversationsApi.toggleStatus(activeConv._id, newStatus);
      // Socket will emit conversation:updated which also syncs status — already handled above
    } catch {
      // Revert optimistic update on failure
      setActiveConv(activeConv);
      setConversations(prev =>
        prev.map(c => (c._id === activeConv._id ? { ...c, status: activeConv.status } : c))
      );
    }
  };

  // ── Typing indicator — emit to other agents when the human agent types ────
  const handleInputChange = (val: string) => {
    setInputText(val);
    if (activeConv) {
      emitAgentTyping(activeConv._id, val.length > 0);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 flex overflow-hidden">

      {/* Sidebar — hidden on mobile when a chat is open */}
      <div className={cn(
        'w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-white shrink-0',
        showList ? 'flex' : 'hidden md:flex'
      )}>
        <ConversationList
          conversations={conversations}
          activeId={activeConv?._id ?? null}
          loading={loadingConvs}
          onSelect={selectConversation}
          onCreate={createConversation}
        />
      </div>

      {/* Chat pane — hidden on mobile when list is shown */}
      <div className={cn(
        'flex-1 flex flex-col',
        !showList ? 'flex' : 'hidden md:flex'
      )}>
        {activeConv ? (
          <ChatWindow
            conversation={activeConv}
            messages={messages}
            inputText={inputText}
            isTyping={isTyping}
            loadingMessages={loadingMsgs}
            onBack={() => setShowList(true)}
            onSend={sendMessage}
            onInputChange={handleInputChange}
            onToggleAI={toggleAI}
          />
        ) : (
          <EmptyChat />
        )}
      </div>

    </div>
  );
}
