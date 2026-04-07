import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, passwordConfirm);
        toast.success('Willkommen bei Alpha Collection!');
      } else {
        await login(email, password);
        toast.success('Erfolgreich angemeldet.');
      }
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Anmeldung fehlgeschlagen.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch">
      {/* ── Left Panel: Editorial ─────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0e0e0e] overflow-hidden">
        {/* Dot texture */}
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
              Das Wholesale<br />
              <span className="text-brand-200 italic">Precision</span> Portal.
            </h1>
            <p className="text-lg text-[#ababab] max-w-md font-body leading-relaxed">
              Zugang zu unserem kuratierten Saisonsortiment und globaler Distribution mit architektonischer Präzision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-[#131313] p-8 border border-[#484848]/20">
              <span className="material-symbols-outlined filled text-brand-200 mb-4">inventory_2</span>
              <div className="text-2xl font-bold tracking-tight text-white">4.2k+</div>
              <div className="text-[0.65rem] text-[#ababab] uppercase tracking-widest font-semibold">Artikel gelistet</div>
            </div>
            <div className="bg-[#131313] p-8 border border-[#484848]/20">
              <span className="material-symbols-outlined filled text-brand-200 mb-4">public</span>
              <div className="text-2xl font-bold tracking-tight text-white">120+</div>
              <div className="text-[0.65rem] text-[#ababab] uppercase tracking-widest font-semibold">Globale Lager</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ───────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <img src="/alpha_White_1.png" alt="Alpha Collection" className="h-8 w-auto" />
          </div>

          <div className="mb-12">
            <h2 className="text-[3.5rem] font-extrabold tracking-tighter text-ink uppercase leading-none font-headline">
              {isRegister ? 'Registrierung' : 'Partner Login'}
            </h2>
            <p className="text-ink-variant font-body mt-4">
              {isRegister ? 'Erstellen Sie Ihr Händlerkonto.' : 'Geben Sie Ihre Händler-Zugangsdaten ein.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {isRegister && (
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
                <label className="label-caps">Firmen-Email / Benutzername</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-[3px] bg-brand-300 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="einkauf@haendler.de"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-end mb-2 ml-1">
                  <label className="label-caps mb-0">Zugangstoken / Passwort</label>
                  {!isRegister && (
                    <a href="#" className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-500 hover:underline">
                      Vergessen?
                    </a>
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
                  />
                </div>
              </div>

              {isRegister && (
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
                    />
                  </div>
                </div>
              )}
            </div>

            {!isRegister && (
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
                  <span>{isRegister ? 'Konto erstellen' : 'Zum Dashboard anmelden'}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-semibold text-ink-variant hover:text-brand-500 transition-colors"
            >
              {isRegister ? 'Bereits registriert? Jetzt anmelden' : 'Noch kein Konto? Jetzt registrieren'}
            </button>
          </div>

          <div className="mt-16 pt-16 border-t border-surface-low flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-outline">Vertraut von</span>
              <div className="h-[1px] flex-grow mx-4 bg-surface-low" />
            </div>
            <div className="flex justify-between opacity-40 grayscale gap-6 overflow-hidden">
              <span className="font-headline font-black text-lg">MODERNIST</span>
              <span className="font-headline font-black text-lg">STRUX</span>
              <span className="font-headline font-black text-lg">KINETIC</span>
              <span className="font-headline font-black text-lg">BASE</span>
            </div>
          </div>
        </div>

        <footer className="mt-auto py-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em] text-ink-outline max-w-md mx-auto w-full">
          <div>© 2024 Alpha Collection</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-ink transition-colors">Impressum</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
