import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(60, 133, 62)',
      light: 'rgba(60, 133, 62, 0.1)',
      dark: '#236b26',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4CCAAA',
      light: 'rgba(76, 202, 170, 0.1)',
      dark: '#2E8876',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
      alt: '#F8F9FA',
    },
    text: {
      primary: '#212529',
      secondary: '#6C757D',
      muted: '#ADB5BD',
    },
    success: {
      main: '#28A745',
      light: 'rgba(40, 167, 69, 0.1)',
    },
    warning: {
      main: '#FFA500',
      light: 'rgba(255, 165, 0, 0.1)',
    },
    error: {
      main: '#DC3545',
      light: 'rgba(220, 53, 69, 0.1)',
    },
    info: {
      main: '#17A2B8',
      light: 'rgba(23, 162, 184, 0.1)',
    },
  },
  typography: {
    fontFamily: "'Mulish', system-ui, sans-serif",
    fontSize: 16,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemiBold: 600,
    fontWeightBold: 700,
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.25,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.25,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.35,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.025em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 2px 6px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.12)',
    '0 8px 24px rgba(0,0,0,0.16)',
    '0 16px 32px rgba(0,0,0,0.2)',
    '0 1px 3px rgba(0,0,0,0.15)',
    '0 3px 6px rgba(0,0,0,0.1)',
    '0 5px 10px rgba(0,0,0,0.1)',
    '0 8px 16px rgba(0,0,0,0.12)',
    '0 10px 20px rgba(0,0,0,0.14)',
    '0 12px 24px rgba(0,0,0,0.16)',
    '0 14px 28px rgba(0,0,0,0.18)',
    '0 16px 32px rgba(0,0,0,0.2)',
    '0 18px 36px rgba(0,0,0,0.22)',
    '0 20px 40px rgba(0,0,0,0.24)',
    '0 22px 44px rgba(0,0,0,0.26)',
    '0 24px 48px rgba(0,0,0,0.28)',
    '0 26px 52px rgba(0,0,0,0.3)',
    '0 28px 56px rgba(0,0,0,0.32)',
    '0 30px 60px rgba(0,0,0,0.34)',
    '0 32px 64px rgba(0,0,0,0.36)',
    '0 34px 68px rgba(0,0,0,0.38)',
    '0 36px 72px rgba(0,0,0,0.4)',
    '0 38px 76px rgba(0,0,0,0.42)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          boxShadow: 'none',
          padding: '10px 18px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        sizeMedium: {
          height: 40,
        },
        sizeSmall: {
          height: 32,
          padding: '6px 12px',
          fontSize: '0.75rem',
        },
        sizeLarge: {
          height: 48,
          padding: '12px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #DEE2E6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontSize: '0.8rem',
          fontWeight: 500,
          minWidth: 70,
          textAlign: 'center',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F8F9FA',
          color: 'rgb(60, 133, 62)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.025em',
          fontSize: '0.875rem',
          padding: '14px 16px',
          borderBottom: '1px solid #DEE2E6',
        },
        root: {
          padding: '12px 16px',
          borderBottom: '1px solid #DEE2E6',
          fontSize: '1rem',
          lineHeight: 1.5,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: '1px solid #DEE2E6',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          backgroundColor: '#FFFFFF',
          overflowX: 'auto',
          marginBottom: 24,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#F8F9FA',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
        },
        indicator: {
          height: 3,
          backgroundColor: 'rgb(60, 133, 62)',
          borderRadius: 2,
        },
        flexContainer: {
          justifyContent: 'space-around',
        }
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          textTransform: 'none',
          padding: '12px 16px',
          minHeight: 48,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(60, 133, 62, 0.1)',
          },
          '&.Mui-selected': {
            fontWeight: 700,
            color: 'rgb(60, 133, 62)',
          },
        },
        iconWrapper: {
          marginRight: 8,
        }
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '20px 24px',
          fontWeight: 700,
          fontSize: '1.25rem',
          borderBottom: '1px solid #DEE2E6',
          letterSpacing: '-0.3px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: 24,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '20px 24px',
          borderTop: '1px solid #DEE2E6',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            transition: 'all 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CED4DA',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgb(60, 133, 62)',
              borderWidth: 1,
              boxShadow: '0 0 0 3px rgba(60, 133, 62, 0.15)',
            },
          },
        },
      },
    },
    BottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }
      }
    },
    BottomNavigationAction: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(60, 133, 62, 0.1)',
          },
          '&.Mui-selected': {
            color: 'rgb(60, 133, 62)',
          }
        },
        label: {
          fontSize: '0.75rem',
          marginTop: 4,
        }
      }
    },
  },
});

export default theme; 