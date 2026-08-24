import { lazy, Suspense, useRef, useState } from "react";
import { Car, CalendarRange, Landmark, Percent, User } from "lucide-react";
import { Card, NumberField, SelectField, TextField } from "./NumberField";
import { cleanNumber, money } from "../lib/calculator";
import type { DealResult, LenderFees, LenderTable } from "../lib/types";

const AmortizationModal = lazy(() => import("./AmortizationModal").then((m) => ({ default: m.AmortizationModal })));

const BALLOON_PERCENT_OPTIONS = Array.from({ length: 13 }, (_, i) => i * 5); // 0, 5, 10, ..., 60

function matchedBalloonPercent(purchasePrice: number, balloonAmount: number): number | null {
  if (!purchasePrice) return null;
  return (
    BALLOON_PERCENT_OPTIONS.find((pct) => Math.abs(Math.round((purchasePrice * pct) / 100) - balloonAmount) < 1) ?? null
  );
}

interface ClientProfileProps {
  clientName: string;
  clientPhone: string;
  vehicle: string;
  stockRef: string;
  onChange: (field: "clientName" | "clientPhone" | "vehicle" | "stockRef", value: string) => void;
}

export function ClientProfileCard({ clientName, clientPhone, vehicle, stockRef, onChange }: ClientProfileProps) {
  return (
    <Card title="Client profile" icon={<User size={15} />} collapsible defaultOpen={false}>
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Client name" value={clientName} onChange={(v) => onChange("clientName", v)} placeholder="Jordan Lee" />
        <TextField label="Phone" value={clientPhone} onChange={(v) => onChange("clientPhone", v)} placeholder="0400 000 000" />
        <TextField label="Vehicle" value={vehicle} onChange={(v) => onChange("vehicle", v)} placeholder="2023 Audi Q5" />
        <TextField label="Stock / ref" value={stockRef} onChange={(v) => onChange("stockRef", v)} placeholder="STK-0142" />
      </div>
    </Card>
  );
}

interface LenderCardProps {
  lenderKey: string;
  lenderFees: LenderTable;
  onLenderChange: (key: string) => void;
  onFeeChange: (field: keyof LenderFees, value: string) => void;
}

