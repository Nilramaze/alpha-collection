import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') ?? '';
  const emailParam = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!token || !emailParam) {
      toast.error('Ungültiger Reset-Link.');
      navigate('/login', { replace: true });
    }
  }, [token, emailParam, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error('Die Passwörter stimmen nicht überein.');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword(emailParam, token, password, passwordConfirm);
      setDone(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Fehler beim Zurücksetzen.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Left panel */}
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
              Neues<br />
              <span className="text-brand-200 italic">Passwort</span><br />
              vergeben.
            </h1>
            <p className="text-lg text-[#ababab] max-w-md font-body leading-relaxed">
              Wählen Sie ein sicheres Passwort für Ihr Händlerkonto.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-2/3 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-8">
            <img src="/alpha_White_1.png" alt="Alpha Collection" className="h-8 w-auto" />
          </div>

          {done ? (
            <div>
              <div className="w-12 h-12 bg-brand-200/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-brand-500 text-2xl">check_circle</span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tighter text-ink uppercase leading-none font-headline mb-4">
                Passwort gesetzt
              </h2>
              <p className="text-sm text-ink-variant leading-relaxed mb-8">
                Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
              </p>
              <Link to="/login" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">login</span>
                <span>Zur Anmeldung</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-[3rem] font-extrabold tracking-tighter text-ink uppercase leading-none font-headline">
                  Passwort zurücksetzen
                </h2>
                <p className="text-ink-variant font-body mt-4 text-sm leading-relaxed">
                  Für <span className="font-semibold text-ink">{emailParam}</span>. Wählen Sie ein neues sicheres Passwort (min. 8 Zeichen).
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label className="label-caps">Neues Passwort</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-brand-300 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Mindestens 8 Zeichen"
                      required
                      minLength={8}
                      autoFocus
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute inset-y-0 right-3 flex items-center text-ink-faint hover:text-ink transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPw ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className="label-caps">Passwort bestätigen</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-brand-300 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="input-field"
                      placeholder="••••••••••••"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                  {passwordConfirm && password !== passwordConfirm && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">Die Passwörter stimmen nicht überein.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password || password !== passwordConfirm}
                  className="btn-primary w-full py-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Wird gespeichert...</span>
                  ) : (
                    <>
                      <span>Passwort speichern</span>
                      <span className="material-symbols-outlined text-lg">lock_reset</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-xs font-semibold text-ink-variant hover:text-brand-500 transition-colors">
                  Zurück zur Anmeldung
                </Link>
              </div>
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
