import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import { Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { CLASS_LEAD_STATUS } from '../../constants';
import { IClassLead, IDemoHistory, IAnnouncement } from '../../types';

export default function StatusTimeline({ classLead, demoHistory = [], announcement }: { classLead: IClassLead; demoHistory?: IDemoHistory[]; announcement?: IAnnouncement | null }) {
  const steps = [
    { status: CLASS_LEAD_STATUS.NEW, label: 'Lead Created' },
    { status: CLASS_LEAD_STATUS.ANNOUNCED, label: 'Announced to Tutors' },
    { status: CLASS_LEAD_STATUS.DEMO_SCHEDULED, label: 'Demo Scheduled' },
    { status: CLASS_LEAD_STATUS.DEMO_COMPLETED, label: 'Demo Completed' },
    { status: CLASS_LEAD_STATUS.CONVERTED, label: 'Converted to Class' },
  ];
  const currentIdx = steps.findIndex((s) => s.status === classLead.status);

  const hasDemoScheduled = demoHistory.some((h) => h.status === 'SCHEDULED');
  const hasDemoCompleted = demoHistory.some((h) => h.status === 'COMPLETED');

  const getDateForStep = (status: string): string | undefined => {
    if (status === CLASS_LEAD_STATUS.NEW) return new Date(classLead.createdAt).toLocaleString();
    if (status === CLASS_LEAD_STATUS.ANNOUNCED && classLead.status === CLASS_LEAD_STATUS.ANNOUNCED) {
      const dt: any = (announcement as any)?.postedAt || (announcement as any)?.createdAt || classLead.updatedAt;
      if (dt) return new Date(dt).toLocaleString();
    }
    if (status === CLASS_LEAD_STATUS.DEMO_SCHEDULED) {
      const d = demoHistory.find((h) => h.status === 'SCHEDULED');
      if (d) return new Date(d.assignedAt).toLocaleString();
    }
    if (status === CLASS_LEAD_STATUS.DEMO_COMPLETED) {
      const d = demoHistory.find((h) => h.status === 'COMPLETED');
      if (d?.completedAt) return new Date(d.completedAt).toLocaleString();
    }
    if (status === classLead.status) return new Date(classLead.updatedAt).toLocaleString();
    return undefined;
  };

  const isCompleted = (_status: string, idx: number) => {
    // Only rely on classLead.status progression to mark steps complete
    // This keeps timeline in sync with list/table status
    return currentIdx >= idx || _status === CLASS_LEAD_STATUS.NEW;
  };

  return (
    <Timeline position="alternate">
      {steps.map((s, idx) => {
        const completed = isCompleted(s.status, idx);
        return (
          <TimelineItem key={s.status}>
            <TimelineOppositeContent>
              <Typography variant="body2">{s.label}</Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={completed ? 'primary' : 'grey' as any} variant={completed ? 'filled' : 'outlined'}>
                {completed ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
              </TimelineDot>
              {idx < steps.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="caption">{completed ? getDateForStep(s.status) : ''}</Typography>
            </TimelineContent>
          </TimelineItem>
        );
      })}
      {classLead.status === CLASS_LEAD_STATUS.REJECTED && (
        <TimelineItem>
          <TimelineOppositeContent>
            <Typography variant="body2">Rejected</Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="error" />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="caption">{new Date(classLead.updatedAt).toLocaleString()}</Typography>
          </TimelineContent>
        </TimelineItem>
      )}
    </Timeline>
  );
}
