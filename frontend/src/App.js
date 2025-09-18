import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import HomeFeed from './pages/HomeFeed';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import ProfileOther from './pages/Profile/ProfileOther';
import { UserProvider } from './contexts/UserContext';
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OnlineStatusProvider } from './contexts/StatusContext';
import MessagesPage from './pages/Message/MessagesPage';
import FriendLayout from './pages/Friends/FriendLayout';
import AllFriend from './pages/Friends/AllFriend';
import Suggestions from './pages/Friends/Suggestions';
import FriendRequests from './pages/Friends/FriendRequests';
import RequestSent from './pages/Friends/RequestSent';
import ChatManager from './components/Chat/ChatManager';
import MatchingLayout from './pages/Matching/MatchingLayout';
import MatchingChallenge from './pages/Matching/MatchingChallenge';
import MatchingRequest from './pages/Matching/MatchingRequest';
import MatchingHistory from './pages/Matching/MatchingHistory';

function App() {
  return (
    <div className="App">
      <Router>
        <ThemeProvider>
          <OnlineStatusProvider>
            <UserProvider>
              <ChatProvider>
                <Routes>
                  <Route path='/' element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/register" element={<Register />} />
                  <Route path='/homefeed' element={<ProtectedRoute> <HomeFeed /> </ProtectedRoute>} />
                  <Route path='/dashboard' element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
                  <Route path='/profile' element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
                  <Route path='/profile/:userId' element={<ProtectedRoute> <ProfileOther /> </ProtectedRoute>} />
                  <Route path='/messages' element={<ProtectedRoute> <MessagesPage /> </ProtectedRoute>} />
                  <Route path='/friends' element={<ProtectedRoute> <FriendLayout /> </ProtectedRoute>}>
                    <Route index element={<Navigate to="all-friends" />} />
                    <Route path="all-friends" element={<AllFriend />} />
                    <Route path="suggestions" element={<Suggestions />} />
                    <Route path="friend-requests" element={<FriendRequests />} />
                    <Route path="request-sent" element={<RequestSent />} />
                  </Route>
                  <Route path='/matching' element={<ProtectedRoute> <MatchingLayout /> </ProtectedRoute>}>
                    <Route index element={<Navigate to="challenge" />} />
                    <Route path="challenge" element={<MatchingChallenge />} />
                    <Route path="match-hub" element={<MatchingRequest />} />
                    <Route path="history-hub" element={<MatchingHistory />} />
                  </Route>
                </Routes>
                <ChatManager />
              </ChatProvider>
            </UserProvider>
          </OnlineStatusProvider>
        </ThemeProvider>
      </Router>
    </div>
  );
}

export default App;