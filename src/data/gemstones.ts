// Navratna: The 9 Sacred Vedic Astrological Gemstones
export interface NavratnaGemstone {
  id: string;
  name: string;
  hindiName: string;
  sanskritName: string;
  planet: string;
  planetHindi: string;
  mantra: string;
  color: string;
  element: string;
  chakra: string;
  tagline: string;
  desc: string;
  benefits: string[];
  image: string;
  matchKeywords: string[];
  auspiciousDay: string;
  finger: string;
}

export const NAVRATNA_GEMSTONES: NavratnaGemstone[] = [
  {
    id: "ruby",
    name: "Ruby",
    hindiName: "माणिक",
    sanskritName: "Manikya",
    planet: "Sun (Surya)",
    planetHindi: "सूर्य ग्रह",
    mantra: "|| ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः ||",
    color: "Deep Pigeon-Blood Crimson",
    element: "Fire (Agni)",
    chakra: "Manipura (Solar Plexus Chakra)",
    tagline: "The King of Gemstones — Bestows royal authority, self-confidence & vitality.",
    desc: "Governed by Lord Surya, natural Ruby instills unshakeable leadership, government success, fame, and cardiac vitality.",
    benefits: [
      "Awakens leadership, charisma & executive authority",
      "Shields against negative planetary transits and evil eye",
      "Boosts vitality, eyesight & cardiovascular strength",
      "Favors administrators, doctors, entrepreneurs & civil servants",
    ],
    image: "/gemstones/ruby.jpg",
    matchKeywords: ["ruby", "manik", "manikya", "surya", "sun"],
    auspiciousDay: "Sunday Morning during Shukla Paksha",
    finger: "Ring Finger of Right Hand in Gold or Copper",
  },
  {
    id: "pearl",
    name: "Pearl",
    hindiName: "मोती",
    sanskritName: "Mukta",
    planet: "Moon (Chandra)",
    planetHindi: "चन्द्र ग्रह",
    mantra: "|| ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः ||",
    color: "Luminous Iridescent White",
    element: "Water (Jal)",
    chakra: "Svadhisthana (Sacral Chakra)",
    tagline: "Queen of the Oceans — Brings profound mental calm, emotional balance & peace.",
    desc: "Representing Chandra Dev, natural South Sea Pearl pacifies turbulent thoughts, relieves anxiety, and enhances emotional intuition.",
    benefits: [
      "Eliminates stress, mood swings, and insomnia",
      "Fosters mental equilibrium, compassion, and emotional harmony",
      "Strengthens mother-child bonding and marital serenity",
      "Balances bodily fluids, hormonal equilibrium & skin radiance",
    ],
    image: "/gemstones/pearl.jpg",
    matchKeywords: ["pearl", "moti", "mukta", "chandra", "moon"],
    auspiciousDay: "Monday Evening or Dawn during Shukla Paksha",
    finger: "Little Finger of Right Hand in Pure Silver",
  },
  {
    id: "red-coral",
    name: "Red Coral",
    hindiName: "मूंगा",
    sanskritName: "Pravala",
    planet: "Mars (Mangal)",
    planetHindi: "मंगल ग्रह",
    mantra: "|| ॐ क्रां क्रीं क्रौं सः भौमाय नमः ||",
    color: "Vibrant Italian Fiery Red",
    element: "Fire & Earth (Agni / Prithvi)",
    chakra: "Muladhara (Root Chakra)",
    tagline: "The Warrior Stone — Grants unstoppable courage, physical vigor & triumph over obstacles.",
    desc: "Energised by Mangal (Mars), natural Italian Red Coral dissolves Manglik dosha impacts, infuses courage, and overcomes lethargy.",
    benefits: [
      "Overcomes Mangal Dosha and pacifies aggressive anger",
      "Instills bold courage, stamina, and administrative drive",
      "Accelerates real estate, land disputes & financial breakthroughs",
      "Purifies blood circulation and boosts muscular energy",
    ],
    image: "/gemstones/red-coral.jpg",
    matchKeywords: ["coral", "moonga", "munga", "praval", "pravala", "mangal", "mars"],
    auspiciousDay: "Tuesday Morning at Sunrise",
    finger: "Ring Finger of Right Hand in Copper or Gold",
  },
  {
    id: "emerald",
    name: "Emerald",
    hindiName: "पन्ना",
    sanskritName: "Marakata",
    planet: "Mercury (Budh)",
    planetHindi: "बुध ग्रह",
    mantra: "|| ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ||",
    color: "Vivid Lush Forest Green",
    element: "Earth (Prithvi)",
    chakra: "Anahata (Heart Chakra)",
    tagline: "Stone of Intellect — Inspires business acumen, sharp eloquence & artistic genius.",
    desc: "Ruled by Budha, natural Zambian and Colombian Emerald sharpens cognitive memory, oratory eloquence, and commercial trade prowess.",
    benefits: [
      "Dramatically enhances commercial negotiation & business wealth",
      "Sharpens intellectual focus, memory retention & analytical skill",
      "Empowers writers, financial analysts, advocates & speakers",
      "Relieves nervous tension and fosters serene heart energy",
    ],
    image: "/gemstones/emerald.jpg",
    matchKeywords: ["emerald", "panna", "marakata", "budh", "mercury"],
    auspiciousDay: "Wednesday Morning during Shukla Paksha",
    finger: "Little Finger of Right Hand in Gold or Bronze",
  },
  {
    id: "yellow-sapphire",
    name: "Yellow Sapphire",
    hindiName: "पुखराज",
    sanskritName: "Pushparaga",
    planet: "Jupiter (Brihaspati / Guru)",
    planetHindi: "बृहस्पति / गुरु ग्रह",
    mantra: "|| ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः ||",
    color: "Canary Golden Yellow",
    element: "Ether (Akasha)",
    chakra: "Ajna & Manipura (Solar / Third Eye)",
    tagline: "The Guru's Jewel — Unlocks supreme wisdom, auspicious matrimony, wealth & progeny.",
    desc: "Presided over by Devaguru Brihaspati, Ceylon Yellow Sapphire is revered for conferring immense good fortune, noble virtues, and scholastic success.",
    benefits: [
      "Attracts lasting financial abundance, luxury & social stature",
      "Removes matrimonial obstacles and promotes harmonious marriage",
      "Bestows divine guidance, spiritual enlightenment & good fortune",
      "Shields professional reputation and promotes career expansion",
    ],
    image: "/gemstones/yellow-sapphire.jpg",
    matchKeywords: ["yellow sapphire", "pukhraj", "pushparag", "ceylon", "bangkok", "jupiter", "guru", "brihaspati"],
    auspiciousDay: "Thursday Morning at Brahma Muhurta",
    finger: "Index Finger of Right Hand in Pure Gold or Panchdhatu",
  },
  {
    id: "diamond",
    name: "Diamond / White Sapphire",
    hindiName: "हीरा / सफेद पुखराज",
    sanskritName: "Vajra / Shwet Pukhraj",
    planet: "Venus (Shukra)",
    planetHindi: "शुक्र ग्रह",
    mantra: "|| ॐ द्रां द्रीं द्रौं सः शुक्राय नमः ||",
    color: "Sparkling D-Color Crystalline White",
    element: "Water (Jal)",
    chakra: "Sahasrara (Crown Chakra)",
    tagline: "The Jewel of Beauty — Magnifies romantic charm, creative brilliance & opulence.",
    desc: "Governed by Shukra Dev, natural Diamond / White Sapphire radiates luxurious magnetism, financial prosperity, and matrimonial joy.",
    benefits: [
      "Attracts regal luxuries, vehicle acquisitions & material comforts",
      "Fosters deep romantic harmony, charisma, and aesthetic charm",
      "Ignites creative breakthroughs for cinema, arts, music & fashion",
      "Enhances feminine reproductive wellness and youthful vitality",
    ],
    image: "/gemstones/diamond.jpg",
    matchKeywords: ["diamond", "heera", "vajra", "white sapphire", "safed pukhraj", "shukra", "venus"],
    auspiciousDay: "Friday Morning after Sunrise",
    finger: "Middle Finger or Ring Finger in Platinum, White Gold or Silver",
  },
  {
    id: "blue-sapphire",
    name: "Blue Sapphire",
    hindiName: "नीलम",
    sanskritName: "Neelam / Indraneel",
    planet: "Saturn (Shani)",
    planetHindi: "शनि ग्रह",
    mantra: "|| ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ||",
    color: "Royal Velvet Deep Indigo Blue",
    element: "Air (Vayu)",
    chakra: "Ajna (Third Eye Chakra)",
    tagline: "The Lightning Catalyst — Instant turnaround, karmic protection & monumental success.",
    desc: "Ruled by Lord Shani, Ceylon Blue Sapphire is the fastest-acting Navratna gem, capable of transforming adversity into triumph within days.",
    benefits: [
      "Swiftly eliminates poverty, stagnation, and professional blockages",
      "Guards against hidden adversaries, jealous gaze & psychic attacks",
      "Infuses laser discipline, profound focus & meditative stillness",
      "Elevates leaders in governance, industry, technology & judiciary",
    ],
    image: "/gemstones/blue-sapphire.jpg",
    matchKeywords: ["blue sapphire", "neelam", "indraneel", "shani", "saturn"],
    auspiciousDay: "Saturday Evening at Dusk",
    finger: "Middle Finger of Right Hand in Panchdhatu or Silver",
  },
  {
    id: "hessonite",
    name: "Hessonite",
    hindiName: "गोमेद",
    sanskritName: "Gomedha",
    planet: "Rahu (North Node)",
    planetHindi: "राहु ग्रह",
    mantra: "|| ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः ||",
    color: "Warm Cinnamon Honey-Amber",
    element: "Ether (Akasha)",
    chakra: "Sahasrara (Crown Center)",
    tagline: "The Mystical Shield — Demolishes confusion, legal troubles & unlocks sudden windfalls.",
    desc: "Aligned with shadow planet Rahu, natural Ceylon Hessonite dispels illusions, clears mental fog, and grants triumph in high-stakes ventures.",
    benefits: [
      "Protects against deceit, legal disputes & unseen opponents",
      "Bestows unexpected financial windfalls, speculatory gains & sudden success",
      "Restores crystal mental clarity, banishing fear, phobias & anxiety",
      "Favors politicians, innovators, stock traders & public figures",
    ],
    image: "/gemstones/hessonite.jpg",
    matchKeywords: ["hessonite", "gomed", "gomedha", "rahu"],
    auspiciousDay: "Saturday Night after Twilight",
    finger: "Middle Finger of Right Hand in Ashtadhatu or Silver",
  },
  {
    id: "cats-eye",
    name: "Cat's Eye",
    hindiName: "लहसुनिया",
    sanskritName: "Vaidurya",
    planet: "Ketu (South Node)",
    planetHindi: "केतु ग्रह",
    mantra: "|| ॐ स्त्रां स्त्रीं स्त्रौं सः केतवे नमः ||",
    color: "Golden Chrysoberyl with Sharp Chatoyant Silk Ray",
    element: "Fire & Ether (Agni / Akasha)",
    chakra: "Third Eye & Root Chakra",
    tagline: "The Spiritual Eye — Awaken psychic intuition, spiritual liberation & karmic defense.",
    desc: "Presided over by Ketu, natural Chrysoberyl Cat's Eye guards against abrupt downfalls, accidents, and awakens higher metaphysical perception.",
    benefits: [
      "Provides impenetrable defense against black magic, curses & sudden peril",
      "Accelerates spiritual evolution, detachment & meditative samadhi",
      "Revives lost wealth, stalled enterprises & dissolved fortunes",
      "Enhances prophetic dreams, intuition & subtle sensory awareness",
    ],
    image: "/gemstones/cats-eye.jpg",
    matchKeywords: ["cat's eye", "cats eye", "lehsuniya", "vaidurya", "chrysoberyl", "ketu"],
    auspiciousDay: "Tuesday or Thursday Midnight",
    finger: "Middle Finger or Ring Finger in Panchdhatu or Silver",
  },
];

