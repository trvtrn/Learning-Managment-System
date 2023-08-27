import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TextField, IconButton } from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { updateAssignmentMark } from '../../../utils/api/assignments';

import styles from './SubmissionTable.module.css';

export default function MarkingContainer({
  existingMark,
  existingComment,
  submissionId,
  totalMarks,
  setOpen,
  refresh,
}) {
  const navigate = useNavigate();
  const [mark, setMark] = useState(existingMark);
  const [comment, setComment] = useState(existingComment);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAssignmentMark(submissionId, mark, comment, navigate)
      .then(() => {
        refresh();
        setOpen(false);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  return (
    <div className={styles.editContainer}>
      <TextField
        id="outlined-number"
        type="number"
        label={`Mark / ${totalMarks}`}
        value={mark}
        width="2rem"
        inputProps={{
          min: 0,
          max: totalMarks,
          style: { fontSize: '0.75rem' },
        }}
        sx={{ width: '5rem', backgroundColor: 'white', borderRadius: '5px' }}
        onChange={(e) => setMark(parseInt(e.target.value, 10))}
      />
      <TextField
        id="outlined-multiline"
        label="Comment"
        multiline
        rows={3}
        value={comment}
        variant="outlined"
        inputProps={{ style: { fontSize: '0.75rem' } }}
        sx={{ width: 'calc(100% - 15rem)', backgroundColor: 'white', borderRadius: '5px' }}
        onChange={(e) => {
          setComment(e.target.value);
        }}
      />
      <IconButton onClick={handleSubmit}>
        <SaveOutlinedIcon />
      </IconButton>
    </div>
  );
}
