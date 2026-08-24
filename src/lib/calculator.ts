import type { AmortizationRow, DealInputs, DealResult, LenderFees } from "./types";

export function cleanNumber(value: unknown): number {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Standard amortised repayment with a balloon (residual) paid at the end of term.
 * Solves M such that PV = M * (1-(1+r)^-n)/r + FV * (1+r)^-n
 */
export function repaymentFor({
  amountFinanced,
  annualRatePct,
  months,
  balloon,
}: {
  amountFinanced: number;
  annualRatePct: number;
  months: number;
  balloon: number;
}): number {
  const monthlyRate = annualRatePct / 100 / 12;

  if (!months || months <= 0) return 0;
  if (!monthlyRate) return Math.max(amountFinanced - balloon, 0) / months;

  const balloonPresentValue = balloon / Math.pow(1 + monthlyRate, months);
  const adjustedPrincipal = amountFinanced - balloonPresentValue;

  return (adjustedPrincipal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

export function calculateDeal(inputs: DealInputs, lender: LenderFees): DealResult {
  const price = cleanNumber(inputs.purchasePrice);
  const deposit = cleanNumber(inputs.deposit);
  const trade = cleanNumber(inputs.tradeAllowance);
  const payout = cleanNumber(inputs.existingPayout);
  const rate = cleanNumber(inputs.interestRate);
  const term = cleanNumber(inputs.loanTermMonths);
  const balloon = cleanNumber(inputs.balloonAmount);

  const lenderCapitalisedFees =
    cleanNumber(lender.originationFee) + cleanNumber(lender.establishmentFee) + cleanNumber(lender.ppsr);

  const equity = deposit + trade - payout;
  const subtotal = Math.max(price - equity, 0);
  const amountFinanced = subtotal + lenderCapitalisedFees;

  const monthlyBase = repaymentFor({ amountFinanced, annualRatePct: rate, months: term, balloon });
  const monthlyAccountFee = cleanNumber(lender.monthlyAccountFee);
  const monthly = monthlyBase + monthlyAccountFee;
  const totalPayable = monthly * term + balloon;

  return {
    purchasePrice: price,
    deposit,
    tradeAllowance: trade,
    existingPayout: payout,
    interestRate: rate,
    loanTermMonths: term,
    balloonAmount: balloon,
    lenderCapitalisedFees,
    monthlyAccountFee,
    equity,
    subtotal,
    amountFinanced,
    monthly,
    weekly: (monthly * 12) / 52,
    fortnightly: (monthly * 12) / 26,
    totalPayable,
    totalInterest: totalPayable - amountFinanced,
    lvr: price ? (amountFinanced / price) * 100 : 0,
    balloonPercent: price ? (balloon / price) * 100 : 0,
  };
}

export function amortizationSchedule(deal: DealResult): AmortizationRow[] {
  const months = Math.round(deal.loanTermMonths);
  if (months <= 0) return [];

  const monthlyRate = deal.interestRate / 100 / 12;
  const paymentExFee = deal.monthly - deal.monthlyAccountFee;

  const rows: AmortizationRow[] = [];
  let balance = deal.amountFinanced;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let month = 1; month <= months; month++) {
    const isFinalMonth = month === months;
    const interest = balance * monthlyRate;
    const principal = paymentExFee - interest;
    balance = isFinalMonth ? deal.balloonAmount : balance - principal;

    cumulativeInterest += interest;
    cumulativePrincipal += principal;

    rows.push({
      month,
      payment: paymentExFee,
      principal,
      interest,
      balance,
      cumulativeInterest,
      cumulativePrincipal,
    });
  }

  return rows;
}

export const CURRENCY = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 2,
});

export function money(value: number): string {
  return Number.isFinite(value) ? CURRENCY.format(value) : "$0.00";
}
