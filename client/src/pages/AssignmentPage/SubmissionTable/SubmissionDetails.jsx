import React from 'react';
import { useNavigate } from 'react-router-dom';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { IconButton, Collapse } from '@mui/material';
import { FileDownloadOutlined, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material/';

import MarkingContainer from './MarkingContainer';
import { downloadAndSaveFile } from '../../../utils/api/file';

export default function SubmissionDetails({ submission, totalMarks, refresh }) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const handleDownload = () => {
    downloadAndSaveFile(submission.fileId, submission.fileName, navigate);
  };

  return (
    <>
      <TableRow>
        <TableCell sx={{ borderBottom: 'none' }}>{submission.studentName}</TableCell>
        <TableCell align="left" sx={{ borderBottom: 'none' }}>
          {submission.email}
        </TableCell>
        <TableCell align="center" sx={{ borderBottom: 'none' }}>
          {submission.mark !== null ? submission.mark : '-'}
        </TableCell>
        <TableCell align="left" sx={{ borderBottom: 'none' }}>
          {submission.markerName || '-'}
        </TableCell>
        <TableCell align="center" sx={{ borderBottom: 'none' }}>
          <IconButton onClick={handleDownload}>
            <FileDownloadOutlined />
          </IconButton>
        </TableCell>
        <TableCell align="center" sx={{ borderBottom: 'none' }}>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={6}
          sx={{ borderBottom: 'none' }}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <MarkingContainer
              existingMark={submission.mark}
              existingComment={submission.comment}
              submissionId={submission.submissionId}
              totalMarks={totalMarks}
              setOpen={setOpen}
              refresh={refresh}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
