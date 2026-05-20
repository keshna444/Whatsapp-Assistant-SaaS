import { useState, useRef, useEffect } from "react";
import { Send, Check } from "lucide-react";
import { Step1Data } from "./Step1BusinessDetails";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

type Phase = "idle" | "date" | "time" | "done";

interface Props {
  step1Data: Step1Data;
  onGoToDashboard: () => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
}

export function SimulatedChat({ step1Data, activeStep: _activeStep, setActiveStep }: Props) {
  const firstService = step1Data.services.find((s) => s.name.trim()) ?? step1Data.services[0];
  const prefilledMessage = `Can I book a ${firstService?.name || "service"} for tomorrow?`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(prefilledMessage);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [showSuccess, setShowSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, quickReplies]);

  const addMessage = (role: "user" | "ai", text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, role, text },
    ]);
  };

  const handleSend = () => {
    if (!inputValue.trim() || phase !== "idle") return;

    const text = inputValue;
    setInputValue("");
    addMessage("user", text);
    setPhase("date");
    setActiveStep(2); // "Reads the message"

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setActiveStep(3); // "Checks availability"

      const svc = firstService;
      const price = svc?.price ? `${step1Data.currencySymbol}${svc.price}` : "";
      const duration = svc?.duration ? `${svc.duration} mins` : "";
      const serviceDetail =
        price && duration ? ` (${duration}, ${price})` : duration || price ? ` (${duration || price})` : "";

      addMessage(
        "ai",
        `Hi! Thanks for reaching out to ${step1Data.businessName} 👋\n` +
          `I can book you in for a ${svc?.name || "service"}${serviceDetail}.\n\n` +
          `Which date works best for you?`
      );
      setQuickReplies(["Tomorrow", "Day after tomorrow", "Choose a different date"]);
    }, 1500);
  };

  const handleDateChoice = (choice: string) => {
    setQuickReplies([]);
    addMessage("user", choice);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "Perfect! And what time suits you?");
      setQuickReplies(["10:00 AM", "12:00 PM", "3:00 PM"]);
      setPhase("time");
    }, 1000);
  };

  const handleTimeChoice = (time: string) => {
    setQuickReplies([]);
    addMessage("user", time);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      addMessage(
        "ai",
        `You're booked! ✅\n` +
          `${firstService?.name || "Service"} tomorrow at ${time}\n` +
          `You'll receive a reminder 2 hours before. See you then! 🎉`
      );
      setPhase("done");
      setActiveStep(4); // "Confirms the booking"
      setShowSuccess(true);
    }, 1200);
  };

  const handleQuickReply = (reply: string) => {
    if (phase === "date") handleDateChoice(reply);
    else if (phase === "time") handleTimeChoice(reply);
  };

  const initials = step1Data.businessName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "BF";

  return (
    <div className="space-y-3">
      {/* WhatsApp chat window */}
      <div
        className="rounded-xl overflow-hidden shadow-sm border border-slate-200 flex flex-col"
        style={{ height: 450 }}
      >
        {/* Header */}
        <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-sm">{initials}</span>
          </div>
          <div>
            <div className="text-white font-medium text-sm leading-tight">
              {step1Data.businessName || "Your Business AI"}
            </div>
            <div className="text-white/70 text-xs">Online</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 bg-[#E5DDD5] space-y-3 overflow-y-auto">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-3 max-w-[85%] shadow-sm text-sm">
                Hello! I'm your AI assistant for{" "}
                <strong>{step1Data.businessName || "your business"}</strong>. I'm ready to help
                your customers book appointments.
                <div className="text-[10px] text-gray-400 text-right mt-1.5">Now</div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg p-3 max-w-[85%] shadow-sm text-sm whitespace-pre-wrap leading-snug ${
                  msg.role === "user"
                    ? "bg-[#DCF8C6] text-slate-800"
                    : "bg-white text-slate-800"
                }`}
              >
                {msg.text}
                <div className="text-[10px] text-gray-400 text-right mt-1.5">Now</div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick reply pills */}
          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-1.5 rounded-full border border-[#25D366] text-[#25D366] text-sm font-medium bg-white hover:bg-[#25D366] hover:text-white transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="bg-[#F0F0F0] p-3 flex gap-2 shrink-0 border-t border-slate-200">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            disabled={phase !== "idle"}
            className="flex-1 h-10 rounded-full border border-slate-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: 16 }}
          />
          <button
            onClick={handleSend}
            disabled={phase !== "idle" || !inputValue.trim()}
            className="shrink-0 rounded-full w-10 h-10 flex items-center justify-center bg-[#128C7E] hover:bg-[#075E54] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send"
          >
            <Send className="w-4 h-4 text-white ml-0.5" />
          </button>
        </div>
      </div>

      {/* Success banner */}
      {showSuccess && (
        <div className="flex items-center gap-3 rounded-lg bg-green-500 text-white p-4 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Your AI just handled a booking automatically.</p>
        </div>
      )}
    </div>
  );
}
