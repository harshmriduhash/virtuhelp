"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  CreditCard,
  FileText,
  MessageSquare,
  TrendingUp,
  Activity,
} from "lucide-react";

interface AdminStats {
  users: {
    total: number;
  };
  subscriptions: Record<string, number>;
  activity: {
    totalQuestions: number;
    totalDocuments: number;
  };
  subscriptionDetails: Array<{
    userId: string;
    email: string;
    plan: string;
    questionsUsed: number;
    documentsUsed: number;
    validUntil: string;
    status: string;
  }>;
  usageMetrics: Array<{
    plan: string;
    avgQuestionsPerUser: number;
    avgDocumentsPerUser: number;
    totalRevenue: number;
  }>;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-gray-600">No statistics available</div>
      </div>
    );
  }

  const subscriptionRevenue = stats.subscriptions
    ? Object.entries(stats.subscriptions || {}).reduce(
        (total, [plan, count]) => {
          const prices: Record<string, number> = {
            BASIC: 9.99,
            PREMIUM: 19.99,
            ENTERPRISE: 49.99,
          };
          return total + (prices[plan] || 0) * count;
        },
        0
      )
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">
                  {stats.users.total}
                </h3>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Monthly Revenue
                </p>
                <h3 className="text-2xl font-bold">
                  ${subscriptionRevenue.toFixed(2)}
                </h3>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Documents
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.activity.totalDocuments}
                </h3>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Questions
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.activity.totalQuestions}
                </h3>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Distribution</CardTitle>
          <CardDescription>
            Breakdown of users by subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.subscriptions || {}).map(([plan, count]) => (
              <div
                key={plan}
                className="bg-gray-50 p-4 rounded-lg text-center space-y-2"
              >
                <h4 className="font-semibold text-gray-700">{plan}</h4>
                <p className="text-2xl font-bold text-blue-600">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Questions per subscription type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <Activity className="h-16 w-16 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <TrendingUp className="h-16 w-16 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
