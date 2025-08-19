import api from "./authApi";

const userApi = {
    getUserDetail: async () => {
        const res = await api.get("/user/detail-user");
        return res.data;
    },

    deleteUser: async () => {

    },

    updateUser: async (formData) => {

    },
}

export default userApi;