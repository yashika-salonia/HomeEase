import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  BadgeCheck,
} from 'lucide-react';
import type { BookingStatus, StatusHistoryEntry } from '../types';
import { formatDateTime } from '../utils/filters';

export function StatusIndicator({ status }: { status: BookingStatus }) {
  const config: Record<
    BookingStatus,
    { label: string; textClass: string; bgClass: string; Icon: typeof Clock }
  > = {
    Pending: {
      label: 'Pending',
      textClass: 'text-[#9A5B13]',
      bgClass: 'bg-[#FEF6EB] border-[#F4A261]/40',
      Icon: Clock,
    },
    Accepted: {
      label: 'Accepted',
      textClass: 'text-[#174C3C]',
      bgClass: 'bg-[#E8F0ED] border-[#174C3C]/25',
      Icon: BadgeCheck,
    },
    Completed: {
      label: 'Completed',
      textClass: 'text-[#14532D]',
      bgClass: 'bg-[#ECFDF3] border-[#16A34A]/30',
      Icon: CheckCircle2,
    },
    Rejected: {
      label: 'Rejected',
      textClass: 'text-[#991B1B]',
      bgClass: 'bg-[#FEF2F2] border-[#DC2626]/25',
      Icon: XCircle,
    },
    Cancelled: {
      label: 'Cancelled',
      textClass: 'text-[#5C6662]',
      bgClass: 'bg-[#F3F4F2] border-[#D4D8D2]',
      Icon: Ban,
    },
  };

  const { label, textClass, bgClass, Icon } = config[status] || config.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border whitespace-nowrap ${textClass} ${bgClass}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function BookingTimeline({
  status,
  statusHistory,
  createdAt,
}: {
  status: BookingStatus;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
}) {
  const historyMap = new Map<BookingStatus, StatusHistoryEntry>();
  for (const entry of statusHistory || []) {
    historyMap.set(entry.status, entry);
  }

  const isTerminatedEarly = status === 'Rejected' || status === 'Cancelled';

  const steps: Array<{
    key: BookingStatus;
    title: string;
    reached: boolean;
    entry?: StatusHistoryEntry;
    isNegative?: boolean;
  }> = isTerminatedEarly
    ? [
        {
          key: 'Pending',
          title: 'Booking Created',
          reached: true,
          entry: historyMap.get('Pending') || {
            status: 'Pending',
            timestamp: createdAt,
            note: 'Booking submitted.',
            updatedBy: '',
          },
        },
        {
          key: status,
          title: status === 'Rejected' ? 'Request Rejected' : 'Booking Cancelled',
          reached: true,
          entry: historyMap.get(status),
          isNegative: true,
        },
      ]
    : [
        {
          key: 'Pending',
          title: 'Booking Created',
          reached: true,
          entry: historyMap.get('Pending') || {
            status: 'Pending',
            timestamp: createdAt,
            note: 'Booking submitted.',
            updatedBy: '',
          },
        },
        {
          key: 'Accepted',
          title: 'Accepted by Worker',
          reached: status === 'Accepted' || status === 'Completed',
          entry: historyMap.get('Accepted'),
        },
        {
          key: 'Completed',
          title: 'Job Completed',
          reached: status === 'Completed',
          entry: historyMap.get('Completed'),
        },
      ];

  return (
    <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Booking lifecycle timeline">
      {steps.map((step, idx) => (
        <li
          key={step.key}
          className={`relative p-3.5 rounded-lg border ${
            step.isNegative
              ? 'bg-[#FEF2F2]/60 border-[#DC2626]/20'
              : step.reached
              ? 'bg-[#F8F8F3] border-[#174C3C]/25'
              : 'bg-white border-[#E2E5DF] opacity-65'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-[#5C6662] tabular-nums">
              Step 0{idx + 1}
            </span>
            <span
              className={`text-xs font-medium ${
                step.isNegative
                  ? 'text-[#991B1B]'
                  : step.reached
                  ? 'text-[#174C3C]'
                  : 'text-[#5C6662]'
              }`}
            >
              {step.reached ? 'Recorded' : 'Awaiting'}
            </span>
          </div>
          <p className="mt-1 font-display text-sm font-semibold text-[#252B29]">
            {step.title}
          </p>
          {step.entry?.timestamp && (
            <p className="mt-1 font-mono text-xs text-[#5C6662] tabular-nums">
              {formatDateTime(step.entry.timestamp)}
            </p>
          )}
          {step.entry?.note && (
            <p className="mt-1.5 text-xs text-[#5C6662] leading-relaxed">
              {step.entry.note}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
