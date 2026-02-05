import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';

interface TermsAndConditionsModalProps {
  open: boolean;
  onAccept: () => void;
  loading?: boolean;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ open, onAccept, loading }) => {
  const [checked, setChecked] = useState(false);

  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth 
      scroll="paper" 
      disableEscapeKeyDown
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2.5, fontWeight: 700 }}>
        Terms and Conditions
      </DialogTitle>
      <DialogContent dividers sx={{ py: 3 }}>
        <Typography variant="body2" component="div" sx={{ '& p': { mb: 2 } }}>
          <p><strong>Welcome to Your Shikshak!</strong></p>
          <p>Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the Your Shikshak platform.</p>
          
          <p><strong>1. Acceptance of Terms</strong></p>
          <p>By accessing and using this platform, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service. These terms apply to all visitors, users and others who access or use the Service.</p>
          
          <p><strong>2. User Obligations & Responsibilities</strong></p>
          <ul>
            <li>You must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</li>
            <li>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</li>
            <li>You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
          </ul>

          <p><strong>3. Conduct for Tutors</strong></p>
          <ul>
            <li>Maintain high standards of professional conduct during all teaching sessions.</li>
            <li>Strictly adhere to the scheduled timings and syllabus agreed upon with the parent/student.</li>
            <li>Provide regular feedback and accurate attendance reports through the platform immediately after each session.</li>
            <li>Refrain from sharing personal contact information with students/parents or bypassing the platform for payments.</li>
          </ul>

          <p><strong>4. Conduct for Parents/Students</strong></p>
          <ul>
            <li>Ensure a quiet and conducive environment for learning during online or offline sessions.</li>
            <li>Review and provide timely approvals for attendance records and payment requests.</li>
            <li>Communicate any cancellations or changes in schedule at least 24 hours in advance.</li>
            <li>Respect the tutor's professional expertise and maintain appropriate boundaries.</li>
          </ul>

          <p><strong>5. Payments and Fees</strong></p>
          <p>All payments must be processed through the Your Shikshak platform. Any attempt to settle payments directly between tutors and parents/students without platform involvement is a violation of these terms and may lead to account suspension.</p>

          <p><strong>6. Limitation of Liability</strong></p>
          <p>In no event shall Your Shikshak, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>

          <p><strong>7. Termination</strong></p>
          <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider', fontStyle: 'italic', color: 'text.secondary' }}>
            <Typography variant="caption">
              Note: This is an official agreement between you and Your Shikshak. By checking the box below and clicking "Accept", you acknowledge that you have read, understood, and agree to be bound by these terms.
            </Typography>
          </Box>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 4, flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} color="primary" />}
          label={<Typography variant="body2" sx={{ fontWeight: 600 }}>I have read and agree to the Terms and Conditions</Typography>}
          sx={{ ml: 0 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={onAccept}
          disabled={!checked || loading}
          fullWidth
          size="large"
          sx={{ 
            borderRadius: 2, 
            height: 54, 
            fontSize: '1rem', 
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
          }}
        >
          {loading ? 'Processing...' : 'Accept and Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsAndConditionsModal;
