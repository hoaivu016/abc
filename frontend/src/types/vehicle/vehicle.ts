import { Staff } from '../staff/staff';

export interface Vehicle {
  id: string;
  name: string;
  status: string;
  purchasePrice?: number;
  sellPrice?: number;
  saleStaff?: {
    id: string;
    name: string;
  };
} 