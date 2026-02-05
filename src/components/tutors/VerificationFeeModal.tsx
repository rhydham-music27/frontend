import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Radio,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface VerificationFeeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { method: 'PAY_NOW' | 'DEDUCT_LATER'; file?: File }) => Promise<void>;
  feeAmount?: number;
}

const VerificationFeeModal: React.FC<VerificationFeeModalProps> = ({
  open,
  onClose,
  onSubmit,
  feeAmount = 499,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deductAgreed, setDeductAgreed] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedFile(null); // Reset file if switching tabs
    setDeductAgreed(false);
  };

  const handleFileLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (tabValue === 0) {
        // Pay Now
        if (!selectedFile) return;
        await onSubmit({ method: 'PAY_NOW', file: selectedFile });
      } else {
        // Deduct Later
        if (!deductAgreed) return;
        await onSubmit({ method: 'DEDUCT_LATER' });
      }
      onClose();
    } catch (error) {
      console.error(error);
      // Let parent handle toast/error display usually, but we stop loading here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Complete Verification
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A one-time verification fee of <strong>₹{feeAmount}</strong> is required to activate your profile.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 0 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab icon={<QrCode2Icon />} label="Pay Now (QR Code)" />
          <Tab icon={<AccountBalanceWalletIcon />} label="Deduct from Earnings" />
        </Tabs>

        <Box sx={{ px: 3, py: 1 }}>
          {tabValue === 0 && (
            <Stack spacing={3} alignItems="center">
              <Alert severity="info" sx={{ width: '100%' }}>
                Scan the QR code below to pay via UPI. Upload the screenshot once done.
              </Alert>

              <Box
                component="img"
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=rhydham.sharma@okaxis&pn=Rhydham%20Sharma&am=499&cu=INR" // Placeholder QR - replace with real static asset or dynamic generator if needed
                alt="Payment QR Code"
                sx={{ width: 200, height: 200, border: '1px solid #eee', borderRadius: 2, p: 1 }}
              />

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ height: 56, borderStyle: 'dashed' }}
              >
                {selectedFile ? selectedFile.name : 'Upload Payment Screenshot'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileLocalChange}
                />
              </Button>
              {selectedFile && (
                <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon fontSize="inherit" /> Ready to upload
                </Typography>
              )}
            </Stack>
          )}

          {tabValue === 1 && (
            <Stack spacing={3}>
              <Alert severity="warning">
                This option allows you to start teaching without immediate payment. The fee will be deducted from your first payout.
              </Alert>
              
              <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Terms of Deduction:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0, typography: 'body2', color: 'text.secondary' }}>
                    <li>Verification fee of ₹{feeAmount} will be marked as "Pending".</li>
                    <li>Once you complete your first month/classes, this amount will be automatically deducted from your total earnings.</li>
                    <li>If you do not earn within 60 days, your profile may be actively paused.</li>
                  </Box>
                </CardContent>
              </Card>

              <FormControlLabel
                control={
                  <Radio
                    checked={deductAgreed}
                    onChange={(e) => setDeductAgreed(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={500}>
                    I agree to deduct ₹{feeAmount} from my first month's earnings.
                  </Typography>
                }
              />
            </Stack>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || (tabValue === 0 && !selectedFile) || (tabValue === 1 && !deductAgreed)}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Verification'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerificationFeeModal;
