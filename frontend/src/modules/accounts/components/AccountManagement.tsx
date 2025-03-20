import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Alert, 
  Snackbar 
} from '@mui/material';
import { supabase } from '../../../lib/database/supabase';

// Định nghĩa kiểu User
interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  created_at: string;
}

// Định nghĩa kiểu UserForm
interface UserForm {
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'staff';
}

const AccountManagement: React.FC = () => {
  // State quản lý danh sách người dùng
  const [users, setUsers] = useState<User[]>([]);
  
  // State cho form tạo tài khoản
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<UserForm>({
    email: '',
    password: '',
    role: 'staff'
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tải danh sách người dùng
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          setError('Bảng users chưa được tạo. Vui lòng chạy migration.');
        } else {
          setError(`Lỗi khi tải danh sách người dùng: ${error.message}`);
        }
        return;
      }

      setUsers(data || []);
    } catch (error) {
      setError('Lỗi không xác định khi tải danh sách người dùng');
      console.error('Lỗi:', error);
    }
  };

  // Xử lý tạo tài khoản mới
  const handleCreateUser = async () => {
    try {
      // Đăng ký người dùng
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            role: newUser.role
          }
        }
      });

      if (authError) {
        setError(`Lỗi khi tạo tài khoản: ${authError.message}`);
        return;
      }

      if (!authData.user) {
        setError('Không thể tạo tài khoản');
        return;
      }

      // Thêm thông tin người dùng vào bảng users
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: newUser.email,
          role: newUser.role
        }]);

      if (insertError) {
        setError(`Lỗi khi thêm thông tin người dùng: ${insertError.message}`);
        return;
      }

      // Làm mới danh sách người dùng
      await fetchUsers();

      // Đóng dialog và đặt lại form
      setIsCreateDialogOpen(false);
      setNewUser({
        email: '',
        password: '',
        role: 'staff'
      });
      setSuccess('Tạo tài khoản thành công');

    } catch (error) {
      setError('Lỗi không xác định khi tạo tài khoản');
      console.error('Lỗi:', error);
    }
  };

  // Xử lý xóa tài khoản
  const handleDeleteUser = async (userId: string) => {
    try {
      // Xóa người dùng từ bảng users
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        setError(`Lỗi khi xóa tài khoản: ${deleteError.message}`);
        return;
      }

      // Làm mới danh sách người dùng
      await fetchUsers();
      setSuccess('Xóa tài khoản thành công');
    } catch (error) {
      setError('Lỗi không xác định khi xóa tài khoản');
      console.error('Lỗi:', error);
    }
  };

  // Tải danh sách người dùng khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản Lý Tài Khoản
      </Typography>

      {/* Nút tạo tài khoản mới */}
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Tạo Tài Khoản Mới
        </Button>
      </Box>

      {/* Bảng danh sách người dùng */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Vai Trò</TableCell>
              <TableCell>Ngày Tạo</TableCell>
              <TableCell>Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button 
                    color="error" 
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog tạo tài khoản */}
      <Dialog 
        open={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)}
      >
        <DialogTitle>Tạo Tài Khoản Mới</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser(prev => ({
              ...prev, 
              email: e.target.value
            }))}
          />
          <TextField
            margin="dense"
            label="Mật Khẩu"
            type="password"
            fullWidth
            variant="outlined"
            value={newUser.password}
            onChange={(e) => setNewUser(prev => ({
              ...prev, 
              password: e.target.value
            }))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Vai Trò</InputLabel>
            <Select
              value={newUser.role}
              label="Vai Trò"
              onChange={(e) => setNewUser(prev => ({
                ...prev, 
                role: e.target.value as 'admin' | 'manager' | 'staff'
              }))}
            >
              <MenuItem value="staff">Nhân Viên</MenuItem>
              <MenuItem value="manager">Quản Lý</MenuItem>
              <MenuItem value="admin">Quản Trị Viên</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsCreateDialogOpen(false)}
            color="secondary"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleCreateUser} 
            color="primary"
            disabled={!newUser.email || !newUser.password}
          >
            Tạo Tài Khoản
          </Button>
        </DialogActions>
      </Dialog>

      {/* Thông báo lỗi */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Thông báo thành công */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountManagement; 