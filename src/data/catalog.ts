// Central catalog: categories, subcategories, products
import rudrakshaImg from "@/assets/rudraksha.jpg";
import rudrakshaBanner from "@/assets/rudraksha-banner.png";
import malaImg from "@/assets/mala.jpg";
import malaBanner from "@/assets/mala-banner.png";
import braceletImg from "@/assets/bracelet.jpg";
import braceletBanner from "@/assets/bracelet-banner.png";
import gemstonesImg from "@/assets/gemstones.jpg";
import gemstonesBanner from "@/assets/gemstones-banner.png";
import poojaImg from "@/assets/pooja.jpg";
import yantraImg from "@/assets/yantra.jpg";
import yantraBanner from "@/assets/yantra-banner.png";

export interface SubCategory {
  name: string;
  slug: string;
  image: string;
  desc?: string;
}

export interface MegaSection {
  title: string;
  items: SubCategory[];
}

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  hero: string;
  sections: MegaSection[];
}

export const categories: Category[] = [
  {
    slug: "rudraksha",
    name: "Rudraksha",
    tagline:
      "Certified Nepali & Indonesian rudraksha — premium collector beads energised by Vedic pandits.",
    hero: rudrakshaBanner,
    sections: [
      {
        title: "Nepali Rudraksha (Collector Beads)",
        items: [
          {
            name: "1 Mukhi Nepali",
            slug: "natural-1-mukhi-sawar-nepali-rudraksha-bead-original-savar-rudraksha-premium-bead-for-spiritual-awakening-wealth",
            image: rudrakshaImg,
            desc: "Ultra rare sovereign bead",
          },
          {
            name: "3 Mukhi Nepali",
            slug: "natural-3-mukhi-nepali-rudraksha-bead-original-teen-mukhi-rudraksha-rudraksha-for-meditation-spiritual-practice-daily-wear",
            image: rudrakshaImg,
            desc: "Large premium grade bead",
          },
          {
            name: "11 Mukhi Nepali",
            slug: "natural-11-mukhi-nepali-rudraksha-bead-original-gyarah-mukhi-rudraksha-premium-rudraksha-for-meditation-prayer-daily-wear",
            image: rudrakshaImg,
            desc: "Lord Hanuman blessings",
          },
          {
            name: "14 Mukhi Nepali",
            slug: "natural-14-mukhi-nepali-rudraksha-bead-original-chaudah-mukhi-rudraksha-premium-rudraksha-for-meditation-spiritual-practice-daily-wear",
            image: rudrakshaImg,
            desc: "Third eye, intuition & courage",
          },
        ],
      },
      {
        title: "Indonesian Rudraksha (1-14 Mukhi)",
        items: [
          {
            name: "1 Mukhi Indo Rudraksha",
            slug: "1-mukhi-indo-rudraksha-original-certified-spiritual-awakening",
            image: rudrakshaImg,
            desc: "Symbol of Supreme Lord Shiva",
          },
          {
            name: "2 Mukhi Indo Rudraksha",
            slug: "2-mukhi-indo-rudraksha",
            image: rudrakshaImg,
            desc: "Most popular & protective bead",
          },
          {
            name: "3 Mukhi Indo Rudraksha",
            slug: "3-mukhi-indo-rudraksha",
            image: rudrakshaImg,
            desc: "For wealth & Goddess Lakshmi",
          },
          {
            name: "4 Mukhi Indo Rudraksha",
            slug: "4-mukhi-indo-rudraksha",
            image: rudrakshaImg,
            desc: "Harmonious marital union",
          },
        ],
      },
    ],
  },
  {
    slug: "mala",
    name: "Mala",
    tagline: "108 bead malas for jaap, meditation & daily sadhana.",
    hero: malaBanner,
    sections: [
      {
        title: "108 Bead Jaap & Sacred Malas",
        items: [
          {
            name: "5 Mukhi Rudraksha Mala",
            slug: "natural-5-mukhi-rudraksha-mala-indonesian-origin-108-1-beads",
            image: malaImg,
            desc: "Classic 108 bead jaap mala",
          },
          {
            name: "Sphatik (Crystal) Mala",
            slug: "natural-2-mukhi-rudraksha-mala-indonesian-origin-108-1-beads",
            image: malaImg,
            desc: "Cooling energy for peace & focus",
          },
          {
            name: "Original Tulsi Mala",
            slug: "natural-3-mukhi-rudraksha-mala-indonesian-origin-108-1-beads",
            image: malaImg,
            desc: "Sacred Vishnu & Krishna sadhana",
          },
          {
            name: "Chandan (Sandalwood) Mala",
            slug: "natural-4-mukhi-rudraksha-mala-indonesian-origin-108-1-beads",
            image: malaImg,
            desc: "Pure fragrance & spiritual calm",
          },
          {
            name: "Kamal Gatta Mala",
            slug: "natural-6-mukhi-rudraksha-mala-indonesian-origin-108-1-beads",
            image: malaImg,
            desc: "Goddess Lakshmi prosperity sadhana",
          },
          {
            name: "Moti (Pearl) Mala",
            slug: "natural-7-mukhi-rudraksha-mala-indonesian-origin-108-1-beads",
            image: malaImg,
            desc: "Moon energy for emotional balance",
          },
        ],
      },
    ],
  },
  {
    slug: "bracelets",
    name: "Bracelets",
    tagline: "Energised crystal & rudraksha bracelets for healing and protection.",
    hero: braceletBanner,
    sections: [
      {
        title: "Crystal & Healing Bracelets",
        items: [
          {
            name: "7 Chakra Healing Bracelet",
            slug: "natural-black-obsidian-crystal-healing-bracelet-for-men-women",
            image: braceletImg,
            desc: "Aligns all 7 energy centers",
          },
          {
            name: "Rudraksha Silver Bracelet",
            slug: "natural-selenite-crystal-healing-bracelet-for-clarity-peace",
            image: braceletImg,
            desc: "Authentic energised beads",
          },
          {
            name: "Money Magnet Bracelet",
            slug: "natural-citrine-crystal-wealth-prosperity-bracelet",
            image: braceletImg,
            desc: "Attracts financial growth",
          },
          {
            name: "Tiger Eye Courage Bracelet",
            slug: "natural-dragon-vein-agate-courage-strength-bracelet",
            image: braceletImg,
            desc: "Confidence & protection",
          },
          {
            name: "Evil Eye Protection",
            slug: "protective-evil-eye-crystal-beaded-charm-bracelet",
            image: braceletImg,
            desc: "Shields against negative energy",
          },
          {
            name: "Pyrite Wealth Bracelet",
            slug: "natural-black-obsidian-crystal-healing-bracelet-for-men-women",
            image: braceletImg,
            desc: "Fool's gold for prosperity",
          },
        ],
      },
    ],
  },
  {
    slug: "gemstones",
    name: "Gemstones",
    tagline: "Lab-certified Navratna gemstones with astrological consultation.",
    hero: gemstonesBanner,
    sections: [
      {
        title: "Navratna — 100% Certified Gems",
        items: [
          {
            name: "Ruby (Manik)",
            slug: "gemstones",
            image: gemstonesImg,
            desc: "Sun · Surya — Leadership & Fame",
          },
          {
            name: "Pearl (Moti)",
            slug: "gemstones",
            image: gemstonesImg,
            desc: "Moon · Chandra — Emotional Peace",
          },
          {
            name: "Red Coral (Moonga)",
            slug: "gemstones",
            image: gemstonesImg,
            desc: "Mars · Mangal — Energy & Bravery",
          },
          {
            name: "Emerald (Panna)",
            slug: "gemstones",
            image: gemstonesImg,
            desc: "Mercury · Budh — Intelligence & Business",
          },
          {
            name: "Yellow Sapphire (Pukhraj)",
            slug: "natural-ceylon-sri-lanka-yellow-sapphire-pukhraj-2-42-carat-2-65-ratti-oval-mixed-certified",
            image:
              "https://cdn.shopify.com/s/files/1/1012/2867/5360/files/preview_images/9dfcc4014109480f8312588b9acb54cd.thumbnail.0000000000.jpg?v=1788804658",
            desc: "Jupiter · Brihaspati — 100% Certified Ceylon",
          },
          {
            name: "Blue Sapphire (Neelam)",
            slug: "gemstones",
            image: gemstonesImg,
            desc: "Saturn · Shani — Rapid Success",
          },
        ],
      },
    ],
  },
  {
    slug: "yantra",
    name: "Yantra",
    tagline: "Sacred geometric yantras energised with Vedic mantras.",
    hero: yantraBanner,
    sections: [
      {
        title: "Energised Sacred Yantras",
        items: [
          {
            name: "Shree Yantra",
            slug: "rudraaura-gold-plated-shree-yantra-frame-for-home-office-temple-vastu-feng-shui-spiritual-decor",
            image: yantraImg,
            desc: "Supreme Yantra for wealth & harmony",
          },
          {
            name: "Kuber Yantra",
            slug: "pyrite-dust-golden-frame-shri-sampoorna-lakshmi-ganesh-yantra-vastu-prosperity-yantra-for-home-office-mandir",
            image: yantraImg,
            desc: "Attracts continuous cash flow",
          },
          {
            name: "Mahamrityunjay Yantra",
            slug: "rudraaura-shri-sampurna-yantra-with-golden-frame-energized-spiritual-wall-frame-for-peace-prosperity-vastu-dosh-nivaran-navgrah-yantra-for-home-office",
            image: yantraImg,
            desc: "Health, longevity & safety",
          },
          {
            name: "Navgrah Yantra",
            slug: "rudraaura-shri-sampurna-navgrah-yantra-with-golden-frame-energized-spiritual-wall-frame-for-peace-prosperity-vastu-dosh-nivaran-navgrah-yantra-for-home-office",
            image: yantraImg,
            desc: "Harmonizes all 9 planets",
          },
        ],
      },
    ],
  },
  {
    slug: "online-pooja",
    name: "Online Pooja",
    tagline: "Sacred rituals performed by Vedic pandits — live from Kashi, Ujjain & Haridwar.",
    hero: poojaImg,
    sections: [
      {
        title: "Sawan Special & Most Booked",
        items: [
          {
            name: "सावन सोमवार जल अभिषेक (₹51)",
            slug: "sawan-jal-abhishek",
            image: poojaImg,
            desc: "Sawan Monday Jal Abhishek with Name & Gotra",
          },
          {
            name: "सावन बेलपत्र व जल (₹101)",
            slug: "sawan-belpatra-jal",
            image: poojaImg,
            desc: "108 Belpatra & Jal Abhishek with Video clip",
          },
          {
            name: "Mahamrityunjay Jaap",
            slug: "mahamrityunjay",
            image: poojaImg,
            desc: "1,25,000 mantra jaap for health & long life",
          },
          {
            name: "Rudrabhishek Pooja",
            slug: "rudrabhishek",
            image: poojaImg,
            desc: "Lord Shiva abhishek with panchamrit",
          },
        ],
      },
      {
        title: "Dosh Nivaran & Sacred Temples",
        items: [
          {
            name: "Kaal Sarp Dosh Pooja",
            slug: "kaal-sarp",
            image: poojaImg,
            desc: "Trimbakeshwar & Ujjain special",
          },
          {
            name: "Pitra Dosh Nivaran",
            slug: "pitra-dosh",
            image: poojaImg,
            desc: "Tarpan & shraadh for ancestors",
          },
          {
            name: "Mangal Dosh Bhaat Pooja",
            slug: "mangal-dosh",
            image: poojaImg,
            desc: "Mangalnath Temple Ujjain",
          },
          {
            name: "Navgrah Shanti Pooja",
            slug: "navgrah-shanti",
            image: poojaImg,
            desc: "Balance all 9 planetary doshas",
          },
        ],
      },
    ],
  },
];

export const getCategory = (slug?: string) => {
  if (!slug) return undefined;
  const s = slug.trim().toLowerCase().replace(/\/$/, "");

  const aliasMap: Record<string, string> = {
    pooja: "online-pooja",
    puja: "online-pooja",
    "online-puja": "online-pooja",
    "online-poojas": "online-pooja",
    "online-pujas": "online-pooja",
    pujas: "online-pooja",
    poojas: "online-pooja",
    bracelet: "bracelets",
    bracelets: "bracelets",
    gemstone: "gemstones",
    gemstones: "gemstones",
    gems: "gemstones",
    gem: "gemstones",
    yantras: "yantra",
    yantra: "yantra",
    malas: "mala",
    mala: "mala",
    rudraksh: "rudraksha",
    rudraksha: "rudraksha",
    rudrakshas: "rudraksha",
  };

  const targetSlug = aliasMap[s] || s;

  const found = categories.find((c) => c.slug === targetSlug || c.slug.toLowerCase() === s);
  if (found) return found;

  // Generic fallback category if slug is unrecognized instead of throwing 404
  return {
    slug: s,
    name: s
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    tagline: "Explore our collection of authentic, energised spiritual offerings.",
    hero: poojaImg,
    sections: [],
  };
};
