import { Bot, User } from 'lucide-react';
import { cn } from '../../../components/ui';
import type { Conversation } from '../../../types/conversations';

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = diffMs / 3600000;
  if (diffHrs < 1) return `${Math.round(diffMs / 60000)}m ago`;
  if (diffHrs < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

type Props = {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
};

export function ConversationListItem({ conversation: conv, isActive, onClick }: Props) {
  const displayName = conv.name || conv.phone;

  return (
    <div
      onClick={onClick}
      className={cn(
        'px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 flex items-start gap-3',
        isActive && 'bg-slate-50 border-l-[3px] border-l-[#25D366]'
      )}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center font-semibold text-white shrink-0 text-xs">
        {displayName.substring(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-0.5">
          <h3 className="font-semibold text-slate-900 truncate pr-2 text-sm">{displayName}</h3>
          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{formatTime(conv.updatedAt)}</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 truncate pr-2">{conv.lastMessage || 'No messages yet'}</p>
          {conv.unread > 0 && (
            <span className="bg-[#25D366] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full shrink-0 px-1">
              {conv.unread}
            </span>
          )}
        </div>

        <div className="mt-1.5">
          {conv.status === 'ai_active' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#25D366] bg-[#25D366]/10 px-1.5 py-0.5 rounded">
              <Bot className="w-2.5 h-2.5" /> AI Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              <User className="w-2.5 h-2.5" /> Needs Attention
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
