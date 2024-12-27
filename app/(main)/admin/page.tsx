"use client";

import { useEffect, useState, Suspense } from "react";
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  CreditCard,
  BarChart,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { adminApi, AdminStats } from "./api";
import FileViewer from "@/components/file-viewer";
import EditAssistantCard from "@/components/EditAssistantCard";
import UserManagement from "@/components/UserManagement";
import { Assistant } from "./api";
import { useAuth } from "@/lib/useAuth";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import RevenueDashboard from "@/components/RevenueDashboard";

interface DashboardData {
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
  costs: {
    total: number;
    byType: Record<string, number>;
    dailyAverage: number;
    projectedMonthly: number;
  };
  revenue: {
    total: number;
    monthly: number;
    lastMonth: number;
    growth: number;
    history: Array<{
      date: string;
      revenue: number;
      subscriptions: number;
    }>;
  };
  metrics: {
    profitMargin: number;
    averageRevenuePerUser: number;
    conversionRate: number;
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

const defaultStats: AdminStats = {
  overview: {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  },
  usageStats: {
    totalQuestions: 0,
    totalDocuments: 0,
    averageQuestionsPerUser: 0,
    averageDocumentsPerUser: 0,
  },
  subscriptions: {
    free: 0,
    pro: 0,
    enterprise: 0,
  },
  revenueHistory: [],
  userGrowth: [],
};

const defaultAssistant: Assistant = {
  id: "default",
  object: "assistant",
  created_at: Math.floor(Date.now() / 1000),
  name: "AI Assistant",
  description: "Your customizable AI assistant",
  model: "gpt-4",
  instructions: null,
  tools: [],
  file_ids: [],
  metadata: {},
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

// Skeleton Components
const StatCardSkeleton = () => (
  <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10">
    <div className="p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
        <div className="text-right">
          <div className="w-20 h-6 bg-gray-700 rounded mb-2"></div>
          <div className="w-16 h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-24 h-4 bg-gray-700 rounded"></div>
      </div>
    </div>
  </Card>
);

const ChartSkeleton = () => (
  <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
    <div className="animate-pulse">
      <div className="w-48 h-6 bg-gray-700 rounded mb-4"></div>
      <div className="w-full h-[300px] bg-gray-700 rounded"></div>
    </div>
  </Card>
);

// Stats Section Component
const StatsSection = ({
  stats,
  isLoading,
}: {
  stats: AdminStats;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {renderStatsCard(
        "Total Users",
        stats.overview.totalUsers,
        `${stats.overview.activeUsers} active`,
        Users,
        "text-blue-500",
        "bg-blue-500/10"
      )}
      {/* ... other stat cards ... */}
    </div>
  );
};

// Charts Section Component
const ChartsSection = ({
  stats,
  isLoading,
}: {
  stats: AdminStats;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ChartSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <RevenueChart stats={stats} />
        <SubscriptionDistribution stats={stats} />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <UserGrowthChart stats={stats} />
      </div>
    </>
  );
};

// Utility Components
const renderStatsCard = (
  title: string,
  value: string | number,
  subtitle: string,
  Icon: any,
  color: string,
  bgColor: string
) => (
  <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10">
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2 ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-400">{title}</p>
      </div>
    </div>
  </Card>
);

// Chart Components
const RevenueChart = ({ stats }: { stats: AdminStats }) => (
  <Card className="col-span-2 bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={stats.revenueHistory}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="date" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "0.5rem",
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#0088FE"
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const UserGrowthChart = ({ stats }: { stats: AdminStats }) => (
  <Card className="col-span-2 bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
    <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={stats.userGrowth}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="date" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="users" fill="#00C49F" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const SubscriptionDistribution = ({ stats }: { stats: AdminStats }) => (
  <Card className="col-span-1 bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
    <h3 className="text-lg font-semibold text-white mb-4">
      Subscription Distribution
    </h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[
              { name: "Free", value: stats.subscriptions.free },
              { name: "Pro", value: stats.subscriptions.pro },
              { name: "Enterprise", value: stats.subscriptions.enterprise },
            ]}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {stats.subscriptions &&
              Object.values(stats.subscriptions).map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "0.5rem",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#0F1629]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Loading admin panel...</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  console.log("AdminDashboard: Component mounting");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [assistant, setAssistant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssistantLoading, setIsAssistantLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const router = useRouter();
  const { checkAdminAuth, user } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const isAuthenticated = await checkAdminAuth();
        if (!isAuthenticated) {
          router.replace("/admin-login");
          return;
        }
      } catch (error) {
        toast({
          title: "Authentication Error",
          description:
            "Failed to verify admin access. Please try logging in again.",
          variant: "destructive",
        });
        router.replace("/admin-login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [checkAdminAuth, router, toast]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch dashboard data");
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data",
        variant: "destructive",
      });
    }
  };

  const fetchAssistantConfig = async () => {
    try {
      setIsAssistantLoading(true);
      const response = await fetch("/api/assistants/config");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Failed to fetch assistant configuration"
        );
      }
      const data = await response.json();
      setAssistant(data);
    } catch (error) {
      console.error("Error fetching assistant config:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch assistant configuration",
        variant: "destructive",
      });
    } finally {
      setIsAssistantLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    } else if (activeTab === "assistant") {
      fetchAssistantConfig();
    }
  }, [activeTab]);

  console.log("AdminDashboard: Rendering with states:", {
    isLoading,
    activeTab,
    hasStats: !!dashboardData?.overview,
    hasUser: !!user,
  });

  const handleEditAssistant = () => {
    fetchAssistantConfig();
  };

  const handleLogout = async () => {
    try {
      await adminApi.logout();
      router.push("/admin-login");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const SidebarLink = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white w-full",
        active && "bg-blue-500/10 text-white"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  // Show loading spinner while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If we're not checking auth and there's no user, redirect
  if (!isLoading && (!user || !user.isAdmin)) {
    console.log(
      "AdminDashboard: No admin user found after auth check, redirecting"
    );
    router.replace("/admin-login");
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 bg-[#0A0F1E]/50 p-6">
        <div className="flex flex-col gap-2">
          <SidebarLink
            icon={BarChart}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <SidebarLink
            icon={Users}
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <SidebarLink
            icon={FileText}
            label="Documents"
            active={activeTab === "documents"}
            onClick={() => setActiveTab("documents")}
          />
          <SidebarLink
            icon={MessageSquare}
            label="Assistant"
            active={activeTab === "assistant"}
            onClick={() => setActiveTab("assistant")}
          />
          <SidebarLink
            icon={Settings}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>

        <div className="mt-auto pt-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-8 p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className="text-sm text-gray-400">
                Manage your AI assistant and monitor system usage
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              <Suspense
                fallback={
                  <div className="animate-pulse">Loading overview...</div>
                }
              >
                {dashboardData && (
                  <>
                    <StatsSection stats={dashboardData} isLoading={isLoading} />
                    <RevenueDashboard
                      revenue={dashboardData.revenue}
                      costs={dashboardData.costs}
                      metrics={dashboardData.metrics}
                    />
                    <ChartsSection
                      stats={dashboardData}
                      isLoading={isLoading}
                    />
                  </>
                )}
              </Suspense>
            </>
          )}

          {activeTab === "users" && (
            <Suspense
              fallback={<div className="animate-pulse">Loading users...</div>}
            >
              <UserManagement />
            </Suspense>
          )}

          {activeTab === "assistant" && (
            <Suspense
              fallback={
                <div className="animate-pulse">Loading assistant...</div>
              }
            >
              <div className="grid grid-cols-1 gap-8">
                {assistant && (
                  <EditAssistantCard
                    assistant={assistant}
                    isLoading={isAssistantLoading}
                    onUpdate={handleEditAssistant}
                  />
                )}
              </div>
            </Suspense>
          )}

          {activeTab === "documents" && (
            <Suspense
              fallback={
                <div className="animate-pulse">Loading documents...</div>
              }
            >
              <FileViewer />
            </Suspense>
          )}

          {activeTab === "settings" && (
            <Suspense
              fallback={
                <div className="animate-pulse">Loading settings...</div>
              }
            >
              <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Settings
                </h3>
                {/* Add settings content here */}
              </Card>
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
