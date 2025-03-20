// ... existing code ...
  const handleCreateUser = async (values: FormValues) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Kiểm tra email đã tồn tại chưa
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', values.email)
        .single();

      if (existingUser) {
        throw new Error('Email đã được sử dụng');
      }

      // 2. Đăng ký tài khoản với Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            role: values.role
          }
        }
      });

      if (authError) {
        console.error('Lỗi đăng ký:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Không thể tạo tài khoản');
      }

      // 3. Đợi một chút để trigger xử lý xong
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Kiểm tra xem user đã được tạo trong bảng users chưa
      const { data: newUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (checkError) {
        console.error('Lỗi kiểm tra user:', checkError);
        throw new Error(checkError.message);
      }

      // 5. Nếu role khác với role mặc định, cập nhật role
      if (newUser && newUser.role !== values.role) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: values.role })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Lỗi cập nhật role:', updateError);
          throw new Error(updateError.message);
        }
      }

      // 6. Cập nhật danh sách người dùng
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Lỗi lấy danh sách người dùng:', fetchError);
        throw new Error(fetchError.message);
      }

      setUsers(users || []);
      setSnackbar({
        open: true,
        message: 'Tạo tài khoản thành công',
        severity: 'success'
      });
      formik.resetForm();
    } catch (error: any) {
      console.error('Lỗi khi tạo tài khoản:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo tài khoản');
      setSnackbar({
        open: true,
        message: error.message || 'Có lỗi xảy ra khi tạo tài khoản',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
// ... existing code ...