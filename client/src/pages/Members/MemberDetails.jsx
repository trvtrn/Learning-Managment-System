import React, { useContext, useState } from 'react';
import {
  IconButton,
  MenuItem,
  Select,
  TableRow,
  TableCell,
  tableCellClasses,
  selectClasses,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import DeleteWarningModal from '../../components/DeleteWarningModal';
import { CourseContext } from '../../utils/contexts';
import globalStyles from '../../index.module.css';

export default function MemberDetails({ changeRole, user, removeMember }) {
  const [showModal, setShowModal] = useState(false);
  const { role } = useContext(CourseContext);
  return (
    <>
      <TableRow
        sx={{
          padding: '0',
          [`& .${tableCellClasses.root}`]: {
            borderBottom: 'none',
          },
        }}
      >
        <TableCell className={globalStyles.normalCell}>
          {user.firstName} {user.lastName}
        </TableCell>
        <TableCell align="left" className={globalStyles.normalCell}>
          {user.email}
        </TableCell>
        <TableCell
          align="left"
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {role === 'Creator' && user.role !== 'Creator' ? (
            <>
              <Select
                onChange={(e) => {
                  changeRole(e.target.value, user.userId);
                }}
                value={user.role}
                size="small"
                variant="standard"
                disableUnderline
                sx={{
                  fontSize: '0.875rem',
                  border: 'none',
                  width: '5.5rem',
                  [`& .${selectClasses.select}`]: {
                    paddingBottom: 0,
                  },
                }}
              >
                <MenuItem value="Educator">Educator</MenuItem>
                <MenuItem value="Student">Student</MenuItem>
              </Select>
              <IconButton
                onClick={() => {
                  setShowModal(true);
                }}
                size="small"
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </>
          ) : (
            user.role
          )}
        </TableCell>
      </TableRow>
      {showModal && (
        <DeleteWarningModal
          helperText={`member ${user.firstName} ${user.lastName}`}
          setShowModal={setShowModal}
          handleDelete={() => removeMember(user.userId)}
        />
      )}
    </>
  );
}
