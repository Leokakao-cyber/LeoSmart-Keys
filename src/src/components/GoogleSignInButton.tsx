import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export function GoogleSignInButton() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setError(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message ?? "Sign in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (email) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs shadow-sm">
        <span className="max-w-[160px] truncate text-foreground">{email}</span>
        <button
          onClick={signOut}
          aria-label="Sign out"
          className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-accent"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={signIn}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:bg-accent disabled:opacity-60"
      >
        <GoogleIcon className="h-4 w-4" />
        {loading ? "Opening…" : "Sign in with Google"}
      </button>
      {error && <div className="text-[10px] text-destructive">{error}</div>}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.53C16.86 3.4 14.66 2.4 12 2.4 6.86 2.4 2.7 6.56 2.7 11.7S6.86 21 12 21c6.93 0 9.3-4.86 9.3-9.28 0-.62-.07-1.09-.16-1.52H12z"/>
      <path fill="#34A853" d="M3.88 7.34l3.2 2.35C7.98 7.9 9.83 6.6 12 6.6c1.88 0 3.14.8 3.86 1.49l2.63-2.53C16.86 3.4 14.66 2.4 12 2.4 8.24 2.4 5 4.58 3.88 7.34z" opacity="0"/>
    </svg>
  );
}