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
    slug: "online-pooja",
    name: "Online Pooja",
    tagline: "Sacred rituals performed by Vedic pandits — live from Kashi, Ujjain & Haridwar.",
    hero: poojaImg,
    sections: [
      {
        title: "Most Booked Poojas",
        items: [
          { name: "Mahamrityunjay Jaap", slug: "mahamrityunjay", image: poojaImg, desc: "1,25,000 mantra jaap for long life & health" },
          { name: "Rudrabhishek Pooja", slug: "rudrabhishek", image: poojaImg, desc: "Lord Shiva abhishek with panchamrit" },
          { name: "Navgrah Shanti", slug: "navgrah-shanti", image: poojaImg, desc: "Balance all 9 planetary doshas" },
          { name: "Lakshmi Pooja", slug: "lakshmi-pooja", image: poojaImg, desc: "For wealth, prosperity & abundance" },
        ],
      },
      {
        title: "Dosh Nivaran",
        items: [
          { name: "Kaal Sarp Dosh", slug: "kaal-sarp", image: poojaImg, desc: "Trimbakeshwar Jyotirlinga special" },
          { name: "Pitra Dosh Nivaran", slug: "pitra-dosh", image: poojaImg, desc: "Tarpan & shraadh at Gaya" },
          { name: "Mangal Dosh Pooja", slug: "mangal-dosh", image: poojaImg, desc: "Manglik dosha nivaran" },
          { name: "Satyanarayan Katha", slug: "satyanarayan", image: poojaImg, desc: "Family well-being katha" },
        ],
      },
    ],
  },
  {
    slug: "rudraksha",
    name: "Rudraksha",
    tagline: "Certified Indonesian & Nepali rudraksha — energised by Vedic pandits.",
    hero: rudrakshaBanner,
    sections: [
      {
        title: "Indonesian Rudraksha",
        items: [
          { name: "1 Mukhi Indonesian", slug: "indo-1-mukhi", image: rudrakshaImg, desc: "Symbol of Lord Shiva" },
          { name: "5 Mukhi Indonesian", slug: "indo-5-mukhi", image: rudrakshaImg, desc: "Most powerful & versatile" },
          { name: "7 Mukhi Indonesian", slug: "indo-7-mukhi", image: rudrakshaImg, desc: "For wealth & Goddess Lakshmi" },
          { name: "Gauri Shankar", slug: "indo-gauri-shankar", image: rudrakshaImg, desc: "Shiva-Parvati union" },
        ],
      },
      {
        title: "Nepali Rudraksha",
        items: [
          { name: "1 Mukhi Nepali", slug: "nepali-1-mukhi", image: rudrakshaImg, desc: "Rarest, most divine" },
          { name: "5 Mukhi Nepali", slug: "nepali-5-mukhi", image: rudrakshaImg, desc: "Large premium beads" },
          { name: "11 Mukhi Nepali", slug: "nepali-11-mukhi", image: rudrakshaImg, desc: "Lord Hanuman blessings" },
          { name: "14 Mukhi Nepali", slug: "nepali-14-mukhi", image: rudrakshaImg, desc: "Divine eye, intuition" },
          { name: "21 Mukhi Nepali", slug: "nepali-21-mukhi", image: rudrakshaImg, desc: "Kuber blessings, ultra rare" },
          { name: "Gauri Shankar Nepali", slug: "nepali-gauri-shankar", image: rudrakshaImg, desc: "Harmonious relationships" },
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
        title: "Rudraksha & Sacred Malas",
        items: [
          { name: "5 Mukhi Rudraksha Mala", slug: "rudraksha-mala", image: malaImg },
          { name: "Sphatik (Crystal) Mala", slug: "sphatik-mala", image: malaImg },
          { name: "Tulsi Mala", slug: "tulsi-mala", image: malaImg },
          { name: "Chandan (Sandal) Mala", slug: "chandan-mala", image: malaImg },
          { name: "Moti (Pearl) Mala", slug: "moti-mala", image: malaImg },
          { name: "Kamal Gatta Mala", slug: "kamal-gatta-mala", image: malaImg },
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
        title: "Crystal & Rudraksha Bracelets",
        items: [
          { name: "7 Chakra Bracelet", slug: "7-chakra-bracelet", image: braceletImg },
          { name: "Rudraksha Bracelet", slug: "rudraksha-bracelet", image: braceletImg },
          { name: "Crystal Bracelet", slug: "crystal-bracelet", image: braceletImg },
          { name: "Evil Eye Bracelet", slug: "evil-eye-bracelet", image: braceletImg },
          { name: "Money Magnet Bracelet", slug: "money-magnet-bracelet", image: braceletImg },
          { name: "Tiger Eye Bracelet", slug: "tiger-eye-bracelet", image: braceletImg },
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
        title: "Navratna — The Nine Gems",
        items: [
          { name: "Ruby (Manik)", slug: "ruby", image: gemstonesImg, desc: "Sun · Surya" },
          { name: "Pearl (Moti)", slug: "pearl", image: gemstonesImg, desc: "Moon · Chandra" },
          { name: "Red Coral (Moonga)", slug: "coral", image: gemstonesImg, desc: "Mars · Mangal" },
          { name: "Emerald (Panna)", slug: "emerald", image: gemstonesImg, desc: "Mercury · Budh" },
          { name: "Yellow Sapphire (Pukhraj)", slug: "yellow-sapphire", image: gemstonesImg, desc: "Jupiter · Brihaspati" },
          { name: "Diamond (Heera)", slug: "diamond", image: gemstonesImg, desc: "Venus · Shukra" },
          { name: "Blue Sapphire (Neelam)", slug: "blue-sapphire", image: gemstonesImg, desc: "Saturn · Shani" },
          { name: "Hessonite (Gomed)", slug: "hessonite", image: gemstonesImg, desc: "Rahu" },
          { name: "Cat's Eye (Lehsunia)", slug: "cats-eye", image: gemstonesImg, desc: "Ketu" },
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
        title: "Powerful Yantras",
        items: [
          { name: "Shree Yantra", slug: "shree-yantra", image: yantraImg, desc: "Wealth & abundance" },
          { name: "Kuber Yantra", slug: "kuber-yantra", image: yantraImg, desc: "Treasury & fortune" },
          { name: "Mahamrityunjay Yantra", slug: "mahamrityunjay-yantra", image: yantraImg, desc: "Health & longevity" },
          { name: "Navgrah Yantra", slug: "navgrah-yantra", image: yantraImg, desc: "Planetary balance" },
        ],
      },
    ],
  },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
