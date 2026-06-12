import axios from "axios";

// In the browser, resolve /api against the current origin → http://localhost:3000/api
// Next.js proxies this to the backend, so the browser never makes a cross-origin request.
// On the server (SSR), fall back to the direct backend URL.
const BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}${process.env.NEXT_PUBLIC_API_URL || "/api"}`
    : process.env.BACKEND_URL;

export const api = axios.create({
  baseURL: "https://openwork-ai-production.up.railway.app",
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);