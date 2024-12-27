"use client";

import * as React from "react";
import { Paperclip, User, Bot, Copy, Check, Brain, Send } from "lucide-react";
import { useAuth, getCurrentUser } from "@/lib/useAuth";
import { AssistantStream } from "openai/lib/AssistantStream";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChatSideBar } from "@/components/ChatSideBar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState } from "react";
import { PaymentModal } from "@/components/PaymentModal";
import { toast } from "@/hooks/use-toast";
import AssistantFunctionsCard from "@/components/AssistantFunctionsCard";
import { Subscription, SubscriptionPlan } from "@/types/subscription";
import { ArrowRight, Badge } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface CodeProps {
  node: any;
  inline: boolean;
  className: string;
  children: React.ReactNode;
}

interface ChatSideBarProps {
  sessions: SessionProps[];
  activeSessionIndex: number | null;
  onNewChat: () => void;
  onSelectChat: (index: number) => void;
  onClearAllChats: () => void;
  subscription: {
    plan: string;
    documentsPerMonth: number;
    questionsPerMonth: number;
    questionsUsed: number;
    validUntil: Date;
    status: string;
  } | null;
}

const LoadingSpinner = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      <span className="text-sm text-gray-400">Generating response...</span>
    </div>
  );
};

const Message = ({ role, content }: MessageProps) => {
  const { user } = useAuth();
  const isUser = role === "user";
  const isGenerating = content === "" && role === "assistant";

  return (
    <div
      className={cn(
        "group w-full border-b border-white/10",
        isUser ? "bg-white/5" : "bg-white/10",
        "backdrop-blur-sm"
      )}
    >
      <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl p-4 md:py-6 lg:px-0 m-auto flex">
        <div className="flex-shrink-0 flex flex-col relative items-end">
          <div
            className={cn(
              "rounded-lg flex items-center justify-center",
              isUser
                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                : "bg-white/10",
              "w-[30px] h-[30px]"
            )}
          >
            {isUser ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-blue-400" />
            )}
          </div>
        </div>
        <div className="relative flex w-[calc(100%-50px)] flex-col gap-1">
          {isUser ? (
            <p className="text-white/90">{content}</p>
          ) : isGenerating ? (
            <LoadingSpinner />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({
                  node,
                  inline,
                  className,
                  children,
                  ...props
                }: CodeProps) => {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      {...props}
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg border border-white/10 bg-[#1E1E1E] p-4 my-4"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      {...props}
                      className={cn(
                        "bg-[#1E1E1E] rounded px-1.5 py-0.5 text-blue-400",
                        className
                      )}
                    >
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <p className="text-white/90 leading-7 mb-6">{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white/90 mb-6 leading-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-white/90 mb-4 leading-tight">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-white/90 mb-4 leading-tight">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="pl-6 text-white/90 mb-6 space-y-2 list-none">
                    {React.Children.map(children, (child) => {
                      if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                          className:
                            'relative pl-6 before:content-["•"] before:absolute before:left-0 before:text-blue-400',
                        });
                      }
                      return child;
                    })}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="pl-6 text-white/90 mb-6 space-y-2 list-none counter-reset-item">
                    {React.Children.map(children, (child, index) => {
                      if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                          className:
                            "relative pl-6 before:absolute before:left-0 before:text-blue-400",
                          "data-counter": index + 1,
                        });
                      }
                      return child;
                    })}
                  </ol>
                ),
                li: ({ children, className, ...props }) => {
                  if (props["data-counter"]) {
                    return (
                      <li className={cn("relative", className)} {...props}>
                        <span className="absolute left-0 text-blue-400">
                          {props["data-counter"]}.
                        </span>
                        {children}
                      </li>
                    );
                  }
                  return (
                    <li className={cn("text-white/90", className)} {...props}>
                      {children}
                    </li>
                  );
                },
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-400/30 hover:border-blue-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto mb-6 rounded-lg border border-white/10">
                    <table
                      {...props}
                      className="w-full border-collapse bg-[#1E1E1E]"
                    />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th
                    {...props}
                    className="border-b border-white/10 px-6 py-3 bg-white/5 text-white/90 font-semibold text-left"
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    {...props}
                    className="border-b border-white/10 px-6 py-3 text-white/90"
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    {...props}
                    className="border-l-4 border-blue-500 pl-6 my-6 italic text-white/80 bg-white/5 py-4 rounded-r"
                  />
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-white/90">{children}</em>
                ),
                hr: () => <hr className="border-white/10 my-8" />,
              }}
              className="prose prose-invert max-w-none"
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

