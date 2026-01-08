import axios from "axios";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseURL = `http://${(window as any).__ENV__?.BACKEND_ADDRESS}`;

export const api = axios.create({
  baseURL,
  withCredentials: true, // obligatoire pour envoyer le cookie refresh_token
});

export const setApiToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
