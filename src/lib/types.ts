export interface LenderFees {
  name: string;
  originationFee: number;
  establishmentFee: number;
  ppsr: number;
  monthlyAccountFee: number;
}

export type LenderKey = string;

export type LenderTable = Record<LenderKey, LenderFees>;

export interface DealInputs {
  purchasePrice: number;
  deposit: number;
  tradeAllowance: number;
  existingPayout: number;
  interestRate: number;
  loanTermMonths: number;
  balloonAmount: number;
}

export interface DealResult extends DealInputs {
  lenderCapitalisedFees: number;
  monthlyAccountFee: number;
  equity: number;
  subtotal: number;
  amountFinanced: number;
  monthly: number;
  weekly: number;
  fortnightly: number;
  totalPayable: number;
  totalInterest: number;
  lvr: number;
  balloonPercent: number;
}

export type TargetVariable = "purchasePrice" | "deposit" | "interestRate" | "loanTermMonths" | "balloonAmount";

export interface TargetScenario {
  key: TargetVariable;
  label: string;
  displayValue: string;
  rawValue: number;
  monthly: number;
  difference: number;
  status: "Close" | "Above target" | "Below target";
  apply: () => void;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface SavedQuote {
  id: string;
  createdAt: string;
  clientName: string;
  clientPhone: string;
  vehicle: string;
  stockRef: string;
  lenderKey: LenderKey;
  inputs: DealInputs;
  lenderFees: LenderTable;
}
