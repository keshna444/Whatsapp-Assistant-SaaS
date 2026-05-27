import { useState, useEffect, useCallback } from 'react';
import { cn } from '../../components/ui';
import { ConversationList } from './Conversations/ConversationList';
import { ChatWindow } from './Conversations/ChatWindow';
import { EmptyChat } from './Conversations/EmptyChat';
import { conversationsApi } from '../../services/conversations';
import type { Conversation, Message } from '../../types/conversations';

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showList, setShowList] = useState(true);

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

  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setShowList(false);
    setInputText('');
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

  const createConversation = async (phone: string, name: string) => {
    const conv = await conversationsApi.create(phone, name || phone);
    setConversations(prev => [conv, ...prev]);
    await selectConversation(conv);
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !activeConv) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimistic: Message = { text, sender: 'user', time: now };

    setMessages(prev => [...prev, optimistic]);
    setInputText('');
    setIsTyping(true);

    try {
      const data = await conversationsApi.sendMessage(activeConv._id, text);
      const botMsg: Message = {
        _id: data.botMessage?._id,
        text: data.reply,
        sender: 'bot',
        time: now,
      };

      setMessages(prev => [
        ...prev.slice(0, -1),
        data.userMessage ?? optimistic,
        botMsg,
      ]);

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
    } finally {
      setIsTyping(false);
    }
  };

  const toggleAI = () => {
    if (!activeConv) return;
    const newStatus = activeConv.status === 'ai_active' ? 'human_needed' : 'ai_active';
    const updated: Conversation = { ...activeConv, status: newStatus };
    setActiveConv(updated);
    setConversations(prev =>
      prev.map(c => (c._id === activeConv._id ? { ...c, status: newStatus } : c))
    );
  };

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
            onInputChange={setInputText}
            onToggleAI={toggleAI}
          />
        ) : (
          <EmptyChat />
        )}
      </div>

    </div>
  );
}
