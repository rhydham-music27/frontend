import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Define the props type for the table
interface AssignedClassesTableProps {
  classes: any[];
  onOpenAttendance: (classId: string) => void;
  onOpenPayments: (classId: string) => void;
}

const AssignedClassesTable: React.FC<AssignedClassesTableProps> = ({ classes, onOpenAttendance, onOpenPayments }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Student Name</TableCell>
            <TableCell>Grade / Board / Mode</TableCell>
            <TableCell>Subject(s)</TableCell>
            <TableCell>Tutor Name</TableCell>
            <TableCell>Schedule</TableCell>
            <TableCell>Session Progress</TableCell>
            <TableCell>Pending Attendance</TableCell>
            <TableCell>Overdue Payments</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell>{cls.studentName}</TableCell>
              <TableCell>{cls.grade} / {cls.board} / {cls.mode}</TableCell>
              <TableCell>{cls.subjects?.join(', ')}</TableCell>
              <TableCell>{cls.tutorName}</TableCell>
              <TableCell>{Array.isArray(cls.schedule?.daysOfWeek) || cls.schedule?.timeSlot ? `${cls.schedule?.daysOfWeek?.join(', ') || ''}${cls.schedule?.daysOfWeek && cls.schedule?.timeSlot ? ' • ' : ''}${cls.schedule?.timeSlot || ''}` : (cls.schedule || '')}</TableCell>
              <TableCell>{cls.sessionProgress}</TableCell>
              <TableCell>{cls.pendingAttendanceCount}</TableCell>
              <TableCell>{cls.overduePaymentsCount}</TableCell>
              <TableCell>{cls.status}</TableCell>
              <TableCell>
                <Tooltip title="Attendance">
                  <IconButton onClick={(e) => { e.stopPropagation(); onOpenAttendance(cls.id); }} size="small"><AssignmentIcon /></IconButton>
                </Tooltip>
                <Tooltip title="Payments">
                  <IconButton onClick={(e) => { e.stopPropagation(); onOpenPayments(cls.id); }} size="small"><PaymentIcon /></IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AssignedClassesTable;
