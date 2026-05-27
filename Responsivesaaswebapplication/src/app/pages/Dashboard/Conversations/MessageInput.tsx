import { useRef } from 'react';
import { Send } from 'lucide-react';

type Props = {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function MessageInput({ value, onChange, onSend, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-3 bg-white border-t border-slate-200 shrink-0">
      <div className="flex items-end gap-2 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200 focus-within:border-[#25D366] transition-colors">
        <textarea
          ref={textareaRef}
          className="flex-1 max-h-32 min-h-[36px] bg-transparent resize-none focus:outline-none text-sm text-slate-900 placeholder-slate-400 py-1 leading-relaxed"
          placeholder="Type a message…"
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="Message input"
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="w-9 h-9 rounded-full bg-[#128C7E] flex items-center justify-center text-white shrink-0 hover:bg-[#075E54] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
      <p className="text-[10px] text-slate-400 text-center mt-1.5 select-none">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
