'use client';

import { AiOutlineCloudUpload } from 'react-icons/ai';
import { FaGithub } from 'react-icons/fa';
import { useState, useRef } from 'react';

export default function Home() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerateQuiz = () => {
    if (uploadedFile) {
      setIsGenerating(true);
      // API call to generate quiz would go here
      setTimeout(() => {
        setIsGenerating(false);
        // quiz
      }, 5000);
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
            <FaGithub className="w-6 h-6" />
          </a>
        </div>
      </nav>

      {isGenerating ? (
        <main className="flex flex-col items-center justify-center px-6 py-16 min-h-[calc(100vh-80px)]">
          <div className="max-w-2xl w-full text-center space-y-8">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Generating Quiz
            </h1>
            
            <p className="text-lg text-gray-700">
              Hold up for a moment
            </p>
            
            <div className="flex justify-center items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              </div>
            </div>
          </div>
        </main>
      ) : (
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
            className={`group relative overflow-hidden font-semibold px-12 py-4 rounded-2xl transition-all duration-500 shadow-xl transform hover:-translate-y-2 ${
              uploadedFile 
                ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-indigo-600 hover:to-purple-700 text-white hover:shadow-2xl cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!uploadedFile}
            onClick={handleGenerateQuiz}
          >
            {uploadedFile && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            )}
            <span className="relative z-10">Generate Quiz</span>
          </button>
          </div>
        </main>
      )}
    </div>
  );
}
