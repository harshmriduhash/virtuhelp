import { toast } from "@/hooks/use-toast";

// Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  plan: "FREE" | "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  subscription?: Subscription;
  usage: Usage;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  startDate: string;
  endDate: string;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  price: number;
  interval: "monthly" | "yearly";
  paymentMethod: {
    type: "card" | "paypal";
    last4?: string;
    brand?: string;
  };
}

export interface Usage {
  questionsUsed: number;
  questionsLimit: number;
  documentsUsed: number;
  documentsLimit: number;
  storageUsed: number;
  storageLimit: number;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "succeeded" | "failed" | "pending" | "refunded";
  createdAt: string;
  paymentMethod: {
    type: "card" | "paypal";
    last4?: string;
    brand?: string;
  };
  subscription?: {
    id: string;
    plan: string;
  };
}

export interface AdminStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    monthlyRevenue: number;
  };
  usageStats: {
    totalQuestions: number;
    totalDocuments: number;
    averageQuestionsPerUser: number;
    averageDocumentsPerUser: number;
  };
  subscriptions: {
    free: number;
    pro: number;
    enterprise: number;
  };
  revenueHistory: Array<{
    date: string;
    revenue: number;
    subscriptions: number;
  }>;
  userGrowth: Array<{
    date: string;
    totalUsers: number;
    activeUsers: number;
  }>;
}

export interface FileItem {
  file_id: string;
  filename: string;
  size: number;
  uploadedAt: string;
  type: string;
}

export interface Assistant {
  id: string;
  object: string;
  created_at: number;
  name: string;
  description: string | null;
  model: string;
  instructions: string | null;
  tools: Array<{
    type: string;
    [key: string]: any;
  }>;
  file_ids?: string[];
  metadata: Record<string, any>;
}

// API Client
class AdminApiClient {
  private baseUrl = "/api/admin";

  private handleUnauthorized() {
    const currentPath = window.location.pathname;
    const loginUrl = new URL("/admin-login", window.location.origin);

    // Only add callbackUrl if we're not already on /admin
    if (currentPath !== "/admin") {
      loginUrl.searchParams.set("callbackUrl", currentPath);
    }

    window.location.href = loginUrl.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  // Auth Endpoints
  async login(email: string, password: string): Promise<{ token: string }> {
    const response = await fetch(`/api/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    return this.handleResponse<{ token: string }>(response);
  }

  async logout(): Promise<void> {
    const response = await fetch(`/api/admin/auth`, {
      method: "DELETE",
      credentials: "include",
    });

    return this.handleResponse<void>(response);
  }

  async checkSession(): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/auth`, {
        credentials: "include",
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // User Management Endpoints
  async getUsers(params?: {
    search?: string;
    plan?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set("search", params.search);
    if (params?.plan) queryParams.set("plan", params.plan);
    if (params?.status) queryParams.set("status", params.status);
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());

    const response = await fetch(
      `${this.baseUrl}/users?${queryParams.toString()}`,
      {
        credentials: "include",
      }
    );

    return this.handleResponse<{
      users: User[];
      total: number;
      page: number;
      totalPages: number;
    }>(response);
  }

  async updateUser(
    userId: string,
    data: Partial<User>
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ success: boolean }>(response);
  }

  // Payment & Subscription Endpoints
  async getPayments(params?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.set("userId", params.userId);
    if (params?.status) queryParams.set("status", params.status);
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());

    const response = await fetch(
      `${this.baseUrl}/payments?${queryParams.toString()}`,
      {
        credentials: "include",
      }
    );

    return this.handleResponse<{
      payments: Payment[];
      total: number;
      page: number;
      totalPages: number;
    }>(response);
  }

  async refundPayment(
    paymentId: string,
    reason?: string
  ): Promise<{ success: boolean }> {
    const response = await fetch(
      `${this.baseUrl}/payments/${paymentId}/refund`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      }
    );

    return this.handleResponse<{ success: boolean }>(response);
  }

  // Stats Endpoints
  async getStats(
    timeframe: "day" | "week" | "month" | "year" = "month"
  ): Promise<AdminStats> {
    const response = await fetch(
      `${this.baseUrl}/stats?timeframe=${timeframe}`,
      {
        credentials: "include",
      }
    );

    return this.handleResponse<AdminStats>(response);
  }

  // File Management Endpoints
  async getFiles(): Promise<FileItem[]> {
    const response = await fetch("/api/assistants/files", {
      credentials: "include",
    });
    return this.handleResponse<FileItem[]>(response);
  }

  async uploadFile(file: File): Promise<{ file_id: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/assistants/files", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return this.handleResponse<{ file_id: string }>(response);
  }

  async deleteFile(fileId: string): Promise<{ success: boolean }> {
    const response = await fetch("/api/assistants/files", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });

    return this.handleResponse<{ success: boolean }>(response);
  }

  // Assistant Management Endpoints
  async getAssistant(): Promise<Assistant> {
    const response = await fetch("/api/assistants/config", {
      credentials: "include",
    });
    return this.handleResponse<Assistant>(response);
  }

  async updateAssistant(data: Partial<Assistant>): Promise<Assistant> {
    const response = await fetch("/api/assistants/config", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return this.handleResponse<Assistant>(response);
  }
}

// Export singleton instance
export const adminApi = new AdminApiClient();
