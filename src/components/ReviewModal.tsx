import { useState, useEffect } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import type { Booking } from '../types';
import { reviewsApi, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ booking, onClose, onSuccess }: ReviewModalProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setRating(5);
      setHoverRating(0);
      setComment('');
      setError('');
    }
  }, [booking]);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (comment.trim().length < 5) {
      setError('Please write a review comment of at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.create({
        bookingId: booking._id,
        rating,
        comment: comment.trim(),
      });
      showToast('Review submitted and worker rating updated!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not submit review.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="bg-white border border-[#E2E5DF] rounded-xl max-w-md w-full p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="review-modal-title"
              className="font-display text-lg font-semibold text-[#252B29]"
            >
              Rate Your Experience
            </h3>
            <p className="text-xs text-[#5C6662] mt-0.5">
              {booking.workerId?.name} · {booking.serviceCategory} ·{' '}
              <span className="font-mono">{booking.bookingId}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review modal"
            className="p-1 text-[#5C6662] hover:text-[#252B29]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <span className="block text-sm font-medium text-[#252B29]">
              Star Rating ({rating} / 5)
            </span>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating out of 5 stars">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`Rate ${star} ${star === 1 ? 'star' : 'stars'}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1.5 rounded-md hover:bg-[#F8F8F3] cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        active ? 'text-[#F4A261] fill-[#F4A261]' : 'text-[#D4D8D2]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="block text-sm font-medium text-[#252B29]">
              Written Review
            </label>
            <textarea
              id="review-comment"
              rows={4}
              required
              minLength={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share punctuality, work quality, cleanliness, and communication..."
              className="w-full rounded-lg border border-[#D4D8D2] px-3 py-2 text-sm text-[#252B29] focus:outline-none focus:border-[#174C3C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[#252B29] bg-[#F8F8F3] border border-[#E2E5DF] rounded-lg hover:bg-[#ECEEE7] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Publishing...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
