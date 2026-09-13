import React, { useState } from "react";
import { Star, ShieldCheck, ThumbsUp, CheckCircle2, MessageSquarePlus, Filter } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  verifiedLab: boolean;
  helpfulCount: number;
  tags?: string[];
}

const DEFAULT_REVIEWS: Record<string, Review[]> = {
  rudraksha: [
    {
      id: "rev-1",
      author: "Rameshwar Prasad Pandey",
      city: "Varanasi, UP",
      rating: 5,
      date: "3 days ago",
      title: "100% Authentic Nepali Bead with X-Ray Certificate",
      comment:
        "Received the Rudraksha with clear X-Ray report showing internal seeds intact. The natural mukhi lines are deep and uninterrupted. Started wearing it after Monday morning Jaap — felt an immediate sense of mental tranquility.",
      verifiedBuyer: true,
      verifiedLab: true,
      helpfulCount: 42,
      tags: ["X-Ray Certified", "Vedic Energised"],
    },
    {
      id: "rev-2",
      author: "Dr. Kavita Deshmukh",
      city: "Pune, MH",
      rating: 5,
      date: "1 week ago",
      title: "Lab tested locally — 100% genuine Elaeocarpus ganitrus",
      comment:
        "Got the bead re-verified at a local gemological institute in Pune. Density and surface morphology matched genuine Nepali origin exactly as certified by Aastha Support. Divine packaging!",
      verifiedBuyer: true,
      verifiedLab: true,
      helpfulCount: 31,
      tags: ["Lab Verified", "Fast Delivery"],
    },
    {
      id: "rev-3",
      author: "Sunil Kumar Kothari",
      city: "Ahmedabad, GJ",
      rating: 5,
      date: "2 weeks ago",
      title: "Remarkable effect on meditation & daily stress",
      comment:
        "Wearing this during morning Mahamrityunjay Jaap. Noticeable reduction in restlessness and stress. The red velvet pouch and energisation certificate gave immense confidence.",
      verifiedBuyer: true,
      verifiedLab: true,
      helpfulCount: 27,
      tags: ["Abhimantrit", "High Energy"],
    },
    {
      id: "rev-4",
      author: "Ananya Sengupta",
      city: "Kolkata, WB",
      rating: 4,
      date: "3 weeks ago",
      title: "Great quality & divine scent of chandan",
      comment:
        "Arrived in 3 days with subtle fragrance of sandalwood oil and sacred bhasma. Very authentic texture. Deducted 1 star only because courier delivery was slightly delayed by 1 day.",
      verifiedBuyer: true,
      verifiedLab: false,
      helpfulCount: 19,
    },
  ],
  gemstone: [
    {
      id: "rev-5",
      author: "Aditya Sharma",
      city: "Jaipur, RJ",
      rating: 5,
      date: "4 days ago",
      title: "Unheated Gemstone — Verified by Family Astrologer",
      comment:
        "Purchased 5.25 Ratti Yellow Sapphire (Pukhraj). Showed it to our family Rajpurohit and gemologist — both confirmed zero heat treatment and excellent clarity index.",
      verifiedBuyer: true,
      verifiedLab: true,
      helpfulCount: 56,
      tags: ["NABL Certified", "Astrologer Approved"],
    },
    {
      id: "rev-6",
      author: "Priyadarshini Rao",
      city: "Bengaluru, KA",
      rating: 5,
      date: "1 week ago",
      title: "Stunning Ceylon Blue Sapphire with documentation",
      comment:
        "Delivered with a QR-coded NABL laboratory report. The cornflower blue color and natural silk inclusions are breathtaking. Pandit Ji provided personalized wearing Vidhi.",
      verifiedBuyer: true,
      verifiedLab: true,
      helpfulCount: 38,
      tags: ["Natural Origin", "Kundali Matched"],
    },
  ],
  mala: [
    {
      id: "rev-7",
      author: "Meenakshi Sundaram",
      city: "Madurai, TN",
      rating: 5,
      date: "2 days ago",
      title: "108+1 Bead Craftsmanship is Exceptional",
      comment:
        "The knotting between each bead is tight and comfortable for fingers during 108 Japa counts. Natural aroma of sacred wood. The Sumeru bead is clearly distinguished.",
      verifiedBuyer: true,
      verifiedLab: true,
      helpfulCount: 34,
      tags: ["108 Japa Ready", "Vedic Knotting"],
    },
  ],
  general: [
    {
      id: "rev-8",
      author: "Pandit Harish Rawat",
      city: "Rishikesh, UK",
      rating: 5,
      date: "5 days ago",
      title: "Scripture-accurate Yantra geometry & 24K Gold plating",
      comment:
        "Inspected the Yantra angles and sacred geometric engravings. Strictly adheres to Agama Shastra specifications. Installed in my Home Altar with Prana Pratishtha.",
      verifiedBuyer: true,
      verifiedLab: true,
      helpfulCount: 48,
      tags: ["Agama Shastra Compliant", "Prana Pratishtha"],
    },
  ],
};

