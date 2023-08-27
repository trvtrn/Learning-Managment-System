import React, { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import { ChatBubbleOutlineRounded, PeopleOutlined } from '@mui/icons-material';
import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import ChatMessages from './ChatMessages/ChatMessages';
import styles from './ClassSideBar.module.css';
import Participants from './Participants/Participants';

export default function ClassSideBar({ classId, wsRef, messages, participants, hasEnteredClass }) {
  const [tab, setTab] = useState(0);
  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };
  return (
    <ColouredBox
      height="100vh"
      width="25vw"
      minWidth="220px"
      maxWidth="300px"
      paddingTopBottom={0}
      paddingSide={0}
      marginSide={0}
      marginTopBottom={0}
      position="absolute"
      right={0}
      color="purple"
    >
      <div className={styles.sideBarContainer}>
        <Tabs value={tab} onChange={handleChangeTab}>
          <Tab sx={{ width: '50%' }} icon={<ChatBubbleOutlineRounded />} aria-label="Chat" />
          <Tab sx={{ width: '50%' }} icon={<PeopleOutlined />} aria-label="Participants" />
        </Tabs>
        {tab !== 0 || (
          <ChatMessages messages={messages} wsRef={wsRef} hasEnteredClass={hasEnteredClass} />
        )}
        {tab !== 1 || <Participants participants={participants} />}
      </div>
    </ColouredBox>
  );
}
