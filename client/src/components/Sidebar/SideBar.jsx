import React, { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, useTheme, Divider } from '@mui/material';
import {
  AutoStoriesOutlined,
  EditNoteOutlined,
  GroupsOutlined,
  QuestionAnswerOutlined,
  SignalCellularAlt,
  ContactMailOutlined,
  BallotOutlined,
} from '@mui/icons-material';

import SideBarItem from './SideBarItem';

import styles from './SideBar.module.css';
import { CourseContext, UserContext } from '../../utils/contexts';

export default function SideBar() {
  const { role, courseName } = useContext(CourseContext);
  const { firstName, lastName } = useContext(UserContext);
  const { courseId } = useParams();
  const theme = useTheme();
  const links = [
    {
      label: 'Teaching Materials',
      icon: <AutoStoriesOutlined />,
      path: `${courseId}/materials`,
    },
    { label: 'Quizzes', icon: <BallotOutlined />, path: `${courseId}/quiz` },
    { label: 'Assignments', icon: <EditNoteOutlined />, path: `${courseId}/assignments` },
    { label: 'Forum', icon: <QuestionAnswerOutlined />, path: `${courseId}/forum` },
    { label: 'Online Classes', icon: <ContactMailOutlined />, path: `${courseId}/classes` },
  ];

  return (
    <Box
      className={styles.sideBarContainer}
      sx={{
        backgroundColor: theme.palette.custom.light,
        color: theme.palette.custom.defaultFont,
      }}
    >
      <List>
        <ListItem disablePadding>
          <Link
            to={`/course/${courseId}`}
            style={{ textDecoration: 'none', color: theme.palette.custom.defaultFont }}
          >
            <ListItemButton sx={{ padding: '0.4rem 0' }}>
              <div className={styles.sideBarItemContainer}>
                <h3 className={styles.sideBarHeading}>{courseName}</h3>
              </div>
            </ListItemButton>
          </Link>
        </ListItem>
        {links.map((link, idx) => (
          <SideBarItem key={idx} {...link} />
        ))}
        <Divider sx={{ margin: '0 auto', width: '80%' }} />
        <ListItem disablePadding>
          <div className={styles.sidebarBottomContainer}>
            <div className={styles.sidebarBottomIconContainer}>
              <Link
                to={`${courseId}/leaderboard`}
                style={{ textDecoration: 'none', color: theme.palette.custom.defaultFont }}
              >
                <ListItemButton className={styles.sidebarBottomIcon}>
                  <SignalCellularAlt
                    className={styles.sideBarIcon}
                    fontSize="large"
                    sx={{ color: theme.palette.custom.defaultFont }}
                  />
                  <div className={styles.sideBarSubheading}>Leaderboard</div>
                </ListItemButton>
              </Link>
              <Link
                to={`${courseId}/members`}
                style={{ textDecoration: 'none', color: theme.palette.custom.defaultFont }}
              >
                <ListItemButton className={styles.sidebarBottomIcon}>
                  <GroupsOutlined
                    className={styles.sideBarIcon}
                    fontSize="large"
                    sx={{ color: theme.palette.custom.defaultFont }}
                  />
                  <div className={styles.sideBarSubheading}>Members</div>
                </ListItemButton>
              </Link>
            </div>
            <div className={styles.sideBarSubheading}>{`${firstName} ${lastName}`}</div>
            <div className={styles.sideBarText}>{role}</div>
          </div>
        </ListItem>
      </List>
    </Box>
  );
}
