import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { transactions } from '../../db/schema.js';
import { NotFoundError } from '../../utils/errors.js';
import type { CreateTransactionInput } from './finance.schema.js';

export interface FinanceFilterOptions {
  timeframe?: 'daily' | 'monthly' | 'yearly' | 'all';
  date?: string; // YYYY-MM-DD
  month?: string; // YYYY-MM
  year?: string; // YYYY
}

export async function getFinanceOverviewService(userId: number, filters?: FinanceFilterOptions) {
  const timeframe = filters?.timeframe || 'all';
  let conditions: any[] = [eq(transactions.userId, userId)];
  let startDate: string | undefined;
  let endDate: string | undefined;

  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = now.toISOString().slice(0, 10);

  if (timeframe === 'daily') {
    const targetDate = filters?.date || todayStr;
    startDate = targetDate;
    endDate = targetDate;
    conditions.push(eq(transactions.date, targetDate));
  } else if (timeframe === 'monthly') {
    const targetMonth = filters?.month || (filters?.date ? filters.date.slice(0, 7) : currentMonth);
    const [yStr, mStr] = targetMonth.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const lastDay = new Date(y, m, 0).getDate(); // Last day of month (28, 29, 30, 31)

    startDate = `${targetMonth}-01`;
    endDate = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;
    conditions.push(and(gte(transactions.date, startDate), lte(transactions.date, endDate)));
  } else if (timeframe === 'yearly') {
    const targetYear = filters?.year || (filters?.date ? filters.date.slice(0, 4) : currentYear);
    startDate = `${targetYear}-01-01`;
    endDate = `${targetYear}-12-31`;
    conditions.push(and(gte(transactions.date, startDate), lte(transactions.date, endDate)));
  }

  const txs = await db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of txs) {
    const amt = parseFloat(t.amount);
    if (t.type === 'income') {
      totalIncome += amt;
    } else {
      totalExpense += amt;
    }
  }

  const balance = totalIncome - totalExpense;

  return {
    timeframe,
    startDate,
    endDate,
    balance: Math.round(balance * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    transactions: txs,
  };
}

export async function createTransactionService(userId: number, input: CreateTransactionInput) {
  const [created] = await db
    .insert(transactions)
    .values({
      userId,
      title: input.title,
      amount: input.amount.toString(),
      type: input.type,
      category: input.category,
      paymentMethod: input.paymentMethod,
      date: input.date,
      time: input.time,
    })
    .returning();

  return created;
}

export async function deleteTransactionService(userId: number, transactionId: number) {
  const [deleted] = await db
    .delete(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
    .returning();

  if (!deleted) {
    throw new NotFoundError('Transaction not found.');
  }

  return { message: 'Transaction deleted successfully.' };
}