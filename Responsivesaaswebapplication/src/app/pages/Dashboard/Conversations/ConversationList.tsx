import { useState } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { Input, Button } from '../../../components/ui';
import { ConversationListItem } from './ConversationListItem';
import type { Conversation } from '../../../types/conversations';

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  loading: boolean;
  onSelect: (conv: Conversation) => void;
  onCreate: (phone: string, name: string) => Promise<void>;
};

export function ConversationList({ conversations, activeId, loading, onSelect, onCreate }: Props) {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const filtered = conversations.filter(c => {
    const q = search.toLowerCase();
    return (c.name ?? '').toLowerCase().includes(q) || c.phone.includes(search);
  });

  const handleCreate = async () => {
    if (!phone.trim()) return;
    setCreating(true);
    try {
      await onCreate(phone.trim(), name.trim());
      setShowNew(false);
      setPhone('');
      setName('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Conversations</h2>
          <button
            onClick={() => setShowNew(v => !v)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#25D366] transition-colors"
            title="New Conversation"
            aria-label="Start new conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showNew && (
          <div className="mb-3 p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
            <Input
              placeholder="Phone number *"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <Input
              placeholder="Customer name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={creating || !phone.trim()}
                className="flex-1"
              >
                {creating ? 'Starting…' : 'Start Chat'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowNew(false); setPhone(''); setName(''); }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            className="pl-9 bg-slate-50 h-9 text-sm"
            placeholder="Search conversations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            <div className="inline-block w-5 h-5 border-2 border-slate-200 border-t-[#25D366] rounded-full animate-spin mb-2" />
            <p>Loading conversations…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 px-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium text-slate-600">
              {search ? 'No results found' : 'No conversations yet'}
            </p>
            <p className="text-xs mt-1 opacity-70">
              {search ? 'Try a different search' : 'Click + to start one'}
            </p>
          </div>
        ) : (
          filtered.map(conv => (
            <ConversationListItem
              key={conv._id}
              conversation={conv}
              isActive={activeId === conv._id}
              onClick={() => onSelect(conv)}
            />
          ))
        )}
      </div>
    </>
  );
}
