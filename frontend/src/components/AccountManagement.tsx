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

      // 3. Sử dụng polling thay vì setTimeout
      let retries = 0;
      const maxRetries = 5;
      
      while (retries < maxRetries) {
        const { data: newUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (newUser) {
          // User đã được tạo thành công
          if (newUser.role !== values.role) {
            const { error: updateError } = await supabase
              .from('users')
              .update({ role: values.role })
              .eq('id', authData.user.id);

            if (updateError) {
              console.error('Lỗi cập nhật role:', updateError);
              throw new Error(updateError.message);
            }
          }
          break;
        }
        
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (retries === maxRetries) {
        throw new Error('Không thể xác nhận tạo tài khoản');
      }

      // Refresh danh sách users
      await fetchUsers();
      
      // Đóng form và hiển thị thông báo thành công
      formik.resetForm();
      setSnackbar({
        open: true,
        message: 'Tạo tài khoản thành công',
        severity: 'success'
      });
    } catch (error) {
      console.error('Lỗi tạo tài khoản:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };
// ... existing code ...