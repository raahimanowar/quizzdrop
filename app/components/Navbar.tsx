'use client';

import { FaGithub } from 'react-icons/fa';
import { HelpCircle } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import HelpModal from './HelpModal';

interface NavbarProps {
  onLogoClick: () => void;
}

export default function Navbar({ onLogoClick }: NavbarProps) {
  const { isSignedIn, user } = useUser();
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <>
      <nav className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 py-2 flex justify-between items-center">
        <div className="text-gray-900 px-2 py-1 cursor-pointer group" onClick={onLogoClick}>
          <span className="text-2xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors duration-200">
            QuizzDrop
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(true)}
            className="text-purple-600 hover:text-purple-700 p-1.5 rounded-lg hover:bg-purple-50 transition-colors duration-200"
            aria-label="Help"
            title="How to use QuizzDrop"
          >
            <HelpCircle className="w-6 h-6" />
          </button>

          <a 
            href="https://github.com/raahimanowar/quizzdrop" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            title="View Source Code"
            className="text-purple-600 hover:text-purple-700 p-1.5 rounded-lg hover:bg-purple-50 transition-colors duration-200"
          >
            <FaGithub className="w-6 h-6" />
          </a>
          
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 hidden sm:block">
                Welcome, {user?.firstName || 'User'}!
              </span>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                    userButtonPopoverCard: 'shadow-lg border border-gray-200',
                    userButtonPopoverActionButton: 'hover:bg-purple-50',
                    userButtonPopoverActionButtonText: 'text-gray-700',
                    userButtonPopoverFooter: 'hidden'
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200 text-xs font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-xs font-medium">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </nav>
    <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
  </>
  );
}
