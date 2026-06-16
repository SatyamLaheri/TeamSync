/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceByIdQueryFn } from "@/lib/api";
import { CustomError } from "@/types/custom-error.type";

const useGetWorkspaceQuery = (workspaceId: string) => {
  const query = useQuery<any, CustomError>({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceByIdQueryFn(workspaceId),
    staleTime: 0,
    enabled: !!workspaceId,
    retry: (failureCount, error) => {
      // Don't retry if there's no access (401 error)
      if (
        error?.errorCode === "ACCESS_UNAUTHORIZED" ||
        error?.errorCode === "RESOURCE_NOT_FOUND"
      ) {
        return false;
      }
      // Only retry 2 times for other errors
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return query;
};

export default useGetWorkspaceQuery;