export function LenderCard({ lenderKey, lenderFees, onLenderChange, onFeeChange }: LenderCardProps) {
  const lender = lenderFees[lenderKey];
  return (
    <Card
      title="Lender & fees"
      icon={<Landmark size={15} />}
      collapsible
      defaultOpen={true}
      action={(open) =>
        !open && (
          <span className="whitespace-nowrap rounded-full bg-ink-800 px-2.5 py-1 text-[11px] font-medium normal-case tracking-normal text-ink-200">
            {lender.name}
          </span>
        )
      }
    >
      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Lender</span>
        <select
          className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-950 py-2.5 px-3 text-sm font-medium text-ink-50 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
          value={lenderKey}
          onChange={(e) => onLenderChange(e.target.value)}
        >
          {Object.entries(lenderFees).map(([key, l]) => (
            <option key={key} value={key}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 flex flex-col gap-3">
        <NumberField label="Origination fee" prefix="$" value={String(lender.originationFee)} onChange={(v) => onFeeChange("originationFee", v)} />
        <NumberField label="Establishment fee" prefix="$" value={String(lender.establishmentFee)} onChange={(v) => onFeeChange("establishmentFee", v)} />
        <NumberField label="PPSR" prefix="$" value={String(lender.ppsr)} onChange={(v) => onFeeChange("ppsr", v)} />
        <NumberField label="Monthly account fee" prefix="$" value={String(lender.monthlyAccountFee)} onChange={(v) => onFeeChange("monthlyAccountFee", v)} />
      </div>
    </Card>
  );
}

interface PurchaseDetailsProps {
  purchasePrice: string;
  deposit: string;
  tradeAllowance: string;
  existingPayout: string;
  deal: DealResult;
  onChange: (field: "purchasePrice" | "deposit" | "tradeAllowance" | "existingPayout", value: string) => void;
}

export function PurchaseDetailsCard({ purchasePrice, deposit, tradeAllowance, existingPayout, deal, onChange }: PurchaseDetailsProps) {
  return (
    <Card title="Purchase details" icon={<Car size={15} />} collapsible defaultOpen={true}>
      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Purchase price" prefix="$" value={purchasePrice} onChange={(v) => onChange("purchasePrice", v)} />
        <NumberField label="Deposit" prefix="$" value={deposit} onChange={(v) => onChange("deposit", v)} />
        <NumberField label="Trade allowance" prefix="$" value={tradeAllowance} onChange={(v) => onChange("tradeAllowance", v)} />
        <NumberField label="Payout" prefix="$" value={existingPayout} onChange={(v) => onChange("existingPayout", v)} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-ink-800 p-3 text-center sm:grid-cols-3">
        <div>
          <p className="whitespace-nowrap text-[10px] uppercase tracking-wide text-ink-400">Equity</p>
          <p className="whitespace-nowrap text-sm font-semibold text-ink-50 tabular-nums">{money(deal.equity)}</p>
        </div>
        <div>
          <p className="whitespace-nowrap text-[10px] uppercase tracking-wide text-ink-400">Subtotal</p>
          <p className="whitespace-nowrap text-sm font-semibold text-ink-50 tabular-nums">{money(deal.subtotal)}</p>
        </div>
        <div>
          <p className="whitespace-nowrap text-[10px] uppercase tracking-wide text-ink-400">LVR</p>
          <p className="whitespace-nowrap text-sm font-semibold text-ink-50 tabular-nums">{deal.lvr.toFixed(2)}%</p>
        </div>
      </div>
    </Card>
  );
}

interface RepaymentStructureProps {
  interestRate: string;
  loanTermMonths: string;
  balloonAmount: string;
  deal: DealResult;
  onChange: (field: "interestRate" | "loanTermMonths" | "balloonAmount", value: string) => void;
  showRate: boolean;
  onToggleRate: () => void;
}

const LONG_PRESS_MS = 550;

export function RepaymentStructureCard({ interestRate, loanTermMonths, balloonAmount, deal, onChange, showRate, onToggleRate }: RepaymentStructureProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const matchedPercent = matchedBalloonPercent(deal.purchasePrice, cleanNumber(balloonAmount));
  const pressTimer = useRef<number | null>(null);

  function handleBalloonPercentChange(value: string) {
    if (value === "custom") return;
    const pct = Number(value);
    onChange("balloonAmount", String(Math.round((deal.purchasePrice * pct) / 100)));
  }

  function handlePressStart() {
    pressTimer.current = window.setTimeout(() => {
      onToggleRate();
      pressTimer.current = null;
    }, LONG_PRESS_MS);
  }

  function handlePressEnd() {
    if (pressTimer.current !== null) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  return (
    <Card
      title={
        <span
          onPointerDown={handlePressStart}
          onPointerUp={handlePressEnd}
          onPointerLeave={handlePressEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="select-none"
        >
          Repayment structure
        </span>
      }
      icon={<Percent size={15} />}
      collapsible
      defaultOpen={true}
      action={
        <button
          type="button"
          onClick={() => setShowSchedule(true)}
          className="flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-800 px-2.5 py-1 text-[11px] font-medium normal-case tracking-normal text-ink-200 transition hover:border-brand-500 hover:text-brand-400"
        >
          <CalendarRange size={12} /> Schedule
        </button>
      }
    >
      <div className={`grid gap-4 ${showRate ? "grid-cols-3" : "grid-cols-2"}`}>
        {showRate && <NumberField label="Rate" suffix="% p.a." value={interestRate} onChange={(v) => onChange("interestRate", v)} />}
        <NumberField label="Term" suffix="mths" value={loanTermMonths} onChange={(v) => onChange("loanTermMonths", v)} />
        <SelectField label="Balloon %" value={matchedPercent === null ? "custom" : String(matchedPercent)} onChange={handleBalloonPercentChange}>
          {matchedPercent === null && <option value="custom">Custom</option>}
          {BALLOON_PERCENT_OPTIONS.map((pct) => (
            <option key={pct} value={pct}>
              {pct}%
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-4">
        <NumberField label="Balloon amount" prefix="$" value={balloonAmount} onChange={(v) => onChange("balloonAmount", v)} />
      </div>

      {showSchedule && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
              <p className="text-sm text-ink-400">Loading schedule…</p>
            </div>
          }
        >
          <AmortizationModal deal={deal} onClose={() => setShowSchedule(false)} />
        </Suspense>
      )}
    </Card>
  );
}
