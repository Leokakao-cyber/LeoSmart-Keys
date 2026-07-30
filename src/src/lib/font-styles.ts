// Unicode stylizers — map ASCII letters/digits to visually-styled variants.
// Each style is a pure function so packs can be added later without touching UI.

export type FontStyleId =
  | "normal"
  | "bold"
  | "italic"
  | "boldItalic"
  | "serifBold"
  | "mono"
  | "script"
  | "fraktur"
  | "doubleStruck"
  | "smallCaps"
  | "fullwidth"
  | "circled"
  | "squared"
  | "bubble";

type Range = { A: number; a: number; d?: number };

// Build a translator from a math-alphanumeric base range.
const mathRange = ({ A, a, d }: Range) =>
  (s: string) =>
    Array.from(s)
      .map((ch) => {
        const c = ch.charCodeAt(0);
        if (c >= 65 && c <= 90) return String.fromCodePoint(A + (c - 65));
        if (c >= 97 && c <= 122) return String.fromCodePoint(a + (c - 97));
        if (d !== undefined && c >= 48 && c <= 57) return String.fromCodePoint(d + (c - 48));
        return ch;
      })
      .join("");

const map = (table: Record<string, string>) => (s: string) =>
  Array.from(s).map((ch) => table[ch] ?? table[ch.toLowerCase()] ?? ch).join("");

const smallCapsTable: Record<string, string> = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ",
  k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ",
  u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ",
};

const circledTable: Record<string, string> = {};
"abcdefghijklmnopqrstuvwxyz".split("").forEach((c, i) => {
  circledTable[c] = String.fromCodePoint(0x24d0 + i);
  circledTable[c.toUpperCase()] = String.fromCodePoint(0x24b6 + i);
});
"0123456789".split("").forEach((d, i) => {
  circledTable[d] = i === 0 ? "⓪" : String.fromCodePoint(0x2460 + i - 1);
});

const squaredTable: Record<string, string> = {};
"abcdefghijklmnopqrstuvwxyz".split("").forEach((c, i) => {
  const cp = String.fromCodePoint(0x1f130 + i);
  squaredTable[c] = cp;
  squaredTable[c.toUpperCase()] = cp;
});

const bubbleTable: Record<string, string> = { ...circledTable };

const fullwidth = (s: string) =>
  Array.from(s)
    .map((ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 33 && c <= 126) return String.fromCodePoint(0xff00 + (c - 32));
      if (ch === " ") return "　";
      return ch;
    })
    .join("");

export const FONT_STYLES: {
  id: FontStyleId;
  label: string;
  apply: (s: string) => string;
}[] = [
  { id: "normal", label: "Aa", apply: (s) => s },
  { id: "bold", label: "𝐀𝐚", apply: mathRange({ A: 0x1d400, a: 0x1d41a, d: 0x1d7ce }) },
  { id: "italic", label: "𝐴𝑎", apply: mathRange({ A: 0x1d434, a: 0x1d44e }) },
  { id: "boldItalic", label: "𝑨𝒂", apply: mathRange({ A: 0x1d468, a: 0x1d482 }) },
  { id: "serifBold", label: "𝔸𝕒", apply: mathRange({ A: 0x1d538, a: 0x1d552, d: 0x1d7d8 }) },
  { id: "mono", label: "𝙰𝚊", apply: mathRange({ A: 0x1d670, a: 0x1d68a, d: 0x1d7f6 }) },
  { id: "script", label: "𝒜𝒶", apply: mathRange({ A: 0x1d49c, a: 0x1d4b6 }) },
  { id: "fraktur", label: "𝔄𝔞", apply: mathRange({ A: 0x1d504, a: 0x1d51e }) },
  { id: "doubleStruck", label: "𝔻𝕕", apply: mathRange({ A: 0x1d538, a: 0x1d552, d: 0x1d7d8 }) },
  { id: "smallCaps", label: "Aᴀ", apply: map(smallCapsTable) },
  { id: "fullwidth", label: "Ａａ", apply: fullwidth },
  { id: "circled", label: "Ⓐⓐ", apply: map(circledTable) },
  { id: "squared", label: "🅰🅰", apply: map(squaredTable) },
  { id: "bubble", label: "Ⓑⓑ", apply: map(bubbleTable) },
];

export const styleText = (id: FontStyleId, s: string): string => {
  const style = FONT_STYLES.find((f) => f.id === id);
  return style ? style.apply(s) : s;
};