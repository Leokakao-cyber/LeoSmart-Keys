/* ---------------- Clipboard sheet ---------------- */

function ClipboardSheet({
  open,
  onClose,
  onPaste,
}: {
  open: boolean;
  onClose: () => void;
  onPaste: (s: string) => void;
}) {
  const [items, setItems] = useState<string[]>([
    "hello@example.com",
    "https://lovable.dev",
    "See you at 6 PM at the cafe ☕",
  ]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // Attempt to read the OS clipboard (Android WebView / desktop browsers).
    (async () => {
      try {
        if (navigator.clipboard?.readText) {
          const text = await navigator.clipboard.readText();
          if (text && !items.includes(text)) setItems((xs) => [text, ...xs].slice(0, 8));
          setStatus("Synced from system clipboard");
        }
      } catch {
        setStatus("Clipboard access denied — showing recent snippets");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border-t bg-card text-card-foreground shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "70vh" }}
      >
        <div className="flex items-center justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Clipboard className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Clipboard</div>
              <div className="text-[11px] text-muted-foreground">
                {status ?? "Tap a snippet to paste"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto px-5 pb-6 pt-4">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => onPaste(it)}
              className="w-full truncate rounded-xl border bg-background px-3 py-2 text-left text-sm hover:bg-accent"
            >
              {it}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------- Utilities ---------------- */

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// Free public translation endpoint (MyMemory). No API key needed for demo.
// In production, swap for Google Translate / DeepL with a server-held key.
async function translateText(q: string, from: string, to: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      q,
    )}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json();
    return data?.responseData?.translatedText ?? "[no translation]";
  } catch {
    return "[translation failed]";
  }
}

/* ---------------- Feature grid ---------------- */

function FeatureGrid() {
  const features = [
    { icon: CheckCircle2, title: "AI Grammar", desc: "Real-time corrections as you type." },
    { icon: Wand2, title: "AI Rewrite", desc: "Formal, friendly, concise — one tap." },
    { icon: Lightbulb, title: "Smart suggestions", desc: "Trie-powered next words." },
    { icon: Globe, title: "Translate", desc: "40+ languages inline." },
    { icon: Clipboard, title: "Clipboard", desc: "Pinned & synced snippets." },
    { icon: Mic, title: "Voice typing", desc: "SpeechRecognition-powered dictation." },
  ];
  return (
    <section className="mx-auto mt-6 max-w-md px-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        More features
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="rounded-2xl border bg-card p-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-2 text-sm font-semibold">{f.title}</div>
              <div className="text-[11px] text-muted-foreground">{f.desc}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
        {["Swipe typing", "Auto-correct", "Auto-cap", "Themes", "Typing sounds", "Haptics"].map(
          (t) => (
            <div key={t} className="rounded-lg border bg-card px-2 py-1.5 text-center">
              {t}
            </div>
          ),
        )}
      </div>
    </section>
  );
}

/* ---------------- Settings sheet ---------------- */

const ACCENT_SWATCHES = [
  "#7c5cff", "#3B82F6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#6366f1",
];

function SettingsSheet({
  open,
  onClose,
  settings,
  setSettings,
  dark,
  setDark,
}: {
  open: boolean;
  onClose: () => void;
  settings: KeyboardSettings;
  setSettings: React.Dispatch<React.SetStateAction<KeyboardSettings>>;
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const toggle = (k: keyof KeyboardSettings) => (v: boolean) =>
    setSettings((s) => ({ ...s, [k]: v }));

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border-t bg-card text-card-foreground shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "82vh" }}
      >
        <div className="flex items-center justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <SettingsIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Keyboard settings</div>
              <div className="text-[11px] text-muted-foreground">Theme • Layout • Feedback</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[68vh] space-y-5 overflow-y-auto px-5 pb-6 pt-4 text-sm">
          <section>
            <SectionLabel>Theme</SectionLabel>
            <div className="mt-2 flex gap-2">
              <SegBtn active={!dark} onClick={() => setDark(false)}>
                <Sun className="h-3.5 w-3.5" /> Light
              </SegBtn>
              <SegBtn active={dark} onClick={() => setDark(true)}>
                <Moon className="h-3.5 w-3.5" /> Dark
              </SegBtn>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ACCENT_SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => setSettings((s) => ({ ...s, accent: c }))}
                  aria-label={`Accent ${c}`}
                  className={`h-7 w-7 rounded-full ring-offset-2 ring-offset-card ${
                    settings.accent === c ? "ring-2 ring-foreground" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionLabel>Keyboard</SectionLabel>
            <label className="mt-2 flex items-center justify-between">
              <span>Height</span>
              <input
                type="range"
                min={0.85}
                max={1.25}
                step={0.05}
                value={settings.height}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, height: parseFloat(e.target.value) }))
                }
              />
            </label>
            <Toggle label="Floating mode" value={settings.floating} onChange={toggle("floating")} />
            <Toggle label="Key borders" value={settings.keyBorders} onChange={toggle("keyBorders")} />
          </section>

          <section>
            <SectionLabel>Typing</SectionLabel>
            <Toggle label="Auto-correction" value={settings.autoCorrect} onChange={toggle("autoCorrect")} />
            <Toggle label="Auto-suggestions" value={settings.autoSuggest} onChange={toggle("autoSuggest")} />
            <Toggle label="Haptic feedback" value={settings.haptic} onChange={toggle("haptic")} />
            <Toggle label="Typing sound" value={settings.sound} onChange={toggle("sound")} />
          </section>

          <section>
            <SectionLabel>About</SectionLabel>
            <div className="mt-2 rounded-xl border bg-background p-3 text-xs text-muted-foreground">
              <div>Lumen Keyboard • v1.0.0 preview</div>
              <div>Build 2026.07.27</div>
              <div>Dictionary: {trie.size.toLocaleString()} words loaded</div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
        active ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="mt-2 flex items-center justify-between">
      <span>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-10 rounded-full transition ${value ? "bg-primary" : "bg-muted"}`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            value ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

/* ---------------- Font style sheet ---------------- */

function FontSheet({
  open,
  onClose,
  value,
  onChange,
  preview,
}: {
  open: boolean;
  onClose: () => void;
  value: FontStyleId;
  onChange: (id: FontStyleId) => void;
  preview: string;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border-t bg-card text-card-foreground shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "70vh" }}
      >
        <div className="flex items-center justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Type className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Font styles</div>
              <div className="text-[11px] text-muted-foreground">Unicode restyle — future packs supported</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto px-5 pb-6 pt-4">
          {FONT_STYLES.map((f) => (
            <button
              key={f.id}
              onClick={() => onChange(f.id)}
              className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                value === f.id ? "border-primary bg-primary/10" : "hover:bg-accent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {f.id}
                </span>
                <span className="text-base">{f.label}</span>
              </div>
              <div className="mt-1 truncate text-sm">{f.apply(preview)}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}