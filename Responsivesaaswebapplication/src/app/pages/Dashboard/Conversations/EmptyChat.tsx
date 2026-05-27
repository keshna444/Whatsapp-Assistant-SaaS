import { MessageSquare } from 'lucide-react';

export function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#E5DDD5]">
      <div className="w-20 h-20 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-sm">
        <MessageSquare className="w-9 h-9 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">Select a conversation</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
        Choose a conversation from the list to view messages, or click&nbsp;
        <span className="font-medium text-slate-600">+</span> to start a new one.
      </p>
    </div>
  );
}
