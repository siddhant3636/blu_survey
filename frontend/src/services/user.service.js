import api from "./api";

const userService = {
  getUsers: async () => {
    return api.get("/users");
  },

  getUser: async (id) => {
    return api.get(`/users/${id}`);
  },

  createUser: async (userData) => {
    return api.post("/users", userData);
  },

  updateUser: async (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  deleteUser: async (id) => {
    return api.delete(`/users/${id}`);
  },
};

export default userService;
