import { Calculator, Gauge, ListChecks, LogOut } from "lucide-react";

export type AppView = "calculator" | "quotes";

interface HeaderProps {
  view: AppView;
  onViewChange: (view: AppView) => void;
  userEmail: string;
  onSignOut: () => void;
}

export function Header({ view, onViewChange, userEmail, onSignOut }: HeaderProps) {
  return (
    <header className="border-b border-ink-800 bg-ink-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-ink-950">
            <Gauge size={18} />
          </span>
          <div className="leading-none">
            <p className="font-display text-lg font-bold tracking-tight text-ink-50">DRIVELINE</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">Finance</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 rounded-lg border border-ink-800 bg-ink-950 p-1">
          <button
            type="button"
            onClick={() => onViewChange("calculator")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              view === "calculator" ? "bg-brand-500 text-ink-950" : "text-ink-400 hover:text-ink-200"
            }`}
          >
            <Calculator size={13} /> Calculator
          </button>
          <button
            type="button"
            onClick={() => onViewChange("quotes")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              view === "quotes" ? "bg-brand-500 text-ink-950" : "text-ink-400 hover:text-ink-200"
            }`}
          >
            <ListChecks size={13} /> Quotes
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden max-w-[160px] truncate text-xs text-ink-400 sm:block">{userEmail}</span>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="flex items-center gap-1.5 rounded-lg border border-ink-800 bg-ink-950 px-2.5 py-1.5 text-xs font-semibold text-ink-400 transition hover:border-rose-500/40 hover:text-rose-400"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
