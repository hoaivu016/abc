export interface CapitalShareholder {
  id: string;
  capital_id: string;
  shareholder_name: string;
  investment_amount: number;
  share_percentage: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CapitalShareholderInput {
  capital_id: string;
  shareholder_name: string;
  investment_amount: number;
  share_percentage: number;
  note?: string | null;
}
