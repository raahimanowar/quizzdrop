'use client';

import { FaGithub } from 'react-icons/fa';

interface NavbarProps {
  onLogoClick: () => void;
}

export default function Navbar({ onLogoClick }: NavbarProps) {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-gray-900 px-4 py-2 cursor-pointer group" onClick={onLogoClick}>
          <span className="text-2xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors duration-200">
            QuizzDrop
          </span>
        </div>
        <a 
          href="https://github.com/raahimanowar/quizzdrop" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="GitHub Repository"
          title="View Source Code"
          className="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200"
        >
          <FaGithub className="w-8 h-8" />
        </a>
      </div>
    </nav>
  );
}
