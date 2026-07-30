import { useState } from "react";
import { MessageSquarePlus, Star, X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (rating < 1 || rating > 5) {
      setError("Please pick a rating (1–5 stars).");
      return;
    }
    const trimmed = message.trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
      setError("Message must be 1–2000 characters.");
      return;
    }
    setStatus("sending");
    const { error: insertError } = await supabase.from("feedback").insert({
      rating,
      message: trimmed,
      email: email.trim() || null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
    if (insertError) {
      setStatus("error");
      setError(insertError.message);
      return;
    }
    setStatus("sent");
    setTimeout(() => {
      setOpen(false);
      setStatus("idle");
      setRating(0);
      setMessage("");
      setEmail("");
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition hover:scale-105"
      >
        <MessageSquarePlus className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border-t border-border bg-card p-5 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold">Send feedback</div>
                <div className="text-xs text-muted-foreground">
                  Help us make Lumen better.
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {status === "sent" ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <div className="text-sm font-medium">Thanks for the feedback!</div>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <div className="mb-1.5 text-xs font-medium text-muted-foreground">Rating</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        className="p-1"
                      >
                        <Star
                          className={`h-7 w-7 transition ${
                            n <= rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Your thoughts
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                    rows={4}
                    placeholder="What worked well? What could be better?"
                    className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <div className="mt-1 text-right text-[10px] text-muted-foreground">
                    {message.length}/2000
                  </div>
                </div>

                <div className="mt-2">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.slice(0, 255))}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                {error && (
                  <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {error}
                  </div>
                )}

                <button
                  onClick={submit}
                  disabled={status === "sending"}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow disabled:opacity-60"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    "Submit feedback"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}