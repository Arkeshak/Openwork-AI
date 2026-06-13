import axios from "axios";

// Force absolute URL to bypass Next.js API proxy entirely on Vercel
const envUrl = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = (envUrl && envUrl.startsWith("http")) 
  ? envUrl 
  : "https://openwork-ai-production.up.railway.app";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Removed auth interceptors to make the app publicly accessible