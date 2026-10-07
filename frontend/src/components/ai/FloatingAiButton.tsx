import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { AiDrawer } from './AiDrawer';

export const FloatingAiButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-24 right-4 z-40 lg:bottom-6 lg:right-6">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full bg-grad-ai p-3.5 text-white shadow-glow-cyan transition-all duration-300 hover:scale-105 hover:shadow-glow active:scale-95 sm:px-5 sm:py-3.5"
          aria-label="Open AI Shopping Assistant"
        >
          {/* Soft breathing halo */}
          <span
            aria-hidden="true"
            className="absolute -inset-0.5 -z-10 rounded-full bg-grad-ai opacity-60 blur-sm animate-breathe"
          />

          <span className="relative flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
            <Sparkles
              className="absolute -right-1.5 -top-1 h-2.5 w-2.5 text-cyan-200"
              aria-hidden="true"
            />
          </span>

          <span className="hidden text-sm font-bold tracking-wide sm:inline">Ask AI</span>
        </button>
      </div>

      <AiDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
