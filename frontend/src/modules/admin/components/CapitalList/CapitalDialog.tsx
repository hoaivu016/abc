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
import { Capital, CapitalInput } from '../../../../models/capital';
import { formatCurrency } from '../../../../utils/format';

interface CapitalDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CapitalInput) => void;
  initialValues?: Capital;
}

const validationSchema = Yup.object().shape({
  capital_amount: Yup.number()
    .required('Vui lòng nhập số vốn')
    .min(0, 'Số vốn phải lớn hơn 0'),
  loan_amount: Yup.number()
    .required('Vui lòng nhập số tiền vay')
    .min(0, 'Số tiền vay phải lớn hơn 0')
    .test('loan-amount', 'Số tiền vay không được lớn hơn số vốn', function (value) {
      return !value || !this.parent.capital_amount || value <= this.parent.capital_amount;
    }),
  interest_rate: Yup.number()
    .required('Vui lòng nhập lãi suất')
    .min(0, 'Lãi suất phải lớn hơn 0')
    .max(100, 'Lãi suất không được lớn hơn 100%'),
  start_date: Yup.string().required('Vui lòng chọn ngày bắt đầu'),
  end_date: Yup.string().nullable(),
  note: Yup.string().nullable(),
});

export const CapitalDialog: React.FC<CapitalDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const handleSubmit = (values: CapitalInput) => {
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
        {initialValues ? 'Chỉnh sửa thông tin vốn' : 'Thêm thông tin vốn mới'}
      </DialogTitle>
      <Formik
        initialValues={
          initialValues || {
            capital_amount: 0,
            loan_amount: 0,
            interest_rate: 0,
            start_date: new Date().toISOString().split('T')[0],
            end_date: null,
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
                    name="capital_amount"
                    label="Tổng vốn"
                    value={formatCurrency(values.capital_amount)}
                    onChange={handleNumberChange(handleChange)}
                    onBlur={handleBlur}
                    error={touched.capital_amount && Boolean(errors.capital_amount)}
                    helperText={touched.capital_amount && errors.capital_amount}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="loan_amount"
                    label="Số tiền vay"
                    value={formatCurrency(values.loan_amount)}
                    onChange={handleNumberChange(handleChange)}
                    onBlur={handleBlur}
                    error={touched.loan_amount && Boolean(errors.loan_amount)}
                    helperText={touched.loan_amount && errors.loan_amount}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="interest_rate"
                    label="Lãi suất (%)"
                    type="number"
                    value={values.interest_rate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.interest_rate && Boolean(errors.interest_rate)}
                    helperText={touched.interest_rate && errors.interest_rate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="start_date"
                    label="Ngày bắt đầu"
                    type="date"
                    value={values.start_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.start_date && Boolean(errors.start_date)}
                    helperText={touched.start_date && errors.start_date}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="end_date"
                    label="Ngày kết thúc"
                    type="date"
                    value={values.end_date || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.end_date && Boolean(errors.end_date)}
                    helperText={touched.end_date && errors.end_date}
                    InputLabelProps={{ shrink: true }}
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