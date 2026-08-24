import { calculateDeal, cleanNumber, money } from "./calculator";
import type { DealInputs, LenderFees, TargetScenario, TargetVariable } from "./types";

function monthlyFor(inputs: DealInputs, lender: LenderFees, overrides: Partial<DealInputs>): number {
  return calculateDeal({ ...inputs, ...overrides }, lender).monthly;
}

function solveContinuous({
  inputs,
  lender,
  key,
  low,
  high,
  target,
  higherValueReducesPayment,
}: {
  inputs: DealInputs;
  lender: LenderFees;
  key: TargetVariable;
  low: number;
  high: number;
  target: number;
  higherValueReducesPayment: boolean;
}): { value: number; monthly: number } {
  let bestValue = low;
  let bestMonthly = monthlyFor(inputs, lender, { [key]: low } as Partial<DealInputs>);

  for (let i = 0; i < 72; i += 1) {
    const mid = (low + high) / 2;
    const monthly = monthlyFor(inputs, lender, { [key]: mid } as Partial<DealInputs>);

    if (Math.abs(monthly - target) < Math.abs(bestMonthly - target)) {
      bestValue = mid;
      bestMonthly = monthly;
    }

    if (higherValueReducesPayment) {
      if (monthly > target) low = mid;
      else high = mid;
    } else {
      if (monthly > target) high = mid;
      else low = mid;
    }
  }

  return { value: bestValue, monthly: bestMonthly };
}

export interface ScenarioSetters {
  setPurchasePrice: (v: string) => void;
  setDeposit: (v: string) => void;
  setInterestRate: (v: string) => void;
  setLoanTermMonths: (v: string) => void;
  setBalloonAmount: (v: string) => void;
}

export function computeTargetScenarios({
  inputs,
  lender,
  targetMonthly,
  locks,
  setters,
}: {
  inputs: DealInputs;
  lender: LenderFees;
  targetMonthly: number;
  locks: TargetVariable[];
  setters: ScenarioSetters;
}): TargetScenario[] {
  const target = cleanNumber(targetMonthly);
  if (!target || target <= 0) return [];

  const price = cleanNumber(inputs.purchasePrice);
  const deposit = cleanNumber(inputs.deposit);
  const balloon = cleanNumber(inputs.balloonAmount);
  const term = cleanNumber(inputs.loanTermMonths);

  const scenarios: Omit<TargetScenario, "difference" | "status">[] = [];

  if (!locks.includes("balloonAmount")) {
    const solved = solveContinuous({
      inputs,
      lender,
      key: "balloonAmount",
      low: 0,
      high: Math.max(price * 0.8, balloon, 1),
      target,
      higherValueReducesPayment: true,
    });
    const rounded = Math.round(solved.value);
    scenarios.push({
      key: "balloonAmount",
      label: "Balloon required",
      displayValue: money(rounded),
      rawValue: rounded,
      monthly: solved.monthly,
      apply: () => setters.setBalloonAmount(String(rounded)),
    });
  }

  if (!locks.includes("deposit")) {
    const solved = solveContinuous({
      inputs,
      lender,
      key: "deposit",
      low: deposit,
      high: Math.max(price, deposit + 1),
      target,
      higherValueReducesPayment: true,
    });
    const rounded = Math.round(solved.value);
    scenarios.push({
      key: "deposit",
      label: "Deposit required",
      displayValue: money(rounded),
      rawValue: rounded,
      monthly: solved.monthly,
      apply: () => setters.setDeposit(String(rounded)),
    });
  }

  if (!locks.includes("loanTermMonths")) {
    let bestTerm = term;
    let bestMonthly = monthlyFor(inputs, lender, { loanTermMonths: term });
    let bestDifference = Math.abs(bestMonthly - target);

    for (let candidate = 12; candidate <= 84; candidate += 12) {
      const monthly = monthlyFor(inputs, lender, { loanTermMonths: candidate });
      const difference = Math.abs(monthly - target);
      if (difference < bestDifference) {
        bestDifference = difference;
        bestTerm = candidate;
        bestMonthly = monthly;
      }
    }

    scenarios.push({
      key: "loanTermMonths",
      label: "Term required",
      displayValue: `${bestTerm} months`,
      rawValue: bestTerm,
      monthly: bestMonthly,
      apply: () => setters.setLoanTermMonths(String(bestTerm)),
    });
  }

  if (!locks.includes("interestRate")) {
    const currentRate = cleanNumber(inputs.interestRate);
    const solved = solveContinuous({
      inputs,
      lender,
      key: "interestRate",
      low: 0.01,
      high: Math.max(currentRate * 2, 30),
      target,
      higherValueReducesPayment: false,
    });
    const rounded = Math.max(0.01, solved.value);
    scenarios.push({
      key: "interestRate",
      label: "Interest rate required",
      displayValue: `${rounded.toFixed(2)}%`,
      rawValue: rounded,
      monthly: solved.monthly,
      apply: () => setters.setInterestRate(rounded.toFixed(2)),
    });
  }

  if (!locks.includes("purchasePrice")) {
    const solved = solveContinuous({
      inputs,
      lender,
      key: "purchasePrice",
      low: 1000,
      high: Math.max(price, 1000),
      target,
      higherValueReducesPayment: false,
    });
    const rounded = Math.round(solved.value);
    scenarios.push({
      key: "purchasePrice",
      label: "Purchase price required",
      displayValue: money(rounded),
      rawValue: rounded,
      monthly: solved.monthly,
      apply: () => setters.setPurchasePrice(String(rounded)),
    });
  }

  return scenarios.map((scenario) => {
    const difference = scenario.monthly - target;
    const status = Math.abs(difference) < 5 ? "Close" : difference > 0 ? "Above target" : "Below target";
    return { ...scenario, difference, status } as TargetScenario;
  });
}
