import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreVertical,
  Search,
  Mail,
  Ban,
  Trash2,
  Shield,
  CreditCard,
  Download,
  Users,
} from "lucide-react";
import { adminApi } from "@/app/(main)/admin/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
  usage: {
    questionsUsed: number;
    questionsLimit: number;
    documentsUsed: number;
    documentsLimit: number;
  };
  subscription?: {
    plan: "NONE" | "FREE" | "PROFESSIONAL" | "ENTERPRISE";
    status: "NONE" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
  };
}

// Plan badge styles
const PLAN_STYLES = {
  NONE: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  FREE: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  PROFESSIONAL: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  ENTERPRISE: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
} as const;

// Status badge styles
const STATUS_STYLES = {
  NONE: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  SUSPENDED: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
} as const;

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response.users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.name?.toLowerCase() || "").includes(searchLower) ||
      user.plan.toLowerCase().includes(searchLower) ||
      user.status.toLowerCase().includes(searchLower)
    );
  });

  const handleAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case "suspend":
          await adminApi.updateUser(userId, { status: "SUSPENDED" });
          break;
        case "activate":
          await adminApi.updateUser(userId, { status: "ACTIVE" });
          break;
        case "delete":
          await adminApi.updateUser(userId, { status: "DELETED" });
          break;
      }
      fetchUsers();
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          adminApi.updateUser(userId, {
            status: action.toUpperCase() as "ACTIVE" | "SUSPENDED" | "DELETED",
          })
        )
      );
      fetchUsers();
      setSelectedUsers([]);
      toast({
        title: "Success",
        description: `Successfully ${action}ed ${selectedUsers.length} users`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} users`,
        variant: "destructive",
      });
    }
  };

  const handleExportUsers = async () => {
    try {
      const csvContent = [
        // Header
        [
          "Email",
          "Name",
          "Plan",
          "Status",
          "Questions Used",
          "Questions Limit",
          "Documents Used",
          "Documents Limit",
          "Created At",
        ].join(","),
        // Data
        ...filteredUsers.map((user) =>
          [
            user.email,
            user.name || "",
            user.plan,
            user.status,
            user.usage.questionsUsed,
            user.usage.questionsLimit,
            user.usage.documentsUsed,
            user.usage.documentsLimit,
            new Date(user.createdAt).toLocaleDateString(),
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Users exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export users",
        variant: "destructive",
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Calculate usage percentage
  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  // Get color based on usage percentage
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-emerald-500";
  };

  return (
    <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Users</h2>
            <p className="text-sm text-gray-400">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10 bg-[#1A2035] border-white/10 text-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="text-yellow-500 hover:text-yellow-400"
                  onClick={() => handleBulkAction("suspend")}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend Selected
                </Button>
                <Button
                  variant="outline"
                  className="text-emerald-500 hover:text-emerald-400"
                  onClick={() => handleBulkAction("activate")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Activate Selected
                </Button>
                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-400"
                  onClick={() => handleBulkAction("delete")}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              className="text-blue-500 hover:text-blue-400"
              onClick={handleExportUsers}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/10">
                <TableHead className="text-gray-400 w-[40px]">
                  <Checkbox
                    checked={
                      filteredUsers.length > 0 &&
                      selectedUsers.length === filteredUsers.length
                    }
                    onCheckedChange={toggleSelectAll}
                    className="border-white/20"
                  />
                </TableHead>
                <TableHead className="text-gray-400">User</TableHead>
                <TableHead className="text-gray-400">Plan</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Usage</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-400 py-10"
                  >
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-400 py-10"
                  >
                    {searchQuery ? (
                      <>
                        No users found matching "
                        <span className="text-white">{searchQuery}</span>"
                      </>
                    ) : (
                      "No users found"
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-white/5 border-white/10"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                        className="border-white/20"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <span className="text-blue-500 font-medium">
                            {user.name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          PLAN_STYLES[user.subscription?.plan || "NONE"]
                        } border-0 font-medium`}
                      >
                        {user.subscription?.plan || "NONE"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          STATUS_STYLES[user.subscription?.status || "NONE"]
                        } border-0 font-medium`}
                      >
                        {user.subscription?.status || "NONE"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            Questions
                          </span>
                          <span
                            className={`text-sm font-medium ${getUsageColor(
                              getUsagePercentage(
                                user.usage.questionsUsed,
                                user.usage.questionsLimit
                              )
                            )}`}
                          >
                            {user.usage.questionsUsed} /{" "}
                            {user.usage.questionsLimit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            Documents
                          </span>
                          <span
                            className={`text-sm font-medium ${getUsageColor(
                              getUsagePercentage(
                                user.usage.documentsUsed,
                                user.usage.documentsLimit
                              )
                            )}`}
                          >
                            {user.usage.documentsUsed} /{" "}
                            {user.usage.documentsLimit}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 bg-[#1A2035] border-white/10"
                        >
                          <DropdownMenuLabel className="text-gray-400">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="hover:bg-white/5 text-gray-200 hover:text-white focus:bg-white/5 focus:text-white">
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Email User</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-white/5 text-gray-200 hover:text-white focus:bg-white/5 focus:text-white">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Manage Subscription</span>
                          </DropdownMenuItem>
                          {user.status === "ACTIVE" ? (
                            <DropdownMenuItem
                              onClick={() => handleAction(user.id, "suspend")}
                              className="hover:bg-yellow-500/10 text-yellow-500 hover:text-yellow-400 focus:bg-yellow-500/10 focus:text-yellow-400"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              <span>Suspend User</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleAction(user.id, "activate")}
                              className="hover:bg-emerald-500/10 text-emerald-500 hover:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400"
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Activate User</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleAction(user.id, "delete")}
                            className="hover:bg-red-500/10 text-red-500 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
