import { supabase } from './supabase';
import { Vehicle, VehicleStatus } from '../../types/vehicles/vehicle';
import { Staff } from '../../models/staff';
import { KpiTarget, SupportDepartmentBonus } from '../../models/kpi';

// Định nghĩa loại hành động đồng bộ
export type SyncAction = 
  | { type: 'vehicle_add', data: Vehicle }
  | { type: 'vehicle_update', data: Vehicle }
  | { type: 'vehicle_delete', data: { id: string } }
  | { type: 'staff_add', data: Staff }
  | { type: 'staff_update', data: Staff }
  | { type: 'staff_delete', data: { id: string } }
  | { type: 'kpi_update', data: KpiTarget[] }
  | { type: 'bonus_update', data: SupportDepartmentBonus[] };

// Hàm lưu trữ các action đang chờ khi offline
export const savePendingSync = (action: SyncAction) => {
  const pendingActions = getPendingSync();
  pendingActions.push({
    ...action,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('pendingSync', JSON.stringify(pendingActions));
};

// Hàm lấy danh sách các action đang chờ
export const getPendingSync = (): (SyncAction & { timestamp: string })[] => {
  const pendingActions = localStorage.getItem('pendingSync');
  return pendingActions ? JSON.parse(pendingActions) : [];
};

// Hàm merge dữ liệu từ server với dữ liệu local
export const mergeData = <T extends { id: string }>(localData: T[], serverData: T[]): T[] => {
  // Tạo một map để truy cập nhanh các item theo ID
  const localMap = new Map<string, T>();
  localData.forEach(item => localMap.set(item.id, item));
  
  // Duyệt qua dữ liệu server và merge với dữ liệu local
  const mergedData: T[] = [];
  const processedIds = new Set<string>();
  
  // Xử lý dữ liệu từ server trước
  serverData.forEach(serverItem => {
    const localItem = localMap.get(serverItem.id);
    
    if (localItem) {
      // Nếu item tồn tại ở cả local và server, giữ lại item local vì có thể đã được chỉnh sửa
      mergedData.push(localItem);
    } else {
      // Nếu item chỉ tồn tại ở server, thêm vào kết quả
      mergedData.push(serverItem);
    }
    
    processedIds.add(serverItem.id);
  });
  
  // Thêm các item chỉ tồn tại ở local (item mới chưa được đồng bộ)
  localData.forEach(localItem => {
    if (!processedIds.has(localItem.id)) {
      mergedData.push(localItem);
    }
  });
  
  return mergedData;
};

// Hàm xử lý đồng bộ hóa data khi có kết nối
export const syncPendingActions = async (): Promise<boolean> => {
  try {
    const pendingUploads = getPendingSync();
    
    if (pendingUploads.length === 0) {
      return true;
    }
    
    // Xử lý từng action một
    for (const item of pendingUploads) {
      try {
        switch (item.type) {
          case 'vehicle_add':
            // Tạo đối tượng xe phù hợp với cấu trúc bảng Supabase
            const vehicleData = {
              id: item.data.id,
              name: item.data.name,
              color: item.data.color,
              manufacturing_year: item.data.manufacturingYear,
              odo: item.data.odo,
              purchase_price: item.data.purchasePrice,
              sell_price: item.data.sellPrice,
              import_date: item.data.importDate instanceof Date 
                ? item.data.importDate.toISOString() 
                : item.data.importDate,
              export_date: item.data.exportDate instanceof Date 
                ? item.data.exportDate?.toISOString() 
                : item.data.exportDate,
              status: item.data.status,
              cost: item.data.cost,
              debt: item.data.debt,
              profit: item.data.profit,
              storage_time: item.data.storageTime,
              created_at: item.data.created_at,
              updated_at: item.data.updated_at
            };
            
            // Thêm xe vào bảng vehicles
            await supabase.from('vehicles').insert([vehicleData]);
            
            // Thêm chi phí nếu có
            if (item.data.costs && item.data.costs.length > 0) {
              for (const cost of item.data.costs) {
                const costData = {
                  vehicle_id: item.data.id,
                  amount: cost.amount,
                  cost_date: cost.costDate instanceof Date 
                    ? cost.costDate.toISOString() 
                    : cost.costDate,
                  description: cost.description,
                  created_at: cost.created_at || new Date().toISOString(),
                  updated_at: cost.updated_at || new Date().toISOString(),
                  id: cost.id
                };
                
                await supabase.from('vehicle_costs').insert([costData]);
              }
            }
            
            // Thêm thanh toán nếu có
            if (item.data.payments && item.data.payments.length > 0) {
              for (const payment of item.data.payments) {
                const paymentData = {
                  id: payment.id || `PAYMENT_${Date.now()}`,
                  vehicle_id: item.data.id,
                  amount: payment.amount,
                  payment_date: payment.date instanceof Date 
                    ? payment.date.toISOString() 
                    : payment.date,
                  payment_type: payment.type,
                  notes: payment.notes,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                
                await supabase.from('vehicle_payments').insert([paymentData]);
              }
            }
            break;
          case 'vehicle_update':
            // Tương tự như thêm xe, tạo đối tượng phù hợp với cấu trúc bảng Supabase
            const updatedVehicleData = {
              id: item.data.id,
              name: item.data.name,
              color: item.data.color,
              manufacturing_year: item.data.manufacturingYear,
              odo: item.data.odo,
              purchase_price: item.data.purchasePrice,
              sell_price: item.data.sellPrice,
              import_date: item.data.importDate instanceof Date 
                ? item.data.importDate.toISOString() 
                : item.data.importDate,
              export_date: item.data.exportDate instanceof Date 
                ? item.data.exportDate?.toISOString() 
                : item.data.exportDate,
              status: item.data.status,
              cost: item.data.cost,
              debt: item.data.debt,
              profit: item.data.profit,
              storage_time: item.data.storageTime,
              updated_at: new Date().toISOString()
            };
            
            // Cập nhật xe
            await supabase.from('vehicles').update(updatedVehicleData).eq('id', item.data.id);
            break;
          case 'vehicle_delete':
            await supabase.from('vehicles').delete().eq('id', item.data.id);
            break;
          case 'staff_add':
            await supabase.from('staff').insert([item.data]);
            break;
          case 'staff_update':
            await supabase.from('staff').update(item.data).eq('id', item.data.id);
            break;
          case 'staff_delete':
            await handleStaffDelete(item);
            break;
          case 'kpi_update':
            // Xóa KPI cũ và chèn KPI mới với cùng tháng và năm
            if (item.data.length > 0) {
              const month = item.data[0].month;
              const year = item.data[0].year;
              await supabase.from('kpi_targets')
                .delete()
                .match({ month, year });
              await supabase.from('kpi_targets').insert(item.data);
            }
            break;
          case 'bonus_update':
            // Tương tự với bonus
            if (item.data.length > 0) {
              const bonusMonth = item.data[0].bonusMonth;
              await supabase.from('support_bonuses')
                .delete()
                .eq('bonus_month', bonusMonth);
              await supabase.from('support_bonuses').insert(item.data);
            }
            break;
        }
      } catch (error) {
        console.error(`Lỗi khi đồng bộ ${item.type}:`, error);
        // Nếu có lỗi, tiếp tục với action tiếp theo
        continue;
      }
    }
    
    // Xóa tất cả các action đã xử lý
    localStorage.removeItem('pendingSync');
    return true;
  } catch (error) {
    console.error('Lỗi khi đồng bộ dữ liệu:', error);
    return false;
  }
};

// Hàm tải dữ liệu từ Supabase
export const loadVehiclesFromSupabase = async (): Promise<Vehicle[]> => {
  try {
    console.log('Bắt đầu tải dữ liệu xe từ Supabase');
    
    // Lấy danh sách xe
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (vehiclesError) {
      console.error('Lỗi khi tải dữ liệu xe:', vehiclesError);
      throw vehiclesError;
    }

    // Lấy chi phí của xe
    const { data: costsData, error: costsError } = await supabase
      .from('vehicle_costs')
      .select('*');

    if (costsError) {
      console.error('Lỗi khi tải dữ liệu chi phí:', costsError);
    }

    // Lấy thanh toán của xe
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('vehicle_payments')
      .select('*');

    if (paymentsError) {
      console.error('Lỗi khi tải dữ liệu thanh toán:', paymentsError);
    }

    // Lấy dữ liệu nhân viên bán hàng
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*');

    if (staffError) {
      console.error('Lỗi khi tải dữ liệu nhân viên:', staffError);
    }

    // Tạo map để tìm nhân viên nhanh hơn
    const staffMap = {};
    if (staffData) {
      staffData.forEach(staff => {
        staffMap[staff.id] = staff;
      });
    }

    // Gộp dữ liệu và chuyển đổi từ định dạng Supabase sang định dạng ứng dụng
    const vehicles = vehiclesData?.map(vehicle => {
      // Chuyển đổi tên trường từ snake_case sang camelCase
      const importDate = new Date(vehicle.import_date);
      const exportDate = vehicle.export_date ? new Date(vehicle.export_date) : null;
      
      // Lọc chi phí và thanh toán theo xe
      const vehicleCosts = (costsData || [])
        .filter(cost => cost.vehicle_id === vehicle.id)
        .map(cost => ({
          vehicleId: cost.vehicle_id,
          amount: cost.amount,
          costDate: new Date(cost.cost_date),
          description: cost.description,
          created_at: cost.created_at,
          updated_at: cost.updated_at,
          id: cost.id
        }));
        
      // Chuyển đổi thanh toán từ DB format sang UI format (VehiclePayment -> PaymentInfo)
      const vehiclePayments = (paymentsData || [])
        .filter(payment => payment.vehicle_id === vehicle.id)
        .map(payment => ({
          id: payment.id,
          amount: payment.amount,
          date: new Date(payment.payment_date),
          type: payment.payment_type as 'DEPOSIT' | 'BANK_DEPOSIT' | 'OFFSET' | 'FULL_PAYMENT',
          notes: payment.notes,
          status: 'confirmed'
        }));
      
      // Tính toán lại công nợ dựa trên thanh toán
      let calculatedDebt = vehicle.sell_price || 0;
      if (vehiclePayments.length > 0) {
        const totalPayments = vehiclePayments.reduce((sum, payment) => sum + payment.amount, 0);
        calculatedDebt = (vehicle.sell_price || 0) - totalPayments;
      }
      
      // Tìm thông tin nhân viên bán hàng nếu có
      const saleStaffId = vehicle.sales_staff_id;
      const saleStaff = saleStaffId && staffMap[saleStaffId] 
        ? {
            id: saleStaffId,
            name: staffMap[saleStaffId].name || '',
            team: staffMap[saleStaffId].team || '',
            expectedCommission: vehicle.sell_price ? (vehicle.sell_price * (staffMap[saleStaffId].commission_rate || 0)) / 100 : 0
          }
        : {
            id: '',
            name: '',
            team: '',
            expectedCommission: 0
          };
      
      // Ghi log về thông tin nhân viên nếu có
      if (saleStaffId) {
        console.log(`Xe ${vehicle.id} có nhân viên bán ID: ${saleStaffId}, Tên: ${saleStaff.name}`);
      }
      
      // Tạo đối tượng Vehicle với định dạng chuẩn của ứng dụng
      return {
        id: vehicle.id,
        name: vehicle.name,
        color: vehicle.color,
        manufacturingYear: vehicle.manufacturing_year,
        odo: vehicle.odo,
        purchasePrice: vehicle.purchase_price,
        sellPrice: vehicle.sell_price,
        importDate,
        exportDate,
        notes: vehicle.notes || '',
        status: vehicle.status,
        cost: vehicle.cost,
        debt: vehicle.status === VehicleStatus.SOLD ? 0 : calculatedDebt,
        profit: vehicle.profit,
        storageTime: vehicle.storage_time,
        costs: vehicleCosts,
        payments: vehiclePayments,
        saleStaff: saleStaff,
        statusHistory: [{
          id: `STATUS_${Date.now()}`,
          fromStatus: vehicle.status,
          toStatus: vehicle.status,
          changedAt: new Date(),
          changedBy: 'System',
          notes: 'Đồng bộ từ Supabase'
        }],
        created_at: vehicle.created_at,
        updated_at: vehicle.updated_at
      } as Vehicle;
    }) || [];

    console.log('Dữ liệu từ server:', vehicles.length, 'xe');
    
    // Lấy dữ liệu local hiện tại
    const savedVehicles = localStorage.getItem('vehicles');
    const localVehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
    console.log('Dữ liệu local:', localVehicles.length, 'xe');
    
    // Merge dữ liệu
    const mergedData = mergeData<Vehicle>(localVehicles, vehicles);
    console.log('Dữ liệu sau khi merge:', mergedData.length, 'xe');
    
    // Lưu lại vào localStorage
    localStorage.setItem('vehicles', JSON.stringify(mergedData));
    
    return mergedData;
  } catch (error) {
    console.error('Lỗi khi tải xe từ Supabase:', error);
    const savedVehicles = localStorage.getItem('vehicles');
    return savedVehicles ? JSON.parse(savedVehicles) : [];
  }
};

export const loadStaffFromSupabase = async (): Promise<Staff[]> => {
  try {
    // Lấy danh sách nhân viên
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*');

    if (staffError) throw staffError;

    // Lấy KPI targets
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpi_targets')
      .select('*');

    if (kpiError) {
      console.error('Lỗi khi tải dữ liệu KPI:', kpiError);
    }

    // Gộp dữ liệu và chuyển đổi từ snake_case sang camelCase
    const staff = staffData?.map(member => ({
      id: member.id,
      name: member.name,
      phone: member.phone,
      email: member.email,
      team: member.team,
      role: member.role,
      status: member.status,
      joinDate: new Date(member.join_date),
      leaveDate: member.leave_date ? new Date(member.leave_date) : null,
      commissionRate: member.commission_rate,
      baseSalary: member.base_salary,
      created_at: member.created_at,
      updated_at: member.updated_at,
      kpiTargets: kpiData?.filter(kpi => kpi.staff_id === member.id) || []
    })) || [];
    
    // Lấy dữ liệu local hiện tại
    const savedStaff = localStorage.getItem('staffList');
    const localStaff = savedStaff ? JSON.parse(savedStaff) : [];
    
    // Merge dữ liệu
    return mergeData(localStaff, staff);
  } catch (error) {
    console.error('Lỗi khi tải nhân viên từ Supabase:', error);
    const savedStaff = localStorage.getItem('staffList');
    return savedStaff ? JSON.parse(savedStaff) : [];
  }
};

export const loadKpiFromSupabase = async (): Promise<KpiTarget[]> => {
  try {
    const { data, error } = await supabase
      .from('kpi_targets')
      .select('*');
      
    if (error) throw error;
    
    // Chuyển đổi từ snake_case sang camelCase
    const kpiTargets = data?.map(kpi => ({
      id: kpi.id,
      staffId: kpi.staff_id,
      targetMonth: kpi.target_month ? new Date(kpi.target_month) : null,
      salesTarget: kpi.sales_target,
      profitTarget: kpi.profit_target,
      actualSales: kpi.actual_sales,
      actualProfit: kpi.actual_profit,
      achievementRate: kpi.achievement_rate,
      created_at: kpi.created_at,
      updated_at: kpi.updated_at
    })) || [];
    
    const savedKpis = localStorage.getItem('kpis');
    const localKpis = savedKpis ? JSON.parse(savedKpis) : [];
    
    return mergeData(localKpis, kpiTargets);
  } catch (error) {
    console.error('Lỗi khi tải KPI từ Supabase:', error);
    const savedKpis = localStorage.getItem('kpis');
    return savedKpis ? JSON.parse(savedKpis) : [];
  }
};

export const loadSupportBonusFromSupabase = async (): Promise<SupportDepartmentBonus[]> => {
  try {
    const { data, error } = await supabase
      .from('support_bonuses')
      .select('*');
      
    if (error) throw error;
    
    // Chuyển đổi từ snake_case sang camelCase
    const bonuses = data?.map(bonus => ({
      department: bonus.department,
      bonusMonth: bonus.bonus_month ? new Date(bonus.bonus_month) : null,
      bonusAmount: bonus.bonus_amount,
      achievementRate: bonus.achievement_rate,
      notes: bonus.notes,
      created_at: bonus.created_at,
      updated_at: bonus.updated_at,
      id: bonus.id
    })) || [];
    
    const savedBonuses = localStorage.getItem('supportBonuses');
    const localBonuses = savedBonuses ? JSON.parse(savedBonuses) : [];
    
    return mergeData(localBonuses, bonuses);
  } catch (error) {
    console.error('Lỗi khi tải thưởng phòng hỗ trợ từ Supabase:', error);
    const savedBonuses = localStorage.getItem('supportBonuses');
    return savedBonuses ? JSON.parse(savedBonuses) : [];
  }
};

export const syncVehicleToSupabase = async (vehicle: Vehicle): Promise<boolean> => {
  if (!vehicle) {
    console.error('Không thể đồng bộ: xe không tồn tại');
    return false;
  }
  
  try {
    console.log(`===== BẮT ĐẦU ĐỒNG BỘ XE ${vehicle.id} (${vehicle.status}) =====`);
    
    // Mã hóa ID xe để tránh vấn đề với ký tự đặc biệt
    const encodedVehicleId = encodeURIComponent(vehicle.id);
    
    // Kiểm tra dữ liệu hiện tại trên Supabase
    const { data: existingVehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', encodedVehicleId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Lỗi khi kiểm tra xe:', fetchError);
      return false;
    }

    // Tính toán lại công nợ dựa trên thanh toán
    let calculatedDebt = vehicle.sellPrice || 0;
    if (vehicle.payments && vehicle.payments.length > 0) {
      const totalPayments = vehicle.payments.reduce((sum, payment) => sum + payment.amount, 0);
      calculatedDebt = (vehicle.sellPrice || 0) - totalPayments;
    }

    // Chuẩn bị dữ liệu xe
    const vehicleData = {
      id: encodedVehicleId, // Sử dụng ID đã mã hóa
      name: vehicle.name,
      color: vehicle.color,
      manufacturing_year: vehicle.manufacturingYear,
      odo: vehicle.odo,
      purchase_price: vehicle.purchasePrice,
      sell_price: vehicle.sellPrice,
      import_date: vehicle.importDate instanceof Date 
        ? vehicle.importDate.toISOString() 
        : vehicle.importDate,
      export_date: vehicle.exportDate instanceof Date 
        ? vehicle.exportDate?.toISOString() 
        : vehicle.exportDate,
      notes: vehicle.notes,
      status: vehicle.status,
      cost: vehicle.cost,
      debt: vehicle.status === VehicleStatus.SOLD ? 0 : calculatedDebt,
      profit: vehicle.profit,
      storage_time: vehicle.storageTime,
      sales_staff_id: vehicle.saleStaff?.id || null,
      created_at: existingVehicle?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Cập nhật hoặc thêm mới xe
    let { data: updatedVehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .upsert([vehicleData], {
        onConflict: 'id',
        ignoreDuplicates: false,
        returning: 'minimal'
      });

    // Xử lý lỗi
    if (vehicleError) {
      console.error('Lỗi khi cập nhật xe:', vehicleError);
      
      // Kiểm tra xem xe đã tồn tại chưa
      const { data: checkVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('id', encodedVehicleId);
        
      if (checkVehicle && checkVehicle.length > 0) {
        // Xe đã tồn tại, thử cập nhật
        console.log('Xe đã tồn tại, thử cập nhật...');
        const { error: updateError } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', encodedVehicleId);
          
        if (updateError) {
          console.error('Vẫn gặp lỗi khi cập nhật:', updateError);
          return false;
        }
      } else {
        // Xe chưa tồn tại, thử insert
        console.log('Xe chưa tồn tại, thử insert...');
        const { error: insertError } = await supabase
          .from('vehicles')
          .insert([vehicleData]);
          
        if (insertError) {
          console.error('Vẫn gặp lỗi khi insert:', insertError);
          return false;
        }
      }
    }

    // Đồng bộ chi phí
    if (vehicle.costs && vehicle.costs.length > 0) {
      // Xóa chi phí cũ
      await supabase
        .from('vehicle_costs')
        .delete()
        .eq('vehicle_id', encodedVehicleId);
        
      // Thêm chi phí mới
      for (const cost of vehicle.costs) {
        const costData = {
          id: cost.id,
          vehicle_id: encodedVehicleId,
          amount: cost.amount,
          cost_date: cost.costDate instanceof Date 
            ? cost.costDate.toISOString() 
            : cost.costDate,
          description: cost.description,
          created_at: cost.created_at || new Date().toISOString(),
          updated_at: cost.updated_at || new Date().toISOString()
        };
        
        const { error: costError } = await supabase
          .from('vehicle_costs')
          .insert([costData]);
          
        if (costError) {
          console.error('Lỗi khi thêm chi phí:', costError);
        }
      }
    }
    
    // Đồng bộ thanh toán
    if (vehicle.payments && vehicle.payments.length > 0) {
      // Xóa thanh toán cũ
      await supabase
        .from('vehicle_payments')
        .delete()
        .eq('vehicle_id', encodedVehicleId);
        
      // Thêm thanh toán mới
      for (const payment of vehicle.payments) {
        const paymentData = {
          id: payment.id,
          vehicle_id: encodedVehicleId,
          amount: payment.amount,
          payment_date: payment.date instanceof Date
            ? payment.date.toISOString()
            : payment.date,
          payment_type: payment.type,
          notes: payment.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: paymentError } = await supabase
          .from('vehicle_payments')
          .insert([paymentData]);
          
        if (paymentError) {
          console.error('Lỗi khi thêm thanh toán:', paymentError);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi đồng bộ xe:', error);
    return false;
  }
};

// Xử lý xóa nhân viên
export async function handleStaffDelete(item: SyncAction): Promise<boolean> {
  try {
    console.log('Xử lý xóa nhân viên:', item);
    
    if (item.type !== 'staff_delete' || !item.data || typeof item.data !== 'object' || !('id' in item.data)) {
      console.error('Dữ liệu nhân viên không hợp lệ:', item);
      throw new Error('Dữ liệu nhân viên không hợp lệ');
    }
    
    // Lấy ID của nhân viên cần xóa
    const staffId = item.data.id;
    
    // Thử xóa nhân viên từ Supabase
    const { error } = await supabase.from('staff').delete().eq('id', staffId);
    
    if (error) {
      console.error('Lỗi khi xóa nhân viên từ Supabase:', error);
      
      // Kiểm tra lỗi ràng buộc khóa ngoại
      if (error.code === '23503' || error.message?.includes('foreign key constraint')) {
        throw new Error(`Không thể xóa nhân viên vì có dữ liệu liên quan. Vui lòng xóa các dữ liệu liên quan trước.`);
      }
      
      // Kiểm tra lỗi quyền truy cập
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        throw new Error(`Không đủ quyền để xóa nhân viên. Vui lòng kiểm tra quyền truy cập của bạn.`);
      }
      
      throw error;
    }
    
    console.log('Đã xóa nhân viên thành công:', staffId);
    return true;
  } catch (error) {
    console.error('Lỗi xử lý xóa nhân viên:', error);
    // Nếu là lỗi ràng buộc khóa ngoại, đánh dấu là đã xử lý để không thử lại
    if ((error as Error).message?.includes('foreign key constraint')) {
      return true; // Đánh dấu là đã xử lý để không thử lại
    }
    throw error;
  }
}

// Thêm hàm kiểm tra kết nối mạng
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Hàm tự động đồng bộ
export const autoSync = async (action: SyncAction): Promise<boolean> => {
  try {
    // Kiểm tra kết nối mạng
    if (!isOnline()) {
      console.log('Đang offline - Lưu thao tác để đồng bộ sau');
      savePendingSync(action);
      return true;
    }

    console.log('Đang online - Thực hiện đồng bộ ngay');
    console.log('Action:', action);
    
    // Xử lý theo loại thao tác
    switch (action.type) {
      case 'vehicle_add':
      case 'vehicle_update':
        // Kiểm tra xem xe có tồn tại không
        const { data: existingVehicle } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', action.data.id)
          .single();
          
        // Chuẩn bị dữ liệu xe
        const vehicleData = {
          id: action.data.id,
          name: action.data.name,
          color: action.data.color,
          manufacturing_year: action.data.manufacturingYear,
          odo: action.data.odo,
          purchase_price: action.data.purchasePrice,
          sell_price: action.data.sellPrice,
          import_date: action.data.importDate instanceof Date 
            ? action.data.importDate.toISOString() 
            : action.data.importDate,
          export_date: action.data.exportDate instanceof Date 
            ? action.data.exportDate?.toISOString() 
            : action.data.exportDate,
          status: action.data.status,
          cost: action.data.cost,
          debt: action.data.debt,
          profit: action.data.profit,
          storage_time: action.data.storageTime,
          sales_staff_id: action.data.saleStaff?.id || null,
          notes: action.data.notes || '',
          created_at: existingVehicle?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Thực hiện upsert
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .upsert([vehicleData], {
            onConflict: 'id',
            ignoreDuplicates: false
          });

        if (vehicleError) {
          console.error('Lỗi khi cập nhật/thêm xe:', vehicleError);
          return false;
        }

        // Cập nhật chi phí
        if (action.data.costs?.length > 0) {
          // Xóa chi phí cũ
          await supabase
            .from('vehicle_costs')
            .delete()
            .eq('vehicle_id', action.data.id);

          // Thêm chi phí mới
          for (const cost of action.data.costs) {
            const costData = {
              id: cost.id,
              vehicle_id: action.data.id,
              amount: cost.amount,
              cost_date: cost.costDate instanceof Date 
                ? cost.costDate.toISOString() 
                : cost.costDate,
              description: cost.description,
              created_at: cost.created_at || new Date().toISOString(),
              updated_at: cost.updated_at || new Date().toISOString()
            };

            const { error: costError } = await supabase
              .from('vehicle_costs')
              .insert([costData]);

            if (costError) {
              console.error('Lỗi khi thêm chi phí:', costError);
            }
          }
        }

        // Cập nhật thanh toán
        if (action.data.payments?.length > 0) {
          // Xóa thanh toán cũ
          await supabase
            .from('vehicle_payments')
            .delete()
            .eq('vehicle_id', action.data.id);

          // Thêm thanh toán mới
          for (const payment of action.data.payments) {
            const paymentData = {
              id: payment.id,
              vehicle_id: action.data.id,
              amount: payment.amount,
              payment_date: payment.date instanceof Date
                ? payment.date.toISOString()
                : payment.date,
              payment_type: payment.type,
              notes: payment.notes,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const { error: paymentError } = await supabase
              .from('vehicle_payments')
              .insert([paymentData]);

            if (paymentError) {
              console.error('Lỗi khi thêm thanh toán:', paymentError);
            }
          }
        }

        return true;
        
      case 'vehicle_delete':
        const { error: deleteError } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', action.data.id);
        if (deleteError) {
          console.error('Lỗi khi xóa xe:', deleteError);
          return false;
        }
        return true;
        
      case 'staff_add':
      case 'staff_update':
        const staffData = {
          id: action.data.id,
          name: action.data.name,
          phone: action.data.phone,
          email: action.data.email,
          team: action.data.team,
          role: action.data.role,
          status: action.data.status,
          join_date: action.data.joinDate instanceof Date 
            ? action.data.joinDate.toISOString() 
            : action.data.joinDate,
          leave_date: action.data.leaveDate instanceof Date 
            ? action.data.leaveDate?.toISOString() 
            : action.data.leaveDate,
          commission_rate: action.data.commissionRate,
          base_salary: action.data.baseSalary,
          created_at: action.data.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: staffError } = await supabase
          .from('staff')
          .upsert([staffData], {
            onConflict: 'id',
            ignoreDuplicates: false
          });
          
        if (staffError) {
          console.error('Lỗi khi cập nhật nhân viên:', staffError);
          return false;
        }
        return true;
        
      case 'staff_delete':
        return await handleStaffDelete(action);
        
      case 'kpi_update':
        if (action.data.length > 0) {
          const month = action.data[0].month;
          const year = action.data[0].year;
          
          // Xóa KPI cũ
          await supabase
            .from('kpi_targets')
            .delete()
            .match({ month, year });
            
          // Thêm KPI mới
          const { error: kpiError } = await supabase
            .from('kpi_targets')
            .insert(action.data);
            
          if (kpiError) {
            console.error('Lỗi khi cập nhật KPI:', kpiError);
            return false;
          }
        }
        return true;
        
      case 'bonus_update':
        if (action.data.length > 0) {
          const bonusMonth = action.data[0].bonusMonth;
          
          // Xóa bonus cũ
          await supabase
            .from('support_bonuses')
            .delete()
            .eq('bonus_month', bonusMonth);
            
          // Thêm bonus mới
          const { error: bonusError } = await supabase
            .from('support_bonuses')
            .insert(action.data);
            
          if (bonusError) {
            console.error('Lỗi khi cập nhật bonus:', bonusError);
            return false;
          }
        }
        return true;
        
      default:
        console.error('Loại thao tác không hợp lệ:', action.type);
        return false;
    }
  } catch (error) {
    console.error('Lỗi khi tự động đồng bộ:', error);
    // Lưu thao tác để thử lại sau
    savePendingSync(action);
    return false;
  }
};

// Thêm event listener để kiểm tra kết nối mạng
window.addEventListener('online', async () => {
  console.log('Đã kết nối mạng - Bắt đầu đồng bộ dữ liệu pending');
  await syncPendingActions();
});

window.addEventListener('offline', () => {
  console.log('Mất kết nối mạng - Các thao tác sẽ được lưu để đồng bộ sau');
}); 