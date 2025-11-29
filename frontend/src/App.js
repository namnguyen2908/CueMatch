import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import HomeFeed from './pages/HomeFeed';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import ProfileOther from './pages/Profile/ProfileOther';
import { UserProvider } from './contexts/UserContext';
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OnlineStatusProvider } from './contexts/StatusContext';
import { MatchingProvider } from './contexts/MatchingContext';
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
import Calendar from './pages/Calendar';
import Pricing from './pages/Pricing';
import SubscriptionPlans from './pages/Dashboard/SubscriptionPlans/SubscriptionPlans';
import SavedPosts from './pages/SavedPosts';
import Payment from './pages/Payment';
import CreateClub from './pages/Partner/CreateClub';
import ClubDashboard from './pages/Partner/ClubDashboard';
import ClubProfile from './pages/Partner/ClubProfile';
import BilliardsTableManagement from './pages/Partner/BilliardsTableManagement';
import BookingDashboard from './pages/Partner/BookingDashboard';
import Wallet from './pages/Partner/Wallet';
import BilliardsManagement from './pages/Dashboard/BilliardsManagement/BilliardsManagement';
import UserManagement from './pages/Dashboard/UserManagement';
import WithdrawalManagement from './pages/Dashboard/WithdrawalManagement';
import BilliardsClubList from './pages/BilliardsClubList';
import BookTablePage from './pages/BookTablePage';
import SearchPage from './pages/SearchPage';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Withdrawal from './pages/Withdrawal';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <div className="App">
      <Router>
        <ThemeProvider>
          <UserProvider>
            <OnlineStatusProvider>
              <ChatProvider>
                <MatchingProvider>
                  <Routes>
                  <Route path='/' element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path='/homefeed' element={<ProtectedRoute> <HomeFeed /> </ProtectedRoute>} />
                  <Route path='/dashboard' element={<RoleProtectedRoute allowedRoles={['admin', 'administrator']}> <Dashboard /> </RoleProtectedRoute>} />
                  <Route path='/dashboard/users' element={<RoleProtectedRoute allowedRoles={['admin', 'administrator']}> <UserManagement /> </RoleProtectedRoute>} />
                  <Route path='/dashboard/withdrawals' element={<RoleProtectedRoute allowedRoles={['admin', 'administrator']}> <WithdrawalManagement /> </RoleProtectedRoute>} />
                  <Route path='/profile' element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
                  <Route path='/profile/:userId' element={<ProtectedRoute> <ProfileOther /> </ProtectedRoute>} />
                  <Route path='/messages' element={<ProtectedRoute> <MessagesPage /> </ProtectedRoute>} />
                  <Route path='/Calendar' element={<ProtectedRoute> <Calendar /> </ProtectedRoute>} />
                  <Route path='/pricing' element={<ProtectedRoute> <Pricing /> </ProtectedRoute>} />
                  <Route path='/dashboard/subscription-plans' element={<RoleProtectedRoute allowedRoles={['admin', 'administrator']}> <SubscriptionPlans /> </RoleProtectedRoute>} />
                  <Route path='/favourites' element={<ProtectedRoute> <SavedPosts /> </ProtectedRoute>} />
                  <Route path='/billiards-club' element={<RoleProtectedRoute allowedRoles="user"> <BilliardsClubList /> </RoleProtectedRoute>} />
                  <Route path='/book-table/:id' element={<RoleProtectedRoute allowedRoles="user"> <BookTablePage /> </RoleProtectedRoute>} />
                  <Route path='/payment/:planId' element={<ProtectedRoute> <Payment /> </ProtectedRoute>} />
                  <Route path='/transactions' element={<ProtectedRoute> <Transactions /> </ProtectedRoute>} />
                  <Route path='/transactions/:transactionId' element={<ProtectedRoute> <TransactionDetail /> </ProtectedRoute>} />
                  <Route path='/withdrawal' element={<ProtectedRoute> <Withdrawal /> </ProtectedRoute>} />
                  <Route path='/my-bookings' element={<ProtectedRoute> <MyBookings /> </ProtectedRoute>} />
                  <Route path='/search' element={<ProtectedRoute> <SearchPage /> </ProtectedRoute>} />
                  <Route path='/partner/create-club' element={<RoleProtectedRoute allowedRoles="partner"> <CreateClub /> </RoleProtectedRoute>} />
                  <Route path='/club-dashboard' element={<RoleProtectedRoute allowedRoles="partner"> <ClubDashboard /> </RoleProtectedRoute>} />
                  <Route path='/club-dashboard/profile' element={<RoleProtectedRoute allowedRoles="partner"> <ClubProfile /> </RoleProtectedRoute>} />
                  <Route path='/club-dashboard/table-management' element={<RoleProtectedRoute allowedRoles="partner"> <BilliardsTableManagement /> </RoleProtectedRoute>} />
                  <Route path='/club-dashboard/bookings' element={<RoleProtectedRoute allowedRoles="partner"> <BookingDashboard /> </RoleProtectedRoute>} />
                  <Route path='/club-dashboard/wallet' element={<RoleProtectedRoute allowedRoles="partner"> <Wallet /> </RoleProtectedRoute>} />
                  <Route path='/dashboard/billiards-management' element={<RoleProtectedRoute allowedRoles={['admin', 'administrator']}> <BilliardsManagement /> </RoleProtectedRoute>} />
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
                </MatchingProvider>
              </ChatProvider>
            </OnlineStatusProvider>
          </UserProvider>
        </ThemeProvider>
      </Router>
    </div>
  );
}

export default App;