const autoResizeTextArea = (element: HTMLTextAreaElement) => {
  element.style.height = "inherit";
  element.style.height = `${Math.min(element.scrollHeight, 200)}px`; // Max height of 200px
};

const SubscriptionDetails = ({
  subscription,
}: {
  subscription: SubscriptionData | null;
}) => {
  const router = useRouter();

  const getProgressPercentage = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  if (!subscription) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#0A0F1E]/50 p-6 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white mb-4">
          No Active Subscription
        </h3>
        <p className="text-gray-400 mb-6">
          Upgrade to unlock premium features and increase your usage limits.
        </p>
        <Button
          onClick={() => router.push("/subscription")}
          className="relative inline-flex items-center justify-center px-8 py-3 font-medium text-white transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <span>Upgrade Now</span>
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#0A0F1E]/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">
          {subscription.plan} Plan
        </h3>
        <Badge
          variant={subscription.status === "ACTIVE" ? "default" : "destructive"}
          className="bg-gradient-to-r from-blue-500 to-indigo-500"
        >
          {subscription.status}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Questions Usage */}
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Questions Used</span>
            <span>
              {subscription.questionsUsed} / {subscription.questionsPerMonth}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              style={{
                width: `${getProgressPercentage(
                  subscription.questionsUsed,
                  subscription.questionsPerMonth
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Documents Usage */}
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Documents Limit</span>
            <span>{subscription.documentsPerMonth} per month</span>
          </div>
        </div>

        {/* Valid Until */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            Valid until: {formatDate(subscription.validUntil)}
          </p>
        </div>

        {/* Upgrade Button */}
        {subscription.plan !== "ENTERPRISE" && (
          <Button
            onClick={() => router.push("/subscription")}
            className="w-full relative inline-flex items-center justify-center px-8 py-3 font-medium text-white transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <span>Upgrade Plan</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

const ChatPage = () => {
  const [messages, setMessages] = React.useState<MessageProps[]>([]);
  const [sessions, setSessions] = React.useState<SessionProps[]>(() => {
    if (typeof window !== "undefined") {
      const savedSessions = localStorage.getItem("chatSessions");
      return savedSessions ? JSON.parse(savedSessions) : [];
    }
    return [];
  });
  const [activeSessionIndex, setActiveSessionIndex] = React.useState<
    number | null
  >(null);
  const [userInput, setUserInput] = React.useState("");
  const [fileInfo, setFileInfo] = React.useState("");
  const [threadId, setThreadId] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [subscription, setSubscription] = useState<{
    plan: string;
    paypalId?: string;
    questionsUsed: number;
    documentsUsed: number;
    questionsPerMonth: number;
    documentsPerMonth: number;
    validUntil: Date;
  } | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/subscriptions/current");
        const data = await response.json();
        console.log("Subscription data:", data);

        if (response.ok && data) {
          setSubscription({
            plan: data.plan,
            paypalId: data.paypalId,
            questionsUsed: data.questionsUsed,
            documentsUsed: data.documentsUsed,
            questionsPerMonth: data.questionsPerMonth || data.questionsLimit,
            documentsPerMonth: data.documentsPerMonth || data.documentsLimit,
            validUntil: new Date(data.validUntil),
          });
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  React.useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, { method: "POST" });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    if (activeSessionIndex !== null && sessions[activeSessionIndex]) {
      const updatedSessions = [...sessions];
      updatedSessions[activeSessionIndex] = {
        ...updatedSessions[activeSessionIndex],
        messages: messages,
      };
      setSessions(updatedSessions);
      localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
    }
  }, [messages, activeSessionIndex]);

  React.useEffect(() => {
    if (user?.subscription) {
      setSubscription(user.subscription as unknown as Subscription);
    }
  }, [user]);

  const canUploadFiles = subscription?.plan === "ENTERPRISE";
  console.log("Current subscription:", subscription);
  console.log("Can upload files:", canUploadFiles);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!canUploadFiles) {
      showError(
        "Please upgrade to Professional or Enterprise plan to upload files"
      );
      setShowPaymentModal(true);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/assistants/files/code-interpreter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      setFileInfo(`${file.name} (ID: ${result.fileId})`);
      setUserInput(`${file.name}`);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      showError("Failed to upload file. Please try again.");
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading || (!userInput.trim() && !fileInfo)) return;

    if (!checkSubscriptionLimit()) {
      return;
    }

    const messageContent = `${userInput} ${fileInfo}`.trim();

    try {
      // Add user message immediately
      setMessages((prev) => [
        ...prev,
        { role: "user", content: messageContent },
      ]);

      // Update session title if it's a new chat
      if (activeSessionIndex !== null && messages.length === 0) {
        const updatedSessions = [...sessions];
        updatedSessions[activeSessionIndex] = {
          ...updatedSessions[activeSessionIndex],
          title:
            messageContent.slice(0, 30) +
            (messageContent.length > 30 ? "..." : ""),
        };
        setSessions(updatedSessions);
        localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
      }

      // Clear inputs before sending
      setUserInput("");
      setFileInfo("");

      // Scroll to bottom
      setTimeout(scrollToBottom, 100);

      // Send the message
      await sendMessage(messageContent);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      showError("Failed to send message. Please try again.");
      // Remove the failed message
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const sendMessage = async (text: string) => {
    if (!threadId) {
      showError("Chat thread not initialized. Please try again.");
      return;
    }

    try {
      // Update usage before sending
      await updateUsage("question");
      if (fileInfo) {
        await updateUsage("document");
      }

      const response = await fetch(
        `/api/assistants/threads/${threadId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: text }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to send message");
      }

      // Create stream from response
      const stream = AssistantStream.fromReadableStream(response.body);

      // Add empty assistant message for streaming
      appendMessage("assistant", "");

      // Set up stream handlers
      stream.on("textCreated", () => {
        // Message already created above
      });

      stream.on("textDelta", (delta) => {
        if (delta.value != null) {
          appendToLastMessage(delta.value);
        }
      });

      stream.on("error", (error) => {
        console.error("Stream error:", error);
        showError("Error receiving response. Please try again.");
        // Remove the failed assistant message
        setMessages((prev) => prev.slice(0, -1));
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const appendToLastMessage = (text: string) => {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      const updatedMessages = [
        ...prev.slice(0, -1),
        { ...lastMessage, content: lastMessage.content + text },
      ];
      setTimeout(scrollToBottom, 100);
      return updatedMessages;
    });
  };

  const appendMessage = (
    role: "user" | "assistant" | "code",
    content: string
  ) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleNewChat = () => {
    const newSession: SessionProps = {
      id: crypto.randomUUID(),
      messages: [],
      createdAt: Date.now(),
    };

    setSessions((prevSessions) => [newSession, ...prevSessions]);
    setMessages([]);
    setActiveSessionIndex(0);

    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, { method: "POST" });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
  };

  const handleSelectChat = (index: number) => {
    if (index >= 0 && index < sessions.length) {
      setActiveSessionIndex(index);
      setMessages(sessions[index].messages);
    }
  };

  const handleClearAllChats = () => {
    setSessions([]);
    localStorage.removeItem("chatSessions");
    setActiveSessionIndex(null);
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const showError = (message: string) => {
    toast({
      variant: "destructive",
      description: message,
    });
  };

  const checkSubscriptionLimit = () => {
    if (!user) {
      showError("Please sign in to continue");
      return false;
    }

    if (!subscription) {
      setShowPaymentModal(true);
      return false;
    }

    const {
      questionsUsed,
      questionsPerMonth,
      documentsUsed,
      documentsPerMonth,
    } = subscription;

    if (questionsPerMonth !== -1 && questionsUsed >= questionsPerMonth) {
      showError(
        "You've reached your monthly question limit. Please upgrade your plan."
      );
      setShowPaymentModal(true);
      return false;
    }

    if (
      fileInfo &&
      documentsPerMonth !== -1 &&
      documentsUsed >= documentsPerMonth
    ) {
      showError(
        "You've reached your monthly document limit. Please upgrade your plan."
      );
      setShowPaymentModal(true);
      return false;
    }

    return true;
  };

  const handleCardClick = (description: string) => {
    setUserInput(description);
  };

  const updateUsage = async (type: "question" | "document") => {
    try {
      const response = await fetch("/api/subscriptions/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Failed to update usage");
      }

      const updatedSubscription = await response.json();

      // Update local subscription state
      setSubscription((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          questionsUsed: updatedSubscription.questionsUsed,
          documentsUsed: updatedSubscription.documentsUsed,
          plan: prev.plan,
          documentsPerMonth: prev.documentsPerMonth,
          questionsPerMonth: prev.questionsPerMonth,
          validUntil: prev.validUntil,
        };
      });

      // Also update the user context if needed
      if (user && user.subscription) {
        user.subscription = {
          ...user.subscription,
          questionsUsed: updatedSubscription.questionsUsed,
          documentsUsed: updatedSubscription.documentsUsed,
        } as typeof user.subscription;
      }
    } catch (error) {
      console.error("Error updating usage:", error);
      showError("Failed to update usage count");
    }
  };

  return (
    <div className="flex h-[100vh] overflow-hidden bg-[#0A0F1E]">
      <ChatSideBar
        sessions={sessions}
        activeSessionIndex={activeSessionIndex}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onClearAllChats={handleClearAllChats}
        subscription={subscription}
      />
      <div className="relative flex h-full w-full flex-1 flex-col">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full overflow-y-auto" ref={scrollAreaRef}>
            <div className="flex flex-col items-center text-sm h-full">
              {messages.length === 0 && (
                <div className="text-center px-3 py-10 text-gray-300">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Welcome to VirtuHelpX
                  </h2>

                  <AssistantFunctionsCard onCardClick={handleCardClick} />
                </div>
              )}
              {messages.map((msg, index) => (
                <Message key={index} role={msg.role} content={msg.content} />
              ))}
              <div
                ref={messagesEndRef}
                className="h-32 md:h-48 flex-shrink-0"
              />
            </div>
          </ScrollArea>
        </div>
        <div className="absolute bottom-0 left-0 w-full border-t border-white/10 bg-gradient-to-b from-transparent via-[#0A0F1E] to-[#0A0F1E] pt-6">
          <form
            onSubmit={handleSubmit}
            className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
          >
            <div className="relative flex h-full flex-1 items-center">
              {canUploadFiles && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute left-3 z-10 h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 opacity-100 cursor-pointer rounded-lg flex items-center justify-center"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  disabled={false}
                >
                  {isUploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Paperclip className="h-4 w-4 text-white" />
                  )}
                </Button>
              )}
              <Textarea
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  autoResizeTextArea(e.target);
                }}
                onKeyDown={handleKeyPress}
                placeholder={
                  canUploadFiles
                    ? "Message VirtuHelpX or upload a file..."
                    : "Message VirtuHelpX..."
                }
                className={cn(
                  "w-full resize-none bg-white/5 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.1)]",
                  canUploadFiles ? "pl-12" : "pl-4"
                )}
                style={{
                  height: "48px",
                  maxHeight: "200px",
                  minHeight: "48px",
                }}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className={cn(
                  "absolute right-2 z-10 h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 rounded-lg flex items-center justify-center",
                  !userInput.trim() &&
                    !fileInfo &&
                    "opacity-50 cursor-not-allowed"
                )}
                disabled={isUploading || (!userInput.trim() && !fileInfo)}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </form>
        </div>
      </div>
      {canUploadFiles && (
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          accept=".txt,.pdf,.doc,.docx,.csv,.json,.xml"
        />
      )}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        subscription={
          subscription
            ? {
                questionsUsed: subscription.questionsUsed,
                documentsUsed: subscription.documentsUsed,
                questionsPerMonth: subscription.questionsPerMonth,
                documentsPerMonth: subscription.documentsPerMonth,
              }
            : undefined
        }
      />
    </div>
  );
};

export default ChatPage;
