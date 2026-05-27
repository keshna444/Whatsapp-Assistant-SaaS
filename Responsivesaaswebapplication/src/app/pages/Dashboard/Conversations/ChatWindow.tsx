import { useRef, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import type { Conversation, Message } from '../../../types/conversations';

type Props = {
  conversation: Conversation;
  messages: Message[];
  inputText: string;
  isTyping: boolean;
  loadingMessages: boolean;
  onBack: () => void;
  onSend: () => void;
  onInputChange: (val: string) => void;
  onToggleAI: () => void;
};

export function ChatWindow({
  conversation,
  messages,
  inputText,
  isTyping,
  loadingMessages,
  onBack,
  onSend,
  onInputChange,
  onToggleAI,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <>
      <ChatHeader conversation={conversation} onBack={onBack} onToggleAI={onToggleAI} />

      {/* Message feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#E5DDD5]">
        {/* Date pill */}
        <div className="flex justify-center mb-1">
          <span className="text-[11px] font-medium text-slate-600 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {loadingMessages ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No messages yet. Send the first one below.
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={msg._id ?? i} message={msg} />
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-end">
            <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-none px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <MessageInput
        value={inputText}
        onChange={onInputChange}
        onSend={onSend}
        disabled={isTyping}
      />
    </>
  );
}
