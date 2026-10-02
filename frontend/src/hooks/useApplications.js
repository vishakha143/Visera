import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "@/api/applications";

const LIST_KEY = ["applications"];

export function useApplications() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: () => applicationsApi.list(),
  });
}

// Recomputes the per-status counts the same way the backend does, so a
// local cache patch never leaves the board's column counts stale.
function withRecountedApplications(old, applications) {
  const counts = applications.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    Object.fromEntries((old.statuses || []).map((s) => [s, 0]))
  );
  return { ...old, applications, counts };
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => applicationsApi.create(body),
    onSuccess: (data) => {
      const created = data?.application;
      if (!created) return;
      queryClient.setQueryData(LIST_KEY, (old) =>
        old ? withRecountedApplications(old, [created, ...old.applications]) : old
      );
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }) => applicationsApi.update(id, body),
    onSuccess: (data) => {
      const updated = data?.application;
      if (!updated) return;
      queryClient.setQueryData(LIST_KEY, (old) => {
        if (!old) return old;
        const applications = old.applications.map((a) =>
          a._id === updated._id ? updated : a
        );
        return withRecountedApplications(old, applications);
      });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => applicationsApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(LIST_KEY, (old) => {
        if (!old) return old;
        const applications = old.applications.filter((a) => a._id !== id);
        return withRecountedApplications(old, applications);
      });
    },
  });
}
