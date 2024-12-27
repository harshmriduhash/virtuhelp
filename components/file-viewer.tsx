import React, { useState, useEffect } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import { adminApi, FileItem } from "@/app/(main)/admin/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const FileViewer = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFiles = async () => {
    try {
      setError(null);
      const data = await adminApi.getFiles();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to fetch files");
      toast({
        title: "Error",
        description:
          "Failed to fetch files. The file management system might not be ready yet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // Polling every 10 seconds instead of 1 second
    const interval = setInterval(fetchFiles, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFileDelete = async (fileId: string) => {
    try {
      setIsLoading(true);
      await adminApi.deleteFile(fileId);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      await fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await adminApi.uploadFile(file);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      await fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = "";
    }
  };

  return (
    <div className="bg-[#0A0F1E]/50 backdrop-blur-xl p-6 rounded-lg border border-white/10">
      <h4 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
        Training Data Files
      </h4>
      <p className="text-sm text-gray-400 mb-6">
        Manage files used for the Assistant's knowledgebase
      </p>
      <div className="border-t border-white/10 pt-6">
        <div
          className={`${
            files.length !== 0 ? "mb-6" : ""
          } max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          ) : error ? (
            <div className="text-sm text-red-400 font-semibold">{error}</div>
          ) : files.length === 0 ? (
            <div className="text-sm text-gray-400 font-semibold">
              No files uploaded yet.
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.file_id}
                className="flex justify-between items-center p-3 hover:bg-white/5 rounded-md transition-all duration-200 backdrop-blur-sm group"
              >
                <span className="text-gray-300 truncate">{file.filename}</span>
                <button
                  onClick={() => handleFileDelete(file.file_id)}
                  className="text-red-400 hover:text-red-300 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  aria-label="Delete file"
                  disabled={isLoading}
                >
                  <FaTrash className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="mt-4">
          <label
            htmlFor="file-upload"
            className={`flex items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-all duration-200 group ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-400 mr-2" />
            ) : (
              <FaUpload className="h-6 w-6 text-blue-400 mr-2 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-gray-300 group-hover:text-white transition-colors">
              {isUploading ? "Uploading..." : "Upload files"}
            </span>
          </label>
          <input
            type="file"
            id="file-upload"
            name="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.txt,.md"
          />
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
