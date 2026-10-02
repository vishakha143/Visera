import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobMatchesApi } from "@/api/jobMatches";

export function useJobMatches() {
  return useQuery({
    queryKey: ["job-matches"],
    queryFn: () => jobMatchesApi.list(),
  });
}

export function useJobMatch(id) {
  return useQuery({
    queryKey: ["job-matches", id],
    queryFn: () => jobMatchesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateJobMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => jobMatchesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-matches"] });
    },
  });
}

export function useDeleteJobMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => jobMatchesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-matches"] });
    },
  });
}
