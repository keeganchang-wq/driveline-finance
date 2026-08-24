import type { LenderTable } from "./types";

export const DEFAULT_LENDERS: LenderTable = {
  VWFS: { name: "VWFS", originationFee: 1595, establishmentFee: 590, ppsr: 0, monthlyAccountFee: 0 },
  PEPPER: { name: "Pepper", originationFee: 1990, establishmentFee: 490, ppsr: 8, monthlyAccountFee: 8.9 },
  ANGLE_COMM: { name: "Angle Commercial", originationFee: 1595, establishmentFee: 599, ppsr: 6, monthlyAccountFee: 20 },
  ANGLE_CON: { name: "Angle Consumer", originationFee: 1395, establishmentFee: 499, ppsr: 6, monthlyAccountFee: 15 },
  TAURUS: { name: "Taurus", originationFee: 1490, establishmentFee: 490, ppsr: 6, monthlyAccountFee: 11 },
  ALLIED: { name: "Allied", originationFee: 1495, establishmentFee: 595, ppsr: 9.95, monthlyAccountFee: 12.95 },
  NFS: { name: "NFS", originationFee: 1490, establishmentFee: 490, ppsr: 6, monthlyAccountFee: 11 },
};

export const DEFAULT_LENDER_KEY = "VWFS";
