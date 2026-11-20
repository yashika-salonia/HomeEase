import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, User as UserIcon, Briefcase } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../services/api';
import type { UserRole } from '../types';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole: UserRole =
    searchParams.get('role') === 'worker' ? 'worker' : 'customer';

  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (location.trim().length < 2) {
      setError('Please enter your city or neighbourhood.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { user } = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        location: location.trim(),
        role,
      });

      showToast(`Account created! Welcome to HomeEase, ${user.name}.`, 'success');

      if (user.role === 'worker') {
        navigate('/worker/profile-setup', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed. Please check your inputs.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#252B29]">
              Create Your HomeEase Account
            </h1>
            <p className="mt-1.5 text-sm text-[#5C6662]">
              Register as a customer to book verified local services, or join as a worker to
              receive job requests.
            </p>
          </div>

          {/* Role Selector */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-[#252B29]">
              Select Account Role
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                aria-pressed={role === 'customer'}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  role === 'customer'
                    ? 'border-[#174C3C] bg-[#E8F0ED]/60'
                    : 'border-[#E2E5DF] bg-white hover:border-[#174C3C]/40'
                }`}
              >
                <div className="flex items-center gap-2 font-display font-semibold text-sm text-[#252B29]">
                  <UserIcon className="w-4 h-4 text-[#174C3C]" aria-hidden="true" />
                  <span>Customer</span>
                </div>
                <p className="mt-1 text-xs text-[#5C6662]">
                  Search workers, book home services, and track bookings.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('worker')}
                aria-pressed={role === 'worker'}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  role === 'worker'
                    ? 'border-[#174C3C] bg-[#E8F0ED]/60'
                    : 'border-[#E2E5DF] bg-white hover:border-[#174C3C]/40'
                }`}
              >
                <div className="flex items-center gap-2 font-display font-semibold text-sm text-[#252B29]">
                  <Briefcase className="w-4 h-4 text-[#174C3C]" aria-hidden="true" />
                  <span>Service Worker</span>
                </div>
                <p className="mt-1 text-xs text-[#5C6662]">
                  Create your trade profile, set rates, and manage jobs.
                </p>
              </button>
            </div>
          </fieldset>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="block text-sm font-medium text-[#252B29]">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Rao"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="block text-sm font-medium text-[#252B29]">
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-phone" className="block text-sm font-medium text-[#252B29]">
                  Phone Number
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] font-mono tabular-nums focus:outline-none focus:border-[#174C3C]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="reg-location"
                  className="block text-sm font-medium text-[#252B29]"
                >
                  Location / Neighbourhood
                </label>
                <input
                  id="reg-location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Model Town, Ambala City"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-[#252B29]"
                >
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-sm font-medium text-[#252B29]"
                >
                  Confirm Password
                </label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting
                ? 'Creating Account...'
                : role === 'worker'
                ? 'Create Worker Account & Set Up Profile'
                : 'Create Customer Account'}
            </button>
          </form>

          <p className="text-sm text-[#5C6662] text-center pt-2 border-t border-[#E2E5DF]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#174C3C] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
