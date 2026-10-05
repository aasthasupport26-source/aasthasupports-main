/**
 * Client-side "intelligent" product search.
 *
 * - Matches query keywords against the *start of words* (so "rud" finds
 *   "Rudraksha"), with exact-word matching for numbers ("1" won't match "10").
 * - Typo tolerant: "rudrksha", "pukraj", "braclet" still find the right items.
 * - Understands Hindi/English names, planets ("shani" → Neelam) and intents
 *   ("for wealth", "protection", "peace").
 * - Understands price phrases: "under 1000", "below ₹500", "above 2000".
 * - Ranks results so products whose name begins with / contains the query
 *   appear first, and falls back to partial matches instead of empty results.
 */

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  // Rudraksha Mukhis & numbers
  "1": ["ek", "one"],
  ek: ["1", "one"],
  "2": ["do", "two"],
  do: ["2", "two"],
  "3": ["teen", "three"],
  teen: ["3", "three"],
  "4": ["char", "four"],
  char: ["4", "four"],
  "5": ["panch", "panchmukhi", "five"],
  panch: ["5", "panchmukhi", "five"],
  panchmukhi: ["5", "panch", "five", "mukhi"],
  "6": ["cheh", "six"],
  cheh: ["6", "six"],
  "7": ["saat", "sat", "seven"],
  saat: ["7", "seven"],
  sat: ["7", "seven"],
  "8": ["aath", "ath", "eight"],
  aath: ["8", "eight"],
  "9": ["nau", "nine"],
  nau: ["9", "nine"],
  "10": ["das", "ten"],
  das: ["10", "ten"],
  "11": ["gyarah", "eleven"],
  "12": ["barah", "twelve"],
  "14": ["chaudah", "fourteen"],
  // Gemstones Hindi & English
  emerald: ["panna", "zamrud"],
  panna: ["emerald"],
  sapphire: ["neelam", "pukhraj"],
  pukhraj: ["yellow sapphire", "sapphire"],
  neelam: ["blue sapphire", "sapphire"],
  ruby: ["manik", "manikya"],
  manik: ["ruby", "manikya"],
  manikya: ["ruby", "manik"],
  pearl: ["moti"],
  moti: ["pearl"],
  coral: ["moonga", "munga"],
  moonga: ["coral", "red coral"],
  munga: ["coral", "moonga"],
  hessonite: ["gomed"],
  gomed: ["hessonite"],
  sphatik: ["crystal", "quartz"],
  crystal: ["sphatik", "quartz"],
  quartz: ["sphatik", "crystal"],
  rudraksh: ["rudraksha"],
  rudrakash: ["rudraksha"],
  sandalwood: ["chandan"],
  chandan: ["sandalwood"],
  lotus: ["kamal"],
  kamal: ["lotus"],
  // Planets (Navagraha) → gemstones
  shani: ["neelam", "blue sapphire", "saturn"],
  saturn: ["neelam", "blue sapphire", "shani"],
  guru: ["pukhraj", "yellow sapphire", "jupiter"],
  jupiter: ["pukhraj", "yellow sapphire", "guru"],
  surya: ["ruby", "manik", "sun"],
  sun: ["ruby", "manik", "surya"],
  chandra: ["pearl", "moti", "moon"],
  moon: ["pearl", "moti", "chandra"],
  mangal: ["coral", "moonga", "mars"],
  mars: ["coral", "moonga", "mangal"],
  budh: ["emerald", "panna", "mercury"],
  mercury: ["emerald", "panna", "budh"],
  rahu: ["gomed", "hessonite"],
  // Intents / benefits
  wealth: ["money", "prosperity", "pyrite", "citrine", "lakshmi", "kuber", "abundance"],
  money: ["wealth", "prosperity", "pyrite", "citrine", "magnet"],
  prosperity: ["wealth", "money", "lakshmi"],
  protection: ["evil eye", "obsidian", "protective", "nazar", "hanuman"],
  nazar: ["evil eye", "protection"],
  health: ["healing", "wellness"],
  healing: ["health", "chakra"],
  peace: ["calm", "meditation", "selenite", "stress"],
  calm: ["peace", "meditation"],
  stress: ["calm", "peace", "anxiety"],
  meditation: ["japa", "spiritual", "peace"],
  love: ["relationship", "rose quartz", "gauri shankar", "marriage"],
  marriage: ["gauri shankar", "relationship", "love"],
  career: ["success", "tiger eye", "growth", "business"],
  success: ["career", "business", "growth"],
  business: ["success", "career", "wealth"],
  courage: ["confidence", "tiger eye", "strength"],
  confidence: ["courage", "tiger eye"],
  gift: ["bracelet", "pendant", "mala"],
  pendant: ["locket"],
  locket: ["pendant"],
  bracelet: ["kada", "band"],
};

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "for", "of", "in", "with", "to", "me", "my", "i", "want",
  "need", "best", "good", "buy", "show", "original", "real", "rs", "inr", "price",
]);

