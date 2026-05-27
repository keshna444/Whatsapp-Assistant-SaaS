import { cn } from '../../../components/ui';
import type { Message } from '../../../types/conversations';

type Props = {
  message: Message;
};

function resolveTime(msg: Message): string {
  if (msg.time) return msg.time;
  if (msg.createdAt) {
    return new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return '';
}

export function MessageBubble({ message: msg }: Props) {
  const isCustomer = msg.sender === 'user';

  return (
    <div className={cn('flex', isCustomer ? 'justify-start' : 'justify-end')}>
      <div className={cn(
        'rounded-2xl px-4 py-2.5 max-w-[80%] sm:max-w-[65%] shadow-sm',
        isCustomer
          ? 'bg-white rounded-tl-none'
          : 'bg-[#DCF8C6] rounded-tr-none'
      )}>
        <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{msg.text}</p>
        <span className={cn(
          'text-[10px] block text-right mt-0.5',
          isCustomer ? 'text-slate-400' : 'text-slate-500'
        )}>
          {resolveTime(msg)}
        </span>
      </div>
    </div>
  );
}
