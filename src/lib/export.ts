import { cleanNumber, money } from "./calculator";
import type { DealResult, LenderFees } from "./types";

export interface ClientInfo {
  clientName: string;
  clientPhone: string;
  vehicle: string;
  stockRef: string;
}

export function buildQuoteText(deal: DealResult): string {
  return `Purchase Price: ${money(deal.purchasePrice)}
Term: ${deal.loanTermMonths} months
Balloon: ${money(deal.balloonAmount)} (${deal.balloonPercent.toFixed(2)}%)
Monthly: ${money(deal.monthly)}`;
}

export async function downloadQuotePdf(client: ClientInfo, lender: LenderFees, deal: DealResult): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  doc.setFillColor(246, 248, 251);
  doc.rect(0, 0, 210, 297, "F");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("DRIVELINE", 105, 22, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.text("FINANCE", 105, 29, { align: "center" });

  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.8);
  doc.line(20, 38, 190, 38);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(money(deal.monthly), 105, 58, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("monthly repayment", 105, 66, { align: "center" });

  const rows: [string, string][] = [
    ["Client", client.clientName || "-"],
    ["Phone", client.clientPhone || "-"],
    ["Vehicle", client.vehicle || "-"],
    ["Stock / Ref", client.stockRef || "-"],
    ["Lender", lender.name],
    ["Purchase Price", money(deal.purchasePrice)],
    ["Deposit", money(deal.deposit)],
    ["Trade", money(deal.tradeAllowance)],
    ["Payout", money(deal.existingPayout)],
    ["Origination Fee", money(cleanNumber(lender.originationFee))],
    ["Establishment Fee", money(cleanNumber(lender.establishmentFee))],
    ["PPSR", money(cleanNumber(lender.ppsr))],
    ["Monthly Account Fee", money(cleanNumber(lender.monthlyAccountFee))],
    ["Amount Financed", money(deal.amountFinanced)],
    ["Rate", `${deal.interestRate.toFixed(2)}%`],
    ["Term", `${deal.loanTermMonths} months`],
    ["Balloon", `${money(deal.balloonAmount)} (${deal.balloonPercent.toFixed(2)}%)`],
    ["Monthly Repayment", money(deal.monthly)],
  ];

  let y = 82;
  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setTextColor(100, 116, 139);
    doc.text(label, 22, y);
    doc.setTextColor(15, 23, 42);
    doc.text(value, 188, y, { align: "right" });
    doc.setDrawColor(226, 232, 240);
    doc.line(22, y + 4, 188, y + 4);
    y += 9;
  });

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text("Estimate only. Subject to lender approval and final contract terms.", 105, 282, {
    align: "center",
  });

  doc.save("driveline-finance-quote.pdf");
}
