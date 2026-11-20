import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, MapPin } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WorkerCard } from '../components/WorkerCard';
import { workersApi } from '../services/api';
import { SERVICE_CATEGORIES, type Worker } from '../types';
import {
  buildWorkerQueryParams,
  DEFAULT_WORKER_FILTERS,
  type WorkerFilterState,
} from '../utils/filters';

export function ExploreWorkersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<WorkerFilterState>(() => ({
    ...DEFAULT_WORKER_FILTERS,
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'All',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minExperience: searchParams.get('minExperience') || '',
    minRating: searchParams.get('minRating') || '',
    availableOnly: searchParams.get('available') === 'true',
    sort:
      (searchParams.get('sort') as WorkerFilterState['sort']) || 'rating',
  }));

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const fetchWorkers = useCallback(async (currentFilters: WorkerFilterState) => {
    setLoading(true);
    setError('');
    try {
      const params = buildWorkerQueryParams(currentFilters);
      const data = await workersApi.search(params);
      setWorkers(data.workers);
    } catch {
      setError('Unable to load service providers right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = buildWorkerQueryParams(filters);
    setSearchParams(params, { replace: true });
    const timer = window.setTimeout(() => {
      fetchWorkers(filters);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [filters, fetchWorkers, setSearchParams]);

  const handleReset = () => {
    setFilters(DEFAULT_WORKER_FILTERS);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2E5DF]">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#252B29]">
              Explore Home Service Workers
            </h1>
            <p className="mt-1 text-sm text-[#5C6662]">
              Search by name, trade, or neighbourhood and compare published rates, experience,
              and verified ratings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFiltersMobile((v) => !v)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-[#E2E5DF] rounded-lg text-[#252B29]"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              {showFiltersMobile ? 'Hide Filters' : 'Filters'}
            </button>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-workers" className="text-xs font-medium text-[#5C6662]">
                Sort by
              </label>
              <select
                id="sort-workers"
                value={filters.sort}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sort: e.target.value as WorkerFilterState['sort'],
                  }))
                }
                className="px-3 py-2 text-sm bg-white border border-[#D4D8D2] rounded-lg text-[#252B29] focus:outline-none focus:border-[#174C3C]"
              >
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Quick Filter Bar */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto py-4"
          role="group"
          aria-label="Filter by service category"
        >
          {['All', ...SERVICE_CATEGORIES].map((cat) => {
            const active = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#174C3C] text-white'
                    : 'bg-white text-[#252B29] border border-[#E2E5DF] hover:border-[#174C3C]/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
          {/* Sidebar Filters */}
          <aside
            className={`lg:col-span-3 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}
          >
            <div className="bg-white border border-[#E2E5DF] rounded-xl p-5 space-y-5 sticky top-24">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-[#252B29]">
                  Filter Workers
                </h2>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#174C3C] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset
                </button>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="filter-search" className="block text-xs font-medium text-[#252B29]">
                  Search name or keyword
                </label>
                <div className="relative">
                  <Search
                    className="w-4 h-4 text-[#5C6662] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="filter-search"
                    type="text"
                    value={filters.q}
                    onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                    placeholder="e.g. Rekha, wiring, tiffin"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="filter-location" className="block text-xs font-medium text-[#252B29]">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    className="w-4 h-4 text-[#5C6662] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="filter-location"
                    type="text"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="e.g. Ambala, Haryana, Chandigarh"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-[#252B29]">
                  Rate range (₹)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="filter-min-price" className="sr-only">
                      Minimum price
                    </label>
                    <input
                      id="filter-min-price"
                      type="number"
                      min={0}
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                      }
                      placeholder="Min ₹"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#D4D8D2] font-mono tabular-nums focus:outline-none focus:border-[#174C3C]"
                    />
                  </div>
                  <div>
                    <label htmlFor="filter-max-price" className="sr-only">
                      Maximum price
                    </label>
                    <input
                      id="filter-max-price"
                      type="number"
                      min={0}
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                      }
                      placeholder="Max ₹"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#D4D8D2] font-mono tabular-nums focus:outline-none focus:border-[#174C3C]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="filter-experience"
                  className="block text-xs font-medium text-[#252B29]"
                >
                  Minimum experience
                </label>
                <select
                  id="filter-experience"
                  value={filters.minExperience}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, minExperience: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D4D8D2] bg-white focus:outline-none focus:border-[#174C3C]"
                >
                  <option value="">Any experience</option>
                  <option value="2">2+ years</option>
                  <option value="5">5+ years</option>
                  <option value="8">8+ years</option>
                  <option value="10">10+ years</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="filter-rating"
                  className="block text-xs font-medium text-[#252B29]"
                >
                  Minimum rating
                </label>
                <select
                  id="filter-rating"
                  value={filters.minRating}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, minRating: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D4D8D2] bg-white focus:outline-none focus:border-[#174C3C]"
                >
                  <option value="">Any rating</option>
                  <option value="3">3.0+ stars</option>
                  <option value="4">4.0+ stars</option>
                  <option value="4.5">4.5+ stars</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, availableOnly: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-[#D4D8D2] accent-[#174C3C]"
                />
                <span className="text-sm text-[#252B29]">Show available workers only</span>
              </label>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between text-sm text-[#5C6662]">
              <p className="tabular-nums">
                {loading
                  ? 'Searching providers...'
                  : `Showing ${workers.length} ${workers.length === 1 ? 'worker' : 'workers'}`}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm"
              >
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="bg-white border border-[#E2E5DF] rounded-xl p-6 h-60 animate-pulse"
                  />
                ))}
              </div>
            ) : workers.length === 0 ? (
              <div className="bg-white border border-[#E2E5DF] rounded-xl p-12 text-center space-y-4">
                <h3 className="font-display text-lg font-semibold text-[#252B29]">
                  No matching workers found
                </h3>
                <p className="text-sm text-[#5C6662] max-w-md mx-auto">
                  Try widening your price range, clearing the location filter, or switching to
                  all service categories.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workers.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
