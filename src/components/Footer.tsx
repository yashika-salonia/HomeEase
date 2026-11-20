import { Link } from 'react-router-dom';
import { HomeEaseLogo } from './Navbar';

export function Footer() {
  return (
    <footer className="bg-[#174C3C] text-[#E8F0ED] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/15">
          <div className="md:col-span-5 space-y-4">
            <HomeEaseLogo inverted />
            <p className="text-sm text-[#D4E2DC] leading-relaxed max-w-sm">
              Reliable Home Help, Just a Click Away. Connecting households with local cooks,
              cleaners, plumbers, electricians, carpenters, painters, and construction workers
              through transparent pricing and a permanent Digital Booking Logbook.
            </p>
            <p className="text-xs text-[#A8C4B9]">
              Support &amp; Demo Inquiries: support@homeease.demo · +91 171 412 9800
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="font-display text-sm font-semibold text-white">Services</h3>
            <ul className="space-y-2 text-sm text-[#D4E2DC]">
              <li>
                <Link to="/workers?category=Cook" className="hover:text-white transition-colors">
                  Home Cooks
                </Link>
              </li>
              <li>
                <Link to="/workers?category=Cleaner" className="hover:text-white transition-colors">
                  Home Cleaners
                </Link>
              </li>
              <li>
                <Link to="/workers?category=Plumber" className="hover:text-white transition-colors">
                  Plumbers
                </Link>
              </li>
              <li>
                <Link to="/workers?category=Electrician" className="hover:text-white transition-colors">
                  Electricians
                </Link>
              </li>
              <li>
                <Link to="/workers?category=Carpenter" className="hover:text-white transition-colors">
                  Carpenters
                </Link>
              </li>
              <li>
                <Link
                  to="/workers?category=Construction%20Labour%20%2F%20Majdoor"
                  className="hover:text-white transition-colors"
                >
                  Construction Labour / Majdoor
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-display text-sm font-semibold text-white">Platform</h3>
            <ul className="space-y-2 text-sm text-[#D4E2DC]">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About HomeEase
                </Link>
              </li>
              <li>
                <Link to="/workers" className="hover:text-white transition-colors">
                  Find Workers
                </Link>
              </li>
              <li>
                <Link to="/register?role=worker" className="hover:text-white transition-colors">
                  Become a Worker
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-display text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2 text-sm text-[#D4E2DC]">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#A8C4B9]">
          <p>© {new Date().getFullYear()} HomeEase Marketplace. All rights reserved.</p>
          <p>Demo Verification labels indicate college-demonstration seed profiles.</p>
        </div>
      </div>
    </footer>
  );
}
