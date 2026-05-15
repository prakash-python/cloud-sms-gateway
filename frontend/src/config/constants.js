export const API_BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://192.168.1.37:8000/api' 
    : 'https://api.yourdomain.com/api'; // Placeholder for production

export const WS_BASE_URL = import.meta.env.MODE === 'development'
    ? 'ws://192.168.1.37:8000/ws'
    : 'wss://api.yourdomain.com/ws'; // Placeholder for production
