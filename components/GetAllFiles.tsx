import React, { useState, useEffect } from "react";
import { FileText, Trash2, Upload, AlertCircle, File } from "lucide-react";

const FileViewer = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFiles();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchFiles = async () => {
    try {
      const resp = await fetch("/api/assistants/files", {
        method: "GET",
      });
      const data = await resp.json();
      setFiles(data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch files");
    }
  };

  const handleFileDelete = async (fileId) => {
    try {
      await fetch("/api/assistants/files", {
        method: "DELETE",
        body: JSON.stringify({ fileId }),
      });
      setError(null);
    } catch (error) {
      setError("Failed to delete file");
    }
  };

  const handleFileUpload = async (event) => {
    const data = new FormData();
    if (event.target.files.length < 0) return;

    setIsUploading(true);
    try {
      data.append("file", event.target.files[0]);
      await fetch("/api/assistants/files", {
        method: "POST",
        body: data,
      });
      setError(null);
    } catch (error) {
      setError("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h4 className="text-lg font-medium text-slate-800 mb-1">
          Construction Documents
        </h4>
        <p className="text-sm text-slate-500">
          Upload and manage your construction documents to enhance the AI
          Assistant's understanding.
        </p>
      </div>

      {/* File List */}
      <div className="p-6 border-b border-slate-200">
        <div
          className={`${
            files.length !== 0 ? "grow" : ""
          } overflow-auto max-h-60`}
        >
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {files.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">
                No documents uploaded yet
              </p>
              <p className="text-sm text-slate-400">
                Upload your first document to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.file_id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <span className="text-sm text-slate-600 truncate">
                      {file.filename}
                    </span>
                  </div>
                  <button
                    onClick={() => handleFileDelete(file.file_id)}
                    className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="p-6">
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer
            hover:bg-slate-50 transition-colors ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {isUploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
          ) : (
            <Upload className="h-5 w-5 text-yellow-500" />
          )}
          <span className="text-sm font-medium text-slate-600">
            {isUploading ? "Uploading..." : "Upload construction documents"}
          </span>
          <input
            type="file"
            id="file-upload"
            name="file-upload"
            className="hidden"
            multiple
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
        <p className="text-xs text-slate-400 text-center mt-2">
          Supported formats: PDF, DOC, DOCX, XLS, XLSX
        </p>
      </div>
    </div>
  );
};

export default FileViewer;
