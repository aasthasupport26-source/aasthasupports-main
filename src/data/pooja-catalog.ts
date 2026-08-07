export interface PackageTier {
  id: string;
  name: string;
  price: number;
  description: string;
  includes: string[];
  photo: boolean;
  video: boolean;
  live_call: boolean;
  prasad: boolean;
  priority?: number;
}

export interface PujaItem {
  id: string;
  temple_id: string;
  slug: string;
  name: string;
  description: string;
  duration_minutes: number;
  active: boolean;
  image_url: string;
  image_url_2?: string;
  image_url_3?: string;
  image_url_4?: string;
  benefits?: {
    gallery?: string[];
    summary?: string[];
  };
  packages: PackageTier[];
}

export interface TempleItem {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
  image_url: string;
  active: boolean;
}

// ─── STANDARD PACKAGE PRESETS ────────────────────────────────────────────────
export const SAWAN_SPECIAL_PACKAGES: PackageTier[] = [
  {
    id: "pkg-sawan-51",
    name: "सावन जल अभिषेक (Jal Abhishek)",
    price: 51,
    description:
      "सावन के हर सोमवार आपके नाम एवं गोत्र से जल अर्पित किया जाएगा। संकल्प के साथ पूजा।",
    includes: ["नाम एवं गोत्र से संकल्प", "सावन सोमवार जल अभिषेक", "पूजा फोटो"],
    photo: true,
    video: false,
    live_call: false,
    prasad: false,
  },
  {
    id: "pkg-sawan-101",
    name: "सावन बेलपत्र एवं जल अभिषेक (Belpatra & Jal Abhishek)",
    price: 101,
    description:
      "सावन के हर सोमवार आपके नाम एवं गोत्र से बेलपत्र और जल दोनों अर्पित किए जाएंगे। संकल्प के साथ पूजा।",
    includes: [
      "नाम एवं गोत्र से संकल्प",
      "सावन सोमवार बेलपत्र व जल अभिषेक",
      "पूजा फोटो व वीडियो क्लिप",
    ],
    photo: true,
    video: true,
    live_call: false,
    prasad: false,
  },
];

export const STANDARD_PUJA_PACKAGES: PackageTier[] = [
  ...SAWAN_SPECIAL_PACKAGES,
  {
    id: "pkg-basic-1100",
    name: "Basic Puja (बेसिक पूजा)",
    price: 1100,
    description: "नाम-गोत्र संकल्प, संपूर्ण पूजा एवं डिजिटल पूजा फोटो।",
    includes: ["नाम एवं गोत्र से संकल्प", "वैदिक विधि से संपूर्ण पूजा", "डिजिटल पूजा फोटो"],
    photo: true,
    video: false,
    live_call: false,
    prasad: false,
  },
  {
    id: "pkg-standard-3100",
    name: "Standard Puja (स्टैंडर्ड पूजा)",
    price: 3100,
    description: "व्यक्तिगत पूजा, फोटो, HD वीडियो रिकॉर्डिंग एवं घर पर प्रसाद।",
    includes: [
      "व्यक्तिगत नाम व गोत्र संकल्प",
      "समर्पित पूजा",
      "डिजिटल फोटो",
      "HD वीडियो रिकॉर्डिंग",
      "पवित्र प्रसाद आपके घर पते पर",
    ],
    photo: true,
    video: true,
    live_call: false,
    prasad: true,
    priority: 1,
  },
  {
    id: "pkg-premium-5100",
    name: "Premium VIP Puja (प्रीमियम लाइव पूजा)",
    price: 5100,
    description:
      "केवल आपके लिए समर्पित पूजा, पंडित जी के साथ Live Video Call, संकल्प, HD वीडियो, प्रसाद एवं प्रायरिटी सहायता।",
    includes: [
      "पंडित जी के साथ Live Video Call / Conference",
      "व्यक्तिगत विशेष संकल्प",
      "HD वीडियो रिकॉर्डिंग व फोटो",
      "पवित्र प्रसाद आपके घर पते पर",
      "Priority VIP सहायता",
    ],
    photo: true,
    video: true,
    live_call: true,
    prasad: true,
    priority: 2,
  },
];

