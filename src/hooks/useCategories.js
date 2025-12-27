import { useQuery } from "@tanstack/react-query";
import { categoriesAPI } from "../services/api";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getAll(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
