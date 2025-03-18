import { CSSProperties, Component } from 'react';

declare module 'recharts' {
  export class Pie extends Component<PieProps> {}
  export class Tooltip extends Component<TooltipProps> {}
  export class PieChart extends Component<PieChartProps> {}
  export class Cell extends Component<CellProps> {}
  export class ResponsiveContainer extends Component<ResponsiveContainerProps> {}

  export interface PieProps {
    children?: React.ReactNode;
    data?: any[];
    dataKey?: string;
    nameKey?: string;
    cx?: string | number;
    cy?: string | number;
    outerRadius?: number;
    label?: (props: any) => React.ReactNode;
  }

  export interface TooltipProps {
    formatter?: (value: any) => [string, string];
    contentStyle?: CSSProperties;
  }

  export interface PieChartProps {
    children?: React.ReactNode;
  }

  export interface CellProps {
    fill?: string;
  }

  export interface ResponsiveContainerProps {
    children?: React.ReactNode;
  }
} 