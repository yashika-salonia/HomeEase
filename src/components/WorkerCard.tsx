import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';
import type { Worker } from '../types';
import { formatRate, getInitials } from '../utils/filters';

export function WorkerAvatar({
  src,
  name,
  size = 'md',
}: {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [imgError, setImgError] = useState(false);

  const dims =
    size === 'lg'
      ? 'w-24 h-24 text-2xl rounded-xl'
      : size === 'sm'
      ? 'w-11 h-11 text-sm rounded-lg'
      : 'w-16 h-16 text-lg rounded-xl';

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={`${name} profile portrait`}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${dims} object-cover object-top shrink-0 border border-[#E2E5DF] bg-[#E8F0ED]`}
      />
    );
  }

  return (
    <div
      className={`${dims} shrink-0 flex items-center justify-center font-display font-semibold bg-[#E8F0ED] text-[#174C3C] border border-[#D4E0DA]`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}

export function WorkerCard({ worker }: { worker: Worker }) {
  const primaryCategories = worker.serviceCategories.join(' / ');

  return (
    <article className="bg-white border border-[#E2E5DF] rounded-xl p-6 flex flex-col justify-between gap-5 hover:border-[#174C3C]/40 hover:shadow-sm transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <WorkerAvatar src={worker.profileImage} name={worker.name} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold text-[#252B29] truncate">
              {worker.name}
            </h3>
            <p className="text-sm font-medium text-[#174C3C] truncate">
              {primaryCategories}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5C6662]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{worker.location}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{worker.experience} yrs exp</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-[#5C6662] leading-relaxed line-clamp-2">
          {worker.description}
        </p>

        {/* Clean unboxed metadata row */}
        <div className="pt-3 border-t border-[#E2E5DF] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#252B29]">
            <Star
              className="w-3.5 h-3.5 text-[#F4A261] fill-[#F4A261] shrink-0"
              aria-hidden="true"
            />
            <span className="font-mono font-semibold tabular-nums">
              {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'}
            </span>
            <span className="text-[#5C6662] tabular-nums">
              ({worker.totalReviews} {worker.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#5C6662]">
            <span
              className={
                worker.availability
                  ? 'text-[#174C3C] font-medium'
                  : 'text-[#8C3B2B] font-medium'
              }
            >
              {worker.availability ? 'Available' : 'Unavailable'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#174C3C]" aria-hidden="true" />
              <span>{worker.verificationStatus}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-1">
        <div>
          <span className="block text-xs text-[#5C6662]">Published rate</span>
          <span className="font-mono text-base font-semibold text-[#252B29] tabular-nums">
            {formatRate(worker.price, worker.pricingType)}
          </span>
        </div>

        <Link
          to={`/workers/${worker.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] transition-colors whitespace-nowrap shrink-0"
        >
          View Profile
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
