// src/api/bookingApi.js

// Mock data: danh sách đặt chỗ ban đầu
let mockBookings = [
  {
    _id: 'b1',
    clubId: 'club-123',
    User: { Name: 'Nguyễn Văn A' },
    Table: { TableNumber: 1 },
    StartTime: new Date().toISOString(),
    EndTime: new Date(Date.now() + 3600000).toISOString(), // +1 giờ
    Status: 'pending',
  },
  {
    _id: 'b2',
    clubId: 'club-123',
    User: { Name: 'Trần Thị B' },
    Table: { TableNumber: 2 },
    StartTime: new Date().toISOString(),
    EndTime: new Date(Date.now() + 7200000).toISOString(), // +2 giờ
    Status: 'confirmed',
  },
];

// API giả lập
const bookingApi = {
  async getBookingsByClub(clubId) {
    console.log('Mock API: getBookingsByClub');
    return mockBookings.filter((b) => b.clubId === clubId);
  },

  async confirmBooking(bookingId) {
    console.log('Mock API: confirmBooking');
    mockBookings = mockBookings.map((b) =>
      b._id === bookingId ? { ...b, Status: 'confirmed' } : b
    );
    return { success: true };
  },

  async cancelBooking(bookingId) {
    console.log('Mock API: cancelBooking');
    mockBookings = mockBookings.map((b) =>
      b._id === bookingId ? { ...b, Status: 'cancelled' } : b
    );
    return { success: true };
  },
};

export default bookingApi;