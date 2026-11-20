import { User } from '../models/User';
import { WorkerProfile } from '../models/WorkerProfile';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';
import { computeAverageRating } from '../utils/bookingRules';

const PORTRAITS = {
  cook: '/src/assets/images/worker_cook_portrait_1795163246176.jpg',
  cleaner: '/src/assets/images/worker_cleaner_portrait_1795163245225.jpg',
  electrician: '/src/assets/images/worker_electrician_portrait_1795163245358.jpg',
  plumber: '/src/assets/images/worker_plumber_portrait_1795163257967.jpg',
  carpenter: '/src/assets/images/worker_carpenter_portrait_1795163273651.jpg',
};

export const DEMO_ACCOUNTS_DOC = [
  { role: 'Customer', name: 'Aarav Mehta', email: 'customer@homeease.demo', password: 'Password@123' },
  { role: 'Cook', name: 'Rekha Joshi', email: 'rekha.cook@homeease.demo', password: 'Worker@101' },
  { role: 'Cleaner', name: 'Pooja Verma', email: 'pooja.cleaner@homeease.demo', password: 'Worker@102' },
  { role: 'Plumber', name: 'Deepak Tiwari', email: 'deepak.plumber@homeease.demo', password: 'Worker@103' },
  { role: 'Electrician', name: 'Arjun Nair', email: 'arjun.electrician@homeease.demo', password: 'Worker@104' },
  { role: 'Carpenter', name: 'Harish Vishwakarma', email: 'harish.carpenter@homeease.demo', password: 'Worker@105' },
  { role: 'Painter', name: 'Manoj Saini', email: 'manoj.painter@homeease.demo', password: 'Worker@106' },
  { role: 'Construction Labour', name: 'Santosh Chauhan', email: 'santosh.labour@homeease.demo', password: 'Worker@107' },
  { role: 'Cook & Cleaner', name: 'Savita Pawar', email: 'savita.helper@homeease.demo', password: 'Worker@108' },
];

const LEGACY_DEFAULT_WORKER_EMAILS = [
  'cook@homeease.demo',
  'cleaner@homeease.demo',
  'plumber@homeease.demo',
  'electrician@homeease.demo',
  'carpenter@homeease.demo',
  'labour@homeease.demo',
  'meenakshi.cook@homeease.demo',
  'suresh.painter@homeease.demo',
  'farhan.elec@homeease.demo',
  'lakshmi.clean@homeease.demo',
];

