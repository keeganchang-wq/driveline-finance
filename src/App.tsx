import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Header, type AppView } from "./components/Header";
import { AuthGate } from "./components/AuthGate";
import { SummaryPanel } from "./components/SummaryPanel";
import { ClientProfileCard, LenderCard, PurchaseDetailsCard, RepaymentStructureCard } from "./components/DealSections";
import { TargetRepaymentCard } from "./components/TargetRepaymentCard";
import { QuotesView } from "./components/QuotesView";
import { calculateDeal, cleanNumber } from "./lib/calculator";
import { DEFAULT_LENDERS, DEFAULT_LENDER_KEY } from "./lib/lenders";
import { computeTargetScenarios } from "./lib/targetSolver";
import { loadSavedQuotes, removeSavedQuote, saveQuote as saveQuoteRemote } from "./lib/quotes";
import { buildQuoteText, downloadQuotePdf } from "./lib/export";
import type { DealInputs, LenderFees, LenderTable, SavedQuote, TargetVariable } from "./lib/types";

export default function App() {
  return <AuthGate>{(session, signOut) => <AppContent session={session} onSignOut={signOut} />}</AuthGate>;
}

interface AppContentProps {
  session: Session;
  onSignOut: () => void;
}

function AppContent({ session, onSignOut }: AppContentProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [stockRef, setStockRef] = useState("");

  const [lenderKey, setLenderKey] = useState(DEFAULT_LENDER_KEY);
  const [lenderFees, setLenderFees] = useState<LenderTable>(DEFAULT_LENDERS);

  const [purchasePrice, setPurchasePrice] = useState("132940");
  const [deposit, setDeposit] = useState("0");
  const [tradeAllowance, setTradeAllowance] = useState("15000");
  const [existingPayout, setExistingPayout] = useState("0");
  const [interestRate, setInterestRate] = useState("7.49");
  const [loanTermMonths, setLoanTermMonths] = useState("60");
  const [balloonAmount, setBalloonAmount] = useState("65000");

  const [targetMonthly, setTargetMonthly] = useState("1500");
  const [targetPreference, setTargetPreference] = useState("auto");
  const [targetLocks, setTargetLocks] = useState<TargetVariable[]>([]);

  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quotesError, setQuotesError] = useState<string | null>(null);

  const [showRate, setShowRate] = useState(false);
  const [view, setView] = useState<AppView>("calculator");

  useEffect(() => {
    loadSavedQuotes()
      .then(setSavedQuotes)
      .catch((err) => setQuotesError(err instanceof Error ? err.message : "Failed to load saved quotes."))
      .finally(() => setQuotesLoading(false));
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setShowRate((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const lender: LenderFees = lenderFees[lenderKey] ?? lenderFees[DEFAULT_LENDER_KEY];

  const inputs: DealInputs = useMemo(
    () => ({
      purchasePrice: cleanNumber(purchasePrice),
      deposit: cleanNumber(deposit),
      tradeAllowance: cleanNumber(tradeAllowance),
      existingPayout: cleanNumber(existingPayout),
      interestRate: cleanNumber(interestRate),
      loanTermMonths: cleanNumber(loanTermMonths),
      balloonAmount: cleanNumber(balloonAmount),
    }),
    [purchasePrice, deposit, tradeAllowance, existingPayout, interestRate, loanTermMonths, balloonAmount]
  );

  const deal = useMemo(() => calculateDeal(inputs, lender), [inputs, lender]);

  const scenarios = useMemo(
    () =>
      computeTargetScenarios({
        inputs,
        lender,
        targetMonthly: cleanNumber(targetMonthly),
        locks: targetLocks,
        setters: {
          setPurchasePrice,
          setDeposit,
          setInterestRate,
          setLoanTermMonths,
          setBalloonAmount,
        },
      }),
    [inputs, lender, targetMonthly, targetLocks]
  );

  const notPossible = targetLocks.length > 0 && (scenarios.length === 0 || scenarios.every((s) => Math.abs(s.difference) > 100));

  function toggleTargetLock(key: TargetVariable) {
    setTargetLocks((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      if (current.length >= 3) return current;
      return [...current, key];
    });
  }

  function applyPreferredTarget() {
    if (!scenarios.length) return;
    const preferred = targetPreference === "auto" ? scenarios : scenarios.filter((s) => s.key === targetPreference);
    const selected = (preferred.length ? preferred : scenarios).slice().sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference))[0];
    selected?.apply();
  }

  function handleClientChange(field: "clientName" | "clientPhone" | "vehicle" | "stockRef", value: string) {
    if (field === "clientName") setClientName(value);
    if (field === "clientPhone") setClientPhone(value);
    if (field === "vehicle") setVehicle(value);
    if (field === "stockRef") setStockRef(value);
  }

  function handlePurchaseChange(field: "purchasePrice" | "deposit" | "tradeAllowance" | "existingPayout", value: string) {
    if (field === "purchasePrice") setPurchasePrice(value);
    if (field === "deposit") setDeposit(value);
    if (field === "tradeAllowance") setTradeAllowance(value);
    if (field === "existingPayout") setExistingPayout(value);
  }

  function handleRepaymentChange(field: "interestRate" | "loanTermMonths" | "balloonAmount", value: string) {
    if (field === "interestRate") setInterestRate(value);
    if (field === "loanTermMonths") setLoanTermMonths(value);
    if (field === "balloonAmount") setBalloonAmount(value);
  }

  function handleFeeChange(field: keyof LenderFees, value: string) {
    setLenderFees((current) => ({
      ...current,
      [lenderKey]: { ...current[lenderKey], [field]: field === "name" ? value : cleanNumber(value) },
    }));
  }

  async function saveQuote() {
    setQuotesError(null);
    try {
      const quote = await saveQuoteRemote({ clientName, clientPhone, vehicle, stockRef, lenderKey, inputs, lenderFees });
      setSavedQuotes((current) => [quote, ...current]);
    } catch (err) {
      setQuotesError(err instanceof Error ? err.message : "Failed to save quote.");
    }
  }

  function loadQuote(quote: SavedQuote) {
    setClientName(quote.clientName);
    setClientPhone(quote.clientPhone);
    setVehicle(quote.vehicle);
    setStockRef(quote.stockRef);
    setLenderKey(quote.lenderKey);
    setLenderFees(quote.lenderFees);
    setPurchasePrice(String(quote.inputs.purchasePrice));
    setDeposit(String(quote.inputs.deposit));
    setTradeAllowance(String(quote.inputs.tradeAllowance));
    setExistingPayout(String(quote.inputs.existingPayout));
    setInterestRate(String(quote.inputs.interestRate));
    setLoanTermMonths(String(quote.inputs.loanTermMonths));
    setBalloonAmount(String(quote.inputs.balloonAmount));
    setView("calculator");
  }

  async function deleteQuote(id: string) {
    setQuotesError(null);
    try {
      await removeSavedQuote(id);
      setSavedQuotes((current) => current.filter((q) => q.id !== id));
    } catch (err) {
      setQuotesError(err instanceof Error ? err.message : "Failed to delete quote.");
    }
  }

  const quoteText = useMemo(() => buildQuoteText(deal), [deal]);

  const smsHref = `sms:?&body=${encodeURIComponent(quoteText)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent("Driveline Finance Quote")}&body=${encodeURIComponent(quoteText)}`;

  return (
    <div className="min-h-screen bg-ink-950">
      <Header view={view} onViewChange={setView} userEmail={session.user.email ?? ""} onSignOut={onSignOut} />
      <main className="mx-auto max-w-6xl px-6 py-6">
        {quotesError && (
          <div className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">{quotesError}</div>
        )}
        {view === "quotes" ? (
          <QuotesView quotes={savedQuotes} loading={quotesLoading} onLoad={loadQuote} onDelete={deleteQuote} />
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr_320px]">
            <div className="flex flex-col gap-5 lg:order-1">
              <SummaryPanel
                deal={deal}
                onSave={saveQuote}
                onPdf={() => downloadQuotePdf({ clientName, clientPhone, vehicle, stockRef }, lender, deal)}
                smsHref={smsHref}
                mailHref={mailHref}
              />
              <LenderCard lenderKey={lenderKey} lenderFees={lenderFees} onLenderChange={setLenderKey} onFeeChange={handleFeeChange} />
            </div>

            <div className="flex flex-col gap-5 lg:order-2">
              <ClientProfileCard clientName={clientName} clientPhone={clientPhone} vehicle={vehicle} stockRef={stockRef} onChange={handleClientChange} />
              <PurchaseDetailsCard
                purchasePrice={purchasePrice}
                deposit={deposit}
                tradeAllowance={tradeAllowance}
                existingPayout={existingPayout}
                deal={deal}
                onChange={handlePurchaseChange}
              />
              <RepaymentStructureCard
                interestRate={interestRate}
                loanTermMonths={loanTermMonths}
                balloonAmount={balloonAmount}
                deal={deal}
                onChange={handleRepaymentChange}
                showRate={showRate}
                onToggleRate={() => setShowRate((v) => !v)}
              />
            </div>

            <div className="flex flex-col gap-5 lg:order-3">
              <TargetRepaymentCard
                targetMonthly={targetMonthly}
                onTargetChange={setTargetMonthly}
                preference={targetPreference}
                onPreferenceChange={setTargetPreference}
                locks={targetLocks}
                onToggleLock={toggleTargetLock}
                scenarios={scenarios}
                onApplyPreferred={applyPreferredTarget}
                notPossible={notPossible}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
