import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

type View = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (view === 'register') {
        await register(name, email, password, passwordConfirm);
        toast.success('Willkommen bei Alpha Collection!');
      } else {
        await login(email, password);
        toast.success('Erfolgreich angemeldet.');
      }
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.identifier?.[0] || 'Anmeldung fehlgeschlagen.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Fehler beim Senden.');
    } finally {
      setIsLoading(false);
    }
  };

  const leftPanel = (
    <div className="hidden lg:flex lg:w-1/3 relative bg-[#0e0e0e] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(#8eff71 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
      }} />
      <div className="relative z-10 p-24 flex flex-col justify-between w-full">
        <div>
          <div className="mb-16">
            <img src="/alpha_White_1.png" alt="Alpha Collection" className="h-10 w-auto" />
          </div>
          <h1 className="text-6xl font-extrabold tracking-tighter text-white mb-8 leading-[0.95] font-headline">
            Alpha<span className="text-brand-200 italic">Collection</span>
          </h1>
          <p className="text-lg text-[#ababab] max-w-md font-body leading-relaxed">
            Zugang zu unserem kuratierten Saisonsortiment und globaler Distribution mit architektonischer Präzision.
          </p>
        </div>
      </div>
    </div>
  );

  // ── Forgot Password View ──────────────────────────────────
  if (view === 'forgot') {
    return (
      <div className="min-h-screen flex items-stretch">
        {leftPanel}
        <div className="w-full lg:w-2/3 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="lg:hidden mb-8">
              <img src="/alpha_White_1.png" alt="Alpha Collection" className="h-8 w-auto" />
            </div>

            <button
              onClick={() => { setView('login'); setForgotSent(false); setForgotEmail(''); }}
              className="flex items-center gap-1 text-xs font-bold text-ink-variant hover:text-ink transition-colors mb-8"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Zurück zur Anmeldung
            </button>

            {forgotSent ? (
              <div>
                <div className="w-12 h-12 bg-brand-200/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-brand-500 text-2xl">mark_email_read</span>
                </div>
                <h2 className="text-4xl font-extrabold tracking-tighter text-ink uppercase leading-none font-headline mb-4">
                  E-Mail gesendet
                </h2>
                <p className="text-sm text-ink-variant leading-relaxed mb-8">
                  Falls ein Konto mit <span className="font-semibold text-ink">{forgotEmail}</span> existiert, haben wir einen Reset-Link geschickt. Bitte prüfen Sie auch Ihren Spam-Ordner.
                </p>
                <p className="text-xs text-ink-faint mb-6">Der Link ist 60 Minuten gültig.</p>
                <button
                  onClick={() => { setView('login'); setForgotSent(false); setForgotEmail(''); }}
                  className="btn-primary w-full py-4"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Zur Anmeldung</span>
                </button>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <h2 className="text-[3rem] font-extrabold tracking-tighter text-ink uppercase leading-none font-headline">
                    Passwort vergessen
                  </h2>
                  <p className="text-ink-variant font-body mt-4 text-sm leading-relaxed">
                    Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
                  </p>
                </div>

                <form onSubmit={handleForgot} className="space-y-6">
                  <div className="group">
                    <label className="label-caps">E-Mail-Adresse</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 w-[3px] bg-brand-300 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="input-field"
                        placeholder="einkauf@haendler.de"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Wird gesendet...</span>
                    ) : (
                      <>
                        <span>Reset-Link senden</span>
                        <span className="material-symbols-outlined text-lg">send</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <footer className="mt-auto py-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em] text-ink-outline max-w-md mx-auto w-full">
            <div>© 2024 Alpha Collection</div>
            <div className="flex gap-6">
              <Link to="/impressum" className="hover:text-ink transition-colors">Impressum</Link>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // ── Login / Register View ─────────────────────────────────
  return (
    <div className="min-h-screen flex items-stretch">
      {leftPanel}

      <div className="w-full lg:w-2/3 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-8">
            <img src="/alpha_White_1.png" alt="Alpha Collection" className="h-8 w-auto" />
          </div>

          <div className="mb-12">
            <h2 className="text-[3.5rem] font-extrabold tracking-tighter text-ink uppercase leading-none font-headline">
              {view === 'register' ? 'Registrierung' : 'Partner Login'}
            </h2>
            <p className="text-ink-variant font-body mt-4">
              {view === 'register' ? 'Erstellen Sie Ihr Händlerkonto.' : 'Geben Sie Ihre Händler-Zugangsdaten ein.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {view === 'register' && (
                <div className="group">
                  <label className="label-caps">Firmenname</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-brand-300 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="Musterfirma GmbH"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="group">
                <label className="label-caps">E-Mail oder Benutzername</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-[3px] bg-brand-300 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="einkauf@haendler.de oder benutzername"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-end mb-2 ml-1">
                  <label className="label-caps mb-0">Passwort</label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-500 hover:underline"
                    >
                      Vergessen?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-[3px] bg-brand-300 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••••••"
                    required
                    autoComplete={view === 'register' ? 'new-password' : 'current-password'}
                  />
                </div>
              </div>

              {view === 'register' && (
                <div className="group">
                  <label className="label-caps">Passwort bestätigen</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-brand-300 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="input-field"
                      placeholder="••••••••••••"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}
            </div>

            {view === 'login' && (
              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" id="remember" className="w-4 h-4 border-none bg-surface-high text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <label htmlFor="remember" className="text-xs font-medium text-ink-variant cursor-pointer select-none">
                  Dieses Gerät 30 Tage merken
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-pulse">Wird geladen...</span>
              ) : (
                <>
                  <span>{view === 'register' ? 'Konto erstellen' : 'Zum Dashboard anmelden'}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setView(view === 'register' ? 'login' : 'register')}
              className="text-xs font-semibold text-ink-variant hover:text-brand-500 transition-colors"
            >
              {view === 'register' ? 'Bereits registriert? Jetzt anmelden' : 'Noch kein Konto? Jetzt registrieren'}
            </button>
          </div>

        </div>

        <footer className="mt-auto py-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em] text-ink-outline max-w-md mx-auto w-full">
          <div>© 2024 Alpha Collection</div>
          <div className="flex gap-6">
            <Link to="/impressum" className="hover:text-ink transition-colors">Impressum</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
