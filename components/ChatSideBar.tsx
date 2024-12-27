"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  MessageSquare,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  PanelRight,
  Plus,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SettingsSheet } from "@/components/SettingsSheet";
import { useAuth } from "@/lib/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type MessageProps = {
  role: "user" | "assistant" | "code";
  content: string;
};

type SessionProps = {
  id: string;
  messages: MessageProps[];
  title?: string;
  createdAt: number;
};

interface ChatSideBarProps {
  sessions: SessionProps[];
  activeSessionIndex: number | null;
  onNewChat: () => void;
  onSelectChat: (index: number) => void;
  onClearAllChats: () => void;
  subscription: any;
}

export function ChatSideBar({
  sessions,
  activeSessionIndex,
  onNewChat,
  onSelectChat,
  onClearAllChats,
  subscription,
}: ChatSideBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative h-full border-r border-white/10 bg-[#0A0F1E] transition-all duration-300",
          isCollapsed ? "w-[60px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center px-3 pt-4 mb-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <Brain className="relative h-8 w-8 text-blue-400" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Virtu
                </span>
                <span className="text-white">HelpX</span>
              </span>
            )}
          </Link>
        </div>

        {/* Header with New Chat and Collapse buttons */}
        <div className="flex items-center justify-between px-3 pb-4">
          <Button
            variant="ghost"
            className={cn(
              "flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/20 border border-white/10 transition-all duration-200",
              isCollapsed ? "w-9 h-9" : "w-[calc(100%-28px)] px-4 py-2",
              "rounded-lg"
            )}
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2 font-medium">New Chat</span>}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <PanelRight className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-auto">
          <div className="px-2">
            {sessions.map((session, index) => (
              <button
                key={index}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-all duration-200",
                  "hover:bg-white/10",
                  activeSessionIndex === index
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                )}
                onClick={() => onSelectChat(index)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <span className="line-clamp-1 flex-1">
                    {session.messages[0]?.content || "New Chat"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom buttons */}
        <div
          className={cn(
            "absolute bottom-4 left-0 right-0 px-3",
            "flex items-center",
            isCollapsed ? "flex-col gap-3 justify-center" : "justify-between"
          )}
        >
          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "flex-col gap-3" : "gap-2"
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all duration-200",
                    "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500 hover:to-indigo-500",
                    "text-blue-400 hover:text-white border border-blue-500/20"
                  )}
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#0A0F1E] border border-white/10 text-gray-200"
              >
                Settings
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all duration-200",
                    "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500 hover:to-indigo-500",
                    "text-blue-400 hover:text-white border border-blue-500/20"
                  )}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#0A0F1E] border border-white/10 text-gray-200"
              >
                Clear all chats
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-[#0A0F1E] border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-white">
              Clear all chats
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to clear all chats? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearAllChats();
                setIsDeleteModalOpen(false);
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Sheet */}
      <SettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </TooltipProvider>
  );
}
