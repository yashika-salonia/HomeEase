import { useState, useMemo } from 'react';
import { Search, Calendar, MapPin, Phone, Star, FileText } from 'lucide-react';
import type { Booking, BookingStatus, UserRole } from '../types';
import { BookingTimeline, StatusIndicator } from './BookingTimeline';
import { formatDateTime, formatRate, formatServiceDate } from '../utils/filters';

const STATUS_TABS: Array<'All' | BookingStatus> = [
  'All',
  'Pending',
  'Accepted',
  'Rejected',
  'Completed',
  'Cancelled',
];

interface DigitalLogbookPanelProps {
  bookings: Booking[];
  role: UserRole;
  loading: boolean;
  onCancelBooking?: (booking: Booking) => void;
  onReviewBooking?: (booking: Booking) => void;
  onWorkerAction?: (booking: Booking, nextStatus: 'Accepted' | 'Rejected' | 'Completed') => void;
}

export function DigitalLogbookPanel({
  bookings,
  role,
  loading,
  onCancelBooking,
  onReviewBooking,
  onWorkerAction,
}: DigitalLogbookPanelProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matches =
          b.bookingId.toLowerCase().includes(q) ||
          b.serviceCategory.toLowerCase().includes(q) ||
          (b.customerId?.name || '').toLowerCase().includes(q) ||
          (b.workerId?.name || '').toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header & Search Controls */}
      <div className="bg-white border border-[#E2E5DF] rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#252B29]">
              Digital Booking Logbook
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6662]">
              Permanent timestamped record of every service booking, schedule, quoted rate, and
              status milestone.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <label htmlFor="logbook-search" className="sr-only">
              Search by Booking ID or name
            </label>
            <Search
              className="w-4 h-4 text-[#5C6662] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="logbook-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Booking ID (e.g. HE-2026...)"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Filter booking logbook by status"
        >
          {STATUS_TABS.map((tab) => {
            const count =
              tab === 'All'
                ? bookings.length
                : bookings.filter((b) => b.status === tab).length;
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#174C3C] text-white'
                    : 'bg-[#F8F8F3] text-[#252B29] hover:bg-[#E8F0ED]'
                }`}
              >
                {tab}{' '}
                <span className="font-mono tabular-nums opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logbook Records */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white border border-[#E2E5DF] rounded-xl p-6 h-56 animate-pulse"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-[#E2E5DF] rounded-xl p-12 text-center space-y-2">
          <FileText className="w-8 h-8 text-[#5C6662] mx-auto" aria-hidden="true" />
          <h3 className="font-display text-base font-semibold text-[#252B29]">
            No logbook entries match this filter
          </h3>
          <p className="text-sm text-[#5C6662]">
            {searchTerm || statusFilter !== 'All'
              ? 'Try clearing your Booking ID search or selecting All statuses.'
              : 'Bookings will be recorded here automatically once created.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((booking) => {
            const counterparty =
              role === 'customer' ? booking.workerId : booking.customerId;
            return (
              <article
                key={booking._id}
                className="bg-white border border-[#E2E5DF] rounded-xl p-5 sm:p-6 space-y-5"
              >
                {/* Record Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E5DF]">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm font-semibold text-[#174C3C] tabular-nums">
                        {booking.bookingId}
                      </span>
                      <StatusIndicator status={booking.status} />
                    </div>
                    <p className="text-xs text-[#5C6662] tabular-nums">
                      Created on {formatDateTime(booking.createdAt)} · {booking.serviceCategory}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs text-[#5C6662]">Quoted Price</p>
                    <p className="font-mono text-lg font-bold text-[#252B29] tabular-nums">
                      {formatRate(booking.price, booking.pricingType)}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#5C6662]">
                      {role === 'customer' ? 'Service Provider' : 'Customer'}
                    </p>
                    <p className="font-semibold text-[#252B29]">
                      {counterparty?.name || 'User'}
                    </p>
                    {counterparty?.phone && (
                      <p className="inline-flex items-center gap-1.5 text-xs text-[#5C6662] font-mono tabular-nums">
                        <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                        {counterparty.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#5C6662]">Scheduled Slot</p>
                    <p className="inline-flex items-center gap-1.5 font-medium text-[#252B29]">
                      <Calendar className="w-4 h-4 text-[#174C3C] shrink-0" aria-hidden="true" />
                      <span>{formatServiceDate(booking.serviceDate)}</span>
                    </p>
                    <p className="text-xs text-[#5C6662] font-mono tabular-nums">
                      {booking.preferredTime}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#5C6662]">Service Address</p>
                    <p className="inline-flex items-start gap-1.5 text-[#252B29] text-xs sm:text-sm leading-snug">
                      <MapPin
                        className="w-4 h-4 text-[#174C3C] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{booking.address}</span>
                    </p>
                  </div>
                </div>

                {booking.instructions && (
                  <div className="p-3 rounded-lg bg-[#F8F8F3] border border-[#E2E5DF] text-xs text-[#252B29]">
                    <span className="font-semibold text-[#5C6662]">Instructions: </span>
                    {booking.instructions}
                  </div>
                )}

                {/* Lifecycle Timeline */}
                <BookingTimeline
                  status={booking.status}
                  statusHistory={booking.statusHistory}
                  createdAt={booking.createdAt}
                />

                {/* Contextual Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-[#E2E5DF]">
                  {role === 'customer' && booking.status === 'Pending' && onCancelBooking && (
                    <button
                      type="button"
                      onClick={() => onCancelBooking(booking)}
                      className="px-4 py-2 text-xs font-semibold text-[#991B1B] bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {role === 'customer' &&
                    booking.status === 'Completed' &&
                    !booking.reviewed &&
                    onReviewBooking && (
                      <button
                        type="button"
                        onClick={() => onReviewBooking(booking)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] transition-colors cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5" aria-hidden="true" />
                        Write a Review
                      </button>
                    )}

                  {role === 'customer' && booking.status === 'Completed' && booking.reviewed && (
                    <span className="text-xs font-medium text-[#174C3C]">
                      Review submitted
                    </span>
                  )}

                  {role === 'worker' && booking.status === 'Pending' && onWorkerAction && (
                    <>
                      <button
                        type="button"
                        onClick={() => onWorkerAction(booking, 'Rejected')}
                        className="px-4 py-2 text-xs font-semibold text-[#991B1B] bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer"
                      >
                        Reject Request
                      </button>
                      <button
                        type="button"
                        onClick={() => onWorkerAction(booking, 'Accepted')}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] cursor-pointer"
                      >
                        Accept Request
                      </button>
                    </>
                  )}

                  {role === 'worker' && booking.status === 'Accepted' && onWorkerAction && (
                    <button
                      type="button"
                      onClick={() => onWorkerAction(booking, 'Completed')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
