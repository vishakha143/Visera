import { apiClient } from "./client";

export const applicationsApi = {
  list: () => apiClient.get("/applications").then((r) => r.data),

  create: (body) =>
    apiClient.post("/applications", body).then((r) => r.data),

  update: (id, body) =>
    apiClient.patch(`/applications/${id}`, body).then((r) => r.data),

  remove: (id) =>
    apiClient.delete(`/applications/${id}`).then((r) => r.data),
};
