import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://openwork-ai-production.up.railway.app";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Removed auth interceptors to make the app publicly accessible