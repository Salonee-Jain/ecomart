import api from "./api";

export const register = (data: any) =>
  api.post("/auth/register", data);

export const login = (data: any) =>
  api.post("/auth/login", data);

export const getProfile = () =>
  api.get("/auth/profile");
