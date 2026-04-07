import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Message } from '../../types';
import toast from 'react-hot-toast';

interface AdminMessage extends Message {
  user?: { id: number; name: string; email: string };
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/messages', { params: { status: filterStatus || undefined } });
      setMessages(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const handleReply = async (msg: AdminMessage) => {
    setSaving(msg.id);
    try {
      await api.patch(`/admin/messages/${msg.id}`, {
        admin_reply: replyText[msg.id] ?? msg.admin_reply ?? '',
        status: 'closed',
      });
      toast.success('Antwort gespeichert.');
      load();
    } catch {
      toast.error('Fehler beim Speichern.');
    } finally { setSaving(null); }
  };

  const toggleStatus = async (msg: AdminMessage) => {
    await api.patch(`/admin/messages/${msg.id}`, { status: msg.status === 'open' ? 'closed' : 'open' });
    load();
  };

  return (
    <div>
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-ink font-headline">Nachrichten</h1>
          <p className="text-ink-variant mt-1">{messages.length} Nachrichten</p>
        </div>
        <div className="flex gap-2">
          {[['', 'Alle'], ['open', 'Offen'], ['closed', 'Geschlossen']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors ${filterStatus === val ? 'bg-brand-200 border-brand-200 text-brand-800' : 'border-surface-low text-ink-variant hover:border-ink-outline'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white animate-pulse" />)
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-ink-variant">Keine Nachrichten gefunden.</div>
        ) : messages.map((msg) => (
          <div key={msg.id} className="bg-white">
            <button
              onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface/50 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${msg.status === 'open' ? 'bg-brand-300' : 'bg-surface-high'}`} />
              <span className="font-semibold text-ink flex-1">{msg.subject}</span>
              <span className="text-xs text-ink-variant hidden sm:block">{msg.user?.name}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${msg.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-surface-low text-ink-outline'}`}>
                {msg.status === 'open' ? 'Offen' : 'Geschlossen'}
              </span>
              <span className="text-xs text-ink-outline">{new Date(msg.created_at).toLocaleDateString('de-DE')}</span>
              <span className="material-symbols-outlined text-ink-faint text-[18px]">
                {expanded === msg.id ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {expanded === msg.id && (
              <div className="border-t border-surface-low px-5 py-5 space-y-4">
                <div>
                  <p className="label-caps mb-1">Von</p>
                  <p className="text-sm text-ink">{msg.user?.name} &lt;{msg.user?.email}&gt;</p>
                </div>
                <div>
                  <p className="label-caps mb-1">Nachricht</p>
                  <p className="text-sm text-ink-variant leading-relaxed">{msg.content}</p>
                </div>
                <div>
                  <p className="label-caps mb-1">Antwort</p>
                  <textarea
                    rows={3}
                    className="input-field resize-none text-sm w-full"
                    placeholder="Antwort verfassen..."
                    value={replyText[msg.id] ?? msg.admin_reply ?? ''}
                    onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleReply(msg)} disabled={saving === msg.id}
                    className="btn-primary px-5 py-2.5 disabled:opacity-50">
                    {saving === msg.id ? 'Speichern...' : 'Antworten & schließen'}
                  </button>
                  <button onClick={() => toggleStatus(msg)}
                    className="px-5 py-2.5 border border-surface-low text-ink-variant hover:bg-surface-low transition-colors text-sm font-semibold">
                    {msg.status === 'open' ? 'Als geschlossen markieren' : 'Wieder öffnen'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
