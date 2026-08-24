import { useMemo, useState } from "react";
import { FolderOpen, Search, Trash2 } from "lucide-react";
import { calculateDeal, money } from "../lib/calculator";
import type { SavedQuote } from "../lib/types";

interface QuotesViewProps {
  quotes: SavedQuote[];
  loading: boolean;
  onLoad: (quote: SavedQuote) => void;
  onDelete: (id: string) => void;
}

export function QuotesView({ quotes, loading, onLoad, onDelete }: QuotesViewProps) {
  const [search, setSearch] = useState("");
  const [lenderFilter, setLenderFilter] = useState("all");

  const lenderOptions = useMemo(() => {
    const names = new Set<string>();
    quotes.forEach((q) => names.add(q.lenderFees[q.lenderKey]?.name ?? q.lenderKey));
    return Array.from(names).sort();
  }, [quotes]);

  const rows = useMemo(() => {
    return quotes
      .map((quote) => ({ quote, deal: calculateDeal(quote.inputs, quote.lenderFees[quote.lenderKey]) }))
      .filter(({ quote }) => {
        const lenderName = quote.lenderFees[quote.lenderKey]?.name ?? quote.lenderKey;
        if (lenderFilter !== "all" && lenderName !== lenderFilter) return false;
        if (!search.trim()) return true;
        const haystack = `${quote.clientName} ${quote.vehicle} ${quote.stockRef}`.toLowerCase();
        return haystack.includes(search.trim().toLowerCase());
      });
  }, [quotes, search, lenderFilter]);

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900 p-5 shadow-sm shadow-black/20">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-300">
          <FolderOpen size={15} /> Saved quotes
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center rounded-lg border border-ink-700 bg-ink-950 px-3 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
            <Search size={14} className="shrink-0 text-ink-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, vehicle, stock #"
              className="w-56 bg-transparent py-2 px-2 text-sm text-ink-50 outline-none placeholder:text-ink-500"
            />
          </div>
          <select
            value={lenderFilter}
            onChange={(e) => setLenderFilter(e.target.value)}
            className="rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm font-medium text-ink-50 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All lenders</option>
            {lenderOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mb-3 text-[11px] text-ink-500">
        {rows.length} of {quotes.length} quote{quotes.length === 1 ? "" : "s"}
      </p>

      {loading ? (
        <p className="rounded-lg bg-ink-800 p-4 text-center text-sm text-ink-400">Loading quotes…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg bg-ink-800 p-4 text-center text-sm text-ink-400">
          {quotes.length === 0 ? "No saved quotes yet. Save a quote from the calculator to see it here." : "No quotes match your filters."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-800">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-ink-800 text-[10px] uppercase tracking-wide text-ink-400">
              <tr>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Client</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Vehicle</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Lender</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Purchase price</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Term</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Balloon</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Monthly</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Saved</th>
                <th className="whitespace-nowrap px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {rows.map(({ quote, deal }) => (
                <tr key={quote.id} className="text-ink-100">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-ink-50">{quote.clientName || "Unnamed client"}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-ink-300">{quote.vehicle || "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-ink-300">{quote.lenderFees[quote.lenderKey]?.name ?? quote.lenderKey}</td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">{money(deal.purchasePrice)}</td>
                  <td className="px-3 py-2 whitespace-nowrap tabular-nums">{deal.loanTermMonths} mths</td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">{money(deal.balloonAmount)}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-semibold tabular-nums text-ink-50">{money(deal.monthly)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-ink-500">{quote.createdAt}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onLoad(quote)}
                        className="whitespace-nowrap rounded-lg border border-ink-700 px-2.5 py-1 text-[11px] font-semibold text-ink-200 transition hover:border-brand-500 hover:text-brand-400"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onDelete(quote.id)}
                        aria-label="Delete quote"
                        className="rounded-lg p-1.5 text-ink-400 transition hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
