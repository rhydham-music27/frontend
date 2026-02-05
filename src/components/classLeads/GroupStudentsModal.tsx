import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

interface StudentDetail {
  name: string;
  studentId?: string;
  gender: 'M' | 'F';
  grade?: string;
}

interface GroupStudentsModalProps {
  open: boolean;
  onClose: () => void;
  students: StudentDetail[];
  leadName: string;
}

const GroupStudentsModal: React.FC<GroupStudentsModalProps> = ({ open, onClose, students, leadName }) => {
  const navigate = useNavigate();

  const handleStudentClick = (studentId?: string) => {
    if (studentId) {
      // Internal profile for staff roles
      navigate(`/admin/student-profile/${studentId}`);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Students in Group: {leadName}
      </DialogTitle>
      <DialogContent dividers>
        <List>
          {students.map((student, index) => (
            <React.Fragment key={index}>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleStudentClick(student.studentId)}
                  disabled={!student.studentId}
                  sx={{ 
                    py: 1.5,
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon color={student.studentId ? "primary" : "disabled"} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600} color={student.studentId ? "primary" : "textPrimary"}>
                        {student.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {student.gender === 'M' ? 'Male' : 'Female'} {student.grade ? `• Grade ${student.grade}` : ''}
                        {student.studentId ? ` • ID: ${student.studentId}` : ' (No Profile Assigned)'}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < students.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupStudentsModal;
