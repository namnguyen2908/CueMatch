// src/api/friendApi
import api from './api'; // import axios instance của bạn

const friendApi = {
  sendFriendRequest: (toUserId) => {
    return api.post('/friends/send-request', { To: toUserId });
  },

  acceptFriendRequest: (fromUserId) => {
    return api.post('/friends/accept-request', { From: fromUserId });
  },

  rejectFriendRequest: (fromUserId) => {
    return api.post('/friends/reject-request', { From: fromUserId });
  },

  cancelFriendRequest: (toUserId) => {
    return api.post('/friends/cancel-request', { To: toUserId });
  },

  unfriend: (userBId) => {
    return api.post('/friends/unfriend', { userB: userBId });
  },

  getFriends: () => {
    return api.get('/friends/friends');
  },

  getSentRequests: () => {
    return api.get('/friends/sent-requests');
  },

  getReceivedRequests: () => {
    return api.get('/friends/received-requests');
  },

  suggestFriends: () => {
    return api.get('/friends/suggestions');
  },
};

export default friendApi;