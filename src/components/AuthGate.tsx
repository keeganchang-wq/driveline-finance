import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Gauge, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AuthGateProps {
  children: (session: Session, signOut: () => void) => ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSendLink(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setStatus("error");
      setErrorMessage(
        error.message.includes("Database error saving new user")
          ? "This email isn't approved for access. Ask the site owner to add it."
          : error.message
      );
      return;
    }
    setStatus("sent");
  }

  function signOut() {
    supabase.auth.signOut();
  }

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <p className="text-sm text-ink-400">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-ink-800 bg-ink-900 p-6 shadow-lg shadow-black/30">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-ink-950">
              <Gauge size={18} />
            </span>
            <div className="leading-none">
              <p className="font-display text-lg font-bold tracking-tight text-ink-50">DRIVELINE</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">Finance</p>
            </div>
          </div>

          {status === "sent" ? (
            <div className="rounded-lg bg-brand-500/10 p-4 text-sm">
              <p className="font-semibold text-brand-400">Check your email</p>
              <p className="mt-1 text-ink-300">We sent a sign-in link to {email}. Open it on this device to continue.</p>
            </div>
          ) : (
            <form onSubmit={handleSendLink}>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Email</span>
                <div className="mt-1.5 flex items-center rounded-lg border border-ink-700 bg-ink-950 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                  <Mail size={14} className="ml-3 shrink-0 text-ink-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full min-w-0 bg-transparent py-2.5 px-2 text-sm font-medium text-ink-50 outline-none placeholder:text-ink-500"
                  />
                </div>
              </label>

              {status === "error" && <p className="mt-2 text-xs text-rose-400">{errorMessage}</p>}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-4 w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send sign-in link"}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-[11px] text-ink-500">No password needed — we'll email you a link.</p>
        </div>
      </div>
    );
  }

  return <>{children(session, signOut)}</>;
}
