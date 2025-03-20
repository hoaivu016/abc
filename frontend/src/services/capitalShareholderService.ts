import { supabase } from '../lib/supabase';
import { CapitalShareholder, CapitalShareholderInput } from '../models/capitalShareholder';

export const capitalShareholderService = {
  async getShareholdersByCapitalId(capitalId: string): Promise<CapitalShareholder[]> {
    try {
      const { data, error } = await supabase
        .from('capital_shareholders')
        .select('*')
        .eq('capital_id', capitalId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting shareholders:', error);
      throw error;
    }
  },

  async createShareholder(shareholder: CapitalShareholderInput): Promise<CapitalShareholder> {
    try {
      const { data, error } = await supabase
        .from('capital_shareholders')
        .insert(shareholder)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating shareholder:', error);
      throw error;
    }
  },

  async updateShareholder(id: string, shareholder: Partial<CapitalShareholderInput>): Promise<CapitalShareholder> {
    try {
      const { data, error } = await supabase
        .from('capital_shareholders')
        .update(shareholder)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating shareholder:', error);
      throw error;
    }
  },

  async deleteShareholder(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('capital_shareholders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting shareholder:', error);
      throw error;
    }
  }
}; 