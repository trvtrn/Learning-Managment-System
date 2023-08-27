import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Table, TableCell, TableHead, TableRow, TableBody, IconButton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import ColouredBox from '../../components/ColouredBox/ColouredBox';

export default function SubmissionTable({ submissions, totalMarks }) {
  const navigate = useNavigate();
  const { courseId, quizId } = useParams();
  return (
    <ColouredBox color="info" marginTopBottom="1rem" marginSide="0" paddingTopBottom="1rem">
      <Table sx={{ minWidth: '650px' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>Name</TableCell>
            <TableCell align="left" sx={{ width: '30%', fontWeight: 'bold' }}>
              Email
            </TableCell>
            <TableCell align="center" sx={{ width: '10%', fontWeight: 'bold' }}>
              Mark
            </TableCell>
            <TableCell align="left" sx={{ width: '25%', fontWeight: 'bold' }}>
              Marked By
            </TableCell>
            <TableCell align="center" sx={{ width: '10%', fontWeight: 'bold' }}>
              Submission
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.length > 0 ? (
            submissions.map((submission, idx) => (
              <TableRow key={idx}>
                <TableCell sx={{ borderBottom: 'none' }}>
                  {submission.firstName} {submission.lastName}
                </TableCell>
                <TableCell sx={{ borderBottom: 'none' }}>{submission.email}</TableCell>
                <TableCell align="center" sx={{ borderBottom: 'none' }}>
                  {submission.mark === null || submission.mark === undefined
                    ? '?'
                    : submission.mark}
                  /{totalMarks}
                </TableCell>
                <TableCell align="left" sx={{ borderBottom: 'none' }}>
                  {submission.markerFirstName
                    ? `${submission.markerFirstName} ${submission.markerLastName}`
                    : '-'}
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: 'none' }}>
                  <IconButton
                    onClick={() =>
                      navigate(`/${courseId}/quiz/${quizId}/mark/${submission.userId}`)
                    }
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ borderBottom: 'none' }}>
                No submissions have been made yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ColouredBox>
  );
}
