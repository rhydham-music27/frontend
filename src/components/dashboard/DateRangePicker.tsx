import React, { useState, useEffect } from 'react';
import { Box, TextField, Button } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

type Props = {
  fromDate?: string;
  toDate?: string;
  onDateChange: (range: { fromDate?: string; toDate?: string }) => void;
  presets?: boolean;
};

const DateRangePicker: React.FC<Props> = ({ fromDate, toDate, onDateChange, presets = true }) => {
  const [from, setFrom] = useState<string | undefined>(fromDate);
  const [to, setTo] = useState<string | undefined>(toDate);

  useEffect(() => {
    setFrom(fromDate);
  }, [fromDate]);

  useEffect(() => {
    setTo(toDate);
  }, [toDate]);

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value || undefined;
    setFrom(v);
    onDateChange({ fromDate: v, toDate: to });
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value || undefined;
    setTo(v);
    onDateChange({ fromDate: from, toDate: v });
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  const handlePreset = (type: 'today' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'clear') => {
    if (type === 'today') {
      setFrom(today);
      setTo(today);
      onDateChange({ fromDate: today, toDate: today });
    } else if (type === 'last7') {
      const f = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      setFrom(f);
      setTo(today);
      onDateChange({ fromDate: f, toDate: today });
    } else if (type === 'last30') {
      const f = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      setFrom(f);
      setTo(today);
      onDateChange({ fromDate: f, toDate: today });
    } else if (type === 'thisMonth') {
      const f = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const t = format(endOfMonth(new Date()), 'yyyy-MM-dd');
      setFrom(f);
      setTo(t);
      onDateChange({ fromDate: f, toDate: t });
    } else if (type === 'lastMonth') {
      const d = subDays(startOfMonth(new Date()), 1);
      const f = format(startOfMonth(d), 'yyyy-MM-dd');
      const t = format(endOfMonth(d), 'yyyy-MM-dd');
      setFrom(f);
      setTo(t);
      onDateChange({ fromDate: f, toDate: t });
    } else if (type === 'clear') {
      setFrom(undefined);
      setTo(undefined);
      onDateChange({ fromDate: undefined, toDate: undefined });
    }
  };

  return (
    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
      <CalendarTodayIcon color="action" />
      <TextField label="From Date" type="date" size="small" value={from || ''} onChange={handleFromDateChange} InputLabelProps={{ shrink: true }} />
      <TextField label="To Date" type="date" size="small" value={to || ''} onChange={handleToDateChange} InputLabelProps={{ shrink: true }} inputProps={{ min: from }} />
      {presets && (
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button size="small" variant="outlined" onClick={() => handlePreset('today')}>Today</Button>
          <Button size="small" variant="outlined" onClick={() => handlePreset('last7')}>Last 7 Days</Button>
          <Button size="small" variant="outlined" onClick={() => handlePreset('last30')}>Last 30 Days</Button>
          <Button size="small" variant="outlined" onClick={() => handlePreset('thisMonth')}>This Month</Button>
          <Button size="small" variant="outlined" onClick={() => handlePreset('lastMonth')}>Last Month</Button>
          <Button size="small" onClick={() => handlePreset('clear')}>Clear</Button>
        </Box>
      )}
    </Box>
  );
};

export default DateRangePicker;
