import { Card } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface RevenueDashboardProps {
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
  costs: {
    total: number;
    byType: Record<string, number>;
    dailyAverage: number;
    projectedMonthly: number;
  };
  metrics: {
    profitMargin: number;
    averageRevenuePerUser: number;
    conversionRate: number;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function RevenueDashboard({
  revenue,
  costs,
  metrics,
}: RevenueDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {formatCurrency(revenue.total)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {revenue.growth > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                revenue.growth > 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {revenue.growth > 0 ? "+" : ""}
              {revenue.growth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-400 ml-2">vs last month</span>
          </div>
        </Card>

        {/* Monthly Revenue */}
        <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Monthly Revenue
              </p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {formatCurrency(revenue.monthly)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-400">
                {formatCurrency(metrics.averageRevenuePerUser)} avg per user
              </span>
            </div>
          </div>
        </Card>

        {/* Profit Margin */}
        <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Profit Margin</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {metrics.profitMargin.toFixed(1)}%
              </h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-400">
                {formatCurrency(revenue.total - costs.total)} net profit
              </span>
            </div>
          </div>
        </Card>

        {/* Monthly Costs */}
        <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Monthly Costs</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {formatCurrency(costs.projectedMonthly)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-400">
                {formatCurrency(costs.dailyAverage)} daily average
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue History Chart */}
        <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">
            Revenue History
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue.history}>
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
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0088FE"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Costs Distribution Chart */}
        <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Costs Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(costs.byType).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {Object.entries(costs.byType).map((_, index) => (
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
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(costs.byType).map(([name, value], index) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <p className="text-xs font-medium text-gray-400">{name}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
