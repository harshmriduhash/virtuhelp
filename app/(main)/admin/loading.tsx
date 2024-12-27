import { Building2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0F1E]">
      <div className="relative mb-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-75 animate-pulse"></div>
        <Building2 className="relative w-12 h-12 text-blue-400" />
      </div>
      <h2 className="text-xl font-bold mb-2">
        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          VirtuHelpX
        </span>
      </h2>
      <p className="text-sm text-gray-400 mb-4">Loading admin portal...</p>
      <div className="relative">
        <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-24 animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );
}
