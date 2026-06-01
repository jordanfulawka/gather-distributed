import { io } from 'socket.io-client';

const API_URL =
  typeof window !== 'undefined'
    ? `http://${window.location.hostname}`
    : 'http://localhost';

const socket = io(`${API_URL}`, {
  autoConnect: false,
});

export { socket };