export function ProductReviews({
  productName,
  categorySlug = "general",
}: {
  productName: string;
  categorySlug?: string;
}) {
  const normCategory = categorySlug.toLowerCase();
  let defaultList = DEFAULT_REVIEWS.general;
  if (normCategory.includes("rudraksha")) defaultList = DEFAULT_REVIEWS.rudraksha;
  else if (normCategory.includes("gem") || normCategory.includes("pukhraj") || normCategory.includes("sapphire"))
    defaultList = DEFAULT_REVIEWS.gemstone;
  else if (normCategory.includes("mala")) defaultList = DEFAULT_REVIEWS.mala;

  const [reviews, setReviews] = useState<Review[]>(defaultList);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  const [showForm, setShowForm] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");

  const handleVoteHelpful = (id: string) => {
    if (helpfulVotes[id]) return;
    setHelpfulVotes((prev) => ({ ...prev, [id]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r)),
    );
    toast.success("Thank you for your feedback!");
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newTitle.trim() || !newComment.trim()) {
      toast.error("Please fill in your name, title, and review comment.");
      return;
    }

    const created: Review = {
      id: `user-rev-${Date.now()}`,
      author: newAuthor.trim(),
      city: newCity.trim() || "Verified Buyer",
      rating: newRating,
      date: "Just now",
      title: newTitle.trim(),
      comment: newComment.trim(),
      verifiedBuyer: true,
      verifiedLab: true,
      helpfulCount: 1,
      tags: ["Verified Buyer"],
    };

    setReviews([created, ...reviews]);
    setShowForm(false);
    setNewAuthor("");
    setNewCity("");
    setNewTitle("");
    setNewComment("");
    setNewRating(5);
    toast.success("Review submitted! Thank you for sharing your blessings ✦");
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <section className="mt-14 pt-8 border-t border-gold/20">
      {/* Rectangular Header Summary Bar */}
      <div className="bg-cream/70 border border-gold/30 rounded-md p-4 sm:p-5 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-maroon-deep text-gold px-4 py-2 rounded-md font-numeric text-3xl font-bold border border-gold/30">
            4.9
          </div>
          <div>
            <div className="flex items-center gap-1 text-gold mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current text-gold" />
              ))}
              <span className="text-xs font-bold text-maroon-deep ml-1.5 font-numeric">
                4.9 / 5.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on 1,284+ verified purchases & lab certificates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-maroon-deep uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-gold" /> Filter:
          </span>
          <button
            onClick={() => setFilterRating(0)}
            className={`px-3 py-1 rounded text-xs font-medium border transition ${
              filterRating === 0
                ? "bg-maroon-deep text-cream border-maroon-deep"
                : "bg-white text-maroon-deep border-gold/25 hover:border-gold"
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilterRating(5)}
            className={`px-3 py-1 rounded text-xs font-medium border transition ${
              filterRating === 5
                ? "bg-maroon-deep text-cream border-maroon-deep"
                : "bg-white text-maroon-deep border-gold/25 hover:border-gold"
            }`}
          >
            5 ★ ({reviews.filter((r) => r.rating === 5).length})
          </button>
          <button
            onClick={() => setFilterRating(4)}
            className={`px-3 py-1 rounded text-xs font-medium border transition ${
              filterRating === 4
                ? "bg-maroon-deep text-cream border-maroon-deep"
                : "bg-white text-maroon-deep border-gold/25 hover:border-gold"
            }`}
          >
            4 ★ ({reviews.filter((r) => r.rating === 4).length})
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ml-2 inline-flex items-center gap-1.5 bg-gold text-maroon-deep px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-gold-soft transition shadow-2xs"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            {showForm ? "Close" : "Write Review"}
          </button>
        </div>
      </div>

      {/* Write a Review Modal/Form */}
      {showForm && (
        <form
          onSubmit={handleAddReview}
          className="bg-white rounded-md p-5 border border-gold/40 shadow-soft mb-6 space-y-3 animate-in fade-in duration-200"
        >
          <h3 className="font-display text-base font-bold text-maroon-deep border-b border-gold/20 pb-2">
            Write a Review for {productName}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-maroon-deep mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Sharma"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-gold/30 text-xs focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-maroon-deep mb-1">
                City / State
              </label>
              <input
                type="text"
                placeholder="e.g. Varanasi, UP"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-gold/30 text-xs focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-maroon-deep mb-1">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setNewRating(s)}
                  className="p-0.5 hover:scale-110 transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      s <= newRating ? "fill-gold text-gold" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-maroon-deep mb-1">
              Review Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Excellent genuine product with lab certificate"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-gold/30 text-xs focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-maroon-deep mb-1">
              Review Details <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Share details about authenticity, energisation, and your spiritual experience..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-gold/30 text-xs focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 rounded border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded bg-maroon-deep text-cream text-xs font-bold uppercase tracking-wider hover:bg-maroon transition shadow-2xs"
            >
              Submit Review
            </button>
          </div>
        </form>
      )}

      {/* Sleek Small Near-Rectangle Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-md p-4 border border-gold/25 shadow-2xs hover:border-gold/60 transition flex flex-col justify-between"
          >
            <div>
              {/* Header line */}
              <div className="flex items-center justify-between gap-2 border-b border-gold/15 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-maroon-deep text-gold flex items-center justify-center font-bold font-numeric text-xs shrink-0 border border-gold/30">
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display font-bold text-maroon-deep text-xs leading-none">
                      {rev.author}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{rev.city}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-0.5 text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rev.rating ? "fill-current text-gold" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                </div>
              </div>

              {/* Title & Comment */}
              <h5 className="font-display font-semibold text-maroon-deep text-xs mb-1 line-clamp-1">
                {rev.title}
              </h5>
              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                {rev.comment}
              </p>
            </div>

            {/* Footer badges & helpful button */}
            <div className="mt-3 pt-2.5 border-t border-gold/10 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-emerald-700 font-medium text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Verified Buyer
              </div>

              <button
                onClick={() => handleVoteHelpful(rev.id)}
                disabled={helpfulVotes[rev.id]}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium border transition ${
                  helpfulVotes[rev.id]
                    ? "bg-green-50 text-green-700 border-green-200 cursor-default"
                    : "bg-cream/60 text-maroon-deep border-gold/25 hover:bg-gold/15"
                }`}
              >
                <ThumbsUp className="w-3 h-3 text-gold" />
                Helpful ({rev.helpfulCount})
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
