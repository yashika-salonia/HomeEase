import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

type InfoTopic = 'about' | 'contact' | 'terms' | 'privacy';

const CONTENT: Record<
  InfoTopic,
  { title: string; subtitle: string; sections: Array<{ heading: string; body: string }> }
> = {
  about: {
    title: 'About HomeEase',
    subtitle: 'Reliable Home Help, Just a Click Away.',
    sections: [
      {
        heading: 'Our Mission',
        body: 'HomeEase is a two-sided local home-services marketplace built to make discovering, booking, and managing trusted household workers—including cooks, cleaners, plumbers, electricians, carpenters, painters, and construction labourers—simple and transparent.',
      },
      {
        heading: 'The Digital Booking Logbook',
        body: 'Every service request receives a unique Booking ID (HE-YYYY-NNNNNN) and a permanent timestamped lifecycle trail from Booking Created through Worker Acceptance to Completion, protecting both households and workers from scheduling disputes.',
      },
      {
        heading: 'Demo Verification Transparency',
        body: 'Verification statuses displayed on provider profiles in this demonstration environment are explicitly labelled as Demo Verification statuses so users clearly distinguish demonstration records from external government checks.',
      },
    ],
  },
  contact: {
    title: 'Contact HomeEase',
    subtitle: 'Support for customers and local service providers.',
    sections: [
      {
        heading: 'Helpdesk & Inquiries',
        body: 'Email: support@homeease.demo · Phone: +91 171 412 9800 (Monday to Saturday, 8:00 AM – 8:00 PM IST).',
      },
      {
        heading: 'Regional Demonstration Coverage',
        body: 'Sample service providers are currently seeded across Northern India, focusing on Ambala (Model Town, Ambala Cantt, Sector 9) and nearby Haryana & Tricity hubs including Panchkula, Chandigarh, Kurukshetra, Karnal, and Gurugram.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    subtitle: 'Platform guidelines for customers and service providers.',
    sections: [
      {
        heading: 'Bookings & Cancellations',
        body: 'Customers may cancel bookings while in Pending status prior to worker acceptance. Once a worker accepts a request, both parties are expected to honour the scheduled service date, time slot, and published quoted rate.',
      },
      {
        heading: 'Reviews & Conduct',
        body: 'Only customers with Completed bookings may submit a 1–5 star rating and written review. Duplicate reviews for the same booking are prevented automatically.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How HomeEase handles user credentials and booking records.',
    sections: [
      {
        heading: 'Account Security',
        body: 'All user passwords are salted and hashed with bcrypt before storage in MongoDB. Sessions are authenticated using signed JSON Web Tokens (JWT) and role permissions are enforced strictly on backend API routes.',
      },
      {
        heading: 'Service Address & Contact Data',
        body: 'Customer service addresses and contact details are shared exclusively with the assigned worker for the purpose of fulfilling an active booking.',
      },
    ],
  },
};

export function StaticInfoPage({ topic }: { topic: InfoTopic }) {
  const data = CONTENT[topic];
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3]">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="border-b border-[#E2E5DF] pb-5">
            <h1 className="font-display text-3xl font-bold text-[#252B29]">{data.title}</h1>
            <p className="mt-1.5 text-sm text-[#5C6662]">{data.subtitle}</p>
          </div>
          <div className="space-y-6">
            {data.sections.map((s) => (
              <section key={s.heading} className="space-y-2">
                <h2 className="font-display text-lg font-semibold text-[#174C3C]">
                  {s.heading}
                </h2>
                <p className="text-sm sm:text-base text-[#5C6662] leading-relaxed">{s.body}</p>
              </section>
            ))}
          </div>
          <div className="pt-4 border-t border-[#E2E5DF]">
            <Link
              to="/workers"
              className="inline-flex px-5 py-2.5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B]"
            >
              Explore HomeEase Services
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