// ─── TEMPLES CATALOG ─────────────────────────────────────────────────────────
export const TEMPLES_CATALOG: TempleItem[] = [
  {
    id: "t-mahakaleshwar-01",
    name: "Mahakaleshwar Temple (महाकालेश्वर ज्योतिर्लिंग)",
    city: "Ujjain",
    state: "Madhya Pradesh",
    description:
      "उज्जैन स्थित 12 ज्योतिर्लिंगों में से एक अत्यंत फलदायी एवं दक्षिणामुखी महाकाल मंदिर।",
    image_url:
      "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    active: true,
  },
  {
    id: "t-kaalbhairav-02",
    name: "Kaal Bhairav Temple (काल भैरव मंदिर)",
    city: "Ujjain",
    state: "Madhya Pradesh",
    description:
      "तंत्र बाधा, शत्रु भय एवं समस्त संकटों का शमन करने वाले भगवान काल भैरव का अति प्राचीन शक्तिपीठ।",
    image_url:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    active: true,
  },
  {
    id: "t-harsiddhi-03",
    name: "Harsiddhi Mata Temple (हरसिद्धि माता शक्तिपीठ)",
    city: "Ujjain",
    state: "Madhya Pradesh",
    description:
      "51 शक्तिपीठों में से एक, जहाँ सती माँ की कोहनी गिरी थी। धन, समृद्धि एवं मनोकामना सिद्धि पीठ।",
    image_url:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    active: true,
  },
  {
    id: "t-mangalnath-04",
    name: "Mangalnath Temple (मंगलनाथ मंदिर)",
    city: "Ujjain",
    state: "Madhya Pradesh",
    description:
      "भगवान मंगल की जन्मभूमि पर स्थापित। मंगल दोष एवं ग्रह शांति हेतु विश्व विख्यात मंदिर।",
    image_url:
      "https://images.unsplash.com/photo-1627894006066-b4566c757c91?auto=format&fit=crop&q=80&w=800",
    active: true,
  },
  {
    id: "t-kashivishwanath-05",
    name: "Kashi Vishwanath Temple (काशी विश्वनाथ मंदिर)",
    city: "Varanasi",
    state: "Uttar Pradesh",
    description:
      "पवित्र नगरी काशी में माँ गंगा के तट पर स्थित 12 ज्योतिर्लिंगों में प्रधान शिवधाम।",
    image_url:
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=800",
    active: true,
  },
  {
    id: "t-sankatmochan-06",
    name: "Sankat Mochan Temple (संकट मोचन मंदिर)",
    city: "Varanasi",
    state: "Uttar Pradesh",
    description: "गोस्वामी तुलसीदास जी द्वारा स्थापित संकट मोचन हनुमान मंदिर।",
    image_url:
      "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&q=80&w=800",
    active: true,
  },
  {
    id: "t-shani-07",
    name: "Shani Temple (शनि मंदिर)",
    city: "Varanasi",
    state: "Uttar Pradesh",
    description: "साढ़ेसाती, ढैय्या एवं शनि दोष मुक्ति हेतु विशेष शनिदेव मंदिर।",
    image_url:
      "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&q=80&w=800",
    active: true,
  },
  {
    id: "t-annapurna-08",
    name: "Annapurna Temple (अन्नपूर्णा मंदिर)",
    city: "Varanasi",
    state: "Uttar Pradesh",
    description: "काशी की अधिष्ठात्री अन्नपूर्णा देवी मंदिर, जहाँ कभी अन्न व धन की कमी नहीं होती।",
    image_url:
      "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    active: true,
  },
  {
    id: "t-general-09",
    name: "General Sacred Temple (समस्त पवित्र तीर्थ स्थल)",
    city: "All Cities",
    state: "India",
    description:
      "भारत के प्रमुख सिद्ध मंदिरों एवं तीर्थों में संपन्न की जाने वाली कल्याणकारी पूजाएँ।",
    image_url:
      "https://images.unsplash.com/photo-1627894006066-b4566c757c91?auto=format&fit=crop&q=80&w=800",
    active: true,
  },
];

// Helper to construct 4 gallery images
function create4Images(primary: string, extra2?: string, extra3?: string, extra4?: string) {
  const defaultExtras = [
    "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1627894006066-b4566c757c91?auto=format&fit=crop&q=80&w=800",
  ];
  return {
    image_url: primary,
    image_url_2: extra2 || defaultExtras[1],
    image_url_3: extra3 || defaultExtras[2],
    image_url_4: extra4 || defaultExtras[3],
    benefits: {
      gallery: [
        primary,
        extra2 || defaultExtras[1],
        extra3 || defaultExtras[2],
        extra4 || defaultExtras[3],
      ],
    },
  };
}

