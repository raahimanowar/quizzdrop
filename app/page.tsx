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
  const [topic, setTopic] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [suggestedQuestionCount, setSuggestedQuestionCount] = useState<number>(10);
  const inputRef = useRef<HTMLInputElement>(null);

  const calculateSuggestedQuestions = (textLength: number, pageCount: number): number => {
    const textBasedQuestions = Math.floor(textLength / 1200);
    const pageBasedQuestions = Math.ceil(pageCount * 2.5);
    const suggested = Math.max(textBasedQuestions, pageBasedQuestions);
    return Math.min(Math.max(suggested, 5), 50);
  };

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
        analyzeFileAndSetSuggestions(file);
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
        analyzeFileAndSetSuggestions(file);
      } else {
        showErrorToast();
      }
    }
  };

  const analyzeFileAndSetSuggestions = async (file: File) => {
    try {
      const extractedData = await extractTextFromPDF(file);
      const { text, pageCount } = extractedData;
      const suggested = calculateSuggestedQuestions(text.length, pageCount);
      setSuggestedQuestionCount(suggested);
      setQuestionCount(suggested);
      
      console.log(`File analysis: ${text.length} chars, ${pageCount} pages → suggesting ${suggested} questions`);
    } catch (error) {
      console.log('Could not analyze file for suggestions, using default');
      setSuggestedQuestionCount(10);
      setQuestionCount(10);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<{text: string, pageCount: number}> => {
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

      return { text: fullText.trim(), pageCount: pdf.numPages };
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
    if (uploadedFile && topic.trim()) {
      setIsGenerating(true);
      
      try {
        setQuizQuestions(null);
        
        const extractedData = await extractTextFromPDF(uploadedFile);
        const { text: extractedText, pageCount } = extractedData;
        
        if (extractedText.length < 100) {
          throw new Error('The PDF content is too short to generate meaningful questions. Please upload a document with more text content.');
        }

        const requestId = Date.now();
        console.log(`Generating quiz with ID: ${requestId} for topic: ${topic.trim()}`);
        
        const questions = await QuizGenerationService.generateQuiz(extractedText, questionCount, topic.trim());
        
        if (questions.length === 0) {
          throw new Error('Could not generate any questions from the document. Please try with a different PDF.');
        }

        setQuizQuestions(questions);
        setCurrentStep('quiz');
        showSuccessToast(`Generated ${questions.length} fresh questions about "${topic.trim()}"!`);
        
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
    } else {
      if (!uploadedFile) {
        setToastMessage('Please upload a PDF file first');
      } else if (!topic.trim()) {
        setToastMessage('Please enter a topic for your quiz');
      }
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleRestart = () => {
    setCurrentStep('upload');
    setQuizQuestions(null);
    setUploadedFile(null);
    setTopic('');
    setQuestionCount(10);
    setSuggestedQuestionCount(10);
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
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="text-gray-900 px-4 py-2 cursor-pointer" onClick={handleRestart}>
            <span className="text-lg font-bold">QuizzDrop</span>
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            title="View on GitHub"
            className="text-white p-2"
          >
            <FaGithub className="w-5 h-5" />
          </a>
        </div>
      </nav>

      {isGenerating ? (
        <main className="flex flex-col items-center justify-center px-4 py-8 min-h-[calc(100vh-60px)]">
          <div className="max-w-xl w-full text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Generating Fresh Quiz
            </h1>
            
            <p className="text-base text-gray-700">
              Creating unique questions just for you...
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
        <main className="flex flex-col items-center justify-center px-4 py-4 min-h-[calc(100vh-60px)]">
          <div className="max-w-2xl w-full text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Turn your PDFs into a quiz
          </h1>
          
          <div 
            className={`bg-white border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer shadow-lg ${
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
            <div className="flex flex-col items-center space-y-3">
              <AiOutlineCloudUpload className={`w-12 h-12 ${
                uploadedFile ? 'text-green-500' : 'text-purple-400'
              }`} />
              <div className={`text-lg font-medium ${
                uploadedFile ? 'text-green-600' : 'text-purple-600'
              }`}>
                {uploadedFile ? `✓ ${uploadedFile.name}` : 'Drop your PDF here'}
              </div>
              <div className="text-gray-500 text-sm">
                {uploadedFile ? 'File ready for quiz generation' : 'or click to browse files'}
              </div>
            </div>
          </div>

          <div className="w-full max-w-xl mx-auto">
            <label htmlFor="topic" className="block text-base font-medium text-gray-700 mb-2 text-left">
              Quiz Topic <span className="text-red-500">*</span>
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Machine Learning, World War II, Cell Biology..."
              className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                topic.trim() ? 'border-purple-200 focus:border-purple-500' : 'border-red-300 focus:border-red-500'
              }`}
              onClick={(e) => e.stopPropagation()}
              required
            />
            <p className={`text-xs mt-1 text-left ${
              topic.trim() ? 'text-gray-500' : 'text-red-500'
            }`}>
              {topic.trim() 
                ? 'Specify a topic to focus the quiz questions on relevant content from your PDF'
                : 'Please enter a topic to generate focused quiz questions'
              }
            </p>
          </div>

          {uploadedFile && (
            <div className="w-full max-w-xl mx-auto">
              <label htmlFor="questionCount" className="block text-base font-medium text-gray-700 mb-2 text-left">
                Number of Questions
              </label>
              <div className="flex items-center space-x-4">
                <input
                  id="questionCount"
                  type="range"
                  min="5"
                  max="50"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Math.min(Math.max(parseInt(e.target.value) || 5, 5), 50))}
                    className="w-16 px-2 py-1 text-center border border-purple-200 rounded-md focus:outline-none focus:border-purple-500"
                    onClick={(e) => e.stopPropagation()}
                    title="Number of questions"
                    aria-label="Number of questions"
                  />
                </div>
              </div>
              <p className="text-xs mt-1 text-left text-gray-500">
                Suggested: <span className="font-medium text-purple-600">{suggestedQuestionCount} questions</span> based on your PDF size
                {questionCount !== suggestedQuestionCount && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuestionCount(suggestedQuestionCount);
                    }}
                    className="ml-2 text-purple-600 hover:text-purple-800 underline text-xs"
                  >
                    Use suggested
                  </button>
                )}
              </p>
            </div>
          )}

          <button 
            className={`group relative overflow-hidden font-semibold px-8 py-3 rounded-xl transition-all duration-500 shadow-lg transform hover:-translate-y-1 ${
              uploadedFile && topic.trim()
                ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-indigo-600 hover:to-purple-700 text-white hover:shadow-xl cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!uploadedFile || !topic.trim()}
            onClick={handleGenerateQuiz}
          >
            {uploadedFile && topic.trim() && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            )}
            <span className="relative z-10">
              {quizQuestions ? 'Generate New Quiz' : 'Generate Quiz'}
            </span>
          </button>
          </div>
        </main>
      )}
    </div>
  );
}
