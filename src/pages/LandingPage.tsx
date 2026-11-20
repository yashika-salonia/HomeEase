import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ChefHat,
  Sparkles,
  Wrench,
  Zap,
  Hammer,
  HardHat,
  ArrowRight,
  BookOpenCheck,
  ShieldCheck,
  IndianRupee,
  Star,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WorkerCard } from '../components/WorkerCard';
import { workersApi } from '../services/api';
import { SERVICE_CATEGORIES, type Worker } from '../types';

const HERO_IMAGE = '/src/assets/images/hero_home_care_1795163245778.jpg';

const POPULAR_CATEGORIES = [
  {
    name: 'Cook',
    icon: ChefHat,
    description:
      'Daily home-cooked meals, family tiffin preparation, and hygienic kitchen care tailored to your menu.',
  },
  {
    name: 'Cleaner',
    icon: Sparkles,
    description:
      'Regular apartment upkeep, bathroom descaling, kitchen degreasing, and move-in deep cleaning.',
  },
  {
    name: 'Plumber',
    icon: Wrench,
    description:
      'Leak detection, faucet and mixer replacements, geyser fittings, and drainage repair.',
  },
  {
    name: 'Electrician',
    icon: Zap,
    description:
      'MCB troubleshooting, ceiling fan mounting, inverter backup wiring, and switchboard upgrades.',
  },
  {
    name: 'Carpenter',
    icon: Hammer,
    description:
      'Wardrobe hinges, door locks, custom shelving, furniture assembly, and woodwork repairs.',
  },
  {
    name: 'Construction Labour / Majdoor',
    icon: HardHat,
    description:
      'Masonry patchwork, plastering, waterproofing putty, tile grouting, and renovation support.',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Find a service',
    description:
      'Browse by trade, neighbourhood, or rate to find local specialists for daily chores or home repairs.',
  },
  {
    step: '02',
    title: 'Choose a worker',
    description:
      'Compare years of experience, published hourly or daily pricing, availability, and verified customer reviews.',
  },
  {
    step: '03',
    title: 'Book your service',
    description:
      'Pick your preferred date, time slot, and service address. Receive an instant unique Booking ID.',
  },
  {
    step: '04',
    title: 'Track your booking',
    description:
      'Follow every status update—Pending, Accepted, and Completed—in your permanent Digital Booking Logbook.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [locationQuery, setLocationQuery] = useState('');
  const [featuredWorkers, setFeaturedWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  useEffect(() => {
    let active = true;
    workersApi
      .list({ sort: 'rating', limit: '6' })
      .then((res) => {
        if (active) setFeaturedWorkers(res.workers);
      })
      .catch(() => {
        if (active) setFeaturedWorkers([]);
      })
      .finally(() => {
        if (active) setLoadingWorkers(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    navigate(`/workers${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-sm font-medium text-[#174C3C]">
                Reliable Home Help, Just a Click Away.
              </p>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-[#252B29] leading-[1.08] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Your Home Deserves the Best Care.
              </h1>

              <p className="text-base sm:text-lg text-[#5C6662] leading-relaxed max-w-xl">
                Find trusted cooks, cleaners, electricians, plumbers and skilled workers near
                you. Book reliable home services without the hassle.
              </p>

              {/* Hero Search Form */}
              <form
                onSubmit={handleHeroSearch}
                aria-label="Search home service workers"
                className="bg-white border border-[#E2E5DF] rounded-xl p-4 shadow-sm space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="hero-search-input" className="sr-only">
                      Search worker or service
                    </label>
                    <div className="relative">
                      <Search
                        className="w-4 h-4 text-[#5C6662] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="hero-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search skill or worker name..."
                        className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-[#D4D8D2] bg-[#F8F8F3]/60 text-[#252B29] placeholder:text-[#5C6662] focus:bg-white focus:outline-none focus:border-[#174C3C] focus:ring-2 focus:ring-[#174C3C]/15"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="hero-category-select" className="sr-only">
                      Select service category
                    </label>
                    <select
                      id="hero-category-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] bg-[#F8F8F3]/60 text-[#252B29] focus:bg-white focus:outline-none focus:border-[#174C3C] focus:ring-2 focus:ring-[#174C3C]/15"
                    >
                      <option value="All">All Service Categories</option>
                      {SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <label htmlFor="hero-location-input" className="sr-only">
                      Location
                    </label>
                    <MapPin
                      className="w-4 h-4 text-[#5C6662] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="hero-location-input"
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="City or neighbourhood (e.g. Ambala, Chandigarh)"
                      className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-[#D4D8D2] bg-[#F8F8F3]/60 text-[#252B29] placeholder:text-[#5C6662] focus:bg-white focus:outline-none focus:border-[#174C3C] focus:ring-2 focus:ring-[#174C3C]/15"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Search Workers
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#5C6662]">
                <span>Transparent hourly &amp; daily rates</span>
                <span aria-hidden="true">·</span>
                <span>Digital Booking Logbook</span>
                <span aria-hidden="true">·</span>
                <span>Verified customer reviews</span>
              </div>
            </div>

            {/* Hero Editorial Visual */}
            <div className="lg:col-span-6 flex">
              <div className="relative w-full min-h-[300px] lg:min-h-full rounded-2xl overflow-hidden border border-[#E2E5DF] bg-[#E8F0ED]">
                {!heroImgFailed ? (
                  <img
                    src={HERO_IMAGE}
                    alt="Warm sunlit modern home kitchen and living room cared for with HomeEase"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-10 text-center text-[#174C3C]">
                    <div>
                      <p className="font-display text-2xl font-semibold">HomeEase</p>
                      <p className="text-sm mt-1">Trusted local home care professionals</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0D2E24]/95 via-[#0D2E24]/75 to-transparent pt-14 p-6 text-white">
                  <p className="text-xs font-semibold text-[#F4A261]">
                    Digital Booking Logbook Included
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-medium leading-snug max-w-md text-white">
                    Every booking receives a permanent timestamped record from request to job
                    completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Service Categories */}
        <section className="bg-white border-y border-[#E2E5DF] py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#252B29]">
                  Popular Service Categories
                </h2>
                <p className="text-sm sm:text-base text-[#5C6662] max-w-xl">
                  Choose a household trade to browse available workers, compare rates, and book
                  directly.
                </p>
              </div>
              <Link
                to="/workers"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#174C3C] hover:text-[#10372B] whitespace-nowrap"
              >
                Explore all services
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {POPULAR_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.name}
                    className="bg-[#F8F8F3] border border-[#E2E5DF] rounded-xl p-6 flex flex-col justify-between gap-5 hover:border-[#174C3C]/40 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-lg bg-[#174C3C] text-white flex items-center justify-center">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-[#252B29]">
                        {category.name}
                      </h3>
                      <p className="text-sm text-[#5C6662] leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    <Link
                      to={`/workers?category=${encodeURIComponent(category.name)}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#174C3C] hover:text-[#10372B] pt-2"
                    >
                      Explore {category.name.split(' / ')[0]}s
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Workers */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#252B29]">
                Featured Local Workers
              </h2>
              <p className="text-sm sm:text-base text-[#5C6662] max-w-xl">
                Experienced service providers across Ambala, Chandigarh, Kurukshetra, and Haryana
                with upfront rates and real booking histories.
              </p>
            </div>
            <Link
              to="/workers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#174C3C] hover:text-[#10372B] whitespace-nowrap"
            >
              Browse full directory
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {loadingWorkers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-[#E2E5DF] rounded-xl p-6 h-64 animate-pulse"
                />
              ))}
            </div>
          ) : featuredWorkers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWorkers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E5DF] rounded-xl p-10 text-center">
              <p className="text-sm text-[#5C6662]">
                No featured workers available right now. Check back shortly or register as a
                provider.
              </p>
            </div>
          )}
        </section>

        {/* How HomeEase Works */}
        <section
          id="how-it-works"
          className="bg-white border-y border-[#E2E5DF] py-16 lg:py-20 scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2 mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#252B29]">
                How HomeEase Works
              </h2>
              <p className="text-sm sm:text-base text-[#5C6662]">
                From searching a local specialist to logging completed work, every step stays
                clear for both households and workers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="bg-[#F8F8F3] border border-[#E2E5DF] rounded-xl p-6 space-y-3"
                >
                  <span className="font-mono text-sm font-semibold text-[#F4A261] tabular-nums">
                    Step {item.step}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-[#252B29]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5C6662] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Digital Booking Logbook Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#252B29]">
                Built for Clarity, Safety &amp; Permanent Records
              </h2>
              <p className="text-sm sm:text-base text-[#5C6662] leading-relaxed">
                Informal home-service arrangements often break down over unclear rates or
                forgotten appointments. HomeEase pairs transparent provider profiles with our
                signature Digital Booking Logbook.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#174C3C] font-display font-semibold text-base">
                    <IndianRupee className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Transparent Pricing</span>
                  </div>
                  <p className="text-sm text-[#5C6662]">
                    Hourly and daily rates are published upfront and locked when you book.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#174C3C] font-display font-semibold text-base">
                    <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Detailed Worker Profiles</span>
                  </div>
                  <p className="text-sm text-[#5C6662]">
                    Inspect experience, working hours, neighbourhoods, and demo verification
                    status before booking.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#174C3C] font-display font-semibold text-base">
                    <BookOpenCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Digital Booking Logbook</span>
                  </div>
                  <p className="text-sm text-[#5C6662]">
                    Every booking carries a unique ID and timestamped timeline from creation to
                    completion.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#174C3C] font-display font-semibold text-base">
                    <Star className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Verified Job Reviews</span>
                  </div>
                  <p className="text-sm text-[#5C6662]">
                    Only customers with completed bookings can submit 1–5 star ratings and
                    written feedback.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] transition-colors"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/register?role=worker"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#174C3C] bg-white border border-[#174C3C]/30 rounded-lg hover:bg-[#E8F0ED] transition-colors"
                >
                  Register as a Worker
                </Link>
              </div>
            </div>

            {/* Adjacent Logbook Preview */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E2E5DF]">
                  <div>
                    <p className="text-xs text-[#5C6662]">Digital Booking Logbook Sample</p>
                    <p className="font-mono text-base font-semibold text-[#174C3C] tabular-nums">
                      HE-2026-205102
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#14532D] bg-[#ECFDF3] border border-[#16A34A]/30 px-2.5 py-1 rounded-md">
                    Completed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-[#5C6662]">Service &amp; Provider</p>
                    <p className="font-medium text-[#252B29]">Cook · Rekha Joshi</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#5C6662]">Quoted Rate</p>
                    <p className="font-mono font-semibold text-[#252B29] tabular-nums">
                      ₹360/hr
                    </p>
                  </div>
                </div>

                <ol className="space-y-3 pt-1">
                  {[
                    {
                      step: '01',
                      label: 'Booking Created',
                      time: '08 Nov 2026 · 09:15 AM',
                      note: 'Request submitted for Ambala City residence',
                    },
                    {
                      step: '02',
                      label: 'Accepted by Worker',
                      time: '09 Nov 2026 · 10:02 AM',
                      note: 'Confirmed morning meal preparation slot',
                    },
                    {
                      step: '03',
                      label: 'Job Completed',
                      time: '10 Nov 2026 · 10:10 AM',
                      note: 'Service completed and rated 5.0 by customer',
                    },
                  ].map((item) => (
                    <li
                      key={item.step}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F8F3] border border-[#E2E5DF]"
                    >
                      <span className="font-mono text-xs font-semibold text-[#174C3C] tabular-nums mt-0.5">
                        {item.step}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[#252B29]">
                            {item.label}
                          </span>
                          <span className="font-mono text-xs text-[#5C6662] tabular-nums">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-[#5C6662] mt-0.5">{item.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
