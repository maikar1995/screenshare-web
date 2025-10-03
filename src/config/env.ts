import { config } from 'dotenv';

config();

export const API_BASE_URL = process.env.VITE_API_BASE_URL || '';
export const WS_API_URL = process.env.VITE_WS_API_URL || '';