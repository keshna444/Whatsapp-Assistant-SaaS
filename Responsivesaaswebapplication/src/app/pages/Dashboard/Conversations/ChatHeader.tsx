import { ArrowLeft, Phone, Video, MoreVertical, Bot } from 'lucide-react';
import { cn } from '../../../components/ui';
import type { Conversation } from '../../../types/conversations';

type Props = {
  conversation: Conversation;
  onBack: () => void;
  onToggleAI: () => void;
};

export function ChatHeader({ conversation: conv, onBack, onToggleAI }: Props) {
  const displayName = conv.name || conv.phone;
  const isAiActive = conv.status === 'ai_active';

  return (
    <>
      {/* Main header row */}
      <div className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={onBack}
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-slate-500 flex items-center justify-center font-semibold text-white shrink-0 text-sm select-none">
            {displayName.substring(0, 2).toUpperCase()}
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">{displayName}</h3>
            <p className="text-xs text-slate-400">{conv.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors hidden sm:flex" aria-label="Video call">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors hidden sm:flex" aria-label="Phone call">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors" aria-label="More options">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI status banner */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className={cn('w-3.5 h-3.5', isAiActive ? 'text-[#25D366]' : 'text-slate-400')} />
          <span className="text-xs font-medium text-slate-600">
            {isAiActive ? 'AI is managing this conversation' : 'AI paused — human assistance needed'}
          </span>
        </div>

        <button
          onClick={onToggleAI}
          className={cn(
            'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
            isAiActive
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20'
          )}
        >
          {isAiActive ? 'Take Over' : 'Resume AI'}
        </button>
      </div>
    </>
  );
}
