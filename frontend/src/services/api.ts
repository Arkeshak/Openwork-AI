import axios from "axios";

// Use relative /api path so Next.js proxy handles CORS
const BASE_URL = "/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Removed auth interceptors to make the app publicly accessible