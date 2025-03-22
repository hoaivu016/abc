import supabase from '../lib/database/supabase';
import { Capital } from '../models/capital';
import { CapitalShareholder } from '../models/capitalShareholder';

export const getCapitalShareholders = async (): Promise<CapitalShareholder[]> => {
  const { data, error } = await supabase
    .from('capital_shareholders')
    .select('*');
  
  if (error) {
    console.error('Error fetching capital shareholders:', error);
    return [];
  }
  
  return data as CapitalShareholder[];
}; 