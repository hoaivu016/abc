import { KpiTarget, KpiTargetType } from '../types/staff/kpi';
import { supabase } from '../lib/supabase';

export class KpiService {
  static calculateCompletion(target: number, actual: number): number {
    if (target === 0) return 0;
    return (actual / target) * 100;
  }

  static calculateBonus(kpi: KpiTarget): number {
    return (kpi.actualValue || 0) * (kpi.bonusAmount || 0);
  }

  static generateDefaultKpi(staffId: string, type: KpiTargetType): KpiTarget {
    return {
      id: `kpi_${staffId}_${Date.now()}`,
      staffId,
      type,
      targetValue: 0,
      actualValue: 0,
      bonusAmount: 0,
      isActive: true,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    };
  }

  static generateDefaultKpis(staffIds: string[]): KpiTarget[] {
    return staffIds.map(staffId => this.generateDefaultKpi(staffId, KpiTargetType.SALES));
  }

  static async syncWithSupabase(kpi: KpiTarget): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('kpi_targets')
        .upsert({
          id: kpi.id,
          type: kpi.type,
          target_value: kpi.targetValue,
          actual_value: kpi.actualValue,
          bonus_amount: kpi.bonusAmount,
          staff_id: kpi.staffId,
          department_id: kpi.departmentId,
          month: kpi.month,
          year: kpi.year,
          team: kpi.team,
          completion_percentage: kpi.completionPercentage,
          created_at: kpi.createdAt,
          updated_at: new Date()
        });

      return !error;
    } catch (error) {
      console.error('Lỗi khi đồng bộ KPI:', error);
      return false;
    }
  }

  static async loadFromSupabase(): Promise<KpiTarget[]> {
    try {
      const { data, error } = await supabase
        .from('kpi_targets')
        .select('*');
        
      if (error) throw error;
      
      return data?.map(kpi => ({
        id: kpi.id,
        type: kpi.type,
        targetValue: kpi.target_value,
        actualValue: kpi.actual_value,
        bonusAmount: kpi.bonus_amount,
        staffId: kpi.staff_id,
        departmentId: kpi.department_id,
        month: kpi.month,
        year: kpi.year,
        team: kpi.team,
        completionPercentage: kpi.completion_percentage,
        createdAt: kpi.created_at,
        updatedAt: kpi.updated_at
      })) || [];
    } catch (error) {
      console.error('Lỗi khi tải KPI từ Supabase:', error);
      return [];
    }
  }

  static async bulkSync(kpis: KpiTarget[]): Promise<boolean> {
    try {
      const dataToSync = kpis.map(kpi => ({
        id: kpi.id,
        type: kpi.type,
        target_value: kpi.targetValue,
        actual_value: kpi.actualValue,
        bonus_amount: kpi.bonusAmount,
        staff_id: kpi.staffId,
        department_id: kpi.departmentId,
        month: kpi.month,
        year: kpi.year,
        team: kpi.team,
        completion_percentage: kpi.completionPercentage,
        created_at: kpi.createdAt,
        updated_at: new Date()
      }));

      const { error } = await supabase
        .from('kpi_targets')
        .upsert(dataToSync);

      return !error;
    } catch (error) {
      console.error('Lỗi khi đồng bộ hàng loạt KPI:', error);
      return false;
    }
  }
} 