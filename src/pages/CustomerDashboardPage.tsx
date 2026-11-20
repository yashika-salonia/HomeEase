import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  CalendarClock,
  BookOpenCheck,
  Star,
  UserCircle,
  X,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout, type DashboardNavItem } from '../layouts/DashboardLayout';
import { StatusIndicator, BookingTimeline } from '../components/BookingTimeline';
import { DigitalLogbookPanel } from '../components/DigitalLogbookPanel';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ReviewModal } from '../components/ReviewModal';
import { AccountSettingsPanel } from '../components/AccountSettingsPanel';
import { bookingsApi, reviewsApi, extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Booking, BookingStats, Review } from '../types';
import { formatDateTime, formatRate, formatServiceDate } from '../utils/filters';

export type CustomerSection = 'overview' | 'bookings' | 'history' | 'reviews' | 'profile';

const EMPTY_STATS: BookingStats = {
  total: 0,
  pending: 0,
  accepted: 0,
  completed: 0,
  rejected: 0,
  cancelled: 0,
};

export function CustomerDashboardPage({ section }: { section: CustomerSection }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>(EMPTY_STATS);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, reviewsRes] = await Promise.all([
        bookingsApi.getMyBookings(),
        reviewsApi.getMyReviews(),
      ]);
      setBookings(bookingsRes.bookings);
      setStats(bookingsRes.stats);
      setReviews(reviewsRes.reviews);
    } catch (err) {
      showToast(extractErrorMessage(err, 'Failed to load dashboard data.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmCancel = async (reason?: string) => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await bookingsApi.cancel(cancelTarget._id, reason);
      showToast(`Booking ${cancelTarget.bookingId} cancelled.`, 'success');
      setCancelTarget(null);
      setDetailBooking(null);
      await loadData();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not cancel booking.'), 'error');
    } finally {
      setCancelling(false);
    }
  };

  const navItems: DashboardNavItem[] = [
    { label: 'Overview', to: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'Find Workers', to: '/workers', icon: Search },
    {
      label: 'My Bookings',
      to: '/customer/bookings',
      icon: CalendarClock,
      badgeCount: stats.pending + stats.accepted,
    },
    { label: 'Booking History', to: '/customer/history', icon: BookOpenCheck },
    { label: 'My Reviews', to: '/customer/reviews', icon: Star },
    { label: 'My Profile', to: '/customer/profile', icon: UserCircle },
  ];

  const titles: Record<CustomerSection, { title: string; subtitle: string }> = {
    overview: {
      title: `Welcome, ${user?.name?.split(' ')[0] || 'Customer'}`,
      subtitle: 'Track your active requests, upcoming visits, and service records.',
    },
    bookings: {
      title: 'My Bookings',
      subtitle: 'Manage pending requests, upcoming visits, and rate completed services.',
    },
    history: {
      title: 'Booking History',
      subtitle: 'Your permanent HomeEase Digital Booking Logbook.',
    },
    reviews: {
      title: 'My Reviews',
      subtitle: 'Ratings and feedback submitted for completed home services.',
    },
    profile: {
      title: 'My Profile',
      subtitle: 'Update your contact details, neighbourhood, and account password.',
    },
  };

  const activeBookings = bookings.filter(
    (b) => b.status === 'Pending' || b.status === 'Accepted'
  );
  const completedUnreviewed = bookings.filter(
    (b) => b.status === 'Completed' && !b.reviewed
  );

  return (
    <DashboardLayout
      title={titles[section].title}
      subtitle={titles[section].subtitle}
      navItems={navItems}
      action={
        <Link
          to="/workers"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] whitespace-nowrap"
        >
          Find Workers
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      }
    >
      {/* OVERVIEW SECTION */}
      {section === 'overview' && (
        <div className="space-y-8">
          {/* KPI Strip */}
          <section aria-label="Booking statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Bookings', value: stats.total },
              { label: 'Pending Bookings', value: stats.pending },
              { label: 'Accepted Bookings', value: stats.accepted },
              { label: 'Completed Bookings', value: stats.completed },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-[#E2E5DF] rounded-xl p-5 space-y-1.5"
              >
                <p className="text-xs font-medium text-[#5C6662]">{stat.label}</p>
                <p className="font-mono text-2xl sm:text-3xl font-bold text-[#174C3C] tabular-nums">
                  {loading ? '—' : stat.value}
                </p>
              </div>
            ))}
          </section>

          {/* Pending Review Prompt */}
          {completedUnreviewed.length > 0 && (
            <section className="bg-white border border-[#E2E5DF] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-base font-semibold text-[#252B29]">
                  {completedUnreviewed.length} Completed{' '}
                  {completedUnreviewed.length === 1 ? 'Job Awaiting' : 'Jobs Awaiting'} Your
                  Review
                </h2>
                <p className="text-xs sm:text-sm text-[#5C6662] mt-0.5">
                  Rate {completedUnreviewed[0].workerId?.name} for{' '}
                  {completedUnreviewed[0].serviceCategory} (
                  {completedUnreviewed[0].bookingId}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewTarget(completedUnreviewed[0])}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] whitespace-nowrap cursor-pointer"
              >
                <Star className="w-4 h-4" aria-hidden="true" />
                Submit Review
              </button>
            </section>
          )}

          {/* Recent Activity */}
          <section className="bg-white border border-[#E2E5DF] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E5DF] flex items-center justify-between gap-4">
              <h2 className="font-display text-base font-semibold text-[#252B29]">
                Recent Activity
              </h2>
              <Link
                to="/customer/history"
                className="text-xs font-semibold text-[#174C3C] hover:underline"
              >
                Open Full Logbook
              </Link>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 bg-[#F8F8F3] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-sm text-[#5C6662]">
                  You haven&apos;t booked a service yet. Browse verified local workers to get
                  started.
                </p>
                <Link
                  to="/workers"
                  className="inline-flex px-4 py-2 text-sm font-semibold text-white bg-[#174C3C] rounded-lg"
                >
                  Explore Workers
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E5DF] bg-[#F8F8F3]/70 text-xs font-medium text-[#5C6662]">
                        <th className="py-3 px-6">Worker &amp; ID</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Scheduled Date</th>
                        <th className="py-3 px-4 text-right">Price</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E5DF] text-sm">
                      {bookings.slice(0, 6).map((b) => (
                        <tr key={b._id} className="hover:bg-[#F8F8F3]/60 transition-colors">
                          <td className="py-3.5 px-6">
                            <p className="font-semibold text-[#252B29]">{b.workerId?.name}</p>
                            <p className="font-mono text-xs text-[#5C6662] tabular-nums">
                              {b.bookingId}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-[#252B29]">{b.serviceCategory}</td>
                          <td className="py-3.5 px-4 text-[#5C6662] tabular-nums">
                            {formatServiceDate(b.serviceDate)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-medium text-[#252B29] tabular-nums">
                            {formatRate(b.price, b.pricingType)}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusIndicator status={b.status} />
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => setDetailBooking(b)}
                              className="text-xs font-semibold text-[#174C3C] hover:underline cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-[#E2E5DF]">
                  {bookings.slice(0, 6).map((b) => (
                    <div key={b._id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-[#252B29]">
                            {b.workerId?.name}
                          </p>
                          <p className="font-mono text-xs text-[#5C6662]">{b.bookingId}</p>
                        </div>
                        <StatusIndicator status={b.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#5C6662]">
                        <span>
                          {b.serviceCategory} · {formatServiceDate(b.serviceDate)}
                        </span>
                        <span className="font-mono font-semibold text-[#252B29] tabular-nums">
                          {formatRate(b.price, b.pricingType)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDetailBooking(b)}
                        className="text-xs font-semibold text-[#174C3C] hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* MY BOOKINGS SECTION */}
      {section === 'bookings' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-[#252B29]">
              Active &amp; Pending Bookings ({activeBookings.length})
            </h2>
            {loading ? (
              <div className="h-40 bg-white border border-[#E2E5DF] rounded-xl animate-pulse" />
            ) : activeBookings.length === 0 ? (
              <div className="bg-white border border-[#E2E5DF] rounded-xl p-8 text-center space-y-3">
                <p className="text-sm text-[#5C6662]">No active or pending bookings right now.</p>
                <Link
                  to="/workers"
                  className="inline-flex px-4 py-2 text-sm font-semibold text-white bg-[#174C3C] rounded-lg"
                >
                  Book a Service
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeBookings.map((b) => (
                  <article
                    key={b._id}
                    className="bg-white border border-[#E2E5DF] rounded-xl p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs text-[#174C3C] font-semibold">
                            {b.bookingId}
                          </p>
                          <h3 className="font-display text-base font-semibold text-[#252B29] mt-0.5">
                            {b.workerId?.name} · {b.serviceCategory}
                          </h3>
                        </div>
                        <StatusIndicator status={b.status} />
                      </div>

                      <div className="text-xs text-[#5C6662] space-y-1">
                        <p>
                          Scheduled: <strong className="text-[#252B29]">{formatServiceDate(b.serviceDate)}</strong> ·{' '}
                          {b.preferredTime}
                        </p>
                        <p className="inline-flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{b.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E2E5DF]">
                      <span className="font-mono text-sm font-semibold text-[#252B29] tabular-nums">
                        {formatRate(b.price, b.pricingType)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailBooking(b)}
                          className="px-3 py-1.5 text-xs font-medium text-[#174C3C] bg-[#F8F8F3] border border-[#E2E5DF] rounded-lg hover:bg-[#E8F0ED] cursor-pointer"
                        >
                          Details
                        </button>
                        {b.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(b)}
                            className="px-3 py-1.5 text-xs font-semibold text-[#991B1B] bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Completed bookings ready for review */}
          {completedUnreviewed.length > 0 && (
            <div className="space-y-4 pt-2">
              <h2 className="font-display text-lg font-semibold text-[#252B29]">
                Completed Bookings Ready for Review ({completedUnreviewed.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {completedUnreviewed.map((b) => (
                  <article
                    key={b._id}
                    className="bg-white border border-[#E2E5DF] rounded-xl p-5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-mono text-xs text-[#5C6662]">{b.bookingId}</p>
                      <h3 className="font-display text-base font-semibold text-[#252B29]">
                        {b.workerId?.name} · {b.serviceCategory}
                      </h3>
                      <p className="text-xs text-[#5C6662] mt-0.5">
                        Completed on {formatServiceDate(b.serviceDate)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewTarget(b)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] whitespace-nowrap cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" aria-hidden="true" />
                      Rate Worker
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DIGITAL BOOKING LOGBOOK SECTION */}
      {section === 'history' && (
        <DigitalLogbookPanel
          bookings={bookings}
          role="customer"
          loading={loading}
          onCancelBooking={(b) => setCancelTarget(b)}
          onReviewBooking={(b) => setReviewTarget(b)}
        />
      )}

      {/* MY REVIEWS SECTION */}
      {section === 'reviews' && (
        <div className="space-y-6">
          {completedUnreviewed.length > 0 && (
            <section className="bg-white border border-[#E2E5DF] rounded-xl p-5 space-y-3">
              <h2 className="font-display text-base font-semibold text-[#252B29]">
                Pending Reviews ({completedUnreviewed.length})
              </h2>
              <div className="divide-y divide-[#E2E5DF]">
                {completedUnreviewed.map((b) => (
                  <div
                    key={b._id}
                    className="py-3 first:pt-1 last:pb-0 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#252B29]">
                        {b.workerId?.name} · {b.serviceCategory}
                      </p>
                      <p className="text-xs text-[#5C6662] font-mono">
                        {b.bookingId} · {formatServiceDate(b.serviceDate)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewTarget(b)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] cursor-pointer"
                    >
                      Write Review
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-white border border-[#E2E5DF] rounded-xl p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-[#252B29]">
              Published Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-[#5C6662]">
                You haven&apos;t submitted any reviews yet. Completed bookings can be rated here.
              </p>
            ) : (
              <div className="divide-y divide-[#E2E5DF]">
                {reviews.map((rev) => {
                  const bookingObj =
                    typeof rev.bookingId === 'object' ? rev.bookingId : null;
                  return (
                    <article key={rev._id} className="py-4 first:pt-1 last:pb-0 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[#252B29]">
                            {rev.workerId?.name || 'Worker'}
                          </p>
                          <p className="text-xs text-[#5C6662] font-mono">
                            {bookingObj
                              ? `${bookingObj.serviceCategory} · ${bookingObj.bookingId}`
                              : 'Completed Booking'}
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
        </div>
      )}

      {/* MY PROFILE SECTION */}
      {section === 'profile' && <AccountSettingsPanel />}

      {/* Booking Details Modal */}
      {detailBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-detail-title"
        >
          <div className="bg-white border border-[#E2E5DF] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E2E5DF]">
              <div>
                <p className="font-mono text-xs font-semibold text-[#174C3C]">
                  {detailBooking.bookingId}
                </p>
                <h3
                  id="booking-detail-title"
                  className="font-display text-lg font-bold text-[#252B29]"
                >
                  {detailBooking.serviceCategory} with {detailBooking.workerId?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailBooking(null)}
                aria-label="Close booking details"
                className="p-1 text-[#5C6662] hover:text-[#252B29]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#5C6662]">Status</p>
                <div className="mt-1">
                  <StatusIndicator status={detailBooking.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-[#5C6662]">Quoted Price</p>
                <p className="mt-1 font-mono font-semibold text-[#252B29] tabular-nums">
                  {formatRate(detailBooking.price, detailBooking.pricingType)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5C6662]">Scheduled Date &amp; Time</p>
                <p className="mt-1 font-medium text-[#252B29]">
                  {formatServiceDate(detailBooking.serviceDate)} · {detailBooking.preferredTime}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5C6662]">Worker Phone</p>
                <p className="mt-1 font-mono text-[#252B29] tabular-nums">
                  {detailBooking.workerId?.phone || '—'}
                </p>
              </div>
            </div>

            <div className="text-sm">
              <p className="text-xs text-[#5C6662]">Service Address</p>
              <p className="mt-0.5 text-[#252B29]">{detailBooking.address}</p>
            </div>

            {detailBooking.instructions && (
              <div className="text-sm">
                <p className="text-xs text-[#5C6662]">Additional Instructions</p>
                <p className="mt-0.5 text-[#252B29]">{detailBooking.instructions}</p>
              </div>
            )}

            <BookingTimeline
              status={detailBooking.status}
              statusHistory={detailBooking.statusHistory}
              createdAt={detailBooking.createdAt}
            />

            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-[#E2E5DF]">
              {detailBooking.status === 'Pending' && (
                <button
                  type="button"
                  onClick={() => setCancelTarget(detailBooking)}
                  className="px-4 py-2 text-xs font-semibold text-[#991B1B] bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer"
                >
                  Cancel Booking
                </button>
              )}
              {detailBooking.status === 'Completed' && !detailBooking.reviewed && (
                <button
                  type="button"
                  onClick={() => {
                    const target = detailBooking;
                    setDetailBooking(null);
                    setReviewTarget(target);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] cursor-pointer"
                >
                  Submit Review
                </button>
              )}
              <button
                type="button"
                onClick={() => setDetailBooking(null)}
                className="px-4 py-2 text-xs font-medium text-[#252B29] bg-[#F8F8F3] border border-[#E2E5DF] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title={`Cancel Booking ${cancelTarget?.bookingId || ''}?`}
        description="This pending request will be marked as Cancelled in your Digital Booking Logbook and removed from the worker's queue."
        confirmLabel="Confirm Cancellation"
        tone="danger"
        showNoteInput
        noteLabel="Cancellation reason (optional)"
        notePlaceholder="e.g. Need to reschedule for next weekend"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />

      {/* Review Submission Modal */}
      <ReviewModal
        booking={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSuccess={loadData}
      />
    </DashboardLayout>
  );
}
