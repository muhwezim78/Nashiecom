import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsAPI } from "../services/api";

export const useProductReviews = (productId, params) => {
  return useQuery({
    queryKey: ["reviews", productId, params],
    queryFn: () => reviewsAPI.getProductReviews(productId, params),
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewData) => reviewsAPI.create(reviewData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
    },
  });
};

export const useReviewStats = (productId) => {
  return useQuery({
    queryKey: ["reviews", "stats", productId],
    queryFn: () => reviewsAPI.getProductReviews(productId, { limit: 1 }), // stats are included in the response
    enabled: !!productId,
  });
};
