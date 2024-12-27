'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  LayoutDashboard,
  Files,
  Users,
  Settings,
  FileText,
  Calendar,
  MessageSquare,
  Bell,
  ChevronDown,
  Search,
} from "lucide-react"
import { SettingsModel } from "../SettingsModel"
import EditAssistantCard from "../EditAssistantCard"
import FileViewer from "../file-viewer"
import DashboardOverview from "@/components/DashboardOverview"
import UserManagement from "@/components/UserManagement"

interface AdminClientProps {
  initialData?: any
}

export default function AdminClient({ initialData }: AdminClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loginError, setLoginError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        if (response.ok) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (response.ok) {
        setIsAuthenticated(true)
        setLoginError("")
      } else {
        setLoginError("Invalid credentials")
      }
    } catch (error) {
      setLoginError("Login failed")
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />
      case "users":
        return <UserManagement />
      case "files":
        return <FileViewer />
      default:
        return <DashboardOverview />
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 border rounded"
              />
            </div>
            {loginError && (
              <div className="text-red-500 text-sm mb-4">{loginError}</div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left p-3 flex items-center space-x-3 ${
              activeTab === "dashboard"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full text-left p-3 flex items-center space-x-3 ${
              activeTab === "users"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`w-full text-left p-3 flex items-center space-x-3 ${
              activeTab === "files"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Files className="w-5 h-5" />
            <span>Files</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-500" />
              </button>
              <button className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="bg-white rounded-xl shadow-sm border border-gray-300">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
