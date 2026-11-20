import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Inbox,
  Hammer,
  CheckCircle2,
  BookOpenCheck,
  Star,
  Settings,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { DashboardLayout, type DashboardNavItem } from '../layouts/DashboardLayout';
import { StatusIndicator } from '../components/BookingTimeline';
import { DigitalLogbookPanel } from '../components/DigitalLogbookPanel';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AccountSettingsPanel } from '../components/AccountSettingsPanel';
import { bookingsApi, reviewsApi, workersApi, extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  SERVICE_CATEGORIES,
  type Booking,
  type BookingStats,
  type PricingType,
  type Review,
} from '../types';
import { formatDateTime, formatRate, formatServiceDate } from '../utils/filters';

export type WorkerSection =
  | 'overview'
  | 'profile'
  | 'requests'
  | 'active'
  | 'completed'
  | 'history'
  | 'reviews'
  | 'settings';

const EMPTY_STATS: BookingStats = {
  total: 0,
  pending: 0,
  accepted: 0,
  completed: 0,
  rejected: 0,
  cancelled: 0,
};

export function WorkerDashboardPage({ section }: { section: WorkerSection }) {
  const { user, workerProfile, hasWorkerProfile, setWorkerProfileState } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>(EMPTY_STATS);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Worker professional profile form state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Cook']);
  const [experience, setExperience] = useState('2');
  const [description, setDescription] = useState('');
  const [pricingType, setPricingType] = useState<PricingType>('hourly');
  const [price, setPrice] = useState('350');
  const [workingHours, setWorkingHours] = useState('8:00 AM – 7:00 PM (Mon – Sat)');
  const [availability, setAvailability] = useState(true);
  const [profileFormError, setProfileFormError] = useState('');
  const [savingWorkerProfile, setSavingWorkerProfile] = useState(false);

  // Confirm dialog state for Reject / Complete actions
  const [confirmState, setConfirmState] = useState<{
    booking: Booking;
    nextStatus: 'Rejected' | 'Completed';
  } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, reviewsRes, profileRes] = await Promise.all([
        bookingsApi.getMyBookings(),
        reviewsApi.getMyReviews(),
        workersApi.getMyProfile(),
      ]);
      setBookings(bookingsRes.bookings);
      setStats(bookingsRes.stats);
      setReviews(reviewsRes.reviews);
      setWorkerProfileState(profileRes.workerProfile);

      if (profileRes.workerProfile) {
        const p = profileRes.workerProfile;
        setSelectedCategories(p.serviceCategories);
        setExperience(String(p.experience));
        setDescription(p.description);
        setPricingType(p.pricingType);
        setPrice(String(p.price));
        setWorkingHours(p.workingHours);
        setAvailability(p.availability);
      }
    } catch (err) {
      showToast(extractErrorMessage(err, 'Failed to load worker workspace.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, setWorkerProfileState]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAcceptBooking = async (booking: Booking) => {
    setActionLoadingId(booking._id);
    try {
      await bookingsApi.updateStatus(booking._id, 'Accepted');
      showToast(`Booking ${booking.bookingId} accepted!`, 'success');
      await loadData();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not accept booking.'), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmWorkerAction = async (note?: string) => {
    if (!confirmState) return;
    setActionLoadingId(confirmState.booking._id);
    try {
      await bookingsApi.updateStatus(
        confirmState.booking._id,
        confirmState.nextStatus,
        note
      );
      showToast(
        `Booking ${confirmState.booking.bookingId} marked as ${confirmState.nextStatus}.`,
        'success'
      );
      setConfirmState(null);
      await loadData();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Failed to update booking status.'), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const triggerWorkerAction = (
    booking: Booking,
    nextStatus: 'Accepted' | 'Rejected' | 'Completed'
  ) => {
    if (nextStatus === 'Accepted') {
      handleAcceptBooking(booking);
    } else {
      setConfirmState({ booking, nextStatus });
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSaveWorkerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFormError('');

    if (selectedCategories.length === 0) {
      setProfileFormError('Please select at least one service category.');
      return;
    }
    if (description.trim().length < 15) {
      setProfileFormError('Please write a professional description (at least 15 characters).');
      return;
    }
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 50) {
      setProfileFormError('Service rate must be at least ₹50.');
      return;
    }

    setSavingWorkerProfile(true);
    try {
      const payload = {
        serviceCategories: selectedCategories,
        experience: Number(experience) || 0,
        description: description.trim(),
        pricingType,
        price: numericPrice,
        workingHours: workingHours.trim() || '8:00 AM – 7:00 PM (Mon – Sat)',
        availability,
      };

      const res = hasWorkerProfile
        ? await workersApi.updateProfile(payload)
        : await workersApi.createProfile(payload);

      setWorkerProfileState(res.workerProfile);
      showToast(
        hasWorkerProfile
          ? 'Professional worker profile updated!'
          : 'Worker profile published! Customers can now discover and book you.',
        'success'
      );

      if (!hasWorkerProfile) {
        navigate('/worker/dashboard');
      }
    } catch (err) {
      setProfileFormError(extractErrorMessage(err, 'Could not save worker profile.'));
    } finally {
      setSavingWorkerProfile(false);
    }
  };

  const pendingRequests = bookings.filter((b) => b.status === 'Pending');
  const activeJobs = bookings.filter((b) => b.status === 'Accepted');
  const completedJobs = bookings.filter((b) => b.status === 'Completed');

  const navItems: DashboardNavItem[] = [
    { label: 'Overview', to: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', to: '/worker/profile', icon: Briefcase },
    {
      label: 'Booking Requests',
      to: '/worker/requests',
      icon: Inbox,
      badgeCount: stats.pending,
    },
    {
      label: 'Active Jobs',
      to: '/worker/active',
      icon: Hammer,
      badgeCount: stats.accepted,
    },
    { label: 'Completed Jobs', to: '/worker/completed', icon: CheckCircle2 },
    { label: 'Booking History', to: '/worker/history', icon: BookOpenCheck },
    { label: 'Reviews', to: '/worker/reviews', icon: Star },
    { label: 'Settings', to: '/worker/settings', icon: Settings },
  ];

  const titles: Record<WorkerSection, { title: string; subtitle: string }> = {
    overview: {
      title: `Worker Overview · ${user?.name?.split(' ')[0] || 'Provider'}`,
      subtitle: 'Monitor incoming customer requests, active assignments, and rating performance.',
    },
    profile: {
      title: hasWorkerProfile ? 'My Professional Profile' : 'Complete Your Worker Profile',
      subtitle: 'Set your service categories, experience, hourly or daily rate, and availability.',
    },
    requests: {
      title: 'Incoming Booking Requests',
      subtitle: 'Review customer details and accept or decline new job requests.',
    },
    active: {
      title: 'Active Jobs',
      subtitle: 'Accepted bookings scheduled with customers. Mark completed once finished.',
    },
    completed: {
      title: 'Completed Jobs',
      subtitle: 'Archive of completed home service assignments.',
    },
    history: {
      title: 'Booking History',
      subtitle: 'Permanent HomeEase Digital Booking Logbook for your work.',
    },
    reviews: {
      title: 'Customer Reviews',
      subtitle: 'Verified ratings and written feedback from completed jobs.',
    },
    settings: {
      title: 'Account Settings',
      subtitle: 'Update your personal details, phone number, location, or password.',
    },
  };

  return (
    <DashboardLayout
      title={titles[section].title}
      subtitle={titles[section].subtitle}
      navItems={navItems}
      action={
        workerProfile ? (
          <Link
            to={`/workers/${workerProfile.id}`}
            className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-medium text-[#174C3C] bg-[#E8F0ED] rounded-lg hover:bg-[#D4E2DC] whitespace-nowrap"
          >
            View Public Profile
          </Link>
        ) : null
      }
    >
      {/* Profile Setup Alert Banner when worker hasn't created WorkerProfile yet */}
      {!loading && !hasWorkerProfile && section !== 'profile' && (
        <div className="mb-6 bg-white border border-[#F4A261] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#252B29]">
              Publish Your Professional Profile to Receive Bookings
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6662] mt-0.5">
              Add your service categories, experience, and hourly/daily rate so customers can
              discover you in Explore Workers.
            </p>
          </div>
          <Link
            to="/worker/profile"
            className="px-4 py-2.5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] whitespace-nowrap text-center"
          >
            Set Up Profile
          </Link>
        </div>
      )}

      {/* OVERVIEW */}
      {section === 'overview' && (
        <div className="space-y-8">
          <section
            aria-label="Worker dashboard statistics"
            className="grid grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {[
              { label: 'Total Requests', value: String(stats.total) },
              { label: 'Pending Requests', value: String(stats.pending) },
              { label: 'Accepted Jobs', value: String(stats.accepted) },
              { label: 'Completed Jobs', value: String(stats.completed) },
              {
                label: 'Average Rating',
                value:
                  workerProfile && workerProfile.averageRating > 0
                    ? `${workerProfile.averageRating.toFixed(1)} / 5`
                    : 'New',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-[#E2E5DF] rounded-xl p-5 space-y-1.5"
              >
                <p className="text-xs font-medium text-[#5C6662]">{stat.label}</p>
                <p className="font-mono text-2xl font-bold text-[#174C3C] tabular-nums">
                  {loading ? '—' : stat.value}
                </p>
              </div>
            ))}
          </section>

          {/* Pending Requests Preview */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#252B29]">
                Pending Booking Requests{!loading ? ` (${pendingRequests.length})` : ''}
              </h2>
              <Link
                to="/worker/requests"
                className="text-xs font-semibold text-[#174C3C] hover:underline"
              >
                View all requests
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="bg-white border border-[#E2E5DF] rounded-xl p-5 h-52 animate-pulse"
                  />
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="bg-white border border-[#E2E5DF] rounded-xl p-8 text-center text-sm text-[#5C6662]">
                No pending requests awaiting your decision right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {pendingRequests.slice(0, 4).map((b) => (
                  <BookingRequestCard
                    key={b._id}
                    booking={b}
                    busy={actionLoadingId === b._id}
                    onAccept={() => triggerWorkerAction(b, 'Accepted')}
                    onReject={() => triggerWorkerAction(b, 'Rejected')}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Active Jobs Preview */}
          {activeJobs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-[#252B29]">
                  Active Accepted Jobs ({activeJobs.length})
                </h2>
                <Link
                  to="/worker/active"
                  className="text-xs font-semibold text-[#174C3C] hover:underline"
                >
                  Manage active jobs
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {activeJobs.slice(0, 2).map((b) => (
                  <ActiveJobCard
                    key={b._id}
                    booking={b}
                    busy={actionLoadingId === b._id}
                    onComplete={() => triggerWorkerAction(b, 'Completed')}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* WORKER PROFESSIONAL PROFILE SETUP / EDIT */}
      {section === 'profile' && (
        <section className="bg-white border border-[#E2E5DF] rounded-xl p-6 sm:p-8 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E5DF]">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#252B29]">
                Professional Service Details
              </h2>
              <p className="text-xs text-[#5C6662] mt-0.5">
                Customers see these details when searching and comparing local providers.
              </p>
            </div>
            {workerProfile && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#174C3C]">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                {workerProfile.verificationStatus}
              </span>
            )}
          </div>

          {profileFormError && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{profileFormError}</span>
            </div>
          )}

          <form onSubmit={handleSaveWorkerProfile} className="space-y-5">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-[#252B29]">
                Service Categories (select one or more)
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SERVICE_CATEGORIES.map((cat) => {
                  const checked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#174C3C] bg-[#E8F0ED]/60 font-medium text-[#174C3C]'
                          : 'border-[#E2E5DF] bg-white text-[#252B29]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 accent-[#174C3C]"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="wp-experience" className="block text-sm font-medium text-[#252B29]">
                  Years of Experience
                </label>
                <input
                  id="wp-experience"
                  type="number"
                  min={0}
                  max={60}
                  required
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] font-mono tabular-nums focus:outline-none focus:border-[#174C3C]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="wp-pricing-type" className="block text-sm font-medium text-[#252B29]">
                  Pricing Type
                </label>
                <select
                  id="wp-pricing-type"
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value as PricingType)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] bg-white focus:outline-none focus:border-[#174C3C]"
                >
                  <option value="hourly">Hourly Rate (₹/hr)</option>
                  <option value="daily">Daily Rate (₹/day)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="wp-price" className="block text-sm font-medium text-[#252B29]">
                  Rate in ₹
                </label>
                <input
                  id="wp-price"
                  type="number"
                  min={50}
                  max={50000}
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] font-mono tabular-nums focus:outline-none focus:border-[#174C3C]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="wp-hours" className="block text-sm font-medium text-[#252B29]">
                Working Hours
              </label>
              <input
                id="wp-hours"
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="e.g. 8:00 AM – 7:00 PM (Mon – Sat)"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="wp-description" className="block text-sm font-medium text-[#252B29]">
                Professional Description
              </label>
              <textarea
                id="wp-description"
                rows={4}
                required
                minLength={15}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your specialties, tools you carry, neighbourhoods served, and work approach..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
              />
            </div>

            <label className="flex items-center gap-3 p-3.5 rounded-lg bg-[#F8F8F3] border border-[#E2E5DF] cursor-pointer">
              <input
                type="checkbox"
                checked={availability}
                onChange={(e) => setAvailability(e.target.checked)}
                className="w-4 h-4 accent-[#174C3C]"
              />
              <div>
                <span className="block text-sm font-medium text-[#252B29]">
                  Available for New Bookings
                </span>
                <span className="block text-xs text-[#5C6662]">
                  Turn off temporarily if you are booked out or on leave.
                </span>
              </div>
            </label>

            <button
              type="submit"
              disabled={savingWorkerProfile}
              className="px-6 py-3 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] disabled:opacity-60 cursor-pointer"
            >
              {savingWorkerProfile
                ? 'Saving Profile...'
                : hasWorkerProfile
                ? 'Update Professional Profile'
                : 'Publish Worker Profile'}
            </button>
          </form>
        </section>
      )}

      {/* INCOMING BOOKING REQUESTS */}
      {section === 'requests' && (
        <div className="space-y-4">
          {loading ? (
            <div className="h-44 bg-white border border-[#E2E5DF] rounded-xl animate-pulse" />
          ) : pendingRequests.length === 0 ? (
            <div className="bg-white border border-[#E2E5DF] rounded-xl p-10 text-center text-sm text-[#5C6662]">
              No pending booking requests at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {pendingRequests.map((b) => (
                <BookingRequestCard
                  key={b._id}
                  booking={b}
                  busy={actionLoadingId === b._id}
                  onAccept={() => triggerWorkerAction(b, 'Accepted')}
                  onReject={() => triggerWorkerAction(b, 'Rejected')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE JOBS */}
      {section === 'active' && (
        <div className="space-y-4">
          {loading ? (
            <div className="h-44 bg-white border border-[#E2E5DF] rounded-xl animate-pulse" />
          ) : activeJobs.length === 0 ? (
            <div className="bg-white border border-[#E2E5DF] rounded-xl p-10 text-center text-sm text-[#5C6662]">
              No active accepted jobs right now. Accepted booking requests appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {activeJobs.map((b) => (
                <ActiveJobCard
                  key={b._id}
                  booking={b}
                  busy={actionLoadingId === b._id}
                  onComplete={() => triggerWorkerAction(b, 'Completed')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED JOBS */}
      {section === 'completed' && (
        <div className="space-y-4">
          {loading ? (
            <div className="h-44 bg-white border border-[#E2E5DF] rounded-xl animate-pulse" />
          ) : completedJobs.length === 0 ? (
            <div className="bg-white border border-[#E2E5DF] rounded-xl p-10 text-center text-sm text-[#5C6662]">
              Completed jobs will appear here once you finish active bookings.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {completedJobs.map((b) => (
                <article
                  key={b._id}
                  className="bg-white border border-[#E2E5DF] rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-[#174C3C] font-semibold">
                        {b.bookingId}
                      </p>
                      <h3 className="font-display text-base font-semibold text-[#252B29]">
                        {b.customerId?.name} · {b.serviceCategory}
                      </h3>
                    </div>
                    <StatusIndicator status={b.status} />
                  </div>
                  <p className="text-xs text-[#5C6662]">
                    Service date: {formatServiceDate(b.serviceDate)} · {b.preferredTime}
                  </p>
                  <p className="text-xs text-[#5C6662]">{b.address}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E5DF] text-xs">
                    <span className="font-mono font-semibold text-[#252B29] tabular-nums">
                      {formatRate(b.price, b.pricingType)}
                    </span>
                    <span className="text-[#5C6662]">
                      {b.reviewed ? 'Reviewed by customer' : 'Awaiting customer review'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WORKER DIGITAL BOOKING LOGBOOK */}
      {section === 'history' && (
        <DigitalLogbookPanel
          bookings={bookings}
          role="worker"
          loading={loading}
          onWorkerAction={triggerWorkerAction}
        />
      )}

      {/* WORKER REVIEWS */}
      {section === 'reviews' && (
        <section className="bg-white border border-[#E2E5DF] rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E5DF]">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#252B29]">
                Customer Ratings &amp; Feedback ({reviews.length})
              </h2>
              <p className="text-xs text-[#5C6662]">
                Ratings are submitted exclusively by customers with completed bookings.
              </p>
            </div>
            {workerProfile && workerProfile.averageRating > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#F4A261] fill-[#F4A261]" aria-hidden="true" />
                <span className="font-mono text-xl font-bold text-[#252B29] tabular-nums">
                  {workerProfile.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-[#5C6662]">/ 5.0</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-[#5C6662]">
              No customer reviews yet. Complete bookings to start building your rating profile.
            </p>
          ) : (
            <div className="divide-y divide-[#E2E5DF]">
              {reviews.map((rev) => {
                const bookingObj =
                  typeof rev.bookingId === 'object' ? rev.bookingId : null;
                return (
                  <article key={rev._id} className="py-4 first:pt-1 last:pb-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#252B29]">
                          {rev.customerId?.name || 'Customer'}
                        </p>
                        <p className="text-xs text-[#5C6662] font-mono">
                          {bookingObj
                            ? `${bookingObj.serviceCategory} · ${bookingObj.bookingId}`
                            : 'Completed Job'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? 'text-[#F4A261] fill-[#F4A261]'
                                  : 'text-[#D4D8D2]'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </span>
                        <span className="font-mono text-xs text-[#5C6662]">
                          {formatDateTime(rev.createdAt).split(',')[0]}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[#252B29] leading-relaxed">{rev.comment}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ACCOUNT SETTINGS */}
      {section === 'settings' && <AccountSettingsPanel />}

      {/* Confirmation Dialog for Reject & Mark Completed */}
      <ConfirmDialog
        open={Boolean(confirmState)}
        title={
          confirmState?.nextStatus === 'Rejected'
            ? `Reject Booking Request ${confirmState.booking.bookingId}?`
            : `Mark Job ${confirmState?.booking.bookingId} as Completed?`
        }
        description={
          confirmState?.nextStatus === 'Rejected'
            ? 'The customer will see this request as Rejected in their Digital Booking Logbook. This action cannot be undone.'
            : 'Confirm that all requested work has been finished. Once completed, the customer can submit a verified rating and review.'
        }
        confirmLabel={
          confirmState?.nextStatus === 'Rejected' ? 'Confirm Reject' : 'Confirm Completed'
        }
        tone={confirmState?.nextStatus === 'Rejected' ? 'danger' : 'primary'}
        showNoteInput
        noteLabel={
          confirmState?.nextStatus === 'Rejected'
            ? 'Reason for declining (optional)'
            : 'Completion summary note (optional)'
        }
        notePlaceholder={
          confirmState?.nextStatus === 'Rejected'
            ? 'e.g. Already booked for that time slot'
            : 'e.g. Finished installation and tested safety'
        }
        loading={Boolean(actionLoadingId)}
        onConfirm={handleConfirmWorkerAction}
        onCancel={() => setConfirmState(null)}
      />
    </DashboardLayout>
  );
}

function BookingRequestCard({
  booking,
  busy,
  onAccept,
  onReject,
}: {
  booking: Booking;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <article className="bg-white border border-[#E2E5DF] rounded-xl p-5 flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold text-[#174C3C]">
              {booking.bookingId}
            </p>
            <h3 className="font-display text-base font-semibold text-[#252B29] mt-0.5">
              {booking.customerId?.name}
            </h3>
            <p className="text-xs font-medium text-[#174C3C]">{booking.serviceCategory}</p>
          </div>
          <StatusIndicator status={booking.status} />
        </div>

        <dl className="space-y-1.5 text-xs text-[#5C6662]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#174C3C] shrink-0" aria-hidden="true" />
            <span>
              Service: <strong className="text-[#252B29]">{formatServiceDate(booking.serviceDate)}</strong> ·{' '}
              {booking.preferredTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <Phone className="w-3.5 h-3.5 text-[#174C3C] shrink-0" aria-hidden="true" />
            <span>{booking.customerId?.phone || 'Phone available on profile'}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#174C3C] shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-[#252B29]">{booking.address}</span>
          </div>
          <div className="text-[11px] text-[#5C6662] tabular-nums">
            Requested on {formatDateTime(booking.createdAt)}
          </div>
        </dl>

        {booking.instructions && (
          <div className="p-3 rounded-lg bg-[#F8F8F3] border border-[#E2E5DF] text-xs text-[#252B29]">
            <span className="font-semibold text-[#5C6662]">Customer instructions: </span>
            {booking.instructions}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E5DF]">
        <div>
          <span className="block text-[11px] text-[#5C6662]">Quoted Price</span>
          <span className="font-mono text-sm font-bold text-[#252B29] tabular-nums">
            {formatRate(booking.price, booking.pricingType)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onReject}
            className="px-3.5 py-2 text-xs font-semibold text-[#991B1B] bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-60 cursor-pointer"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onAccept}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] disabled:opacity-60 cursor-pointer"
          >
            {busy ? 'Working...' : 'Accept Request'}
          </button>
        </div>
      </div>
    </article>
  );
}

function ActiveJobCard({
  booking,
  busy,
  onComplete,
}: {
  booking: Booking;
  busy: boolean;
  onComplete: () => void;
}) {
  return (
    <article className="bg-white border border-[#E2E5DF] rounded-xl p-5 flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold text-[#174C3C]">
              {booking.bookingId}
            </p>
            <h3 className="font-display text-base font-semibold text-[#252B29] mt-0.5">
              {booking.customerId?.name} · {booking.serviceCategory}
            </h3>
          </div>
          <StatusIndicator status={booking.status} />
        </div>

        <div className="space-y-1.5 text-xs text-[#5C6662]">
          <p>
            Scheduled: <strong className="text-[#252B29]">{formatServiceDate(booking.serviceDate)}</strong> ·{' '}
            {booking.preferredTime}
          </p>
          <p className="font-mono tabular-nums">Phone: {booking.customerId?.phone}</p>
          <p className="text-[#252B29]">{booking.address}</p>
        </div>

        {booking.instructions && (
          <p className="p-3 rounded-lg bg-[#F8F8F3] border border-[#E2E5DF] text-xs text-[#252B29]">
            {booking.instructions}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E2E5DF]">
        <span className="font-mono text-sm font-bold text-[#252B29] tabular-nums">
          {formatRate(booking.price, booking.pricingType)}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={onComplete}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] disabled:opacity-60 cursor-pointer"
        >
          Mark Completed
        </button>
      </div>
    </article>
  );
}
