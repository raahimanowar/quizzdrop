'use client';

import { X, FileText, Target, Hash } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-purple-600">How to Use QuizzDrop</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close help"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Guide</h3>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span>Sign in to your account</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>Upload your PDF document</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span>Enter your quiz topic</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span>Generate and take your quiz!</span>
                </li>
              </ol>
            </div>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Tips for Best Results</h3>
            <div className="space-y-4">
              
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <FileText className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Use English Text-Based PDFs</h4>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      Ensure your PDF contains clear, readable English text. Avoid scanned images, handwritten notes, 
                      or documents in other languages for optimal quiz generation. Text-based PDFs work best for 
                      accurate content extraction and question creation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Match Your Topic to PDF Content</h4>
                    <p className="text-green-700 text-sm leading-relaxed">
                      Make sure your quiz topic directly relates to the content in your PDF. If your document is about 
                      "Biology," don't ask for questions about "Mathematics." The AI generates better questions when 
                      the topic aligns with the actual document content.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-start space-x-3">
                  <Hash className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Try Fewer Questions If Generation Fails</h4>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      If the quiz generation isn't working, try reducing the number of questions. Start with 5-10 questions 
                      instead of the maximum. Shorter documents or complex content may work better with fewer questions. 
                      You can always generate multiple smaller quizzes!
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Limits</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 text-sm">
                You can generate up to <span className="font-semibold text-purple-600">3 quizzes per day</span>. 
                This limit resets every 24 hours. Make the most of your daily quota by following the tips above!
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Troubleshooting</h3>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Common Issues & Solutions</h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• <strong>PDF not uploading:</strong> Check file size (max 10MB) and format</li>
                <li>• <strong>No questions generated:</strong> Ensure PDF has readable text content</li>
                <li>• <strong>Poor question quality:</strong> Use more specific topic descriptions</li>
                <li>• <strong>Generation timeout:</strong> Try smaller PDFs or fewer questions</li>
              </ul>
            </div>
          </section>

        </div>

        <div className="flex justify-center p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors duration-200"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
