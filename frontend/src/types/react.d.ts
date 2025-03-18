import * as React from 'react';

declare module 'react' {
  export type ChangeEvent<T = Element> = React.SyntheticEvent<T> & {
    target: T & {
      value: string;
      name?: string;
    };
  };

  export type FC<P = {}> = React.FunctionComponent<P>;
  export type ReactNode = React.ReactNode;
  export type ReactElement = React.ReactElement;
}

declare module '@mui/material' {
  export interface SelectChangeEvent {
    target: {
      value: string;
      name?: string;
    };
  }
} 