export function normalizeSearchText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\u2010-\u2015_-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    // "7mukhi" -> "7 mukhi", "mukhi7" -> "mukhi 7"
    .replace(/(\p{N})(\p{L})/gu, "$1 $2")
    .replace(/(\p{L})(\p{N})/gu, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

/** Very light plural stemming for query words ("malas" -> "mala"). */
export function stem(word: string): string {
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

const isNumeric = (s: string) => /^\p{N}+$/u.test(s);

/** Optimal-string-alignment edit distance with an early-exit cap. */
export function editDistance(a: string, b: string, max = 2): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows = a.length + 1;
  const cols = b.length + 1;
  let prevPrev: number[] = new Array(cols).fill(0);
  let prev: number[] = Array.from({ length: cols }, (_, j) => j);
  for (let i = 1; i < rows; i++) {
    const cur: number[] = new Array(cols);
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prevPrev[j - 2] + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prevPrev = prev;
    prev = cur;
  }
  return prev[cols - 1];
}

function allowedTypos(term: string): number {
  if (term.length >= 8) return 2;
  if (term.length >= 4) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Query parsing
// ---------------------------------------------------------------------------

export interface ParsedQuery {
  tokens: string[];
  minPrice?: number;
  maxPrice?: number;
}

const MAX_PRICE_RE = /(?:\b(?:under|below|less than|lesser than|upto|up to|within|max)\b|<=?)\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/i;
const MIN_PRICE_RE = /(?:\b(?:above|over|more than|greater than|min|from|starting)\b|>=?)\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/i;
const RANGE_RE = /(?:rs\.?|inr|₹)?\s*(\d[\d,]*)\s*(?:-|to|–)\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/i;

const toNum = (s: string) => Number(s.replace(/,/g, ""));

export function parseQuery(query: string): ParsedQuery {
  let rest = String(query ?? "");
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  const range = rest.match(RANGE_RE);
  // Only treat "a-b" as a price range when values look like prices (not "1-14 mukhi").
  if (range && toNum(range[2]) >= 100) {
    minPrice = toNum(range[1]);
    maxPrice = toNum(range[2]);
    rest = rest.replace(range[0], " ");
  } else {
    const max = rest.match(MAX_PRICE_RE);
    if (max) {
      maxPrice = toNum(max[1]);
      rest = rest.replace(max[0], " ");
    }
    const min = rest.match(MIN_PRICE_RE);
    if (min) {
      minPrice = toNum(min[1]);
      rest = rest.replace(min[0], " ");
    }
  }

  const all = normalizeSearchText(rest).split(" ").filter(Boolean);
  const meaningful = all.filter((t) => !STOP_WORDS.has(t));
  const tokens = meaningful.length > 0 ? meaningful : minPrice || maxPrice ? [] : all;
  return { tokens, minPrice, maxPrice };
}

export function tokenizeQuery(query: string): string[] {
  return parseQuery(query).tokens;
}

// ---------------------------------------------------------------------------
// Index
// ---------------------------------------------------------------------------

export interface SearchableProduct {
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  productType?: string;
  tags?: string[];
  price?: number;
}

interface IndexedField {
  text: string;
  words: string[];
  weight: number;
}

export interface IndexedProduct<T> {
  product: T;
  name: string;
  fields: IndexedField[];
}

export interface SearchIndex<T> extends Array<IndexedProduct<T>> {
  vocabulary?: string[];
}

function makeField(value: unknown, weight: number): IndexedField | null {
  const text = normalizeSearchText(value);
  if (!text) return null;
  return { text, words: text.split(" "), weight };
}

export function buildSearchIndex<T extends SearchableProduct>(products: T[]): SearchIndex<T> {
  const vocab = new Set<string>();
  const index: SearchIndex<T> = products.map((product) => {
    const tags = Array.isArray(product.tags) ? product.tags.join(" ") : "";
    const fields = [
      makeField(product.name, 10),
      makeField(tags, 5),
      makeField(product.category, 5),
      makeField(product.productType, 5),
      makeField(product.slug, 4),
      makeField(product.description, 1),
    ].filter((f): f is IndexedField => f !== null);
    for (const f of fields) {
      if (f.weight < 4) continue;
      for (const w of f.words) if (w.length >= 3 && !isNumeric(w)) vocab.add(w);
    }
    return { product, name: normalizeSearchText(product.name), fields };
  });
  index.vocabulary = [...vocab];
  return index;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Quality of a single term against a field:
 * 3 exact word, 2 word prefix, 1 substring, 0.5–0.75 typo match, 0 none.
 */
function matchQuality(term: string, field: IndexedField, fuzzy: boolean): number {
  if (term.includes(" ")) {
    // Multi-word synonym, e.g. "yellow sapphire"
    return field.text.includes(term) ? 3 : 0;
  }
  const numeric = isNumeric(term);
  let best = 0;
  for (const word of field.words) {
    if (word === term) return 3;
    if (numeric) continue; // numbers must match exactly
    if (word.startsWith(term)) best = Math.max(best, 2);
    else if (term.length >= 4 && word.includes(term)) best = Math.max(best, 1);
  }
  if (best > 0 || !fuzzy || numeric || field.weight < 4) return best;

  const max = allowedTypos(term);
  if (max === 0) return 0;
  for (const word of field.words) {
    if (word.length < 3) continue;
    let d = editDistance(term, word, max);
    // Also compare against the word's prefix so partially-typed typos match ("rudrk" → "rudraksha").
    if (d > max && word.length > term.length) {
      d = Math.min(d, editDistance(term, word.slice(0, term.length), max));
    }
    if (d <= max) best = Math.max(best, d === 1 ? 0.75 : 0.5);
  }
  return best;
}

function scoreToken(token: string, fields: IndexedField[]): number {
  const base = stem(token);
  const candidates: Array<[string, number, boolean]> = [[base, 1, true]];
  if (base !== token) candidates.push([token, 1, false]);
  for (const syn of SEARCH_SYNONYMS[token] || SEARCH_SYNONYMS[base] || []) {
    candidates.push([normalizeSearchText(syn), 0.7, false]);
  }

  let best = 0;
  // Exact/prefix pass first; only fall back to (more expensive) fuzzy matching when needed.
  for (const pass of [false, true]) {
    for (const [term, factor, allowFuzzy] of candidates) {
      if (!term || (pass && !allowFuzzy)) continue;
      for (const field of fields) {
        const q = matchQuality(term, field, pass);
        if (q > 0) best = Math.max(best, q * field.weight * factor);
      }
    }
    if (best > 0) break;
  }
  return best;
}

export interface SearchResult<T> {
  results: T[];
  /** Total number of matching products. */
  total: number;
  /** Corrected query, when the user's words looked like typos. */
  suggestion?: string;
  minPrice?: number;
  maxPrice?: number;
  /** True when no product matched every keyword and partial matches are shown. */
  partial: boolean;
}

function suggestCorrection(tokens: string[], vocabulary: string[] | undefined): string | undefined {
  if (!vocabulary?.length) return undefined;
  let changed = false;
  const corrected = tokens.map((token) => {
    const t = stem(token);
    if (isNumeric(t) || t.length < 4 || SEARCH_SYNONYMS[token] || SEARCH_SYNONYMS[t]) return token;
    if (vocabulary.some((w) => w.startsWith(t))) return token;
    const max = allowedTypos(t);
    let bestWord: string | undefined;
    let bestDist = max + 1;
    for (const w of vocabulary) {
      let d = editDistance(t, w, max);
      if (d > max && w.length > t.length) d = editDistance(t, w.slice(0, t.length), max);
      if (d < bestDist) {
        bestDist = d;
        bestWord = w;
      }
    }
    if (bestWord) {
      changed = true;
      return bestWord;
    }
    return token;
  });
  return changed ? corrected.join(" ") : undefined;
}

/** Full search with metadata (suggestion, price filters, partial flag). */
export function searchProductsDetailed<T extends SearchableProduct>(
  index: SearchIndex<T>,
  query: string,
): SearchResult<T> {
  const { tokens, minPrice, maxPrice } = parseQuery(query);

  const inPrice = (p: T) => {
    const price = typeof p.price === "number" ? p.price : Number(p.price);
    if (minPrice !== undefined && !(price >= minPrice)) return false;
    if (maxPrice !== undefined && !(price <= maxPrice)) return false;
    return true;
  };
  const pool = minPrice !== undefined || maxPrice !== undefined ? index.filter((e) => inPrice(e.product)) : index;

  if (tokens.length === 0) {
    const results = pool.map((e) => e.product);
    return { results, total: results.length, minPrice, maxPrice, partial: false };
  }

  const phrase = tokens.join(" ");
  const firstStem = stem(tokens[0]);
  const scored = pool.map((entry, position) => {
    let score = 0;
    let matched = 0;
    for (const token of tokens) {
      const s = scoreToken(token, entry.fields);
      if (s > 0) matched++;
      score += s;
    }
    if (matched > 0) {
      // Strongly favour products whose name starts with / contains the query.
      if (entry.name.startsWith(phrase)) score += 60;
      else if (entry.name.includes(phrase)) score += 30;
      const firstWordIdx = entry.name.split(" ").findIndex((w) => w.startsWith(firstStem));
      if (firstWordIdx >= 0) score += Math.max(0, 10 - firstWordIdx * 2);
    }
    return { product: entry.product, score, matched, position };
  });

  const byRank = (
    a: { score: number; matched: number; position: number },
    b: { score: number; matched: number; position: number },
  ) => b.matched - a.matched || b.score - a.score || a.position - b.position;

  const allMatched = scored.filter((s) => s.matched === tokens.length);
  const partial = allMatched.length === 0;
  const results = (partial ? scored.filter((s) => s.matched > 0) : allMatched).sort(byRank).map((s) => s.product);

  return {
    results,
    total: results.length,
    suggestion: suggestCorrection(tokens, index.vocabulary),
    minPrice,
    maxPrice,
    partial: partial && results.length > 0,
  };
}

/**
 * Filters and ranks products for the given query. Returns the original list
 * untouched when the query is empty.
 */
export function searchProducts<T extends SearchableProduct>(index: SearchIndex<T>, query: string): T[] {
  return searchProductsDetailed(index, query).results;
}

/** Splits text into segments, flagging the parts that match the query (for highlighting). */
export function highlightMatches(text: string, query: string): Array<{ text: string; match: boolean }> {
  const tokens = parseQuery(query).tokens.map(stem).filter(Boolean);
  if (!text || tokens.length === 0) return [{ text, match: false }];
  const out: Array<{ text: string; match: boolean }> = [];
  for (const part of text.split(/(\s+|[()\-,/|])/)) {
    if (!part) continue;
    const lower = part.toLowerCase();
    const hit = tokens.find((t) => lower.startsWith(t));
    if (hit) {
      out.push({ text: part.slice(0, hit.length), match: true });
      if (part.length > hit.length) out.push({ text: part.slice(hit.length), match: false });
    } else {
      out.push({ text: part, match: false });
    }
  }
  return out;
}
