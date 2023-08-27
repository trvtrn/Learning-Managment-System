import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Switch,
  FormControlLabel,
} from '@mui/material';

import SubmissionDetails from './SubmissionDetails';
import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import { getAllSubmissions, updateReleaseMarks } from '../../../utils/api/assignments';

import styles from './SubmissionTable.module.css';

export default function SubmissionTable({ totalMarks, marksReleased, setMarksReleased }) {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);

  const refreshSubmissions = () => {
    getAllSubmissions(assignmentId, navigate)
      .then(setSubmissions)
      .catch((err) => {
        console.error(err.message);
      });
  };

  const updateMarkVisibility = (e) => {
    updateReleaseMarks(assignmentId, !marksReleased, navigate)
      .then(() => {
        setMarksReleased((prev) => !prev);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  useEffect(refreshSubmissions, [assignmentId, navigate]);

  return (
    <div>
      <h3 className={styles.subheading}>
        Submissions
        <FormControlLabel
          value="Release Marks"
          control={
            <Switch color="primary" checked={marksReleased} onChange={updateMarkVisibility} />
          }
          label="Release Marks"
          labelPlacement="start"
        />
      </h3>
      <ColouredBox
        marginSide="0"
        marginTopBottom="1rem"
        color="info"
        paddingSide="1rem"
        paddingTopBottom="0.5rem"
      >
        <TableContainer>
          <Table aria-label="all students submissions table" sx={{ width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Email
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Mark
                </TableCell>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Graded by
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Submission
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Edit Mark
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length < 1 ? (
                <TableCell
                  className={styles.noSubmissions}
                  colSpan={6}
                  align="center"
                  sx={{ borderBottom: 'none' }}
                >
                  No submissions have been made yet
                </TableCell>
              ) : (
                submissions.map((submission) => {
                  return (
                    <SubmissionDetails
                      key={submission.id}
                      submission={submission}
                      totalMarks={totalMarks}
                      refresh={refreshSubmissions}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ColouredBox>
    </div>
  );
}