export function getGemstoneById(id: string): NavratnaGemstone | undefined {
  const cleanId = id.toLowerCase().trim();
  return NAVRATNA_GEMSTONES.find(
    (g) =>
      g.id === cleanId ||
      g.name.toLowerCase() === cleanId ||
      g.matchKeywords.some((kw) => cleanId.includes(kw) || kw.includes(cleanId)),
  );
}

export function matchGemstoneForProduct(product: {
  name?: string;
  title?: string;
  tags?: string[];
  productType?: string;
}): NavratnaGemstone | null {
  const text = `${product.name || product.title || ""} ${product.productType || ""} ${(product.tags || []).join(" ")}`.toLowerCase();

  // Match specific stones first
  if (text.includes("pukhraj") || text.includes("yellow sapphire")) {
    return NAVRATNA_GEMSTONES.find((g) => g.id === "yellow-sapphire") || null;
  }
  if (text.includes("neelam") || text.includes("blue sapphire")) {
    return NAVRATNA_GEMSTONES.find((g) => g.id === "blue-sapphire") || null;
  }
  if (text.includes("manik") || text.includes("ruby")) {
    return NAVRATNA_GEMSTONES.find((g) => g.id === "ruby") || null;
  }
  if (text.includes("panna") || text.includes("emerald")) {
    return NAVRATNA_GEMSTONES.find((g) => g.id === "emerald") || null;
  }
  if (text.includes("moti") || text.includes("pearl")) {
    return NAVRATNA_GEMSTONES.find((g) => g.id === "pearl") || null;
  }
  if (text.includes("moonga") || text.includes("munga") || text.includes("coral")) {
    return NAVRATNA_GEMSTONES.find((g) => g.id === "red-coral") || null;
  }
  if (text.includes("heera") || text.includes("diamond") || text.includes("safed pukhraj")) {
    return NAVRATNA_GEMSTONES.find((g) => g.id === "diamond") || null;
  }
  if (text.includes("gomed") || text.includes("hessonite")) {
    return NAVRATNA_GEMSTONES.find((g) => g.id === "hessonite") || null;
  }
  if (text.includes("lehsuniya") || text.includes("cat's eye") || text.includes("cats eye")) {
    return NAVRATNA_GEMSTONES.find((g) => g.id === "cats-eye") || null;
  }

  return null;
}
