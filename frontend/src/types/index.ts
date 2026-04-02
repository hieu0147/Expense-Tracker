export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
  status?: 'PENDING' | 'ACTIVE' | 'BANNED';
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number | string;
  type: 'income' | 'expense';
  date: string;
  note?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  categories?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  // yyyy-MM (derived from start_date)
  month: string;
  period: 'MONTHLY' | 'YEARLY';
  start_date: string; // yyyy-MM-dd
  end_date: string; // yyyy-MM-dd
  amount_limit: number | string; // backend field: amount
  spent_amount?: number; // computed by backend GET /budgets
  warning_sent?: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: Category;
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'categories'>;
export type TransactionUpdate = Partial<TransactionInsert>;

export type BudgetInsert = Omit<
  Budget,
  'id'
  | 'created_at'
  | 'updated_at'
  | 'categories'
  | 'spent_amount'
  | 'warning_sent'
  | 'user_id'
  | 'month'
>;
export type BudgetUpdate = Partial<BudgetInsert>;
