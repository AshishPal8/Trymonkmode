"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/lib/store";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Utensils,
  Car,
  Home,
  Tv,
  ShoppingBag,
  HeartPulse,
  Briefcase,
  Trash2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  formatCurrency,
  formatDatePretty,
  getTodayDateString,
} from "@/lib/utils";
import { TransactionItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ModuleContainer } from "@/components/layout/ModuleContainer";
import { CustomSelect } from "@/components/ui/select";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

type TimeframeMode = "daily" | "monthly" | "yearly" | "all";

export function FinanceView() {
  const { transactions, addTransaction, deleteTransaction } = useApp();

  const todayStr = getTodayDateString();
  const [timeframe, setTimeframe] = useState<TimeframeMode>("monthly");

  // Selected date pointers
  const [selectedDate, setSelectedDate] = useState<string>(todayStr); // YYYY-MM-DD for daily
  const [selectedMonth, setSelectedMonth] = useState<string>(
    todayStr.slice(0, 7),
  ); // YYYY-MM for monthly
  const [selectedYear, setSelectedYear] = useState<number>(
    parseInt(todayStr.slice(0, 4), 10),
  ); // YYYY for yearly

  const [activeTab, setActiveTab] = useState<"all" | "expense" | "income">(
    "all",
  );
  const [showAddModal, setShowAddModal] = useState(false);

  // New Transaction Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState<TransactionItem["category"]>("Food");
  const [paymentMethod, setPaymentMethod] =
    useState<TransactionItem["paymentMethod"]>("Apple Pay");
  const [txDate, setTxDate] = useState(getTodayDateString());

  // Date Navigation Handlers
  const handlePrevDate = () => {
    if (timeframe === "daily") {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      setSelectedDate(d.toISOString().slice(0, 10));
    } else if (timeframe === "monthly") {
      const [y, m] = selectedMonth.split("-").map(Number);
      const prev = new Date(y, m - 2, 1);
      setSelectedMonth(
        `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`,
      );
    } else if (timeframe === "yearly") {
      setSelectedYear((prev) => prev - 1);
    }
  };

  const handleNextDate = () => {
    if (timeframe === "daily") {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      setSelectedDate(d.toISOString().slice(0, 10));
    } else if (timeframe === "monthly") {
      const [y, m] = selectedMonth.split("-").map(Number);
      const next = new Date(y, m, 1);
      setSelectedMonth(
        `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`,
      );
    } else if (timeframe === "yearly") {
      setSelectedYear((prev) => prev + 1);
    }
  };

  // Month Display Name Helper (e.g., "August 2026")
  const getMonthDisplayName = (ym: string) => {
    const [y, m] = ym.split("-").map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Filtered Transactions according to Timeframe & Category Tab
  const timeframeTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (timeframe === "daily") {
        return t.date === selectedDate;
      } else if (timeframe === "monthly") {
        return t.date.startsWith(selectedMonth);
      } else if (timeframe === "yearly") {
        return t.date.startsWith(String(selectedYear));
      }
      return true; // 'all'
    });
  }, [transactions, timeframe, selectedDate, selectedMonth, selectedYear]);

  // Tab Filtering (Expense vs Income)
  const displayTransactions = useMemo(() => {
    return timeframeTransactions.filter((t) => {
      if (activeTab !== "all" && t.type !== activeTab) return false;
      return true;
    });
  }, [timeframeTransactions, activeTab]);

  // Dynamic Calculations for Current Timeframe
  const timeframeIncome = useMemo(() => {
    return timeframeTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [timeframeTransactions]);

  const timeframeExpense = useMemo(() => {
    return timeframeTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [timeframeTransactions]);

  const timeframeBalance = timeframeIncome - timeframeExpense;

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    addTransaction({
      title: title.trim(),
      amount: parseFloat(amount) || 0,
      type,
      category,
      paymentMethod,
      date: txDate,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    setTitle("");
    setAmount("");
    setTxDate(getTodayDateString());
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: TransactionItem["category"]) => {
    switch (cat) {
      case "Salary":
        return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case "Food":
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case "Transport":
        return <Car className="w-4 h-4 text-blue-500" />;
      case "Tech & Subscriptions":
        return <Tv className="w-4 h-4 text-purple-500" />;
      case "Rent":
        return <Home className="w-4 h-4 text-sky-500" />;
      case "Health":
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case "Shopping":
      default:
        return <ShoppingBag className="w-4 h-4 text-pink-500" />;
    }
  };

  return (
    <ModuleContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Finance & Cashflow
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Apple Wallet style cashflow ledger with daily, monthly, and yearly
            timeframes
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-4 py-2 shadow-sm transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Transaction</span>
        </Button>
      </div>

      {/* 1. Timeframe Switcher & Date Stepper Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl ios-card border border-border">
        {/* Timeframe Tabs */}
        <div className="flex p-1 rounded-xl bg-muted border border-border/80">
          {(["daily", "monthly", "yearly", "all"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                timeframe === tf
                  ? "bg-[#0052FF] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf === "all" ? "All Time" : tf}
            </button>
          ))}
        </div>

        {/* Date Stepper Controls */}
        {timeframe !== "all" && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDate}
              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 text-xs font-bold font-mono text-card-foreground border border-border">
              <Calendar className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>
                {timeframe === "daily"
                  ? formatDatePretty(selectedDate)
                  : timeframe === "monthly"
                    ? getMonthDisplayName(selectedMonth)
                    : `Year ${selectedYear}`}
              </span>
            </div>

            <button
              onClick={handleNextDate}
              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Overview Balance Card */}
      <div className="ios-card rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {timeframe === "daily"
                ? "Daily Net Cashflow"
                : timeframe === "monthly"
                  ? `${getMonthDisplayName(selectedMonth)} Net Balance`
                  : timeframe === "yearly"
                    ? `${selectedYear} Annual Net Balance`
                    : "Total Lifetime Balance"}
            </span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-card-foreground mt-1">
              {formatCurrency(timeframeBalance)}
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#0052FF]/10 text-[#0052FF] font-mono">
            {timeframeTransactions.length}{" "}
            {timeframeTransactions.length === 1
              ? "Transaction"
              : "Transactions"}
          </span>
        </div>

        {/* Twin Pills: Spending & Income */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl cat-inbox flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF5C39] text-white">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase opacity-80">
                {timeframe === "daily"
                  ? "Day Spending"
                  : timeframe === "monthly"
                    ? "Month Spending"
                    : "Spending"}
              </span>
              <p className="text-sm sm:text-base font-bold font-mono">
                {formatCurrency(timeframeExpense)}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl cat-done flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#22C55E] text-white">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase opacity-80">
                {timeframe === "daily"
                  ? "Day Income"
                  : timeframe === "monthly"
                    ? "Month Income"
                    : "Income"}
              </span>
              <p className="text-sm sm:text-base font-bold font-mono">
                {formatCurrency(timeframeIncome)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filterable Transactions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            Transactions ({displayTransactions.length})
          </h3>
          <div className="flex p-1 ios-card rounded-2xl bg-card border border-border">
            {(["all", "expense", "income"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#0052FF] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {displayTransactions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl ios-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto shadow-sm">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                No Transactions for this Period
              </h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No recorded income or expenses in this timeframe. Click below to
                add a transaction.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setTxDate(
                  timeframe === "daily" ? selectedDate : getTodayDateString(),
                );
                setShowAddModal(true);
              }}
              className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-4 py-2 shadow-sm cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {displayTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl ios-card transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted">
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-card-foreground">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatDatePretty(tx.date)}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs sm:text-sm font-bold font-mono ${
                      tx.type === "income"
                        ? "text-[#22C55E]"
                        : "text-card-foreground"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal with Date Picker */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Transaction"
        description="Track cashflow, server expenses, subscriptions, or revenue."
        icon={
          type === "expense" ? (
            <ArrowDownLeft className="w-4 h-4 text-[#FF5C39]" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-[#22C55E]" />
          )
        }
        topAccentColor={type === "expense" ? "#FF5C39" : "#22C55E"}
        maxWidth="md"
      >
        <form onSubmit={handleCreateTransaction} className="space-y-3.5 pt-1">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                type === "expense"
                  ? "bg-[#FF5C39] text-white shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                type === "income"
                  ? "bg-[#22C55E] text-white shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Income (+)
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Description / Merchant *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Server Hosting or Consulting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Amount ($) *
              </label>
              <Input
                type="number"
                step="0.01"
                required
                placeholder="50.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Date
              </label>
              <CustomDatePicker value={txDate} onChange={setTxDate} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Category
              </label>
              <CustomSelect
                value={category}
                onChange={(val) =>
                  setCategory(val as TransactionItem["category"])
                }
                options={[
                  { value: "Salary", label: "Salary" },
                  { value: "Food", label: "Food" },
                  { value: "Transport", label: "Transport" },
                  {
                    value: "Tech & Subscriptions",
                    label: "Tech & Subscriptions",
                  },
                  { value: "Shopping", label: "Shopping" },
                  { value: "Health", label: "Health" },
                  { value: "Rent", label: "Rent" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Payment Method
              </label>
              <CustomSelect
                value={paymentMethod}
                onChange={(val) =>
                  setPaymentMethod(val as TransactionItem["paymentMethod"])
                }
                options={[
                  { value: "Apple Pay", label: "Apple Pay" },
                  { value: "Credit Card", label: "Credit Card" },
                  { value: "PayPal", label: "PayPal" },
                  { value: "Bank Transfer", label: "Bank Transfer" },
                  { value: "Cash", label: "Cash" },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-5 py-2 shadow-sm cursor-pointer"
            >
              Save Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </ModuleContainer>
  );
}
