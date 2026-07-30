// Base vocabulary pack. In a real Android build this would come from a
// bundled SQLite/asset file; here we ship a compact common-word list and
// expose a `loadPack` interface so extra packs (200/400/user) can be added
// dynamically at runtime.

export const BASE_PACK_ID = "base-en-v1";

export const BASE_WORDS: Array<[string, number]> = [
  // High-frequency function words (weighted higher so they rank first)
  ["the", 100], ["be", 95], ["to", 94], ["of", 93], ["and", 92], ["a", 91],
  ["in", 90], ["that", 89], ["have", 88], ["i", 87], ["it", 86], ["for", 85],
  ["not", 84], ["on", 83], ["with", 82], ["he", 81], ["as", 80], ["you", 79],
  ["do", 78], ["at", 77], ["this", 76], ["but", 75], ["his", 74], ["by", 73],
  ["from", 72], ["they", 71], ["we", 70], ["say", 69], ["her", 68], ["she", 67],
  ["or", 66], ["an", 65], ["will", 64], ["my", 63], ["one", 62], ["all", 61],
  ["would", 60], ["there", 59], ["their", 58], ["what", 57], ["so", 56],
  ["up", 55], ["out", 54], ["if", 53], ["about", 52], ["who", 51], ["get", 50],
  ["which", 49], ["go", 48], ["me", 47], ["when", 46], ["make", 45],
  ["can", 44], ["like", 43], ["time", 42], ["no", 41], ["just", 40],
  ["him", 39], ["know", 38], ["take", 37], ["people", 36], ["into", 35],
  ["year", 34], ["your", 33], ["good", 32], ["some", 31], ["could", 30],
  ["them", 29], ["see", 28], ["other", 27], ["than", 26], ["then", 25],
  ["now", 24], ["look", 23], ["only", 22], ["come", 21], ["its", 20],
  ["over", 19], ["think", 18], ["also", 17], ["back", 16], ["after", 15],
  ["use", 14], ["two", 13], ["how", 12], ["our", 11], ["work", 10],
  // Common conversational words
  ["hello", 30], ["hey", 28], ["hi", 30], ["thanks", 25], ["please", 24],
  ["sure", 20], ["okay", 22], ["yes", 25], ["yeah", 24], ["nope", 15],
  ["sorry", 22], ["love", 24], ["really", 22], ["today", 24], ["tomorrow", 22],
  ["tonight", 20], ["morning", 20], ["evening", 18], ["cafe", 18],
  ["coffee", 20], ["meet", 22], ["meeting", 20], ["around", 22], ["about", 22],
  // Dictionary flair words
  ["serendipity", 8], ["ephemeral", 8], ["lucid", 10], ["eloquent", 9],
  ["luminous", 8], ["ubiquitous", 6], ["quintessential", 6], ["ineffable", 5],
  ["mellifluous", 5], ["petrichor", 6],
  // Practical
  ["and", 92], ["email", 18], ["phone", 18], ["home", 18], ["message", 18],
  ["text", 20], ["send", 20], ["call", 20], ["later", 22], ["soon", 22],
  ["free", 20], ["busy", 15], ["going", 22], ["great", 22], ["nice", 20],
  ["awesome", 18], ["amazing", 18], ["cool", 18], ["fine", 18], ["late", 18],
  ["early", 16], ["never", 18], ["always", 18], ["maybe", 18], ["might", 18],
  ["should", 18], ["would", 60], ["could", 30], ["want", 22], ["need", 22],
  ["thank", 22], ["welcome", 18], ["night", 18], ["day", 22], ["week", 20],
  ["weekend", 18], ["month", 16], ["hour", 16], ["minute", 15],
];

// Example "expansion packs" — in production these would be fetched lazily
// from the network / asset system. Kept tiny here to illustrate the API.
export const EXPANSION_PACKS: Record<string, Array<[string, number]>> = {
  "tech-200": [
    ["react", 12], ["typescript", 12], ["javascript", 12], ["android", 14],
    ["keyboard", 14], ["dictionary", 14], ["translate", 12], ["clipboard", 12],
    ["voice", 10], ["emoji", 10], ["gboard", 10], ["ime", 8], ["trie", 8],
    ["suggestion", 10], ["autocomplete", 10],
  ],
};