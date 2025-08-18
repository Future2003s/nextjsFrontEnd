import { http } from "@/lib/http";

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  data: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data: Review;
}

export const reviewsApiRequest = {
  // Get reviews for a product
  getProductReviews: (
    productId: string,
    page = 1,
    limit = 10
  ): Promise<ReviewsResponse> => {
    return http.get(
      `/reviews/product/${productId}?page=${page}&limit=${limit}`
    );
  },

  // Get user's reviews
  getUserReviews: (
    token: string,
    page = 1,
    limit = 10
  ): Promise<ReviewsResponse> => {
    return http.get(`/reviews/user?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Create new review
  createReview: (
    token: string,
    body: CreateReviewRequest
  ): Promise<ReviewResponse> => {
    return http.post("/reviews", body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Update review
  updateReview: (
    token: string,
    reviewId: string,
    body: UpdateReviewRequest
  ): Promise<ReviewResponse> => {
    return http.put(`/reviews/${reviewId}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Delete review
  deleteReview: (
    token: string,
    reviewId: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.delete(`/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Mark review as helpful
  markHelpful: (
    token: string,
    reviewId: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.post(
      `/reviews/${reviewId}/helpful`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Get review statistics for a product
  getProductReviewStats: (
    productId: string
  ): Promise<{
    success: boolean;
    data: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: {
        [key: number]: number;
      };
    };
  }> => {
    return http.get(`/reviews/product/${productId}/stats`);
  },

  // Admin: Get all reviews
  getAllReviews: (
    token: string,
    filters?: {
      productId?: string;
      userId?: string;
      rating?: number;
      isVerified?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<ReviewsResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString
      ? `/reviews/admin?${queryString}`
      : "/reviews/admin";

    return http.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Admin: Verify review
  verifyReview: (
    token: string,
    reviewId: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.put(
      `/reviews/${reviewId}/verify`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
};