// ─── PUJAS CATALOG ───────────────────────────────────────────────────────────
export const PUJAS_CATALOG: PujaItem[] = [
  // ── Mahakaleshwar Pujas
  {
    id: "p-rudrabhishek-mk",
    temple_id: "t-mahakaleshwar-01",
    slug: "rudrabhishek-mahakaleshwar",
    name: "रुद्राभिषेक (Mahakaleshwar Rudrabhishek)",
    description:
      "महाकालेश्वर ज्योतिर्लिंग पर दूध, जल, पंचामृत एवं विशेष औषधियों से भव्य रुद्राभिषेक पूजा। समस्त पापों व कष्टों का निवारण।",
    duration_minutes: 90,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-laghurudra-mk",
    temple_id: "t-mahakaleshwar-01",
    slug: "laghu-rudrabhishek-mahakaleshwar",
    name: "लघु रुद्राभिषेक (Laghu Rudrabhishek)",
    description:
      "11 पंडितों द्वारा रुद्र पाठ एवं जल-दूध से अभिषेक। ग्रह दोष शांति व मनोकामना पूर्ति हेतु अत्यंत श्रेष्ठ।",
    duration_minutes: 120,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-maharudra-mk",
    temple_id: "t-mahakaleshwar-01",
    slug: "maha-rudrabhishek-mahakaleshwar",
    name: "महा रुद्राभिषेक (Maha Rudrabhishek)",
    description:
      "अति दुर्लभ एवं विशाल महा रुद्राभिषेक पूजा। समस्त ग्रह बाधा, रोग व मृत्यु भय से पूर्ण सुरक्षा।",
    duration_minutes: 180,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-mrityunjay-mk",
    temple_id: "t-mahakaleshwar-01",
    slug: "mahamrityunjay-jaap-mahakaleshwar",
    name: "महामृत्युंजय जाप (Mahamrityunjay Jaap)",
    description:
      "अकाल मृत्यु भय निवारण, गंभीर स्वास्थ्य लाभ एवं दीर्घायु की प्राप्ति हेतु विशेष वैदिक महामृत्युंजय अनुष्ठान।",
    duration_minutes: 150,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1627894006066-b4566c757c91?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-kalsarp-mk",
    temple_id: "t-mahakaleshwar-01",
    slug: "kalsarp-dosh-puja-mahakaleshwar",
    name: "कालसर्प दोष पूजा (Kalsarp Dosh Puja)",
    description:
      "उज्जैन महाकाल तीर्थ पर राहु-केतु जनित कालसर्प दोष से पूर्ण मुक्ति हेतु वैदिक विधान से पूजा।",
    duration_minutes: 120,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-pitradosh-mk",
    temple_id: "t-mahakaleshwar-01",
    slug: "pitra-dosh-puja-mahakaleshwar",
    name: "पितृ दोष पूजा (Pitra Dosh Puja)",
    description:
      "पूर्वजों की शांति, वंश वृद्धि एवं पारिवारिक क्लेश निवारण हेतु विशेष महाकाल पितृ शांति अनुष्ठान।",
    duration_minutes: 90,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-navgrah-mk",
    temple_id: "t-mahakaleshwar-01",
    slug: "navgrah-shanti-mahakaleshwar",
    name: "नवग्रह शांति एवं नवग्रह पूजा (Navgrah Shanti)",
    description:
      "नौ ग्रहों की अनुकूलता, भाग्य वृद्धि एवं जीवन के समस्त अवरोधों को दूर करने हेतु नवग्रह होम।",
    duration_minutes: 90,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-shravan-mk",
    temple_id: "t-mahakaleshwar-01",
    slug: "shravan-vishesh-puja-mahakaleshwar",
    name: "श्रावण विशेष पूजा (Shravan Vishesh Puja)",
    description: "पवित्र श्रावण मास में महाकाल मंदिर में विशेष पूजा, भस्म आरती संकल्प व जलाभिषेक।",
    duration_minutes: 90,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1627894006066-b4566c757c91?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },

  // ── Kaal Bhairav Pujas
  {
    id: "p-kaalbhairav-kb",
    temple_id: "t-kaalbhairav-02",
    slug: "kaal-bhairav-puja",
    name: "काल भैरव पूजा (Kaal Bhairav Puja)",
    description:
      "भय नाशक, रक्षक एवं विघ्न हर्ता भगवान काल भैरव की तांत्रिक व वैदिक विधान से विशेष पूजा।",
    duration_minutes: 60,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-tantrabadha-kb",
    temple_id: "t-kaalbhairav-02",
    slug: "tantra-badha-nivaran-puja",
    name: "तंत्र बाधा निवारण पूजा (Tantra Badha Nivaran)",
    description:
      "बुरी नजर, ऊपरी बाधा एवं अज्ञात भय से रक्षा हेतु काल भैरव मंदिर में शक्तिशाली अनुष्ठान।",
    duration_minutes: 90,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },

  // ── Harsiddhi Mata Pujas
  {
    id: "p-shreeyantra-hs",
    temple_id: "t-harsiddhi-03",
    slug: "shree-yantra-puja-harsiddhi",
    name: "श्री यंत्र पूजा एवं लक्ष्मी पाठ (Shree Yantra Puja)",
    description:
      "अखंड धन, ऐश्वर्य एवं व्यापार में अभूतपूर्व वृद्धि हेतु हरसिद्धि माता शक्तिपीठ पर महालक्ष्मी अनुष्ठान।",
    duration_minutes: 90,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-durgasaptashati-hs",
    temple_id: "t-harsiddhi-03",
    slug: "durga-saptashati-paath-harsiddhi",
    name: "दुर्गा सप्तशती पाठ (Durga Saptashati Paath)",
    description:
      "दुर्गा सप्तशती के 13 अध्यायों का सम्पुट पाठ व हवन। मनोकामना पूर्ति व सर्व कल्याण हेतु।",
    duration_minutes: 120,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1627894006066-b4566c757c91?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },

  // ── Mangalnath Pujas
  {
    id: "p-mangaldosh-mn",
    temple_id: "t-mangalnath-04",
    slug: "mangal-dosh-puja-mangalnath",
    name: "मंगल दोष पूजा (Mangal Dosh Puja)",
    description:
      "विवाह में विलंब, वैवाहिक जीवन में तनाव व कड़े मंगल दोष के निवारण हेतु मंगलनाथ मंदिर उज्जैन में विशेष भात पूजा।",
    duration_minutes: 120,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1627894006066-b4566c757c91?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },

  // ── Kashi Vishwanath Pujas
  {
    id: "p-rudrabhishek-kv",
    temple_id: "t-kashivishwanath-05",
    slug: "rudrabhishek-kashi-vishwanath",
    name: "काशी विश्वनाथ रुद्राभिषेक (Kashi Vishwanath Rudrabhishek)",
    description: "मोक्षदायिनी काशी में बाबा विश्वनाथ पर गंगाजल, दूध व भस्म से पवित्र रुद्राभिषेक।",
    duration_minutes: 90,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-shravan-kv",
    temple_id: "t-kashivishwanath-05",
    slug: "shravan-somwar-puja-kashi",
    name: "श्रावण सोमवार विशेष पूजा (Shravan Somwar Kashi)",
    description: "काशी विश्वनाथ मंदिर में सावन सोमवार विशेष पूजा, गंगाजल अर्पण व नाम-गोत्र संकल्प।",
    duration_minutes: 90,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },

  // ── Sankat Mochan Pujas
  {
    id: "p-sunderkand-sm",
    temple_id: "t-sankatmochan-06",
    slug: "sunderkand-paath-sankat-mochan",
    name: "सुंदरकांड पाठ एवं हनुमान पूजा (Sunderkand Paath)",
    description:
      "काशी के संकट मोचन मंदिर में श्री सुंदरकांड का संगीतमय पाठ, हनुमान चालीसा व चोला अर्पण।",
    duration_minutes: 120,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },

  // ── Shani Temple Pujas
  {
    id: "p-shanidosh-sh",
    temple_id: "t-shani-07",
    slug: "shani-dosh-nivaran-puja",
    name: "शनि दोष निवारण पूजा (Shani Dosh Nivaran)",
    description:
      "शनि साढ़ेसाती, ढैय्या एवं शनि की महादशा से राहत हेतु तैल स्नान, काले तिल व नीलमणि पूजन।",
    duration_minutes: 90,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },

  // ── Annapurna Temple Pujas
  {
    id: "p-annapurna-ap",
    temple_id: "t-annapurna-08",
    slug: "annapurna-puja-kashi",
    name: "अन्नपूर्णा पूजा (Annapurna Puja Kashi)",
    description:
      "घर में सुख, शांति, अन्न-धन की कभी कमी न होने हेतु माँ अन्नपूर्णा की विशेष पूजा व महाप्रसाद।",
    duration_minutes: 60,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },

  // ── General Pujas (All Cities)
  {
    id: "p-satyanarayan-gen",
    temple_id: "t-general-09",
    slug: "satyanarayan-katha",
    name: "सत्यनारायण कथा (Satyanarayan Katha)",
    description:
      "पारिवारिक सुख-शांति, समृद्धि एवं मनोकामना पूर्ण करने वाली भगवान सत्यनारायण की कथा व पूजन।",
    duration_minutes: 90,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1627894006066-b4566c757c91?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-vastushanti-gen",
    temple_id: "t-general-09",
    slug: "vastu-shanti-puja",
    name: "वास्तु शांति पूजा (Vastu Shanti Puja)",
    description:
      "गृह प्रवेश, नए मकान या दुकान में वास्तु दोषों के निवारण हेतु गृह शांति होम व पूजन।",
    duration_minutes: 150,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
  {
    id: "p-shikshasafalta-gen",
    temple_id: "t-general-09",
    slug: "shiksha-safalta-puja",
    name: "शिक्षा एवं प्रतियोगिता सफलता पूजा (Saraswati / Ganesh Puja)",
    description:
      "विद्यार्थियों की परीक्षा में सफलता, एकाग्रता एवं बुद्धि विकास हेतु सरस्वती व गणेश अनुष्ठान।",
    duration_minutes: 60,
    active: true,
    ...create4Images(
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    ),
    packages: STANDARD_PUJA_PACKAGES,
  },
];
