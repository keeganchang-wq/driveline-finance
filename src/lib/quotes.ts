import { supabase } from "./supabase";
import type { DealInputs, LenderKey, LenderTable, SavedQuote } from "./types";

interface QuoteRow {
  id: string;
  client_name: string;
  client_phone: string;
  vehicle: string;
  stock_ref: string;
  lender_key: string;
  inputs: DealInputs;
  lender_fees: LenderTable;
  created_at: string;
}

function rowToQuote(row: QuoteRow): SavedQuote {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toLocaleString(),
    clientName: row.client_name,
    clientPhone: row.client_phone,
    vehicle: row.vehicle,
    stockRef: row.stock_ref,
    lenderKey: row.lender_key,
    inputs: row.inputs,
    lenderFees: row.lender_fees,
  };
}

export async function loadSavedQuotes(): Promise<SavedQuote[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select("id, client_name, client_phone, vehicle, stock_ref, lender_key, inputs, lender_fees, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;
  return (data ?? []).map(rowToQuote);
}

export interface NewQuoteInput {
  clientName: string;
  clientPhone: string;
  vehicle: string;
  stockRef: string;
  lenderKey: LenderKey;
  inputs: DealInputs;
  lenderFees: LenderTable;
}

export async function saveQuote(quote: NewQuoteInput): Promise<SavedQuote> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data, error } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      client_name: quote.clientName,
      client_phone: quote.clientPhone,
      vehicle: quote.vehicle,
      stock_ref: quote.stockRef,
      lender_key: quote.lenderKey,
      inputs: quote.inputs,
      lender_fees: quote.lenderFees,
    })
    .select("id, client_name, client_phone, vehicle, stock_ref, lender_key, inputs, lender_fees, created_at")
    .single();

  if (error) throw error;
  return rowToQuote(data);
}

export async function removeSavedQuote(id: string): Promise<void> {
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw error;
}
