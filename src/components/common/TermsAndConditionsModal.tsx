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
  Link,
} from '@mui/material';

interface TermsAndConditionsModalProps {
  open: boolean;
  onAccept: () => void;
  loading?: boolean;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ open, onAccept, loading }) => {
  const [checked, setChecked] = useState(false);

  const termsText = `1. Nature of Platform
1.1 Your Shikshak operates as a technology-enabled facilitator and marketplace connecting parents/students with independent tutors.

1.2 Your Shikshak is not a school, coaching institute, educational institution, or employer of tutors.

1.3 Tutors registered on the Platform are independent service providers and not employees, agents, representatives, or partners of Your Shikshak.

1.4 Nothing contained herein shall be construed as creating any agency, partnership, employment, or joint venture relationship.

1.5 Your Shikshak conducts identity verification based on documents submitted by tutors; however, the Platform does not conduct police verification or comprehensive background investigations.

1.6 Parents and users are advised to exercise independent judgment before engaging any tutor.

1.7 The Platform may facilitate both one-on-one and group class formats. Group classes may be conducted at private premises arranged by participating parents. Your Shikshak does not own, inspect, control, or supervise such premises and acts solely as a coordination and facilitation platform.

2. Eligibility
2.1 Parents/guardians must be at least 18 years of age.

2.2 Tutors must be at least 18 years of age.

2.3 By using the Platform, you represent that all information provided is accurate and lawful.

3. Account Registration & Responsibility
3.1 Users shall provide accurate and complete information.

3.2 Users are responsible for safeguarding login credentials.

3.3 Your Shikshak reserves the right to suspend or terminate accounts for false information, policy violations, misconduct, or legal risk.

4. Payments & Platform Role
4.1 Parents shall pay fees through approved third-party payment gateway providers integrated by the Platform.

4.2 Fees consist of:

(a) Platform service charges; and
(b) Tutor tuition components.
4.3 Your Shikshak may temporarily hold tuition amounts solely for coordination and settlement purposes and does not operate as a banking, escrow, or financial institution.

4.4 Your Shikshak does not earn interest on held funds.

4.5 Payment processing is governed by the respective payment gateway's terms and policies.

4.6 Applicable taxes, including GST (if applicable in future), shall be governed by prevailing law.

5. Attendance & Service Verification
5.1 Attendance records maintained through the Platform shall serve as the primary basis for session verification.

5.2 Sessions marked as completed in Platform records shall be treated as delivered services for billing and settlement purposes.

6. Tutor Replacement & Refunds
6.1 Tutor replacement limits and refund conditions shall be governed exclusively by the Parent Service Policy and Refund & Cancellation Policy.

6.2 Nothing herein guarantees academic outcomes, continuous tutor availability, or specific results.

7. Prohibited Uses
Users shall not:

7.1 Bypass the Platform to transact directly with tutors or parents.
7.2 Misrepresent identity or credentials.
7.3 Engage in harassment, abuse, or unlawful conduct.
7.4 Upload malicious software or attempt unauthorized access.
7.5 Violate applicable laws, including IT Act 2000 and related rules.
Violation may result in suspension or termination without prior notice.

8. Intellectual Property
8.1 All content, trademarks, branding, software, and materials on the Platform are proprietary to Your Shikshak.

8.2 Users shall not copy, reproduce, modify, or commercially exploit Platform content without written consent.

8.3 Tutors grant the Platform a limited, non-exclusive license to display profile information and submitted materials for service facilitation purposes.

9. Limitation of Liability
9.1 To the fullest extent permitted by law, Your Shikshak shall not be liable for:

Acts or omissions of independent tutors or users;
Incidents occurring at private premises;
Injuries, accidents, disputes, or property damage;
Indirect, incidental, special, or consequential damages.
9.2 Notwithstanding the foregoing, the aggregate liability of Your Shikshak arising out of or relating to the use of the Platform shall not exceed the lower of:

(a) The total platform service charges paid by the User to Your Shikshak in the preceding three (3) months; or
(b) INR 10,000.
9.3 Nothing in these Terms shall exclude liability for fraud, willful misconduct, or gross negligence where such exclusion is prohibited by law.

9.4 Users retain rights available under applicable consumer protection laws.

10. Indemnity
Users agree to indemnify and hold harmless Your Shikshak from claims, damages, losses, liabilities, and expenses arising from misuse of the Platform, breach of these Terms, or disputes between users.

11. Force Majeure
Your Shikshak shall not be liable for delay or failure due to events beyond reasonable control, including natural disasters, government actions, internet disruptions, or third-party service failures.

12. Suspension & Termination
Your Shikshak may suspend or terminate access for policy violations, non-payment, safety concerns, or legal compliance requirements.

13. Grievance Redressal
In accordance with applicable law, users may contact:

Grievance Officer:

Kamaljeet Singh Dangi
Proprietor & Grievance Officer
Shop 2/51/2B, Saket Nagar, DRM Road,
Bhopal, Madhya Pradesh – 462043

Email: legal@yourshikshak.in

Acknowledgment shall be provided within 24 hours, and resolution shall be attempted within 15 days from receipt.

14. Governing Law & Dispute Resolution
14.1 These Terms shall be governed by the laws of India.

14.2 Parties shall first attempt amicable resolution within 30 days of written notice.

14.3 If unresolved, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996.

14.4 The arbitration shall be conducted by a single arbitrator mutually appointed by the parties. In case of disagreement, appointment shall be made in accordance with Section 11 of the Act.

14.5 The seat and venue of arbitration shall be Bhopal, Madhya Pradesh.

14.6 Nothing herein restricts a User's right to approach competent consumer forums under applicable law.

15. Entity Transition
In the event of conversion of the proprietorship into a Limited Liability Partnership or Private Limited Company, all rights, obligations, assets, and liabilities under these Terms shall automatically vest in the successor entity without requiring fresh consent from users.

16. Modifications
Your Shikshak may update these Terms from time to time. Material changes shall be notified through the Platform. Continued use following notification constitutes acceptance of revised Terms.

17. Severability & Waiver
If any provision is held invalid, remaining provisions shall remain enforceable. Failure to enforce any provision shall not constitute waiver.

18. Entire Agreement
These Terms, along with related policies, constitute the entire agreement between users and Your Shikshak.

These Terms constitute an electronic record and do not require physical or digital signature.`;

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
        <Typography variant="body1" component="div" sx={{ lineHeight: 1.8 }}>
          <Typography variant="body1" component="p" sx={{ mb: 2 }}>
            These Terms &amp; Conditions ("Terms") govern access to and use of the website, mobile applications,
            and related services (collectively, the "Platform") operated by Kamaljeet Singh Dangi, Sole
            Proprietor trading as "Your Shikshak", having its principal place of business at:
          </Typography>

          <Typography variant="body1" component="p" sx={{ mb: 2 }}>
            Shop 2/51/2B, Saket Nagar, DRM Road,
            <br />
            Bhopal, Madhya Pradesh – 462043, India
          </Typography>

          <Typography variant="body1" component="p" sx={{ mb: 2 }}>
            ("Your Shikshak", "we", "us", "our").
          </Typography>

          <Typography variant="body1" component="p" sx={{ mb: 2 }}>
            By accessing, registering on, or using the Platform, you acknowledge that you have read,
            understood, and agree to be legally bound by these Terms, along with the{' '}
            <Link href="https://yourshikshak.in/privacy-policy" target="_blank" rel="noreferrer">
              Privacy Policy
            </Link>
            ,{' '}
            <Link href="https://yourshikshak.in/parent-service-policy" target="_blank" rel="noreferrer">
              Parent Service Policy
            </Link>
            ,{' '}
            <Link href="https://yourshikshak.in/tutor-agreement" target="_blank" rel="noreferrer">
              Tutor Agreement
            </Link>
            , and{' '}
            <Link href="https://yourshikshak.in/refund-cancellation-policy" target="_blank" rel="noreferrer">
              Refund &amp; Cancellation Policy
            </Link>
            .
          </Typography>
        </Typography>

        <Box sx={{ mt: 2, whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.8 }}>
          {termsText}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 4, flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} color="primary" />}
          label={
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              I have read and agree to the policies.
            </Typography>
          }
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
