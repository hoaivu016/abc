const { createClient } = require('@supabase/supabase-js');

// Khởi tạo Supabase client
const supabase = createClient(
  'https://qqxvaaabmnkmlvqehtoz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeHZhYWFibW5rbWx2cWVodG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTc2MzMsImV4cCI6MjA1NjQ5MzYzM30.cjr6vKBG6mwkgh51CKCv3hUHYp13PXIuEAegKMcm254'
);

async function createAdminUser() {
  try {
    // Tạo tài khoản admin trong Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'hoaivu016@gmail.com', // Thay bằng email thật của bạn
      password: 'Admin@123456',      // Mật khẩu mạnh hơn
      options: {
        data: {
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error('Lỗi khi tạo tài khoản admin:', authError.message);
      return;
    }

    console.log('Đã tạo tài khoản admin thành công!');
    console.log('Email:', authData.user.email);
    console.log('ID:', authData.user.id);

    // Thêm user vào bảng users với role admin
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: 'hoaivu016@gmail.com',
          role: 'admin'
        }
      ]);

    if (insertError) {
      console.error('Lỗi khi thêm user vào bảng users:', insertError.message);
      return;
    }

    console.log('Đã thêm user vào bảng users thành công!');

  } catch (error) {
    console.error('Lỗi:', error.message);
  }
}

createAdminUser(); 