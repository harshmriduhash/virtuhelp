import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SystemMetrics {
  cpu: number;
  memory: number;
  storage: number;
  apiLatency: number;
  databaseConnections: number;
  errors24h: number;
  uptime: number;
}

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  latency: number;
}

const defaultMetrics: SystemMetrics = {
  cpu: 0,
  memory: 0,
  storage: 0,
  apiLatency: 0,
  databaseConnections: 0,
  errors24h: 0,
  uptime: 0,
};

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetrics>(defaultMetrics);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      // In production, replace with actual API call
      const response = await fetch("/api/admin/system/metrics");
      const data = await response.json();
      setMetrics(data.metrics);
      setServices(data.services);
    } catch (error) {
      console.error("Failed to fetch system metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "text-emerald-500";
      case "degraded":
        return "text-yellow-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "degraded":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "down":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU Usage */}
          <div className="bg-[#1A2035] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-200">CPU</span>
              </div>
              <span className="text-sm font-medium text-white">
                {metrics.cpu}%
              </span>
            </div>
            <Progress value={metrics.cpu} className="h-2" />
          </div>

          {/* Memory Usage */}
          <div className="bg-[#1A2035] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-200">
                  Memory
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                {metrics.memory}%
              </span>
            </div>
            <Progress value={metrics.memory} className="h-2" />
          </div>

          {/* Storage Usage */}
          <div className="bg-[#1A2035] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium text-gray-200">
                  Storage
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                {metrics.storage}%
              </span>
            </div>
            <Progress value={metrics.storage} className="h-2" />
          </div>

          {/* Database Connections */}
          <div className="bg-[#1A2035] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-200">
                  Database
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                {metrics.databaseConnections} connections
              </span>
            </div>
            <Progress
              value={(metrics.databaseConnections / 100) * 100}
              className="h-2"
            />
          </div>
        </div>
      </Card>

      {/* Service Status */}
      <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Service Status
        </h2>
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between bg-[#1A2035] rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <span className="text-sm font-medium text-gray-200">
                  {service.name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-sm font-medium ${getStatusColor(
                    service.status
                  )}`}
                >
                  {service.status}
                </span>
                <span className="text-sm text-gray-400">
                  {service.latency}ms
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Stats */}
      <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">System Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#1A2035] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-200">
                API Latency
              </span>
            </div>
            <span className="text-2xl font-bold text-white">
              {metrics.apiLatency}ms
            </span>
          </div>

          <div className="bg-[#1A2035] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-gray-200">
                Errors (24h)
              </span>
            </div>
            <span className="text-2xl font-bold text-white">
              {metrics.errors24h}
            </span>
          </div>

          <div className="bg-[#1A2035] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium text-gray-200">Uptime</span>
            </div>
            <span className="text-2xl font-bold text-white">
              {Math.floor(metrics.uptime / 24)}d {metrics.uptime % 24}h
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
