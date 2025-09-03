import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import HomeFeed from './pages/HomeFeed';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile';
import { UserProvider } from './contexts/UserContext';
import MessagesPage from './pages/Message/MessagesPage';
import Friends from './pages/Friends';
function App() {
  return (
    <div className="App">
      <UserProvider>
        <Router>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/register" element={<Register />} />
            <Route path='/homefeed' element={<ProtectedRoute> <HomeFeed /> </ProtectedRoute>} />
            <Route path='/dashboard' element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
            <Route path='/profile' element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
            <Route path='/messages' element={<ProtectedRoute> <MessagesPage/> </ProtectedRoute>} />
            <Route path='/friends' element={<ProtectedRoute> <Friends/> </ProtectedRoute>} />
          </Routes>
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;