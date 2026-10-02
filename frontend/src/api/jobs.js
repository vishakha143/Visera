import { apiClient } from "./client";

export const jobsApi = {
  status: () => apiClient.get("/jobs/status").then((r) => r.data),
  search: (params) => apiClient.get("/jobs/search", { params }).then((r) => r.data),
};
