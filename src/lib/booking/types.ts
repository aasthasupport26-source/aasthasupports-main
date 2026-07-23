import { z } from 'zod';

// Booking form validation schema
export const BookingFormSchema = z.object({
  // Personal Details
  fullName: z.string().min(2, 'Full name is required'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  whatsappNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit WhatsApp number'),
  address: z.string().min(10, 'Complete address is required'),

  // Sankalp Details
  gotra: z.string().min(2, 'Gotra is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  timeOfBirth: z.string().optional().or(z.literal('')),
  placeOfBirth: z.string().min(2, 'Place of birth is required'),
  rashi: z.string().optional().or(z.literal('')),
  nakshatra: z.string().optional().or(z.literal('')),

  // Pooja Details
  poojaName: z.string().min(1, 'Pooja name is required'),
  templeName: z.string().min(1, 'Temple name is required'),
  poojaDate: z.string().min(1, 'Pooja date is required'),
  participantCount: z.number().int().min(1, 'At least one participant required'),
  participantNames: z.array(z.string().min(1)).min(1, 'At least one participant name required'),
  specialWish: z.string().optional().or(z.literal('')),

  // Delivery & Additional Services
  prasadRequired: z.boolean(),
  prasadAddress: z.string().optional().or(z.literal('')),
  liveVideo: z.boolean(),
  recordedVideo: z.boolean(),
  photosRequired: z.boolean(),

  // Payment
  package: z.enum(['Basic', 'Standard']),
  couponCode: z.string().optional().or(z.literal('')),
  gstApplicable: z.boolean(),
  gstNumber: z.string().optional().or(z.literal('')),
}).refine((data) => {
  // If prasad required, address must be provided
  if (data.prasadRequired && (!data.prasadAddress || data.prasadAddress.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Prasad delivery address is required when prasad is selected',
  path: ['prasadAddress'],
}).refine((data) => {
  // If GST applicable, GST number must be provided
  if (data.gstApplicable && (!data.gstNumber || data.gstNumber.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'GST number is required when GST is applicable',
  path: ['gstNumber'],
});

export type BookingFormData = z.infer<typeof BookingFormSchema>;

// Package definitions
export const PACKAGES = {
  Basic: {
    name: 'Basic Package',
    basePrice: 1100,
    includes: ['Sankalp', 'Pooja', 'Photos'],
    description: 'Essential pooja with sankalp and photo documentation',
  },
  Standard: {
    name: 'Standard Package',
    basePrice: 3100,
    includes: ['Sankalp', 'Pooja', 'Photos', 'Recorded Video', 'Prasad Delivery'],
    description: 'Complete pooja experience with video and prasad',
  },
} as const;

// Rashi (Zodiac) options
export const RASHI_OPTIONS = [
  'Mesh (Aries)',
  'Vrishabh (Taurus)',
  'Mithun (Gemini)',
  'Kark (Cancer)',
  'Simha (Leo)',
  'Kanya (Virgo)',
  'Tula (Libra)',
  'Vrishchik (Scorpio)',
  'Dhanu (Sagittarius)',
  'Makar (Capricorn)',
  'Kumbh (Aquarius)',
  'Meen (Pisces)',
];

// Nakshatra options
export const NAKSHATRA_OPTIONS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];

// Popular Gotras
export const COMMON_GOTRAS = [
  'Kashyap',
  'Bharadwaj',
  'Vishwamitra',
  'Gautam',
  'Jamadagni',
  'Vashishtha',
  'Atri',
  'Agastya',
  'Bhrigu',
  'Angiras',
  'Marichi',
  'Pulastya',
  'Pulaha',
  'Kratu',
  'Daksha',
  'Shandilya',
  'Garga',
  'Kaushik',
  'Vatsa',
  'Harita',
];

// Temple options
export const TEMPLES = [
  'Kashi Vishwanath, Varanasi',
  'Mahakaleshwar, Ujjain',
  'Har Ki Pauri, Haridwar',
  'Trimbakeshwar, Nashik',
  'Omkareshwar, Madhya Pradesh',
  'Somnath, Gujarat',
  'Rameshwaram, Tamil Nadu',
  'Kedarnath, Uttarakhand',
  'Badrinath, Uttarakhand',
  'Tirupati Balaji, Andhra Pradesh',
];
