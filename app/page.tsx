'use client';

import { AiOutlineCloudUpload } from 'react-icons/ai';
import { FaGithub } from 'react-icons/fa';
import { useState, useRef } from 'react';
import QuizDisplay from './components/QuizDisplay';
import { QuizGenerationService, QuizQuestion } from './services/quizGeneration';

let pdfjsLib: any = null;

const setupPDFWorker = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
  }
  return pdfjsLib;
};

export default function Home() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success'>('error');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'quiz'>('upload');
  const inputRef = useRef<HTMLInputElement>(null);

  const showErrorToast = () => {
    setToastMessage('Please upload a PDF file only');
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
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

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const pdfLib = await setupPDFWorker();

      const arrayBuffer = await file.arrayBuffer();
      
      const loadingTask = pdfLib.getDocument({
        data: arrayBuffer,
        disableFontFace: true,
        nativeImageDecoderSupport: 'none'
      });
      
      const pdf = await loadingTask.promise;
      let fullText = '';

      if (pdf.numPages === 0) {
        throw new Error('PDF appears to be empty or corrupted');
      }

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          if (textContent.items && textContent.items.length > 0) {
            const pageText = textContent.items
              .filter((item: any) => item.str && item.str.trim().length > 0)
              .map((item: any) => item.str)
              .join(' ');
            
            if (pageText.trim()) {
              fullText += pageText + '\n';
            }
          }
        } catch (pageError) {
          console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        }
      }

      if (!fullText.trim()) {
        throw new Error('No readable text found in PDF. The PDF might be image-based or corrupted.');
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF')) {
          throw new Error('The uploaded file is not a valid PDF document.');
        } else if (error.message.includes('worker')) {
          throw new Error('PDF processing failed. Please try refreshing the page and uploading again.');
        } else if (error.message.includes('No readable text')) {
          throw error;
        }
      }
      
      throw new Error('Failed to extract text from PDF. Please ensure the PDF contains readable text.');
    }
  };

  const handleGenerateQuiz = async () => {
    if (uploadedFile) {
      setIsGenerating(true);
      
      try {
        const extractedText = await extractTextFromPDF(uploadedFile);
        
        if (extractedText.length < 100) {
          throw new Error('The PDF content is too short to generate meaningful questions. Please upload a document with more text content.');
        }

        const questions = await QuizGenerationService.generateQuiz(extractedText, 10);
        
        if (questions.length === 0) {
          throw new Error('Could not generate any questions from the document. Please try with a different PDF.');
        }

        setQuizQuestions(questions);
        setCurrentStep('quiz');
        showSuccessToast(`Generated ${questions.length} questions successfully!`);
        
      } catch (error) {
        console.error('Error processing PDF:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.';
        setToastMessage(errorMessage);
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleRestart = () => {
    setCurrentStep('upload');
    setQuizQuestions(null);
    setUploadedFile(null);
    setIsGenerating(false);
  };

  if (currentStep === 'quiz' && quizQuestions) {
    return <QuizDisplay questions={quizQuestions} onRestart={handleRestart} />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-purple-200">
      {showToast && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg animate-bounce ${
          toastType === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">
              {toastType === 'error' ? '✗' : '✓'}
            </span>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
      
      <nav className="w-full bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-gray-900 px-6 py-3 cursor-pointer" onClick={handleRestart}>
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
