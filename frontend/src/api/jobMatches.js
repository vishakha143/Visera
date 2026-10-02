import { apiClient } from "./client";

export const jobMatchesApi = {
  list: () => apiClient.get("/job-matches").then((r) => r.data),

  get: (id) => apiClient.get(`/job-matches/${id}`).then((r) => r.data),

  create: (body) =>
    apiClient.post("/job-matches", body).then((r) => r.data),

  remove: (id) =>
    apiClient.delete(`/job-matches/${id}`).then((r) => r.data),
};
