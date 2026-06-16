import { getCurrentUserQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { CustomError } from "@/types/custom-error.type";

const useAuth = () => {
  const token = localStorage.getItem("authToken");

  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    staleTime: 0,
    enabled: !!token, // Only run query if token exists
    retry: (failureCount, error) => {
      // Don't retry if there's no token (401 error)
      const customError = error as CustomError;
      if (customError?.errorCode === "ACCESS_UNAUTHORIZED") {
        return false;
      }
      // Only retry 2 times for other errors
      return failureCount < 2;
    },
    // Don't refetch automatically if there's no token
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  return query;
};

export default useAuth;
