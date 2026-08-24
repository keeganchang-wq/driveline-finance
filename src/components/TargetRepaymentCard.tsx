import { Lock, Target, Unlock } from "lucide-react";
import { Card, NumberField } from "./NumberField";
import type { TargetScenario, TargetVariable } from "../lib/types";

const LOCK_LABELS: Record<TargetVariable, string> = {
  purchasePrice: "Purchase",
  interestRate: "Rate",
  balloonAmount: "Balloon",
  loanTermMonths: "Term",
  deposit: "Deposit",
};

const STATUS_STYLES: Record<TargetScenario["status"], string> = {
  Close: "text-brand-400",
  "Above target": "text-amber-400",
  "Below target": "text-sky-400",
};

interface TargetRepaymentCardProps {
  targetMonthly: string;
  onTargetChange: (value: string) => void;
  preference: string;
  onPreferenceChange: (value: string) => void;
  locks: TargetVariable[];
  onToggleLock: (key: TargetVariable) => void;
  scenarios: TargetScenario[];
  onApplyPreferred: () => void;
  notPossible: boolean;
}

export function TargetRepaymentCard({
  targetMonthly,
  onTargetChange,
  preference,
  onPreferenceChange,
  locks,
  onToggleLock,
  scenarios,
  onApplyPreferred,
  notPossible,
}: TargetRepaymentCardProps) {
  return (
    <Card title="Target repayment" icon={<Target size={15} />}>
      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Target monthly" prefix="$" value={targetMonthly} onChange={onTargetChange} />
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Apply preference</span>
          <select
            className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-950 py-2.5 px-3 text-sm font-medium text-ink-50 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            value={preference}
            onChange={(e) => onPreferenceChange(e.target.value)}
          >
            <option value="auto">Best fit</option>
            <option value="purchasePrice">Purchase price</option>
            <option value="interestRate">Interest rate</option>
            <option value="balloonAmount">Balloon amount</option>
            <option value="loanTermMonths">Term</option>
            <option value="deposit">Deposit</option>
          </select>
        </label>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Lock up to 3 variables</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LOCK_LABELS) as TargetVariable[]).map((key) => {
            const locked = locks.includes(key);
            return (
              <button
                key={key}
                onClick={() => onToggleLock(key)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  locked
                    ? "border-brand-500 bg-brand-500 text-ink-950"
                    : "border-ink-700 bg-ink-800 text-ink-300 hover:border-ink-500"
                }`}
              >
                {locked ? <Lock size={11} /> : <Unlock size={11} />}
                {LOCK_LABELS[key]}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] text-ink-400">{locks.length}/3 locked</p>
      </div>

      <div className="mt-4 space-y-2">
        {scenarios.length === 0 && (
          <p className="rounded-lg bg-ink-800 p-3 text-xs text-ink-400">Enter a target monthly repayment to see solved options.</p>
        )}
        {notPossible && scenarios.length > 0 && (
          <p className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400">Target isn't reachable with the current locks.</p>
        )}
        {scenarios.map((scenario) => (
          <div key={scenario.key} className="flex items-center justify-between gap-3 rounded-xl border border-ink-700 p-3">
            <div>
              <p className="text-xs font-semibold text-ink-300">{scenario.label}</p>
              <p className="text-sm font-semibold text-ink-50 tabular-nums">{scenario.displayValue}</p>
              <p className={`text-[11px] ${STATUS_STYLES[scenario.status]}`}>
                {scenario.status === "Close" ? "Close to target" : `${scenario.status}: $${Math.abs(scenario.difference).toFixed(2)}`}
              </p>
            </div>
            <button
              onClick={scenario.apply}
              className="shrink-0 rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-200 transition hover:border-brand-500 hover:text-brand-400"
            >
              Apply
            </button>
          </div>
        ))}
      </div>

      {scenarios.length > 0 && (
        <button
          onClick={onApplyPreferred}
          className="mt-4 w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-brand-400"
        >
          Apply preferred option
        </button>
      )}
    </Card>
  );
}
