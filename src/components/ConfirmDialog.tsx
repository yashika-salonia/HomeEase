import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  showNoteInput?: boolean;
  noteLabel?: string;
  notePlaceholder?: string;
  loading?: boolean;
  onConfirm: (note?: string) => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Go Back',
  tone = 'primary',
  showNoteInput = false,
  noteLabel = 'Optional note',
  notePlaceholder = 'Add a short note for the booking logbook...',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) setNote('');
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-white border border-[#E2E5DF] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3
            id="confirm-dialog-title"
            className="font-display text-lg font-semibold text-[#252B29]"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close confirmation dialog"
            className="p-1 text-[#5C6662] hover:text-[#252B29] rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#5C6662] leading-relaxed">{description}</p>

        {showNoteInput && (
          <div className="space-y-1.5">
            <label
              htmlFor="confirm-dialog-note"
              className="block text-xs font-medium text-[#252B29]"
            >
              {noteLabel}
            </label>
            <textarea
              id="confirm-dialog-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={notePlaceholder}
              className="w-full rounded-lg border border-[#D4D8D2] px-3 py-2 text-sm text-[#252B29] focus:outline-none focus:border-[#174C3C] focus:ring-2 focus:ring-[#174C3C]/15"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-[#252B29] bg-[#F8F8F3] border border-[#E2E5DF] rounded-lg hover:bg-[#ECEEE7] transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirm(note.trim() || undefined)}
            className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer disabled:opacity-60 ${
              tone === 'danger'
                ? 'bg-[#B91C1C] hover:bg-[#991B1B]'
                : 'bg-[#174C3C] hover:bg-[#10372B]'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
