import api from "./authApi";

const userApi = {

    getUserDetail: async (userId) => {
        const path = userId ? `/user/detail-user/${userId}` : '/user/detail-user';
        const res = await api.get(path);
        return res.data;
    },

    deleteUser: async () => {

    },

    updateUser: async (formData) => {

    },
}

export default userApi;