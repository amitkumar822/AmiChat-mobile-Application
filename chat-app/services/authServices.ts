import { API_URL } from "@/constants";
import axios from "axios";

export const register = async (
  email: string,
  password: string,
  name: string,
  avatar?: string
): Promise<{ token: string }> => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "An unknown error occurred";
    throw new Error(errorMessage);
  }
};

export const login = async (
  email: string,
  password: string
): Promise<{ token: string }> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "An unknown error occurred";
    throw new Error(errorMessage);
  }
};
