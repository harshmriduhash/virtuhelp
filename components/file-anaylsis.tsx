import React, { useState, useEffect } from "react";
import { DocumentAdd, Trash } from "lucide-react";

interface FileItem {
  file_id: string;
  filename: string;
}

const FileViewer = () => {
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFiles();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchFiles = async () => {
    const resp = await fetch("/api/assistants/files", {
      method: "GET",
    });
    const data = await resp.json();
    setFiles(data);
  };

  const handleFileDelete = async (fileId: string) => {
    await fetch("/api/assistants/files", {
      method: "DELETE",
      body: JSON.stringify({ fileId }),
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const data = new FormData();
    if (!event.target.files || event.target.files.length === 0) return;
    data.append("file", event.target.files[0]);
    await fetch("/api/assistants/files", {
      method: "POST",
      body: data,
    });
  };

  return (
    <div className="bg-[#0A0F1E]/50 backdrop-blur-xl p-6 rounded-lg border border-white/10">
      <h4 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
        Upload Your Files for Assistant
      </h4>
      <p className="text-sm text-gray-400 mb-4">
        These files will be used for the Assistant's Knowledgebase.
      </p>

      <div
        className={`${
          files.length !== 0 ? "max-h-60" : ""
        } overflow-auto mb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent`}
      >
        {files.length === 0 ? (
          <div className="text-sm text-gray-400 font-semibold text-center py-4">
            No files uploaded yet
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.file_id}
              className="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-md mb-2 backdrop-blur-sm transition-all duration-200 group"
            >
              <span className="text-gray-300 truncate">{file.filename}</span>
              <button
                onClick={() => handleFileDelete(file.file_id)}
                className="text-red-400 hover:text-red-300 transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label={`Delete ${file.filename}`}
              >
                <Trash className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-4">
        <label
          htmlFor="file-upload"
          className="flex justify-center items-center p-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 transition-all duration-200 cursor-pointer group"
        >
          <DocumentAdd className="h-6 w-6 text-white mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-white font-medium">Upload files</span>
        </label>
        <input
          type="file"
          id="file-upload"
          name="file-upload"
          className="hidden"
          multiple
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};

export default FileViewer;
