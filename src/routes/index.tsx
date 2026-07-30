import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppWindow,
  Type,
  BookOpen,
  Clipboard,
  Languages,
  Smile,
  Mic,
  Delete,
  ArrowBigUp,
  Search,
  X,
  Sparkles,
  Volume2,
  Moon,
  Sun,
  Wand2,
  CheckCircle2,
  Lightbulb,
  Globe,
  Loader2,
  Settings as SettingsIcon,
} from "lucide-react";
import { Trie } from "@/lib/trie";
import { BASE_PACK_ID, BASE_WORDS, EXPANSION_PACKS } from "@/lib/vocab";
import { FONT_STYLES, styleText, type FontStyleId } from "@/lib/font-styles";
import { EMOJI_CATEGORIES } from "@/lib/emoji-data";
import { InstallPrompt } from "@/components/InstallPrompt";
import { FeedbackButton } from "@/components/FeedbackButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen Keyboard — AI keyboard with built-in Dictionary" },
      {
        name: "description",
        content:
          "A Gboard-familiar Android keyboard with AI grammar correction, rewrite, translation, and a signature Dictionary button for instant word meanings.",
      },
      { property: "og:title", content: "Lumen Keyboard — AI + Dictionary" },
      {
        property: "og:description",
        content:
          "Modern AI keyboard for Android with a signature Dictionary button, grammar fixes, rewrite, and translation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ---------------- Keyboard layout data ---------------- */

const ROW1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const ROW2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
const ROW3 = ["z", "x", "c", "v", "b", "n", "m"];

// ?123 mode
const SYM_ROW1 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const SYM_ROW2 = ["@", "#", "$", "_", "&", "-", "+", "(", ")", "/"];
const SYM_ROW3 = ["*", '"', "'", ":", ";", "!", "?"];

type KbMode = "alpha" | "symbols" | "symbols2" | "emoji";

// Secondary math/currency layer (=\<)
const SYM2_ROW1 = ["~", "`", "|", "•", "√", "π", "÷", "×", "¶", "∆"];
const SYM2_ROW2 = ["£", "€", "¥", "¢", "^", "°", "=", "{", "}", "\\"];
const SYM2_ROW3 = ["%", "©", "®", "™", "✓", "[", "]"];
// Extras for the number bar in ?123 additions
const SYM_EXTRAS = ["≈", "≠", "≤", "≥", "§"];

const DICTIONARY: Record<
  string,
  { phonetic: string; pos: string; meaning: string; example: string }
> = {
  serendipity: {
    phonetic: "/ˌsɛrənˈdɪpɪti/",
    pos: "noun",
    meaning: "The occurrence of events by chance in a happy or beneficial way.",
    example: "A fortunate stroke of serendipity brought them together.",
  },
  ephemeral: {
    phonetic: "/ɪˈfɛm(ə)rəl/",
    pos: "adjective",
    meaning: "Lasting for a very short time.",
    example: "The beauty of the sunset was ephemeral but unforgettable.",
  },
  lucid: {
    phonetic: "/ˈluːsɪd/",
    pos: "adjective",
    meaning: "Expressed clearly; easy to understand.",
    example: "She gave a lucid explanation of the theory.",
  },
  eloquent: {
    phonetic: "/ˈɛləkwənt/",
    pos: "adjective",
    meaning: "Fluent or persuasive in speaking or writing.",
    example: "He delivered an eloquent speech at the conference.",
  },
};

/* ---------------- Component ---------------- */

// One shared Trie instance (module-scoped, like an on-device IME dict).
const trie = new Trie();
trie.loadPack(BASE_PACK_ID, BASE_WORDS);

// Input type ~= Android EditorInfo. Drives Enter-key behaviour.
type InputType = "text" | "multiline" | "search" | "next" | "done";

export type KeyboardSettings = {
  height: number; // 0.85–1.25 scale
  floating: boolean;
  keyBorders: boolean;
  autoCorrect: boolean;
  autoSuggest: boolean;
  haptic: boolean;
  sound: boolean;
  accent: string; // hex or oklch
};

const DEFAULT_SETTINGS: KeyboardSettings = {
  height: 1,
  floating: false,
  keyBorders: false,
  autoCorrect: true,
  autoSuggest: true,
  haptic: true,
  sound: false,
  accent: "#7c5cff",
};

function Index() {
  const [dark, setDark] = useState(true);
  const [text, setText] = useState("Meet me at the cafe around");
  const [shift, setShift] = useState(true);
  const [mode, setMode] = useState<KbMode>("alpha");
  const [dictOpen, setDictOpen] = useState(false);
  const [clipOpen, setClipOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  const [fontStyle, setFontStyle] = useState<FontStyleId>("normal");
  const [settings, setSettings] = useState<KeyboardSettings>(DEFAULT_SETTINGS);
  const [inputType, setInputType] = useState<InputType>("multiline");
  const [imeStatus, setImeStatus] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);

  // Apply accent color as a CSS variable override
  const rootStyle = { ["--kb-accent" as any]: settings.accent } as React.CSSProperties;

  // Dynamic suggestions from Trie based on current word prefix.
  const suggestions = useMemo(() => {
    if (!settings.autoSuggest) return [];
    const match = text.match(/([A-Za-z']+)$/);
    const prefix = match ? match[1] : "";
    if (!prefix) {
      // Show high-frequency next-word starters when there's no active prefix.
      return trie.suggest("t", 3);
    }
    const results = trie.suggest(prefix, 3);
    // Ensure the prefix itself is offered as a literal fallback.
    if (results.length < 3 && !results.includes(prefix.toLowerCase())) {
      results.push(prefix.toLowerCase());
    }
    return results;
  }, [text, settings.autoSuggest]);

  // Haptic + sound feedback (opt-in via settings)
  const feedback = () => {
    if (settings.haptic && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(6);
      } catch { /* ignore */ }
    }
    if (settings.sound && typeof window !== "undefined" && "AudioContext" in window) {
      try {
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "square";
        o.frequency.value = 880;
        g.gain.value = 0.02;
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.03);
        setTimeout(() => ctx.close(), 100);
      } catch { /* ignore */ }
    }
  };

  // Simulated onTextChanged listener — could also feed a remote AI service.
  useEffect(() => {
    if (!imeStatus) return;
    const t = setTimeout(() => setImeStatus(null), 1600);
    return () => clearTimeout(t);
  }, [imeStatus]);

  return (
    <div className={dark ? "dark" : ""} style={rootStyle}>
      <div className="min-h-screen bg-background text-foreground">
        <InstallPrompt />
        <FeedbackButton />
        <div className="mx-auto max-w-md px-5 pt-10 pb-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">Lumen Keyboard</div>
                <div className="text-[11px] text-muted-foreground">
                  AI • Dictionary • Gboard-familiar
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GoogleSignInButton />
              <button
                onClick={() => setDark((d) => !d)}
                className="grid h-9 w-9 place-items-center rounded-full border bg-card text-foreground transition hover:bg-accent"
                aria-label="Toggle theme"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>

          <h1 className="mt-8 text-2xl font-semibold leading-tight tracking-tight">
            Type smarter. <span className="text-primary">Look up instantly.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Familiar Gboard layout with dynamic Trie-powered suggestions, a signature
            Dictionary button, and AI tools.
          </p>

          <InputTypeSelector value={inputType} onChange={setInputType} />
        </div>

        <div className="mx-auto max-w-md px-5">
          <ChatMock
            text={styleText(fontStyle, text)}
            inputType={inputType}
            imeStatus={imeStatus}
            translation={translation}
          />
        </div>

        <div className="sticky bottom-0 mx-auto mt-4 max-w-md">
          <Keyboard
            text={text}
            setText={setText}
            shift={shift}
            setShift={setShift}
            mode={mode}
            setMode={setMode}
            suggestions={suggestions}
            inputType={inputType}
            fontStyle={fontStyle}
            settings={settings}
            feedback={feedback}
            onImeAction={(msg) => setImeStatus(msg)}
            onOpenDictionary={() => setDictOpen(true)}
            onOpenClipboard={() => setClipOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenFonts={() => setFontOpen(true)}
            onTranslate={async () => {
              if (!text.trim()) return;
              setImeStatus("Translating…");
              const out = await translateText(text, "en", "es");
              setTranslation(out);
              setImeStatus("Translated → Spanish");
            }}
            onVoice={(finalText) => setText((t) => (t ? t + " " : "") + finalText)}
          />
        </div>

        <DictionarySheet open={dictOpen} onClose={() => setDictOpen(false)} />
        <ClipboardSheet
          open={clipOpen}
          onClose={() => setClipOpen(false)}
          onPaste={(snippet) => {
            setText((t) => t + snippet);
            setClipOpen(false);
          }}
        />
        <SettingsSheet
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          setSettings={setSettings}
          dark={dark}
          setDark={setDark}
        />
        <FontSheet
          open={fontOpen}
          onClose={() => setFontOpen(false)}
          value={fontStyle}
          onChange={setFontStyle}
          preview={text || "The quick brown fox"}
        />


        <FeatureGrid />
        <footer className="pb-10 pt-6 text-center text-xs text-muted-foreground">
          Built for Android • v1.0 preview
        </footer>
      </div>
    </div>
  );
}

/* ---------------- Input type selector (simulates EditorInfo) ---------------- */

function InputTypeSelector({
  value,
  onChange,
}: {
  value: InputType;
  onChange: (v: InputType) => void;
}) {
  const opts: { id: InputType; label: string }[] = [
    { id: "multiline", label: "Multiline (⏎ = newline)" },
    { id: "next", label: "Form (⏎ = Next)" },
    { id: "search", label: "Search (⏎ = Search)" },
    { id: "done", label: "Done (⏎ = Done)" },
  ];
  return (
    <div className="mt-5">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Simulated input type (drives Enter key)
      </div>
      <div className="flex flex-wrap gap-1.5">
        {opts.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
              value === o.id
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Chat mock ---------------- */

function ChatMock({
  text,
  inputType,
  imeStatus,
  translation,
}: {
  text: string;
  inputType: InputType;
  imeStatus: string | null;
  translation: string | null;
}) {
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3 border-b pb-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
          A
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Alex</div>
          <div className="text-[11px] text-muted-foreground">online</div>
        </div>
        {imeStatus && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {imeStatus}
          </span>
        )}
      </div>
      <div className="space-y-2 py-4">
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground">
          Sounds good! What time?
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-secondary px-3 py-2 text-sm text-secondary-foreground">
          I'm free after 5. ☕
        </div>
        {translation && (
          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-dashed bg-background px-3 py-2 text-xs text-muted-foreground">
            <span className="mr-1 font-semibold text-primary">ES:</span>
            {translation}
          </div>
        )}
      </div>
      <div className="flex items-start gap-2 rounded-2xl border bg-background px-3 py-2 text-sm">
        <span className="flex-1 whitespace-pre-wrap break-words text-foreground">
          {text}
          <span className="ml-0.5 inline-block h-4 w-0.5 -translate-y-0.5 animate-pulse bg-primary align-middle" />
        </span>
        <span className="mt-0.5 rounded-md bg-accent/60 px-1.5 py-0.5 text-[9px] font-medium text-accent-foreground">
          {inputType}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Keyboard ---------------- */

function Keyboard({
  text,
  setText,
  shift,
  setShift,
  mode,
  setMode,
  suggestions,
  inputType,
  fontStyle,
  settings,
  feedback,
  onImeAction,
  onOpenDictionary,
  onOpenClipboard,
  onOpenSettings,
  onOpenFonts,
  onTranslate,
  onVoice,
}: {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  shift: boolean;
  setShift: (v: boolean) => void;
  mode: KbMode;
  setMode: (m: KbMode) => void;
  suggestions: string[];
  inputType: InputType;
  fontStyle: FontStyleId;
  settings: KeyboardSettings;
  feedback: () => void;
  onImeAction: (msg: string) => void;
  onOpenDictionary: () => void;
  onOpenClipboard: () => void;
  onOpenSettings: () => void;
  onOpenFonts: () => void;
  onTranslate: () => void;
  onVoice: (t: string) => void;
}) {
  const append = (c: string) => {
    feedback();
    const ch = shift ? c.toUpperCase() : c;
    const styled = /[A-Za-z0-9]/.test(ch) ? styleText(fontStyle, ch) : ch;
    setText((t) => t + styled);
    if (shift) setShift(false);
  };

  const backspace = () => {
    feedback();
    setText((t) => Array.from(t).slice(0, -1).join(""));
  };

  // Commit the currently-typed prefix, then insert the chosen suggestion.
  const acceptSuggestion = (word: string) => {
    setText((t) => {
      const m = t.match(/([A-Za-z']+)$/);
      const base = m ? t.slice(0, -m[1].length) : t;
      trie.bump(word);
      return base + word + " ";
    });
  };

  // Enter key → dispatch IME action or insert newline, per input type.
  const onEnter = () => {
    switch (inputType) {
      case "multiline":
        setText((t) => t + "\n");
        break;
      case "next":
        onImeAction("IME_ACTION_NEXT → focus next field");
        break;
      case "done":
        onImeAction("IME_ACTION_DONE → dismissed");
        break;
      case "search":
        onImeAction(`IME_ACTION_SEARCH → “${text.trim()}”`);
        break;
      default:
        setText((t) => t + "\n");
    }
  };

  const scale = settings.height;
  const containerCls = settings.floating
    ? "mx-2 mb-2 rounded-3xl bg-[var(--color-kb-bg)] pb-3 pt-2 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
    : "rounded-t-3xl bg-[var(--color-kb-bg)] pb-3 pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.15)]";

  return (
    <div
      className={`${containerCls} ${settings.keyBorders ? "[&_button]:border [&_button]:border-black/10 dark:[&_button]:border-white/10" : ""}`}
      style={{ transform: `scaleY(${scale})`, transformOrigin: "bottom" }}
    >
      <Toolbar
        onOpenDictionary={onOpenDictionary}
        onOpenClipboard={onOpenClipboard}
        onOpenSettings={onOpenSettings}
        onOpenFonts={onOpenFonts}
        onTranslate={onTranslate}
        onToggleEmoji={() => setMode(mode === "emoji" ? "alpha" : "emoji")}
        onVoice={onVoice}
        emojiActive={mode === "emoji"}
      />


      {/* Dynamic suggestion strip (Trie prefix matches) */}
      <div className="mt-1 flex items-center border-b border-black/5 px-1 dark:border-white/5">
        {(suggestions.length ? suggestions : ["", "", ""]).map((s, i) => (
          <button
            key={s + i}
            disabled={!s}
            onClick={() => acceptSuggestion(s)}
            className={`flex-1 truncate py-2 text-[13px] ${
              i === 1
                ? "font-semibold text-[var(--color-kb-key-fg)]"
                : "text-[var(--color-kb-toolbar-fg)]"
            } ${!s ? "opacity-30" : ""}`}
          >
            {s || "—"}
          </button>
        ))}
      </div>

      {mode === "emoji" ? (
        <EmojiPanel onPick={(e) => setText((t) => t + e)} onBack={() => setMode("alpha")} />
      ) : mode === "symbols" ? (
        <SymbolsLayout
          append={append}
          backspace={backspace}
          onEnter={onEnter}
          inputType={inputType}
          onBackToAlpha={() => setMode("alpha")}
          onSwitchExt={() => setMode("symbols2")}
        />
      ) : mode === "symbols2" ? (
        <SymbolsExtLayout
          append={append}
          backspace={backspace}
          onEnter={onEnter}
          inputType={inputType}
          onBackToAlpha={() => setMode("alpha")}
          onBackToSymbols={() => setMode("symbols")}
        />
      ) : (
        <AlphaLayout
          append={append}
          backspace={backspace}
          onEnter={onEnter}
          shift={shift}
          setShift={setShift}
          onSwitchSymbols={() => setMode("symbols")}
          inputType={inputType}
        />
      )}

      <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-black/20 dark:bg-white/20" />
    </div>
  );
}

/* ---------------- Alpha / Symbols / Emoji layouts ---------------- */

function AlphaLayout({
  append,
  backspace,
  onEnter,
  shift,
  setShift,
  onSwitchSymbols,
  inputType,
}: {
  append: (c: string) => void;
  backspace: () => void;
  onEnter: () => void;
  shift: boolean;
  setShift: (v: boolean) => void;
  onSwitchSymbols: () => void;
  inputType: InputType;
}) {
  return (
    <>
      <Row>
        {ROW1.map((k) => (
          <Key key={k} onClick={() => append(k)} label={shift ? k.toUpperCase() : k} />
        ))}
      </Row>
      <Row>
        <Spacer w={0.5} />
        {ROW2.map((k) => (
          <Key key={k} onClick={() => append(k)} label={shift ? k.toUpperCase() : k} />
        ))}
        <Spacer w={0.5} />
      </Row>
      <Row>
        <Key
          onClick={() => setShift(!shift)}
          icon={<ArrowBigUp className="h-4 w-4" />}
          wide
          alt
          active={shift}
        />
        {ROW3.map((k) => (
          <Key key={k} onClick={() => append(k)} label={shift ? k.toUpperCase() : k} />
        ))}
        <Key onClick={backspace} icon={<Delete className="h-4 w-4" />} wide alt />
      </Row>
      <BottomRow
        onSwitchSymbols={onSwitchSymbols}
        symbolLabel="?123"