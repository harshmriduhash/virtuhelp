"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setError("Invalid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      if (rememberMe) {
        localStorage.setItem("adminEmail", email);
      } else {
        localStorage.removeItem("adminEmail");
      }

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to admin panel",
      });

      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get("callbackUrl") || "/admin";
      router.replace(callbackUrl);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Invalid admin credentials"
      );
      toast({
        title: "Error",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0A0F1E] to-black flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#0A0F1E]/50 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
            <p className="text-gray-400">
              Secure access to your admin dashboard
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-500"
            >
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Admin Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="pl-10 bg-[#0A0F1E]/50 border-gray-800 focus:border-blue-500 text-white placeholder-gray-400"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="pl-10 pr-10 bg-[#0A0F1E]/50 border-gray-800 focus:border-blue-500 text-white placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  className="border-gray-600 data-[state=checked]:bg-blue-500"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-400 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 py-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in to Admin Panel"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            Protected by advanced security protocols
          </p>
        </div>
      </motion.div>
    </div>
  );
}
