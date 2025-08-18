import { NextRequest } from "next/server";
import {
  createAuthenticatedRoute,
  apiRouteHandler,
} from "@/lib/api/route-handler";
import { httpClient } from "@/lib/api/http-client";
import { z } from "zod";

// Validation schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/)
    .optional(),
  avatar: z.string().url().optional(),
});

export const GET = createAuthenticatedRoute(
  async (request, context) => {
    const response = await httpClient.get("/auth/me");

    if (!response.success) {
      throw new Error("Failed to get user profile");
    }

    return apiRouteHandler.createSuccessResponse(response.data, 200, {
      cached: false,
      source: "backend",
    });
  },
  {
    cache: { ttl: 300 }, // Cache for 5 minutes
    audit: true,
  }
);

export const PUT = createAuthenticatedRoute(
  async (request, context) => {
    const body = await request.json();

    const response = await httpClient.put("/auth/me", body);

    if (!response.success) {
      throw new Error("Failed to update user profile");
    }

    return apiRouteHandler.createSuccessResponse(response.data, 200, {
      updated: true,
    });
  },
  {
    validateInput: updateProfileSchema,
    audit: true,
  }
);
