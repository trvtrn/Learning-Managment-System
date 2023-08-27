import React from 'react';

import { TextField } from '@mui/material';
import { DatePicker, TimeField } from '@mui/x-date-pickers';

import EditorFormInputBase from '../../components/EditorFormInputBase';

import styles from './AssignmentEditor.module.css';

export default function AssignmentDetails({
  releaseDate,
  setReleaseDate,
  releaseTime,
  setReleaseTime,
  deadlineDate,
  setDeadlineDate,
  deadlineTime,
  setDeadlineTime,
  totalMarks,
  setTotalMarks,
  weighting,
  setWeighting,
}) {
  return (
    <div className={styles.detailsContainer}>
      <EditorFormInputBase label="Release">
        <div className={styles.time}>
          <TimeField
            className={styles.timeInput}
            label="Time"
            value={releaseTime}
            onChange={(value) => {
              setReleaseTime(value);
            }}
          />
          <DatePicker
            className={styles.dateInput}
            label="Date"
            format="DD/MM/YYYY"
            value={releaseDate}
            onChange={(value) => {
              setReleaseDate(value);
            }}
          />
        </div>
      </EditorFormInputBase>
      <EditorFormInputBase label="Deadline">
        <div className={styles.time}>
          <TimeField
            className={styles.timeInput}
            label="Time"
            value={deadlineTime}
            onChange={(value) => {
              setDeadlineTime(value);
            }}
          />
          <DatePicker
            className={styles.dateInput}
            label="Date"
            format="DD/MM/YYYY"
            value={deadlineDate}
            onChange={(value) => {
              setDeadlineDate(value);
            }}
          />
        </div>
      </EditorFormInputBase>
      <EditorFormInputBase label="Total Marks" width="50%">
        <TextField
          id="totalMarks"
          name="Total Marks"
          value={totalMarks}
          onChange={(e) => {
            setTotalMarks(e.target.value);
          }}
          InputProps={{ inputProps: { min: 0 } }}
          type="number"
          variant="outlined"
          sx={{ width: '5rem' }}
        />
      </EditorFormInputBase>
      <EditorFormInputBase label="Weighting" width="50%">
        <TextField
          id="weighting"
          name="Weighting"
          value={weighting}
          label="/100"
          onChange={(e) => {
            setWeighting(e.target.value);
          }}
          InputProps={{ inputProps: { min: 0, max: 100 } }}
          type="number"
          variant="outlined"
          sx={{ width: '5rem' }}
        />
      </EditorFormInputBase>
    </div>
  );
}
