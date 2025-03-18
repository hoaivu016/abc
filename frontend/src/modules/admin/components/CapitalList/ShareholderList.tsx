import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Grid,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCapitalShareholder } from '../../../../hooks/useCapitalShareholder';
import { formatCurrency } from '../../../../utils/format';

interface ShareholderListProps {
  capitalId: string;
  totalCapital: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ShareholderList: React.FC<ShareholderListProps> = ({
  capitalId,
  totalCapital,
  onEdit,
  onDelete,
}) => {
  const { shareholders, loading, fetchShareholders } = useCapitalShareholder(capitalId);

  useEffect(() => {
    fetchShareholders();
  }, [capitalId]);

  const chartData = shareholders.map((shareholder) => ({
    name: shareholder.shareholder_name,
    value: shareholder.share_percentage,
  }));

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên cổ đông</TableCell>
                  <TableCell align="right">Vốn góp</TableCell>
                  <TableCell align="right">Tỷ lệ (%)</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shareholders.map((shareholder) => (
                  <TableRow key={shareholder.id}>
                    <TableCell>{shareholder.shareholder_name}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(shareholder.investment_amount)}
                    </TableCell>
                    <TableCell align="right">
                      {shareholder.share_percentage.toFixed(2)}%
                    </TableCell>
                    <TableCell>{shareholder.note}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(shareholder.id)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(shareholder.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Cơ cấu vốn góp
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                      index,
                    }: {
                      cx: number;
                      cy: number;
                      midAngle: number;
                      innerRadius: number;
                      outerRadius: number;
                      value: number;
                      index: number;
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = 25 + innerRadius + (outerRadius - innerRadius);
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={COLORS[index % COLORS.length]}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                        >
                          {`${chartData[index].name} (${value}%)`}
                        </text>
                      );
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Tỷ lệ góp vốn']}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 