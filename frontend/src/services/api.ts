// frontend/src/services/api.ts
import axios from "axios";

declare global {
  interface Window {
    __ENV__?: {
      API_BASE_URL?: string;
      BACKEND_ADDRESS?: string; // fallback si tu avais l’ancien nom
      WS_ENDPOINT?: string;
    };
  }
}

const baseURL =
  window.__ENV__?.API_BASE_URL ??
  window.__ENV__?.BACKEND_ADDRESS ??
  ""; // "" => same-origin (pratique derrière un reverse-proxy)

export const api = axios.create({
  baseURL,
  // withCredentials not needed - using JWT Bearer tokens via Authorization header
});

// Optionnel mais très pratique : ton AuthProvider peut appeler ça
export function setApiAuthToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}
