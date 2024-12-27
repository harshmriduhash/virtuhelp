"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Brain,
  Mail,
  Lock,
  User,
  BrainCircuit,
  Bot,
  FileText,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    icon: <FileText className="h-5 w-5 text-blue-400" />,
    title: "Document Intelligence",
    description: "Advanced AI-powered document analysis and insights",
  },
  {
    icon: <Bot className="h-5 w-5 text-indigo-400" />,
    title: "Smart Assistant",
    description: "24/7 intelligent document assistance",
  },
  {
    icon: <BrainCircuit className="h-5 w-5 text-purple-400" />,
    title: "Neural Processing",
    description: "State-of-the-art data processing",
  },
];

export default function SignUpPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      setAuth(data.token, data.user);
      toast({
        title: "Account created!",
        description: "You have successfully created your account.",
      });
      router.push("/chat");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to sign up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#162454] to-[#0A0F1E]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_400px_at_50%_300px,#3B82F6,transparent)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_400px_at_80%_80%,#6366F1,transparent)]" />
        </div>
      </div>

      <div className="relative min-h-screen flex">
        {/* Left Side - Features */}
        <div className="hidden lg:flex lg:flex-1 relative p-12 items-center justify-center">
          <div className="relative z-10 max-w-lg">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                <Brain className="relative h-12 w-12 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Virtu
                  </span>
                  <span className="text-white">HelpX</span>
                </h1>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-6 py-2 mb-8"
            >
              <BrainCircuit className="w-5 h-5 mr-2 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-medium">
                Start Your Journey Today
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-6"
            >
              Transform Documents with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI Intelligence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-300 mb-12"
            >
              Experience the future of document analysis with AI-powered
              insights and intelligent processing.
            </motion.p>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-start gap-4"
                >
                  <div className="p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="relative p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
              <div className="relative">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">
                    Create Account
                  </h2>
                  <p className="text-gray-400">
                    Join VirtuHelpX and start exploring the future of document
                    intelligence
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/50"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/50"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/50"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 transition-all duration-200"
                  >
                    {isLoading ? (
                      <motion.div
                        className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : null}
                    Create Account
                  </Button>
                </form>

                <div className="mt-6 text-center text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
