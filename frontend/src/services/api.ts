import axios from "axios";

// In the browser, resolve /api against the current origin → http://localhost:3000/api
// Next.js proxies this to the backend, so the browser never makes a cross-origin request.
// On the server (SSR), fall back to the direct backend URL.
const BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}${process.env.NEXT_PUBLIC_API_URL || "/api"}`
    : process.env.BACKEND_URL;

export const api = axios.create({
  baseURL: BASE_URL,
});

// Removed auth interceptors to make the app publicly accessible