import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';
import { Capital, CapitalInput } from '../../../../../models/capital';
import { capitalService } from '../../../../../services/capitalService';
import { useSnackbar } from 'notistack';

interface CapitalFormData extends Omit<CapitalInput, 'start_date' | 'end_date'> {
  start_date: Date | null;
  end_date: Date | null;
}

const initialFormData: CapitalFormData = {
  capital_amount: 0,
  loan_amount: 0,
  interest_rate: 0,
  start_date: null,
  end_date: null,
  note: ''
};

const CapitalInfo: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [capitals, setCapitals] = useState<Capital[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CapitalFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCapitals();
  }, []);

  const loadCapitals = async () => {
    try {
      const data = await capitalService.getAll();
      setCapitals(data);
    } catch (error) {
      console.error('Error loading capitals:', error);
      enqueueSnackbar('Không thể tải dữ liệu vốn', { variant: 'error' });
    }
  };

  const handleOpenDialog = (capital?: Capital) => {
    if (capital) {
      setFormData({
        capital_amount: capital.capital_amount,
        loan_amount: capital.loan_amount,
        interest_rate: capital.interest_rate,
        start_date: new Date(capital.start_date),
        end_date: capital.end_date ? new Date(capital.end_date) : null,
        note: capital.note || ''
      });
      setEditingId(capital.id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleInputChange = (field: keyof CapitalFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'note' ? value : Number(value)
    }));
  };

  const handleDateChange = (field: 'start_date' | 'end_date') => (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = async () => {
    if (!formData.start_date) {
      enqueueSnackbar('Vui lòng chọn ngày bắt đầu', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await capitalService.update(editingId, formData);
        enqueueSnackbar('Cập nhật thông tin vốn thành công', { variant: 'success' });
      } else {
        await capitalService.create(formData);
        enqueueSnackbar('Thêm thông tin vốn thành công', { variant: 'success' });
      }
      handleCloseDialog();
      loadCapitals();
    } catch (error) {
      console.error('Error saving capital:', error);
      enqueueSnackbar('Không thể lưu thông tin vốn', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông tin vốn này?')) {
      return;
    }

    try {
      await capitalService.delete(id);
      enqueueSnackbar('Xóa thông tin vốn thành công', { variant: 'success' });
      loadCapitals();
    } catch (error) {
      console.error('Error deleting capital:', error);
      enqueueSnackbar('Không thể xóa thông tin vốn', { variant: 'error' });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card 
          sx={{ 
            boxShadow: theme.shadows[1],
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" color="primary">
                  Thông Tin Vốn
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Thêm Mới
                </Button>
              </Box>
            }
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ngày bắt đầu</TableCell>
                    <TableCell>Ngày kết thúc</TableCell>
                    <TableCell align="right">Tổng vốn</TableCell>
                    <TableCell align="right">Vốn vay</TableCell>
                    <TableCell align="right">Lãi suất</TableCell>
                    <TableCell>Ghi chú</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {capitals.map((capital) => (
                    <TableRow key={capital.id}>
                      <TableCell>{formatDate(new Date(capital.start_date))}</TableCell>
                      <TableCell>
                        {capital.end_date ? formatDate(new Date(capital.end_date)) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(capital.capital_amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(capital.loan_amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {capital.interest_rate.toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell>{capital.note || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenDialog(capital)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(capital.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? 'Cập Nhật Thông Tin Vốn' : 'Thêm Thông Tin Vốn'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tổng vốn đầu tư"
              type="number"
              value={formData.capital_amount}
              onChange={handleInputChange('capital_amount')}
              fullWidth
              required
            />
            <TextField
              label="Vốn vay"
              type="number"
              value={formData.loan_amount}
              onChange={handleInputChange('loan_amount')}
              fullWidth
              required
            />
            <TextField
              label="Lãi suất (%)"
              type="number"
              value={formData.interest_rate}
              onChange={handleInputChange('interest_rate')}
              fullWidth
              required
            />
            <DatePicker
              label="Ngày bắt đầu"
              value={formData.start_date}
              onChange={handleDateChange('start_date')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
            <DatePicker
              label="Ngày kết thúc"
              value={formData.end_date}
              onChange={handleDateChange('end_date')}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
            <TextField
              label="Ghi chú"
              value={formData.note}
              onChange={handleInputChange('note')}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {editingId ? 'Cập Nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CapitalInfo; 