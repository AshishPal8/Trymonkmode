import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { TransactionItem } from "@/lib/types";
import { financeApi } from "@/lib/api";
import { soundFX } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useUserStore } from "./userStore";

export interface FinanceStoreState {
  transactions: TransactionItem[];
  setTransactions: (transactions: TransactionItem[]) => void;
  addTransaction: (tx: Omit<TransactionItem, "id">) => void;
  deleteTransaction: (id: string) => void;
}

export const useFinanceStore = create<FinanceStoreState>()(
  persist(
    (set) => ({
      transactions: [],

      setTransactions: (transactions: TransactionItem[]) =>
        set({ transactions }),

      addTransaction: (tx) => {
        const newTx: TransactionItem = { ...tx, id: `tx-${Date.now()}` };
        set((state) => ({ transactions: [newTx, ...state.transactions] }));
        soundFX.playCheckSound();
        useUserStore.getState().addXP(15);
        toast.success("Transaction logged in finance! +15 XP");

        financeApi
          .createTransaction({
            title: tx.title,
            amount: tx.amount,
            type: tx.type,
            category: tx.category,
            paymentMethod: tx.paymentMethod,
            date: tx.date,
            time: tx.time,
          })
          .catch(() => {});
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        toast.info("Transaction deleted");
        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          financeApi.deleteTransaction(numId).catch(() => {});
        }
      },
    }),
    {
      name: "trymonk_finance_store",
      storage: createEncryptedStorage(),
    },
  ),
);
