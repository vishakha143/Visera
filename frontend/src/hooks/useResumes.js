import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumesApi } from "@/api/resumes";

export function useResumesList() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const data = await resumesApi.list();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.resumes)) return data.resumes;
      if (Array.isArray(data?.data)) return data.data;
      return []; // never mock
    },
  });
}

export function useResume(id) {
  return useQuery({
    queryKey: ["resumes", id],
    queryFn: () => resumesApi.get(id), // no findMockResume
    enabled: !!id,
  });
}


// Get full version details
export function useFullVersion(resumeId, versionId) {
  return useQuery({
    queryKey: ["resumes", resumeId, "versions", versionId],
    queryFn: () => resumesApi.getVersion(resumeId, versionId),
    enabled: !!resumeId && !!versionId,
  });
}

// Get analysis for a version
export function useAnalysisForVersion(resumeId, versionId) {
  return useQuery({
    queryKey: ["resumes", resumeId, "analysis", versionId],
    queryFn: () => resumesApi.analysisForVersion(resumeId, versionId),
    enabled: !!resumeId && !!versionId,
  });
}

// Upload a resume
export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, title }) => resumesApi.upload(file, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

// Run analysis
export function useAnalyzeResume(resumeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload = {}) => resumesApi.analyze(resumeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes", resumeId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Apply rewrites
export function useApplyRewrites(resumeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => resumesApi.applyRewrites(resumeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes", resumeId] });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => resumesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}