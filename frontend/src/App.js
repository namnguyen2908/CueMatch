import React from 'react';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import HomeFeed from './pages/HomeFeed';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/register" element={<Register />} />
          <Route path='/homefeed' element={<ProtectedRoute><HomeFeed /></ProtectedRoute>} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;