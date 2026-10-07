import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch {
    // ignore
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // An expired/invalid session would otherwise leave the user "signed in"
    // with every request failing. Sign-in/reset calls legitimately return 401
    // (wrong password), so only act when we were holding a saved session.
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !url.startsWith("/auth/")) {
      try {
        if (localStorage.getItem("auth_user")) {
          localStorage.removeItem("auth_user");
          if (!/^\/(login|register|forgot-password|reset-password)/.test(window.location.pathname)) {
            window.location.assign("/login");
          }
        }
      } catch {
        // ignore
      }
    }

    const message =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      "Request failed";
    return Promise.reject({
      status: err.response?.status,
      message,
      details: err.response?.data?.error?.details,
      original: err,
    });
  }
);

export { apiClient };
export default apiClient;