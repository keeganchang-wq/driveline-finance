import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { amortizationSchedule, money } from "../lib/calculator";
import type { DealResult } from "../lib/types";

interface AmortizationModalProps {
  deal: DealResult;
  onClose: () => void;
}

export function AmortizationModal({ deal, onClose }: AmortizationModalProps) {
  const schedule = useMemo(() => amortizationSchedule(deal), [deal]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-ink-800 bg-ink-900 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-800 px-6 py-4">
          <h2 className="font-display text-base font-semibold text-ink-50">Amortisation schedule</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-800 hover:text-ink-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryTile label="Amount financed" value={money(deal.amountFinanced)} />
            <SummaryTile label="Total interest" value={money(deal.totalInterest)} />
            <SummaryTile label="Total payable" value={money(deal.totalPayable)} />
            <SummaryTile label="Balloon" value={money(deal.balloonAmount)} />
          </div>

          {deal.balloonAmount > 0 && (
            <p className="mt-3 text-[11px] text-ink-500">
              The balloon of {money(deal.balloonAmount)} is a residual owing at the end of the term, separate from the monthly payment shown below.
            </p>
          )}

          <div className="mt-5 h-64 rounded-xl border border-ink-800 bg-ink-950 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={schedule} margin={{ top: 10, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid stroke="var(--color-ink-800)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--color-ink-400)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-ink-700)" }}
                />
                <YAxis yAxisId="amount" tick={{ fill: "var(--color-ink-400)", fontSize: 11 }} tickLine={false} axisLine={false} width={38} />
                <YAxis yAxisId="balance" orientation="right" tick={{ fill: "var(--color-ink-400)", fontSize: 11 }} tickLine={false} axisLine={false} width={38} />
                <Tooltip
                  contentStyle={{ background: "var(--color-ink-900)", border: "1px solid var(--color-ink-700)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "var(--color-ink-300)" }}
                  formatter={(value, name) => [money(Number(value)), name]}
                  labelFormatter={(month) => `Month ${month}`}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-ink-400)" }} />
                <Bar yAxisId="amount" dataKey="principal" stackId="payment" name="Principal" fill="var(--color-brand-500)" />
                <Bar yAxisId="amount" dataKey="interest" stackId="payment" name="Interest" fill="#f59e0b" />
                <Line yAxisId="balance" type="monotone" dataKey="balance" name="Balance" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 max-h-72 overflow-y-auto rounded-xl border border-ink-800">
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead className="sticky top-0 bg-ink-800 text-[10px] uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">Month</th>
                  <th className="px-3 py-2 font-semibold">Payment</th>
                  <th className="px-3 py-2 font-semibold">Principal</th>
                  <th className="px-3 py-2 font-semibold">Interest</th>
                  <th className="px-3 py-2 font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {schedule.map((row) => (
                  <tr key={row.month} className="tabular-nums">
                    <td className="px-3 py-1.5 text-ink-400">{row.month}</td>
                    <td className="px-3 py-1.5 text-ink-100">{money(row.payment)}</td>
                    <td className="px-3 py-1.5 text-ink-100">{money(row.principal)}</td>
                    <td className="px-3 py-1.5 text-ink-100">{money(row.interest)}</td>
                    <td className="px-3 py-1.5 font-semibold text-ink-50">{money(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-800 p-3">
      <p className="whitespace-nowrap text-[10px] uppercase tracking-wide text-ink-400">{label}</p>
      <p className="whitespace-nowrap text-sm font-semibold tabular-nums text-ink-50">{value}</p>
    </div>
  );
}
