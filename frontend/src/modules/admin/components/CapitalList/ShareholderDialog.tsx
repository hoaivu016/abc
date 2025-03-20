import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { CapitalShareholder, CapitalShareholderInput } from '../../../../models/capitalShareholder';
import { formatCurrency } from '../../../../utils/format';

interface ShareholderDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CapitalShareholderInput) => void;
  initialValues?: CapitalShareholder;
  totalCapital: number;
  capitalId: string;
}

const validationSchema = Yup.object().shape({
  shareholder_name: Yup.string().required('Vui lòng nhập tên cổ đông'),
  investment_amount: Yup.number()
    .required('Vui lòng nhập số vốn góp')
    .min(0, 'Số vốn góp phải lớn hơn 0')
    .test('max-investment', 'Số vốn góp không được vượt quá tổng vốn', function (value) {
      return !value || value <= this.parent.totalCapital;
    }),
  share_percentage: Yup.number()
    .required('Vui lòng nhập tỷ lệ góp vốn')
    .min(0, 'Tỷ lệ góp vốn phải lớn hơn 0')
    .max(100, 'Tỷ lệ góp vốn không được vượt quá 100%'),
  note: Yup.string().nullable(),
});

export const ShareholderDialog: React.FC<ShareholderDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  totalCapital,
  capitalId,
}) => {
  const handleSubmit = (values: CapitalShareholderInput) => {
    onSubmit(values);
    onClose();
  };

  const handleNumberChange = (handleChange: any) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numericValue = value.replace(/[^0-9]/g, '');
    handleChange({
      target: {
        name,
        value: numericValue ? parseInt(numericValue, 10) : 0,
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialValues ? 'Chỉnh sửa thông tin cổ đông' : 'Thêm cổ đông mới'}
      </DialogTitle>
      <Formik
        initialValues={
          initialValues || {
            capital_id: capitalId,
            shareholder_name: '',
            investment_amount: 0,
            share_percentage: 0,
            note: '',
          }
        }
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="shareholder_name"
                    label="Tên cổ đông"
                    value={values.shareholder_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.shareholder_name && Boolean(errors.shareholder_name)}
                    helperText={touched.shareholder_name && errors.shareholder_name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="investment_amount"
                    label="Vốn góp ban đầu"
                    value={formatCurrency(values.investment_amount)}
                    onChange={handleNumberChange(handleChange)}
                    onBlur={handleBlur}
                    error={touched.investment_amount && Boolean(errors.investment_amount)}
                    helperText={touched.investment_amount && errors.investment_amount}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="share_percentage"
                    label="Tỷ lệ góp vốn (%)"
                    type="number"
                    value={values.share_percentage}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.share_percentage && Boolean(errors.share_percentage)}
                    helperText={touched.share_percentage && errors.share_percentage}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="note"
                    label="Ghi chú"
                    multiline
                    rows={3}
                    value={values.note || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.note && Boolean(errors.note)}
                    helperText={touched.note && errors.note}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Hủy</Button>
              <Button type="submit" variant="contained" color="primary">
                {initialValues ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}; 