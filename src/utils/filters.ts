export interface WorkerFilterState {
  q: string;
  category: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  minExperience: string;
  minRating: string;
  availableOnly: boolean;
  sort: 'rating' | 'price_asc' | 'price_desc' | 'experience';
}

export const DEFAULT_WORKER_FILTERS: WorkerFilterState = {
  q: '',
  category: 'All',
  location: '',
  minPrice: '',
  maxPrice: '',
  minExperience: '',
  minRating: '',
  availableOnly: false,
  sort: 'rating',
};

export function buildWorkerQueryParams(filters: WorkerFilterState): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.q.trim()) params.q = filters.q.trim();
  if (filters.category && filters.category !== 'All') params.category = filters.category;
  if (filters.location.trim()) params.location = filters.location.trim();
  if (filters.minPrice.trim() && !Number.isNaN(Number(filters.minPrice))) {
    params.minPrice = filters.minPrice.trim();
  }
  if (filters.maxPrice.trim() && !Number.isNaN(Number(filters.maxPrice))) {
    params.maxPrice = filters.maxPrice.trim();
  }
  if (filters.minExperience.trim() && Number(filters.minExperience) > 0) {
    params.minExperience = filters.minExperience.trim();
  }
  if (filters.minRating.trim() && Number(filters.minRating) > 0) {
    params.minRating = filters.minRating.trim();
  }
  if (filters.availableOnly) params.available = 'true';
  if (filters.sort) params.sort = filters.sort;
  return params;
}

export function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatRate(price: number, pricingType: 'hourly' | 'daily'): string {
  return `${formatCurrency(price)}/${pricingType === 'daily' ? 'day' : 'hr'}`;
}

export function formatDateTime(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatServiceDate(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return dateStr;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getTodayIsoDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getInitials(name: string): string {
  const parts = (name || 'HE').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
