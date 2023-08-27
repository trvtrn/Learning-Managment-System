import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider } from '@mui/material';
import theme from './utils/themes';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import PasswordReset from './pages/PasswordReset/PasswordReset';
import HomeDashboard from './pages/HomeDashboard/HomeDashboard';
import CourseDashboard from './pages/CourseDashboard/CourseDashboard';
import Classes from './pages/Classes/Classes';
import Class from './pages/Class/Class';
import TeachingMaterialsOverview from './pages/TeachingMaterialsOverview/TeachingMaterialsOverview';
import TeachingMaterial from './pages/TeachingMaterial/TeachingMaterial';
import TeachingMaterialEdit from './pages/TeachingMaterialsEditor/TeachingMaterialEditor';
import AssignmentsOverview from './pages/AssignmentsOverview/AssignmentsOverview';
import AssignmentPage from './pages/AssignmentPage/AssignmentPage';
import AssignmentEditor from './pages/AssignmentEditor/AssignmentEditor';
import Forum from './pages/Forum/Forum';
import ForumPostEditor from './pages/ForumPostEditor/ForumPostEditor';
import ResetLinkEmail from './pages/PasswordReset/ResetLinkEmail';
import ForumPost from './pages/ForumPost/ForumPost';
import Members from './pages/Members/Members';
import QuizzesOverview from './pages/QuizzesOverview/QuizzesOverview';
import QuizStart from './pages/QuizOverview/QuizOverview';
import Quiz from './pages/Quiz/Quiz';
import QuizMarking from './pages/QuizMarking/QuizMarking';
import QuizEdit from './pages/QuizEditor/QuizEditor';
import SideBarLayout from './layouts/SideBarLayout/SideBarLayout';
import NavLayout from './layouts/NavLayout/NavLayout';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import { getUser } from './utils/api/auth';
import { UserContext } from './utils/contexts';

function App() {
  const [userId, setUserId] = useState();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getUser(navigate)
      .then((data) => {
        setUserId(data.userId);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
      })
      .catch((err) => console.error(err.message));
  }, [userId, navigate]);

  return (
    <UserContext.Provider
      value={{ userId, email, firstName, lastName, setUserId, setEmail, setFirstName, setLastName }}
    >
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/linkreset" element={<ResetLinkEmail />} />
            <Route path="/reset" element={<PasswordReset />} />
            <Route path="/class/:classId" element={<Class />} />
            <Route element={<NavLayout />}>
              <Route path="/home" element={<HomeDashboard />} />
            </Route>
            <Route element={<SideBarLayout />}>
              <Route path="/course/:courseId" element={<CourseDashboard />} />
              <Route path="/:courseId/classes" element={<Classes />} />
              <Route path="/:courseId/materials" element={<TeachingMaterialsOverview />} />
              <Route path="/:courseId/assignments" element={<AssignmentsOverview />} />
              <Route path="/:courseId/assignments/:assignmentId" element={<AssignmentPage />} />
              <Route
                path="/:courseId/assignments/edit/:assignmentId?"
                element={<AssignmentEditor />}
              />
              <Route path="/:courseId/materials/:materialId" element={<TeachingMaterial />} />
              <Route
                path="/:courseId/materials/edit/:materialId?"
                element={<TeachingMaterialEdit />}
              />
              <Route path="/:courseId/forum" element={<Forum />} />
              <Route path="/:courseId/forum/edit/:postId?" element={<ForumPostEditor />} />
              <Route path="/:courseId/post/:postId" element={<ForumPost />} />
              <Route path="/:courseId/members" element={<Members />} />
              <Route path="/:courseId/quiz" element={<QuizzesOverview />} />
              <Route path="/:courseId/quiz/:quizId" element={<QuizStart />} />
              <Route path="/:courseId/quiz/:quizId/attempt" element={<Quiz />} />
              <Route path="/:courseId/quiz/:quizId/mark/:userId" element={<QuizMarking />} />
              <Route path="/:courseId/quiz/edit/:quizId?" element={<QuizEdit />} />
              <Route path="/:courseId/leaderboard" element={<Leaderboard />} />
            </Route>
          </Routes>
        </LocalizationProvider>
      </ThemeProvider>
    </UserContext.Provider>
  );
}

export default App;
