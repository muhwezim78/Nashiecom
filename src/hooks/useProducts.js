import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { productsAPI } from "../services/api";

export const useProducts = (params) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsAPI.getAll(params),
    placeholderData: keepPreviousData,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productsAPI.getById(id),
    enabled: !!id,
  });
};

export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: ["products", "featured", limit],
    queryFn: () => productsAPI.getFeatured(limit),
  });
};

export const useSearchProducts = (query) => {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: () => productsAPI.search(query),
    enabled: !!(query && query.length >= 2),
  });
};
