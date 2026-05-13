import { useState, useRef, useEffect } from "react";
import { Search, MoreVertical, Phone, Video, Bot, User, ArrowLeft, MessageSquare, Send, Plus } from "lucide-react";
import { cn, Input, Button } from "../../components/ui";

const API = "http://localhost:5000/api";

type Message = {
  _id?: string;
  text: string;
  sender: "user" | "bot";
  createdAt?: string;
  time?: string;
};

type Conversation = {
  _id: string;
  phone: string;
  name: string;
  lastMessage: string;
  status: "ai_active" | "human_needed";
  unread: number;
  updatedAt: string;
  messages?: Message[];
};

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = diffMs / 3600000;
  if (diffHrs < 1) return `${Math.round(diffMs / 60000)}m ago`;
  if (diffHrs < 24) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [showNewConv, setShowNewConv] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const loadConversations = async () => {
    setLoadingConvs(true);
    try {
      const res = await fetch(`${API}/conversations`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  };

  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setIsMobileListVisible(false);
    setInputText("");
    setLoadingMsgs(true);
    try {
      const res = await fetch(`${API}/conversations/${conv._id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(data.messages || []);
      setActiveConv(data);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const createConversation = async () => {
    if (!newPhone.trim()) return;
    try {
      const res = await fetch(`${API}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone.trim(), name: newName.trim() || newPhone.trim() }),
      });
      if (!res.ok) throw new Error();
      const conv = await res.json();
      setConversations(prev => [conv, ...prev]);
      setShowNewConv(false);
      setNewPhone("");
      setNewName("");
      await selectConversation(conv);
    } catch {
      alert("Failed to create conversation.");
    }
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !activeConv) return;

    const optimisticUser: Message = { text, sender: "user", time: nowTime() };
    setMessages(prev => [...prev, optimisticUser]);
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setIsTyping(true);
    try {
      const res = await fetch(`${API}/conversations/${activeConv._id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const botMsg: Message = {
        _id: data.botMessage?._id,
        text: data.reply ?? "No response",
        sender: "bot",
        time: nowTime(),
      };
      setMessages(prev => {
        const withoutOptimistic = prev.slice(0, -1);
        return [
          ...withoutOptimistic,
          data.userMessage ? { ...data.userMessage, time: nowTime() } : optimisticUser,
          botMsg,
        ];
      });
      setConversations(prev =>
        prev.map(c => c._id === activeConv._id ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() } : c)
      );
    } catch {
      setMessages(prev => [
        ...prev,
        { text: "⚠️ Could not reach the server. Please check your backend.", sender: "bot", time: nowTime() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
  };

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="h-[calc(100vh-8rem)] -m-4 sm:-m-6 lg:-m-8 bg-white flex overflow-hidden border-t border-slate-200">

      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 bg-white z-10",
        isMobileListVisible ? "flex" : "hidden md:flex"
      )}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Conversations</h2>
            <button
              onClick={() => setShowNewConv(v => !v)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              title="New Conversation"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {showNewConv && (
            <div className="mb-3 p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
              <Input
                placeholder="Phone number *"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
              />
              <Input
                placeholder="Customer name (optional)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={createConversation} className="flex-1">Start</Button>
                <Button size="sm" variant="outline" onClick={() => setShowNewConv(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9 bg-slate-50"
              placeholder="Search chats..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs && (
            <div className="text-center py-8 text-slate-400 text-sm">
              <div className="inline-block w-5 h-5 border-2 border-slate-200 border-t-[#25D366] rounded-full animate-spin mb-2" />
              <p>Loading…</p>
            </div>
          )}

          {!loadingConvs && filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 px-4">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No conversations yet.</p>
              <p className="text-xs mt-1">Click + to start one.</p>
            </div>
          )}

          {!loadingConvs && filtered.map(conv => (
            <div
              key={conv._id}
              onClick={() => selectConversation(conv)}
              className={cn(
                "p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50",
                activeConv?._id === conv._id ? "bg-slate-50" : ""
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-slate-900 truncate pr-2">{conv.name}</h3>
                <span className="text-xs text-slate-500 whitespace-nowrap">{formatTime(conv.updatedAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600 truncate pr-4">{conv.lastMessage || "No messages yet"}</p>
                {conv.unread > 0 && (
                  <span className="bg-[#25D366] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1">
                {conv.status === "ai_active" ? (
                  <span className="inline-flex items-center text-[10px] font-medium text-[#25D366] bg-[#25D366]/10 px-1.5 py-0.5 rounded">
                    <Bot className="w-3 h-3 mr-1" /> AI Active
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    <User className="w-3 h-3 mr-1" /> Handover Needed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex-col bg-[#E5DDD5] relative",
        !isMobileListVisible ? "flex" : "hidden md:flex"
      )}>
        {activeConv ? (
          <>
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
                  onClick={() => setIsMobileListVisible(true)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-600 shrink-0">
                  {activeConv.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{activeConv.name}</h3>
                  <p className="text-xs text-slate-500">{activeConv.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full hidden sm:block"><Video className="w-5 h-5" /></button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full hidden sm:block"><Phone className="w-5 h-5" /></button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* AI Banner */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 p-2 flex justify-between items-center px-4 shrink-0">
              <div className="flex items-center gap-2">
                <Bot className={cn("w-4 h-4", activeConv.status === "ai_active" ? "text-[#25D366]" : "text-slate-400")} />
                <span className="text-sm font-medium text-slate-700">
                  {activeConv.status === "ai_active" ? "AI is managing this chat" : "AI paused — Human taking over"}
                </span>
              </div>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md">
                {activeConv.status === "ai_active" ? "Take Over" : "Resume AI"}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <span className="text-xs font-medium text-slate-500 bg-white/60 px-2 py-1 rounded-md">
                  {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {loadingMsgs && (
                <div className="text-center py-6 text-slate-400 text-sm">Loading messages…</div>
              )}

              {!loadingMsgs && messages.map((msg, i) => (
                <div key={msg._id || i} className={cn("flex", msg.sender === "user" ? "justify-start" : "justify-end")}>
                  <div className={cn(
                    "rounded-lg p-3 max-w-[85%] sm:max-w-[70%] shadow-sm",
                    msg.sender === "user" ? "bg-white" : "bg-[#DCF8C6]"
                  )}>
                    <p className="text-sm text-slate-900 whitespace-pre-line">{msg.text}</p>
                    <span className={cn(
                      "text-[10px] block text-right mt-1",
                      msg.sender === "user" ? "text-slate-400" : "text-slate-500"
                    )}>
                      {msg.time || (msg.createdAt ? formatTime(msg.createdAt) : "")}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-end">
                  <div className="bg-[#DCF8C6] rounded-lg px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white z-10 shrink-0">
              <div className="flex items-end gap-2 bg-slate-50 rounded-xl p-2 border border-slate-200">
                <textarea
                  ref={textareaRef}
                  className="flex-1 max-h-32 min-h-[40px] bg-transparent resize-none focus:outline-none py-2 text-sm text-slate-900"
                  placeholder="Simulate a customer message…"
                  rows={1}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center text-white shrink-0 hover:bg-[#075E54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">BookFlow Web</h3>
            <p className="max-w-md text-sm">Select a conversation to view messages. Use the + button to start a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
