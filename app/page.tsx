'use client';

import { AiOutlineCloudUpload } from 'react-icons/ai';
import { useState, useRef } from 'react';

export default function Home() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showErrorToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setUploadedFile(file);
      } else {
        showErrorToast();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setUploadedFile(file);
      } else {
        showErrorToast();
      }
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-purple-200">
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">X</span>
            <span className="font-medium">Please upload a PDF file only</span>
          </div>
        </div>
      )}
      
      <nav className="w-full bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-gray-900 px-6 py-3">
            <span className="text-xl font-bold">QuizzDrop</span>
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            title="View on GitHub"
            className="text-white p-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center px-6 py-16 min-h-[calc(100vh-80px)]">
        <div className="max-w-3xl w-full text-center space-y-12">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Turn your PDFs into a quiz
          </h1>
          
          <div 
            className={`bg-white border-2 border-dashed rounded-3xl p-20 transition-all duration-300 cursor-pointer shadow-lg ${
              dragActive 
                ? 'border-purple-500 bg-purple-100/50' 
                : uploadedFile 
                ? 'border-green-400 bg-green-50/30' 
                : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload PDF file"
            />
            <div className="flex flex-col items-center space-y-4">
              <AiOutlineCloudUpload className={`w-16 h-16 ${
                uploadedFile ? 'text-green-500' : 'text-purple-400'
              }`} />
              <div className={`text-xl font-medium ${
                uploadedFile ? 'text-green-600' : 'text-purple-600'
              }`}>
                {uploadedFile ? `✓ ${uploadedFile.name}` : 'Drop your PDF here'}
              </div>
              <div className="text-gray-500 text-sm">
                {uploadedFile ? 'File ready for quiz generation' : 'or click to browse files'}
              </div>
            </div>
          </div>

          <button 
            className={`font-semibold px-12 py-4 rounded-2xl transition-all duration-300 shadow-xl transform hover:-translate-y-1 hover:scale-105 ${
              uploadedFile 
                ? 'bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white hover:shadow-2xl cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!uploadedFile}
          >
            Generate Quiz
          </button>
        </div>
      </main>
    </div>
  );
}
