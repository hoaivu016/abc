import { supabase } from '../utils/supabase';
import { CapitalShareholder, CapitalShareholderInput } from '../models/capitalShareholder';

const TABLE_NAME = 'capital_shareholders';

export const capitalShareholderService = {
  async getAllByCapitalId(capitalId: string): Promise<CapitalShareholder[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('capital_id', capitalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(input: CapitalShareholderInput): Promise<CapitalShareholder> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, input: Partial<CapitalShareholderInput>): Promise<CapitalShareholder> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(input)
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