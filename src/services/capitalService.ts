import supabase from '../lib/database/supabase';
import { Capital } from '../models/capital';

export const getCapitalData = async (): Promise<Capital[]> => {
  const { data, error } = await supabase
    .from('capital')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching capital data:', error);
    return [];
  }
  
  return data as Capital[];
}; 