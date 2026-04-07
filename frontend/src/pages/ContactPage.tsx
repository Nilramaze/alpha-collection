import { useEffect, useState, FormEvent } from 'react';
import { messageApi } from '../services/api';
import type { Message } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ContactPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    messageApi.list().then(({ data }) => setMessages(data.data)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await messageApi.create(subject, content);
      setMessages((prev) => [data.data, ...prev]);
      setSubject('');
      setContent('');
      setShowForm(false);
      toast.success('Nachricht erfolgreich gesendet.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Fehler beim Senden.');
    } finally { setSending(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-ink font-headline">Kontakt & Nachrichten</h1>
          <p className="text-sm text-ink-variant mt-1">Kommunizieren Sie direkt mit unserem Vertriebsteam.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary py-3 px-6">
          <span className="material-symbols-outlined text-base">{showForm ? 'close' : 'edit'}</span>
          <span>{showForm ? 'Abbrechen' : 'Neue Nachricht'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 mb-8">
          <h3 className="text-lg font-extrabold tracking-tight text-ink font-headline mb-6">Neue Nachricht</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-caps">Betreff</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                className="input-field" placeholder="z.B. Anfrage zu Großbestellung" required />
            </div>
            <div>
              <label className="label-caps">Nachricht</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                className="input-field resize-none" rows={5} placeholder="Ihre Nachricht an unser Team..." required />
            </div>
            <button type="submit" disabled={sending} className="btn-primary py-3 px-8 disabled:opacity-50">
              {sending ? <span className="animate-pulse">Wird gesendet...</span> : <><span className="material-symbols-outlined text-base">send</span><span>Nachricht senden</span></>}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-surface-low animate-pulse" />)}</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 bg-white">
          <span className="material-symbols-outlined text-6xl text-ink-faint/20 mb-4">chat_bubble</span>
          <p className="text-ink-variant">Noch keine Nachrichten.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-ink font-headline">{msg.subject}</h4>
                  <span className="text-[10px] text-ink-outline">
                    {new Date(msg.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className={clsx('text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1',
                  msg.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800')}>
                  {msg.status === 'open' ? 'Offen' : 'Beantwortet'}
                </span>
              </div>
              <p className="text-sm text-ink-variant leading-relaxed">{msg.content}</p>
              {msg.admin_reply && (
                <div className="mt-4 pt-4 border-t border-surface-low">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-brand-500 text-sm">support_agent</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-500">Antwort vom Team</span>
                  </div>
                  <p className="text-sm text-ink leading-relaxed">{msg.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
