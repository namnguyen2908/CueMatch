import api from "./authApi";

const userApi = {

    getUserDetail: async (userId) => {
        const path = userId ? `/user/detail-user/${userId}` : '/user/detail-user';
        const res = await api.get(path);
        return res.data;
    },

    updateUser: async (formData) => {
        const res = await api.put('/user/edit-user', formData);
        return res.data;
    },
}

export default userApi;