export async function seedDatabase(options: { forceReset?: boolean } = {}): Promise<boolean> {
  const existingCount = await User.countDocuments();
  const hasLegacyDefaults =
    existingCount > 0
      ? Boolean(await User.exists({ email: { $in: LEGACY_DEFAULT_WORKER_EMAILS } }))
      : false;
  const hasLegacyLocations =
    existingCount > 0
      ? Boolean(await User.exists({ location: { $regex: /Bengaluru|Pune|Mumbai/i } }))
      : false;

  const shouldReset = Boolean(options.forceReset) || hasLegacyDefaults || hasLegacyLocations;

  if (existingCount > 0 && !shouldReset) {
    return false;
  }

  if (shouldReset) {
    await Promise.all([
      Review.deleteMany({}),
      Booking.deleteMany({}),
      WorkerProfile.deleteMany({}),
      User.deleteMany({}),
    ]);
  }

  // 1. Seed Customers (Ambala & Haryana / Tricity)
  const customerPrimary = await User.create({
    name: 'Aarav Mehta',
    email: 'customer@homeease.demo',
    phone: '9812045678',
    password: 'Password@123',
    role: 'customer',
    location: 'Model Town, Ambala City, Haryana',
    profileImage: '',
  });

  const customerSecondary = await User.create({
    name: 'Neha Deshpande',
    email: 'neha.customer@homeease.demo',
    phone: '9813023411',
    password: 'Password@123',
    role: 'customer',
    location: 'Ambala Cantt, Haryana',
    profileImage: '',
  });

  const customerThird = await User.create({
    name: 'Siddharth Rao',
    email: 'siddharth.customer@homeease.demo',
    phone: '9814234509',
    password: 'Password@123',
    role: 'customer',
    location: 'Sector 17, Panchkula, Haryana',
    profileImage: '',
  });

  // 2. Seed 8 Brand New Workers across Ambala, Haryana & Northern India
  const workerSeeds = [
    {
      name: 'Rekha Joshi',
      email: 'rekha.cook@homeease.demo',
      password: 'Worker@101',
      phone: '9812112201',
      location: 'Model Town, Ambala City, Haryana',
      profileImage: PORTRAITS.cook,
      serviceCategories: ['Cook'],
      experience: 8,
      description:
        'Experienced home cook specializing in North Indian, Punjabi, Haryanvi, and low-oil daily family meals, student & office tiffins, and clean post-cooking kitchen upkeep.',
      pricingType: 'hourly' as const,
      price: 360,
      workingHours: '6:30 AM – 8:30 PM (Daily)',
      availability: true,
      verificationStatus: 'Demo Verified' as const,
      pendingTask: 'Prepare vegetarian weekday lunch & dinner for 3 adults (less spice, phulkas + dal + sabzi).',
      pendingTime: '08:00 AM – 10:00 AM',
      completedTask: 'Weekend family breakfast and lunch prep for 5 guests.',
      reviewText: 'Rekha was punctual, cooked fresh homestyle food, and left the kitchen counter spotless.',
      reviewRating: 5,
    },
    {
      name: 'Pooja Verma',
      email: 'pooja.cleaner@homeease.demo',
      password: 'Worker@102',
      phone: '9812112202',
      location: 'Ambala Cantt, Haryana',
      profileImage: PORTRAITS.cleaner,
      serviceCategories: ['Cleaner'],
      experience: 5,
      description:
        'Thorough residential deep cleaning, bathroom descaling, kitchen hood degreasing, balcony scrubbing, and eco-friendly floor sanitization.',
      pricingType: 'hourly' as const,
      price: 290,
      workingHours: '8:00 AM – 6:30 PM (Mon – Sat)',
      availability: true,
      verificationStatus: 'Demo Verified' as const,
      pendingTask: '2BHK apartment deep cleaning including kitchen tiles, two bathrooms, and balcony glass.',
      pendingTime: '10:00 AM – 01:00 PM',
      completedTask: 'Move-in apartment cleaning and bathroom descaling.',
      reviewText: 'Pooja cleaned every corner carefully without rushing. Bathrooms and glass doors look brand new.',
      reviewRating: 5,
    },
    {
      name: 'Deepak Tiwari',
      email: 'deepak.plumber@homeease.demo',
      password: 'Worker@103',
      phone: '9812112203',
      location: 'Sector 9, Ambala City, Haryana',
      profileImage: PORTRAITS.plumber,
      serviceCategories: ['Plumber'],
      experience: 11,
      description:
        'Certified residential plumber for concealed leak detection, bathroom mixer & shower installations, geyser inlet lines, and kitchen sink unclogging.',
      pricingType: 'hourly' as const,
      price: 440,
      workingHours: '7:30 AM – 8:00 PM (Daily)',
      availability: true,
      verificationStatus: 'Demo Verified' as const,
      pendingTask: 'Replace leaking bathroom diverter cartridge and inspect kitchen sink drain joint.',
      pendingTime: '11:00 AM – 01:00 PM',
      completedTask: 'Installed new overhead water pressure pump and checked kitchen faucet line.',
      reviewText: 'Deepak diagnosed the pressure drop quickly and explained every spare part clearly.',
      reviewRating: 5,
    },
    {
      name: 'Arjun Nair',
      email: 'arjun.electrician@homeease.demo',
      password: 'Worker@104',
      phone: '9812112204',
      location: 'Sector 20, Panchkula, Haryana',
      profileImage: PORTRAITS.electrician,
      serviceCategories: ['Electrician'],
      experience: 9,
      description:
        'Skilled domestic electrician handling MCB distribution boards, BLDC ceiling fans, home inverter backup wiring, earthing checks, and modular switches.',
      pricingType: 'hourly' as const,
      price: 460,
      workingHours: '8:00 AM – 9:00 PM (Daily)',
      availability: true,
      verificationStatus: 'Demo Verified' as const,
      pendingTask: 'Mount 2 ceiling fans in bedrooms and troubleshoot frequent living room MCB tripping.',
      pendingTime: '04:00 PM – 06:00 PM',
      completedTask: 'Inverter backup wiring inspection and 3 modular wall socket replacements.',
      reviewText: 'Arjun tested every circuit with a multimeter and fixed our tripping issue neatly.',
      reviewRating: 5,
    },
    {
      name: 'Harish Vishwakarma',
      email: 'harish.carpenter@homeease.demo',
      password: 'Worker@105',
      phone: '9812112205',
      location: 'Sector 22, Chandigarh',
      profileImage: PORTRAITS.carpenter,
      serviceCategories: ['Carpenter'],
      experience: 14,
      description:
        'Master carpenter for teakwood door alignment, smart mortise lock fitting, modular wardrobe sliding tracks, custom shelving, and furniture repair.',
      pricingType: 'daily' as const,
      price: 1250,
      workingHours: '9:00 AM – 6:30 PM (Mon – Sat)',
      availability: true,
      verificationStatus: 'Demo Verified' as const,
      pendingTask: 'Repair master bedroom wardrobe sliding track and fit new main-door latch lock.',
      pendingTime: 'Full Day (09:00 AM – 06:00 PM)',
      completedTask: 'Aligned modular kitchen hinges and restored solid teak study table.',
      reviewText: 'Harish did crisp joinery work and cleaned up all wood shavings afterward.',
      reviewRating: 5,
    },
    {
      name: 'Manoj Saini',
      email: 'manoj.painter@homeease.demo',
      password: 'Worker@106',
      phone: '9812112206',
      location: 'Sector 13, Kurukshetra, Haryana',
      profileImage: PORTRAITS.electrician,
      serviceCategories: ['Painter'],
      experience: 7,
      description:
        'Interior emulsion repainting, dampness primer waterproofing, smooth wall putty finishing, balcony grill enamel coating, and clean drop-sheet masking.',
      pricingType: 'daily' as const,
      price: 1150,
      workingHours: '8:30 AM – 6:30 PM (Mon – Sat)',
      availability: true,
      verificationStatus: 'Demo Verified' as const,
      pendingTask: 'Living room accent wall primer + 2 coats of matte washable emulsion.',
      pendingTime: 'Full Day (09:00 AM – 06:00 PM)',
      completedTask: 'Bedroom wall damp-seal treatment and fresh ivory repainting.',
      reviewText: 'Clean paint edges, zero floor splashes, and finished right on schedule.',
      reviewRating: 4,
    },
    {
      name: 'Santosh Chauhan',
      email: 'santosh.labour@homeease.demo',
      password: 'Worker@107',
      phone: '9812112207',
      location: 'Model Town, Karnal, Haryana',
      profileImage: PORTRAITS.carpenter,
      serviceCategories: ['Construction Labour / Majdoor'],
      experience: 10,
      description:
        'Reliable masonry repair, wall plastering, bathroom tile grouting, waterproofing cement patchwork, and home renovation material handling.',
      pricingType: 'daily' as const,
      price: 880,
      workingHours: '8:00 AM – 6:00 PM (Mon – Sat)',
      availability: true,
      verificationStatus: 'Demo Verified' as const,
      pendingTask: 'Terrace parapet crack plastering and balcony floor tile re-grouting.',
      pendingTime: 'Full Day (09:00 AM – 06:00 PM)',
      completedTask: 'Kitchen utility wall masonry patch and waterproof cement finish.',
      reviewText: 'Hardworking, dependable, and swept all masonry rubble neatly before leaving.',
      reviewRating: 5,
    },
    {
      name: 'Savita Pawar',
      email: 'savita.helper@homeease.demo',
      password: 'Worker@108',
      phone: '9812112208',
      location: 'DLF Phase 3, Gurugram, Haryana',
      profileImage: PORTRAITS.cook,
      serviceCategories: ['Cook', 'Cleaner'],
      experience: 6,
      description:
        'Combined household cooking and cleaning specialist for busy homes and student flats—Punjabi & North Indian home meals plus hygienic daily house upkeep.',
      pricingType: 'hourly' as const,
      price: 330,
      workingHours: '7:00 AM – 7:30 PM (Mon – Sat)',
      availability: true,
      verificationStatus: 'Demo Review Pending' as const,
      pendingTask: 'Morning tiffin meal prep (poha, dal, rotis) plus kitchen & dining area tidy-up.',
      pendingTime: '07:30 AM – 09:30 AM',
      completedTask: 'Weekly meal prep and apartment kitchen organization.',
      reviewText: 'Savita is warm, trustworthy, and handles both cooking and kitchen cleaning effortlessly.',
      reviewRating: 5,
    },
  ];

  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  const formatDateOffset = (offsetDays: number) => {
    const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  };

  let bookingSeq = 205101;

  for (let i = 0; i < workerSeeds.length; i += 1) {
    const w = workerSeeds[i];

    const workerUser = await User.create({
      name: w.name,
      email: w.email,
      phone: w.phone,
      password: w.password,
      role: 'worker',
      location: w.location,
      profileImage: w.profileImage,
    });

    const workerProfile = await WorkerProfile.create({
      userId: workerUser._id,
      serviceCategories: w.serviceCategories,
      experience: w.experience,
      description: w.description,
      pricingType: w.pricingType,
      price: w.price,
      workingHours: w.workingHours,
      availability: w.availability,
      verificationStatus: w.verificationStatus,
      averageRating: 0,
      totalReviews: 0,
    });

    const pendingCustomer = i < 4 ? customerPrimary : i % 2 === 0 ? customerSecondary : customerThird;
    const pendingAddress =
      pendingCustomer._id.equals(customerPrimary._id)
        ? 'House No. 42, Sector 7, Urban Estate, Ambala City, Haryana'
        : pendingCustomer._id.equals(customerSecondary._id)
        ? '118, Mahesh Nagar, Ambala Cantt, Haryana'
        : 'Flat 204, Shivalik Enclave, Sector 17, Panchkula, Haryana';

    // 1. Seed a Pending booking request for EVERY worker so any worker login can immediately demonstrate Accept/Reject!
    await Booking.create({
      bookingId: `HE-2026-${bookingSeq++}`,
      customerId: pendingCustomer._id,
      workerId: workerUser._id,
      workerProfileId: workerProfile._id,
      serviceCategory: w.serviceCategories[0],
      serviceDate: formatDateOffset(2 + (i % 5)),
      preferredTime: w.pendingTime,
      address: pendingAddress,
      instructions: w.pendingTask,
      price: w.price,
      pricingType: w.pricingType,
      status: 'Pending',
      createdAt: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
          note: 'Booking request submitted by customer.',
          updatedBy: pendingCustomer._id,
        },
      ],
    });

    // 2. Seed a Completed booking + Review for every worker so every worker has genuine reviews & ratings
    const completedCustomer = i === 0 ? customerPrimary : i % 2 === 0 ? customerThird : customerSecondary;
    const completedBooking = await Booking.create({
      bookingId: `HE-2026-${bookingSeq++}`,
      customerId: completedCustomer._id,
      workerId: workerUser._id,
      workerProfileId: workerProfile._id,
      serviceCategory: w.serviceCategories[0],
      serviceDate: formatDateOffset(-(5 + i)),
      preferredTime: w.pendingTime,
      address:
        completedCustomer._id.equals(customerPrimary._id)
          ? 'House No. 42, Sector 7, Urban Estate, Ambala City, Haryana'
          : completedCustomer._id.equals(customerSecondary._id)
          ? '118, Mahesh Nagar, Ambala Cantt, Haryana'
          : 'Flat 204, Shivalik Enclave, Sector 17, Panchkula, Haryana',
      instructions: w.completedTask,
      price: w.price,
      pricingType: w.pricingType,
      status: 'Completed',
      reviewed: true,
      createdAt: daysAgo(7 + i),
      statusHistory: [
        {
          status: 'Pending',
          timestamp: daysAgo(7 + i),
          note: 'Booking request submitted by customer.',
          updatedBy: completedCustomer._id,
        },
        {
          status: 'Accepted',
          timestamp: daysAgo(6 + i),
          note: `Slot confirmed by ${w.name}.`,
          updatedBy: workerUser._id,
        },
        {
          status: 'Completed',
          timestamp: daysAgo(5 + i),
          note: 'Service finished and verified with customer.',
          updatedBy: workerUser._id,
        },
      ],
    });

    await Review.create({
      bookingId: completedBooking._id,
      customerId: completedCustomer._id,
      workerId: workerUser._id,
      workerProfileId: workerProfile._id,
      rating: w.reviewRating,
      comment: w.reviewText,
    });

    // 3. Give Deepak (Plumber) an extra Completed-unreviewed booking for Aarav so Customer can immediately demo writing a review
    if (i === 2) {
      await Booking.create({
        bookingId: `HE-2026-${bookingSeq++}`,
        customerId: customerPrimary._id,
        workerId: workerUser._id,
        workerProfileId: workerProfile._id,
        serviceCategory: 'Plumber',
        serviceDate: formatDateOffset(-3),
        preferredTime: '11:00 AM – 01:00 PM',
        address: 'House No. 42, Sector 7, Urban Estate, Ambala City, Haryana',
        instructions: 'Kitchen sink U-bend washer replacement and tap flow test.',
        price: w.price,
        pricingType: w.pricingType,
        status: 'Completed',
        reviewed: false,
        createdAt: daysAgo(5),
        statusHistory: [
          { status: 'Pending', timestamp: daysAgo(5), note: 'Booking submitted.', updatedBy: customerPrimary._id },
          { status: 'Accepted', timestamp: daysAgo(4), note: 'Accepted by Deepak Tiwari.', updatedBy: workerUser._id },
          { status: 'Completed', timestamp: daysAgo(3), note: 'Leak sealed and tested.', updatedBy: workerUser._id },
        ],
      });
    }

    // 4. Give Arjun (Electrician) an Accepted active job for Aarav so Worker can also demo "Mark Completed" immediately
    if (i === 3) {
      await Booking.create({
        bookingId: `HE-2026-${bookingSeq++}`,
        customerId: customerPrimary._id,
        workerId: workerUser._id,
        workerProfileId: workerProfile._id,
        serviceCategory: 'Electrician',
        serviceDate: formatDateOffset(1),
        preferredTime: '02:00 PM – 04:00 PM',
        address: 'House No. 42, Sector 7, Urban Estate, Ambala City, Haryana',
        instructions: 'Install study room surge protector outlet and check earthing.',
        price: w.price,
        pricingType: w.pricingType,
        status: 'Accepted',
        createdAt: daysAgo(1),
        statusHistory: [
          { status: 'Pending', timestamp: daysAgo(1), note: 'Booking submitted.', updatedBy: customerPrimary._id },
          {
            status: 'Accepted',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            note: 'Accepted by Arjun Nair. Bringing earthing tester.',
            updatedBy: workerUser._id,
          },
        ],
      });
    }

    // Recalculate worker averageRating & totalReviews
    const workerReviews = await Review.find({ workerProfileId: workerProfile._id }).select('rating');
    const { averageRating, totalReviews } = computeAverageRating(
      workerReviews.map((r) => r.rating)
    );
    await WorkerProfile.findByIdAndUpdate(workerProfile._id, {
      averageRating,
      totalReviews,
    });
  }

  console.log('[HomeEase Seed] Seeded 3 customers, 8 new workers (each with individual credentials & pending requests), 18 bookings, and 8 reviews.');
  return true;
}
