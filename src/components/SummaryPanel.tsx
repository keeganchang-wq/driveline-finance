import { useState } from "react";
import { ChevronDown, Download, MessageSquareText, Save, Mail } from "lucide-react";
import { money } from "../lib/calculator";
import type { DealResult } from "../lib/types";

interface SummaryPanelProps {
  deal: DealResult;
  onSave: () => void;
  onPdf: () => void;
  smsHref: string;
  mailHref: string;
}

export function SummaryPanel({ deal, onSave, onPdf, smsHref, mailHref }: SummaryPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="sticky top-6 flex flex-col gap-4">
      <div className="rounded-2xl border border-ink-800 bg-gradient-to-br from-ink-800 to-ink-950 p-6 text-white shadow-lg shadow-black/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">Monthly repayment</p>
            <p className="mt-2 font-display text-4xl font-bold tabular-nums">{money(deal.monthly)}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Collapse payments" : "Expand payments"}
            aria-expanded={open}
            className="rounded-lg p-1 text-ink-400 transition hover:bg-white/10 hover:text-ink-200"
          >
            <ChevronDown size={16} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
          </button>
        </div>

        {open && (
          <>
            <div className="mt-5 flex flex-col gap-2.5 border-t border-white/10 pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="whitespace-nowrap text-[11px] uppercase tracking-wide text-ink-400">Weekly</p>
                <p className="whitespace-nowrap font-display text-base font-semibold tabular-nums">{money(deal.weekly)}</p>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="whitespace-nowrap text-[11px] uppercase tracking-wide text-ink-400">Fortnightly</p>
                <p className="whitespace-nowrap font-display text-base font-semibold tabular-nums">{money(deal.fortnightly)}</p>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="whitespace-nowrap text-[11px] uppercase tracking-wide text-ink-400">Amount financed</p>
                <p className="whitespace-nowrap font-display text-base font-semibold tabular-nums">{money(deal.amountFinanced)}</p>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="whitespace-nowrap text-[11px] uppercase tracking-wide text-ink-400">Total interest</p>
                <p className="whitespace-nowrap font-display text-base font-semibold tabular-nums">{money(deal.totalInterest)}</p>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="whitespace-nowrap text-[11px] uppercase tracking-wide text-ink-400">Total payable</p>
                <p className="whitespace-nowrap font-display text-base font-semibold tabular-nums">{money(deal.totalPayable)}</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2 border-t border-white/10 pt-4 text-xs">
              <span className="shrink-0 whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 font-medium tabular-nums">LVR {deal.lvr.toFixed(1)}%</span>
              <span className="shrink-0 whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 font-medium tabular-nums">Balloon {deal.balloonPercent.toFixed(1)}%</span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onSave}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          <Save size={15} /> Save quote
        </button>
        <button
          onClick={onPdf}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-ink-700 bg-ink-800 py-2.5 text-sm font-semibold text-ink-200 transition hover:bg-ink-700"
        >
          <Download size={15} /> PDF
        </button>
        <a
          href={smsHref}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-ink-700 bg-ink-800 py-2.5 text-sm font-semibold text-ink-200 transition hover:bg-ink-700"
        >
          <MessageSquareText size={15} /> SMS
        </a>
        <a
          href={mailHref}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-ink-700 bg-ink-800 py-2.5 text-sm font-semibold text-ink-200 transition hover:bg-ink-700"
        >
          <Mail size={15} /> Email
        </a>
      </div>

      <p className="px-1 text-[11px] leading-snug text-ink-400">
        Estimate only. Subject to approval, lender policy and final contract terms.
      </p>
    </div>
  );
}
