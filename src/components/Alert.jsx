import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Snackbar,
  Alert as MuiAlert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { forwardRef } from 'react';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    autoHideDuration: 3000
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const showSnackbar = useCallback((message, severity = 'success', autoHideDuration = 3000) => {
    setSnackbar({
      open: true,
      message,
      severity,
      autoHideDuration
    });
  }, []);

  const showSuccess = useCallback((message, autoHideDuration = 3000) => {
    showSnackbar(message, 'success', autoHideDuration);
  }, [showSnackbar]);

  const showError = useCallback((message, autoHideDuration = 3000) => {
    showSnackbar(message, 'error', autoHideDuration);
  }, [showSnackbar]);

  const showWarning = useCallback((message, autoHideDuration = 3000) => {
    showSnackbar(message, 'warning', autoHideDuration);
  }, [showSnackbar]);

  const showInfo = useCallback((message, autoHideDuration = 3000) => {
    showSnackbar(message, 'info', autoHideDuration);
  }, [showSnackbar]);

  const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        open: true,
        title,
        message,
        onConfirm: () => {
          setConfirmDialog({ open: false, title: '', message: '', onConfirm: null, onCancel: null });
          if (onConfirm) onConfirm();
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog({ open: false, title: '', message: '', onConfirm: null, onCancel: null });
          if (onCancel) onCancel();
          resolve(false);
        }
      });
    });
  }, []);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showSnackbar
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      
      {/* Snackbar 通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 确认对话框 */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => {
          setConfirmDialog(prev => ({ ...prev, open: false }));
          if (confirmDialog.onCancel) confirmDialog.onCancel();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmDialog(prev => ({ ...prev, open: false }));
              if (confirmDialog.onCancel) confirmDialog.onCancel();
            }}
            color="inherit"
          >
            取消
          </Button>
          <Button
            onClick={() => {
              setConfirmDialog(prev => ({ ...prev, open: false }));
              if (confirmDialog.onConfirm) confirmDialog.onConfirm();
            }}
            variant="contained"
            color="primary"
            autoFocus
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </AlertContext.Provider>
  );
};

export default AlertProvider;