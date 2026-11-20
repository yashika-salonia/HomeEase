import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WorkerAvatar } from '../components/WorkerCard';
import { bookingsApi, extractErrorMessage, workersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Booking, Review, Worker } from '../types';
import { formatDateTime, formatRate, formatServiceDate, getTodayIsoDate } from '../utils/filters';

const TIME_SLOTS = [
  '07:30 AM – 09:30 AM',
  '09:00 AM – 11:00 AM',
  '11:00 AM – 01:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
  '06:00 PM – 08:00 PM',
  'Full Day (09:00 AM – 06:00 PM)',
];

export function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[1]);
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setLoadError('');

    workersApi
      .getById(id)
      .then((res) => {
        if (!active) return;
        setWorker(res.worker);
        setReviews(res.reviews);
        setServiceCategory(res.worker.serviceCategories[0] || '');
        if (res.worker.pricingType === 'daily') {
          setPreferredTime(TIME_SLOTS[6]);
        }
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(extractErrorMessage(err, 'Worker profile could not be loaded.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (user?.location && !address) {
      setAddress(user.location);
    }
  }, [user, address]);

  const handleOpenBooking = () => {
    if (!user) {
      navigate('/login', { state: { from: `/workers/${id}` } });
      return;
    }
    setShowBookingForm(true);
    setConfirmedBooking(null);
    setFormError('');
    window.setTimeout(() => {
      document.getElementById('booking-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;
    setFormError('');

    if (!serviceDate) {
      setFormError('Please select a service date.');
      return;
    }
    if (serviceDate < getTodayIsoDate()) {
      setFormError('Service date cannot be in the past.');
      return;
    }
    if (address.trim().length < 8) {
      setFormError('Please enter a complete service address (at least 8 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await bookingsApi.create({
        workerId: worker.id,
        serviceCategory,
        serviceDate,
        preferredTime,
        address: address.trim(),
        instructions: instructions.trim(),
      });
      setConfirmedBooking(res.booking);
      showToast(`Booking ${res.booking.bookingId} created successfully!`, 'success');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not submit booking.');
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <Link
          to="/workers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5C6662] hover:text-[#174C3C] mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Explore Workers
        </Link>

        {loading ? (
          <div className="bg-white border border-[#E2E5DF] rounded-xl p-10 h-80 animate-pulse" />
        ) : loadError || !worker ? (
          <div className="bg-white border border-[#E2E5DF] rounded-xl p-10 text-center space-y-3">
            <h1 className="font-display text-xl font-bold text-[#252B29]">
              Worker Not Found
            </h1>
            <p className="text-sm text-[#5C6662]">{loadError || 'This profile does not exist.'}</p>
            <Link
              to="/workers"
              className="inline-flex px-5 py-2.5 text-sm font-medium text-white bg-[#174C3C] rounded-lg"
            >
              Browse Workers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Main Column: Profile & Reviews */}
            <div className="lg:col-span-7 space-y-8">
              <section className="bg-white border border-[#E2E5DF] rounded-xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <WorkerAvatar src={worker.profileImage} name={worker.name} size="lg" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C6662]">
                      <span className="inline-flex items-center gap-1 font-medium text-[#174C3C]">
                        <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                        {worker.verificationStatus}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          worker.availability
                            ? 'text-[#174C3C] font-medium'
                            : 'text-[#991B1B] font-medium'
                        }
                      >
                        {worker.availability ? 'Available for bookings' : 'Currently unavailable'}
                      </span>
                    </div>

                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#252B29]">
                      {worker.name}
                    </h1>

                    <p className="text-sm font-medium text-[#174C3C]">
                      {worker.serviceCategories.join(' · ')}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#5C6662] pt-1">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#174C3C]" aria-hidden="true" />
                        {worker.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Briefcase className="w-4 h-4 text-[#174C3C]" aria-hidden="true" />
                        {worker.experience} years experience
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Star
                          className="w-4 h-4 text-[#F4A261] fill-[#F4A261]"
                          aria-hidden="true"
                        />
                        <span className="font-mono font-semibold text-[#252B29] tabular-nums">
                          {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'}
                        </span>
                        <span className="tabular-nums">({worker.totalReviews} reviews)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-[#E2E5DF] space-y-2">
                  <h2 className="font-display text-lg font-semibold text-[#252B29]">
                    About {worker.name}
                  </h2>
                  <p className="text-sm sm:text-base text-[#5C6662] leading-relaxed">
                    {worker.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2E5DF] text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-[#5C6662]">Published Rate</p>
                    <p className="font-mono text-lg font-semibold text-[#252B29] tabular-nums">
                      {formatRate(worker.price, worker.pricingType)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#5C6662]">Working Hours</p>
                    <p className="inline-flex items-center gap-1.5 font-medium text-[#252B29]">
                      <Clock className="w-4 h-4 text-[#174C3C]" aria-hidden="true" />
                      {worker.workingHours}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#F8F8F3] border border-[#E2E5DF] text-xs text-[#5C6662]">
                  <strong className="text-[#252B29]">Demo Verification Notice:</strong> “
                  {worker.verificationStatus}” is a college-demonstration status label and does
                  not represent third-party government background verification.
                </div>
              </section>

              {/* Customer Reviews */}
              <section className="bg-white border border-[#E2E5DF] rounded-xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-xl font-bold text-[#252B29]">
                    Customer Reviews ({reviews.length})
                  </h2>
                  {worker.averageRating > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Star
                        className="w-4 h-4 text-[#F4A261] fill-[#F4A261]"
                        aria-hidden="true"
                      />
                      <span className="font-mono font-semibold text-[#252B29] tabular-nums">
                        {worker.averageRating.toFixed(1)} / 5.0
                      </span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <p className="text-sm text-[#5C6662] py-4">
                    No customer reviews yet. Reviews appear automatically after customers rate
                    completed bookings.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E2E5DF]">
                    {reviews.map((review) => {
                      const bookingRef =
                        typeof review.bookingId === 'object' ? review.bookingId : null;
                      return (
                        <article key={review._id} className="py-5 first:pt-1 last:pb-0 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-[#252B29]">
                                {review.customerId?.name || 'Verified Customer'}
                              </p>
                              <p className="text-xs text-[#5C6662]">
                                {bookingRef
                                  ? `${bookingRef.serviceCategory} · Booking ${bookingRef.bookingId}`
                                  : 'Completed Booking'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-flex items-center gap-0.5"
                                aria-label={`Rated ${review.rating} out of 5 stars`}
                              >
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      star <= review.rating
                                        ? 'text-[#F4A261] fill-[#F4A261]'
                                        : 'text-[#D4D8D2]'
                                    }`}
                                    aria-hidden="true"
                                  />
                                ))}
                              </span>
                              <span className="font-mono text-xs text-[#5C6662] tabular-nums">
                                {formatDateTime(review.createdAt).split(',')[0]}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-[#252B29] leading-relaxed">
                            {review.comment}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right Sticky Column: Book Now CTA / Form / Confirmation */}
            <div id="booking-form-section" className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="bg-white border border-[#E2E5DF] rounded-xl p-6 sm:p-7 space-y-5 shadow-sm">
                <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-[#E2E5DF]">
                  <div>
                    <p className="text-xs text-[#5C6662]">Estimated Quote</p>
                    <p className="font-mono text-2xl font-bold text-[#174C3C] tabular-nums">
                      {formatRate(worker.price, worker.pricingType)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      worker.availability ? 'text-[#174C3C]' : 'text-[#991B1B]'
                    }`}
                  >
                    {worker.availability ? 'Open for bookings' : 'Unavailable'}
                  </span>
                </div>

                {confirmedBooking ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[#ECFDF3] border border-[#16A34A]/30 space-y-2">
                      <div className="flex items-center gap-2 text-[#14532D] font-semibold text-sm">
                        <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                        <span>Booking Request Submitted</span>
                      </div>
                      <p className="text-xs text-[#14532D]">
                        Your request has been logged in MongoDB with status{' '}
                        <strong>Pending</strong> and sent to {worker.name}.
                      </p>
                    </div>

                    <dl className="space-y-2.5 text-sm border-y border-[#E2E5DF] py-4">
                      <div className="flex justify-between gap-4">
                        <dt className="text-[#5C6662]">Booking ID</dt>
                        <dd className="font-mono font-semibold text-[#174C3C] tabular-nums">
                          {confirmedBooking.bookingId}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[#5C6662]">Service</dt>
                        <dd className="font-medium text-[#252B29]">
                          {confirmedBooking.serviceCategory}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[#5C6662]">Scheduled</dt>
                        <dd className="font-medium text-[#252B29] text-right">
                          {formatServiceDate(confirmedBooking.serviceDate)} ·{' '}
                          {confirmedBooking.preferredTime}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[#5C6662]">Quoted Price</dt>
                        <dd className="font-mono font-semibold text-[#252B29] tabular-nums">
                          {formatRate(confirmedBooking.price, confirmedBooking.pricingType)}
                        </dd>
                      </div>
                    </dl>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to="/customer/history"
                        className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B]"
                      >
                        Open Booking Logbook
                      </Link>
                      <Link
                        to="/customer/bookings"
                        className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-[#174C3C] bg-[#F8F8F3] border border-[#E2E5DF] rounded-lg hover:bg-[#E8F0ED]"
                      >
                        My Bookings
                      </Link>
                    </div>
                  </div>
                ) : user?.role === 'worker' ? (
                  <div className="space-y-3 text-sm text-[#5C6662]">
                    <p>
                      You are currently signed in as a <strong>Service Provider</strong>. Only
                      customer accounts can book home services.
                    </p>
                    <Link
                      to="/worker/dashboard"
                      className="inline-flex w-full justify-center px-4 py-2.5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B]"
                    >
                      Go to Worker Dashboard
                    </Link>
                  </div>
                ) : !showBookingForm ? (
                  <div className="space-y-4">
                    <p className="text-sm text-[#5C6662] leading-relaxed">
                      Reserve {worker.name} for your preferred date and time. Your booking is
                      recorded immediately in the Digital Booking Logbook and confirmed once the
                      worker accepts.
                    </p>
                    <button
                      type="button"
                      disabled={!worker.availability}
                      onClick={handleOpenBooking}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      {worker.availability
                        ? user
                          ? 'Book Now'
                          : 'Login to Book Now'
                        : 'Currently Unavailable'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <h2 className="font-display text-lg font-semibold text-[#252B29]">
                      Book {worker.name}
                    </h2>

                    {formError && (
                      <div
                        role="alert"
                        className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label
                        htmlFor="booking-category"
                        className="block text-xs font-medium text-[#252B29]"
                      >
                        Service Category
                      </label>
                      <select
                        id="booking-category"
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D4D8D2] bg-white focus:outline-none focus:border-[#174C3C]"
                      >
                        {worker.serviceCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="booking-date"
                          className="block text-xs font-medium text-[#252B29]"
                        >
                          Service Date
                        </label>
                        <input
                          id="booking-date"
                          type="date"
                          min={getTodayIsoDate()}
                          value={serviceDate}
                          onChange={(e) => setServiceDate(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D4D8D2] font-mono tabular-nums focus:outline-none focus:border-[#174C3C]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="booking-time"
                          className="block text-xs font-medium text-[#252B29]"
                        >
                          Preferred Time
                        </label>
                        <select
                          id="booking-time"
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D4D8D2] bg-white focus:outline-none focus:border-[#174C3C]"
                        >
                          {TIME_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="booking-address"
                        className="block text-xs font-medium text-[#252B29]"
                      >
                        Service Address
                      </label>
                      <textarea
                        id="booking-address"
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder="House/Flat No., Street, Landmark, City"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="booking-instructions"
                        className="block text-xs font-medium text-[#252B29]"
                      >
                        Additional Instructions (optional)
                      </label>
                      <textarea
                        id="booking-instructions"
                        rows={3}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Mention room count, tools needed, dietary preferences, or gate instructions..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
                      />
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#F8F8F3] border border-[#E2E5DF] flex items-center justify-between text-sm">
                      <span className="text-[#5C6662]">Estimated Quoted Rate</span>
                      <span className="font-mono font-semibold text-[#174C3C] tabular-nums">
                        {formatRate(worker.price, worker.pricingType)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? 'Submitting Booking...' : 'Confirm Booking Request'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
