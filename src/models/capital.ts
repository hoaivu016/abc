export interface Capital {
  id: string;
  shareholder_name: string;
  capital_amount: number;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CapitalInput {
  shareholder_name: string;
  capital_amount: number;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  end_date?: string | null;
  note?: string | null;
} 