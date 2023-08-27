import React, { useRef, useContext, useState } from 'react';
import {
  Button,
  Modal,
  IconButton,
  TextField,
  MenuItem,
  useTheme,
  Select,
  Box,
  Table,
  TableHead,
  TableCell,
  Alert,
  TableBody,
  TableRow,
} from '@mui/material';
import { AddCircle } from '@mui/icons-material';

import ListedMember from './ListedMember';
import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import { UserContext } from '../../../utils/contexts';
import { isValidEmail } from '../../../utils/helpers';

import styles from './Modal.module.css';

export default function AddMembersModal({ open, onClose, handleSubmit, hideSkipButton }) {
  const theme = useTheme();
  const buttonRef = useRef(null);
  const { email } = useContext(UserContext);
  const [newEmail, setNewEmail] = React.useState('');
  const [newRole, setNewRole] = React.useState('Student');
  const [members, setMembers] = useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');

  const listNewMember = (e) => {
    e.preventDefault();
    if (!isValidEmail(newEmail)) {
      setErrorMessage('Please enter a valid email');
      return;
    }
    if (email === newEmail.trim()) {
      setErrorMessage('You cannot invite yourself');
      return;
    }
    if (members.some((member) => member.email === newEmail.trim())) {
      setErrorMessage('User already added');
      return;
    }
    setErrorMessage('');
    setMembers((prev) => [...prev, { email: newEmail, role: newRole }]);
    setNewEmail('');
    setNewRole('Student');
    buttonRef.current.scrollIntoView();
  };

  const removeMember = (emailToRemove) => {
    setMembers(
      members.filter((value) => {
        return value.email !== emailToRemove;
      })
    );
  };

  const onSubmit = () => {
    handleSubmit(members, (e) => setErrorMessage(e.message));
  };

  return (
    <Modal onClose={onClose} open={open} className={styles.homeModal}>
      <Box>
        <ColouredBox
          maxHeight="80vh"
          width="590px"
          marginSide="0px"
          marginTopBottom="0px"
          paddingSide="30px"
        >
          <div className={styles.homeModalContainer}>
            <h3 className={styles.homeModalHeading}>Add Members</h3>
            {members.length !== 0 && (
              <div className={styles.tableContainer}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody className={styles.homeModalNewUserList}>
                    {members.map((member) => {
                      return <ListedMember key={member.email} remove={removeMember} {...member} />;
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <form
              onSubmit={listNewMember}
              className={styles.homeModalNewUsersContainer}
              style={{ backgroundColor: theme.palette.custom.light }}
            >
              <h4 className={styles.homeModalNewUserHeading}>Enter member email and role</h4>
              <div className={styles.homeModalNewUserInputContainer}>
                <TextField
                  label="Email"
                  variant="outlined"
                  size="small"
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                  }}
                  sx={{
                    width: '290px',
                    marginLeft: '12px',
                    backgroundColor: theme.palette.custom.background,
                    borderRadius: '5px',
                  }}
                />
                <Select
                  size="small"
                  value={newRole}
                  onChange={(e) => {
                    setNewRole(e.target.value);
                  }}
                  sx={{ width: '130px', backgroundColor: theme.palette.custom.background }}
                >
                  <MenuItem value="Student">Student</MenuItem>
                  <MenuItem value="Educator">Educator</MenuItem>
                </Select>
                <IconButton type="submit">
                  <AddCircle sx={{ color: theme.palette.primary.main }} />
                </IconButton>
              </div>
            </form>
            {errorMessage && (
              <Alert severity="error" className={styles.homeModalErrorMessage}>
                {errorMessage}
              </Alert>
            )}
            <div className={styles.homeModalButtonContainer}>
              <Button variant="outlined" color="primary" onClick={onClose}>
                Cancel
              </Button>
              {(members.length !== 0 || !hideSkipButton) && (
                <Button onClick={onSubmit} variant="contained" color="primary">
                  {members.length !== 0 ? 'Invite' : 'Skip'}
                </Button>
              )}
            </div>
          </div>
          <Box ref={buttonRef} />
        </ColouredBox>
      </Box>
    </Modal>
  );
}
