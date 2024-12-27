"use server";

import { revalidatePath } from "next/cache";

interface DashboardData {
  totalUsers: number;
  totalQuestions: number;
  totalDocuments: number;
  revenueStats: {
    total: number;
    recurring: number;
    oneTime: number;
  };
  userGrowth: {
    percentage: number;
    trend: "up" | "down";
  };
  activeSubscriptions: number;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    validUntil: string;
  } | null;
  stats: {
    questions: number;
    documents: number;
  };
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch("/api/admin/dashboard", {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new APIError(response.status, "Failed to fetch dashboard data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    throw error instanceof APIError
      ? error
      : new APIError(500, "Internal server error");
  }
}

export async function fetchUserData(): Promise<UserData[]> {
  try {
    const response = await fetch("/api/admin/users", {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new APIError(response.status, "Failed to fetch user data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("User data fetch error:", error);
    throw error instanceof APIError
      ? error
      : new APIError(500, "Internal server error");
  }
}

export async function updateUserData(
  userData: Partial<UserData>
): Promise<void> {
  try {
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new APIError(response.status, "Failed to update user data");
    }

    revalidatePath("/admin");
  } catch (error) {
    console.error("User data update error:", error);
    throw error instanceof APIError
      ? error
      : new APIError(500, "Internal server error");
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new APIError(response.status, "Failed to delete user");
    }

    revalidatePath("/admin");
  } catch (error) {
    console.error("User deletion error:", error);
    throw error instanceof APIError
      ? error
      : new APIError(500, "Internal server error");
  }
}

export async function exportUserData(): Promise<Blob> {
  try {
    const response = await fetch("/api/admin/users/export", {
      method: "GET",
    });

    if (!response.ok) {
      throw new APIError(response.status, "Failed to export user data");
    }

    return await response.blob();
  } catch (error) {
    console.error("User data export error:", error);
    throw error instanceof APIError
      ? error
      : new APIError(500, "Internal server error");
  }
}
