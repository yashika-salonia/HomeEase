import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../services/api';

const DEMO_CREDENTIALS = [
  { label: 'Customer — Aarav Mehta', email: 'customer@homeease.demo', password: 'Password@123' },
  { label: 'Cook — Rekha Joshi', email: 'rekha.cook@homeease.demo', password: 'Worker@101' },
  { label: 'Cleaner — Pooja Verma', email: 'pooja.cleaner@homeease.demo', password: 'Worker@102' },
  { label: 'Plumber — Deepak Tiwari', email: 'deepak.plumber@homeease.demo', password: 'Worker@103' },
  { label: 'Electrician — Arjun Nair', email: 'arjun.electrician@homeease.demo', password: 'Worker@104' },
  { label: 'Carpenter — Harish Vishwakarma', email: 'harish.carpenter@homeease.demo', password: 'Worker@105' },
  { label: 'Painter — Manoj Saini', email: 'manoj.painter@homeease.demo', password: 'Worker@106' },
  { label: 'Construction Labour — Santosh Chauhan', email: 'santosh.labour@homeease.demo', password: 'Worker@107' },
  { label: 'Cook & Cleaner — Savita Pawar', email: 'savita.helper@homeease.demo', password: 'Worker@108' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fromPath = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      const { user, hasWorkerProfile } = await login(email.trim(), password);
      showToast(`Welcome back, ${user.name}!`, 'success');

      if (fromPath && !fromPath.startsWith('/login') && !fromPath.startsWith('/register')) {
        if (
          (user.role === 'customer' && !fromPath.startsWith('/worker')) ||
          (user.role === 'worker' && !fromPath.startsWith('/customer'))
        ) {
          navigate(fromPath, { replace: true });
          return;
        }
      }

      if (user.role === 'worker') {
        navigate(hasWorkerProfile ? '/worker/dashboard' : '/worker/profile-setup', {
          replace: true,
        });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Login Card */}
          <div className="lg:col-span-6 bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#252B29]">
                Sign in to HomeEase
              </h1>
              <p className="mt-1.5 text-sm text-[#5C6662]">
                Access your customer bookings, Digital Booking Logbook, or worker job requests.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-sm font-medium text-[#252B29]">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C] focus:ring-2 focus:ring-[#174C3C]/15"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-[#252B29]"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C] focus:ring-2 focus:ring-[#174C3C]/15"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-sm text-[#5C6662] text-center pt-2 border-t border-[#E2E5DF]">
              New to HomeEase?{' '}
              <Link to="/register" className="font-semibold text-[#174C3C] hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {/* Demo Accounts Panel for Live Evaluation */}
          <div className="lg:col-span-6 bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-[#174C3C]">
              <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />
              <h2 className="font-display text-base font-semibold text-[#252B29]">
                Seeded Demo Accounts
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C6662] leading-relaxed">
              Click any account below to pre-fill the login form with that user&apos;s individual
              email and password for live customer-to-worker demonstration.
            </p>

            <div className="divide-y divide-[#E2E5DF] border border-[#E2E5DF] rounded-xl overflow-hidden">
              {DEMO_CREDENTIALS.map((acc) => (
                <div
                  key={acc.email}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#F8F8F3]/60 hover:bg-[#E8F0ED]/50 transition-colors"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-[#252B29] truncate">{acc.label}</p>
                    <p className="font-mono text-xs text-[#5C6662] break-all">
                      {acc.email}
                    </p>
                    <p className="font-mono text-xs text-[#174C3C]">
                      Password: {acc.password}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword(acc.password);
                      setError('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#174C3C] bg-white border border-[#174C3C]/30 rounded-md hover:bg-[#174C3C] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Use Account
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
