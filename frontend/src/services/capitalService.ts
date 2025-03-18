import { supabase } from '../utils/supabase';
import { Capital, CapitalInput } from '../models/capital';

const TABLE_NAME = 'capitals';

export const capitalService = {
  async getAll(): Promise<Capital[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<Capital | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .is('end_date', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(input: CapitalInput): Promise<Capital> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        capital_amount: input.capital_amount,
        loan_amount: input.loan_amount,
        interest_rate: input.interest_rate,
        start_date: input.start_date,
        end_date: input.end_date || null,
        note: input.note || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, input: Partial<CapitalInput>): Promise<Capital> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        capital_amount: input.capital_amount,
        loan_amount: input.loan_amount,
        interest_rate: input.interest_rate,
        start_date: input.start_date,
        end_date: input.end_date,
        note: input.note
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 