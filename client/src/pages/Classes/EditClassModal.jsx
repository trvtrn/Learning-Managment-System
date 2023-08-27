import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker, TimeField } from '@mui/x-date-pickers';
import {
  Button,
  TextField,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';

import ColouredBox from '../../components/ColouredBox/ColouredBox';

import styles from './Classes.module.css';
import { createDateTime } from '../../utils/helpers';
import { createOrUpdateClass } from '../../utils/api/classes';

export default function EditClassModal({
  classId,
  name,
  date,
  startTime,
  endTime,
  frequency,
  showModal,
  setShowModal,
  getClasses,
}) {
  const [errorMessage, setErrorMessage] = useState('');
  const [newName, setNewName] = useState(name || '');
  const [newDate, setNewDate] = useState(date || null);
  const [newStartTime, setNewStartTime] = useState(startTime || null);
  const [newEndTime, setNewEndTime] = useState(endTime || null);
  const [newFrequency, setNewFrequency] = useState(frequency || 'once');
  const { courseId } = useParams();
  const navigate = useNavigate();

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };
  const handleDateChange = (updatedDate) => {
    setNewDate(updatedDate);
  };
  const handleStartTimeChange = (updatedStart) => {
    setNewStartTime(updatedStart);
  };
  const handleEndTimeChange = (updatedEnd) => {
    setNewEndTime(updatedEnd);
  };
  const handleFrequencyChange = (e) => {
    setNewFrequency(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newName.match(/^\s*$/) || !newDate?.$d || !newStartTime?.$d || !newEndTime?.$d) {
      setErrorMessage('No fields can be left empty');
    } else if (new Date(newStartTime) >= new Date(newEndTime)) {
      setErrorMessage('Start time must be before end time');
    } else if (createDateTime(new Date(newDate), new Date(newStartTime)) < Date.now()) {
      setErrorMessage('Start time cannot be in the past');
    } else {
      setErrorMessage('');
      createOrUpdateClass(
        classId,
        courseId,
        newName,
        createDateTime(new Date(newDate), new Date(newStartTime)).getTime(),
        createDateTime(new Date(newDate), new Date(newEndTime)).getTime(),
        newFrequency,
        navigate
      )
        .then(getClasses)
        .then(() => setShowModal(false))
        .catch((err) => {
          setErrorMessage(err.message);
          console.error(err.message);
        });
    }
  };

  return (
    <Modal
      open={showModal}
      onClose={() => {
        setErrorMessage('');
        setShowModal(false);
      }}
      aria-labelledby="Enter Class Details"
      aria-describedby="Enter class details for a new or existing class"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <ColouredBox height="fit" width="550px">
        <form onSubmit={handleSubmit}>
          <h2 className={styles.modalHeading}>Enter Class Details</h2>
          <div className={styles.formRow}>
            <TextField fullWidth label="Class Name" value={newName} onChange={handleNameChange} />
          </div>
          <div className={styles.formRow}>
            <DatePicker
              className={styles.formInput}
              label="Date"
              format="DD/MM/YYYY"
              value={newDate}
              onChange={handleDateChange}
            />
            <FormControl className={styles.formInput}>
              <InputLabel htmlFor="frequency">Frequency</InputLabel>
              <Select
                id="frequency"
                label="Frequency"
                value={newFrequency}
                onChange={handleFrequencyChange}
              >
                <MenuItem value="once">Once</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="fortnightly">Fortnightly</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className={styles.formRow}>
            <TimeField
              className={styles.formInput}
              label="Start Time"
              value={newStartTime}
              onChange={handleStartTimeChange}
            />
            <TimeField
              className={styles.formInput}
              label="End Time"
              value={newEndTime}
              onChange={handleEndTimeChange}
            />
          </div>
          {errorMessage && (
            <div className={styles.formRow}>
              <Alert severity="error" sx={{ width: '100%' }}>
                {errorMessage}
              </Alert>
            </div>
          )}
          <div className={styles.formRow}>
            <Button variant="outlined" color="primary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Save
            </Button>
          </div>
        </form>
      </ColouredBox>
    </Modal>
  );
}
