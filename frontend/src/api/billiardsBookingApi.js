import api from './api';

const billiardsBookingApi = {
    bookTable: async (data) => {
        const res = await api.post('/billiards-booking/book-table', data);
        return res.data;
    },

    cancelBooking: async (bookingId) => {
        const res = await api.put(`/billiards-booking/cancel-booking/${bookingId}`);
        return res.data;
    },

    checkIn: async (bookingId) => {
        const res = await api.put(`/billiards-booking/check-in/${bookingId}`);
        return res.data;
    },

    checkOut: async (bookingId) => {
        const res = await api.put(`/billiards-booking/check-out/${bookingId}`);
        return res.data;
    },

    getUserBookings: async (params) => {
        const res = await api.get('/billiards-booking/get-bookings', { params });
        return res.data;
    },

    openNow: async (data) => {
        const res = await api.post('/billiards-booking/open-table', data);
        return res.data;
    },

    endPlay: async (bookingId) => {
        const res = await api.put(`/billiards-booking/end-play/${bookingId}`);
        return res.data;
    },

    previewEndPlay: async (bookingId) => {
        const res = await api.get(`/billiards-booking/preview-bookings/${bookingId}`);
        return res.data;
    }
}

export default billiardsBookingApi;