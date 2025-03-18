import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useCapital } from '../../../../hooks/useCapital';
import { useCapitalShareholder } from '../../../../hooks/useCapitalShareholder';
import { formatCurrency, formatDate } from '../../../../utils/format';
import { Capital, CapitalInput } from '../../../../models/capital';
import { CapitalShareholder, CapitalShareholderInput } from '../../../../models/capitalShareholder';
import { CapitalDialog } from './CapitalDialog';
import { ShareholderDialog } from './ShareholderDialog';

export const CapitalList = () => {
  const { capitals, loading, fetchCapitals, createCapital, updateCapital, deleteCapital } = useCapital();
  const { shareholders, loading: loadingShareholders, fetchShareholders, createShareholder, updateShareholder, deleteShareholder } = useCapitalShareholder();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareholderDialogOpen, setShareholderDialogOpen] = useState(false);
  const [selectedCapital, setSelectedCapital] = useState<Capital | null>(null);
  const [selectedShareholder, setSelectedShareholder] = useState<CapitalShareholder | null>(null);

  useEffect(() => {
    fetchCapitals();
  }, [fetchCapitals]);

  useEffect(() => {
    if (selectedCapital) {
      fetchShareholders(selectedCapital.id);
    }
  }, [selectedCapital, fetchShareholders]);

  const handleOpenDialog = (capital?: Capital) => {
    setSelectedCapital(capital || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedCapital(null);
    setDialogOpen(false);
  };

  const handleOpenShareholderDialog = (shareholder?: CapitalShareholder) => {
    setSelectedShareholder(shareholder || null);
    setShareholderDialogOpen(true);
  };

  const handleCloseShareholderDialog = () => {
    setSelectedShareholder(null);
    setShareholderDialogOpen(false);
  };

  const handleSubmit = async (values: CapitalInput) => {
    if (selectedCapital) {
      await updateCapital(selectedCapital.id, values);
    } else {
      await createCapital(values);
    }
  };

  const handleSubmitShareholder = async (values: any) => {
    if (selectedShareholder) {
      await updateShareholder(selectedShareholder.id, values);
    } else {
      await createShareholder({
        ...values,
        capital_id: selectedCapital?.id || '',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông tin vốn này?')) {
      await deleteCapital(id);
    }
  };

  const handleDeleteShareholder = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông tin cổ đông này?')) {
      await deleteShareholder(id);
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Danh sách thông tin vốn</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Thêm mới
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Cổ đông</TableCell>
                  <TableCell>Vốn góp ban đầu</TableCell>
                  <TableCell>Tỷ lệ góp vốn (%)</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shareholders.map((shareholder, index) => (
                  <TableRow key={shareholder.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{shareholder.shareholder_name}</TableCell>
                    <TableCell>{formatCurrency(shareholder.investment_amount)}</TableCell>
                    <TableCell>{shareholder.share_percentage}%</TableCell>
                    <TableCell>{shareholder.note || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenShareholderDialog(shareholder)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteShareholder(shareholder.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loadingShareholders && shareholders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <CapitalDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        initialValues={selectedCapital || undefined}
      />

      <ShareholderDialog
        open={shareholderDialogOpen}
        onClose={handleCloseShareholderDialog}
        onSubmit={handleSubmitShareholder}
        initialValues={selectedShareholder || undefined}
        totalCapital={selectedCapital?.capital_amount || 0}
      />
    </>
  );
}; 