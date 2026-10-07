import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { FloatingAiButton } from '../ai/FloatingAiButton';

export const PublicLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-base text-ink selection:bg-primary selection:text-white">
      {/* Premium ambient page background — soft orbs + faint blueprint grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.07),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(0,140,255,0.10),transparent_45%)]" />
        <div className="absolute -left-32 top-[35vh] h-[480px] w-[480px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(37,99,235,0.09),transparent_70%)] dark:bg-[radial-gradient(closest-side,rgba(0,170,255,0.08),transparent_70%)]" />
        <div className="absolute -right-28 top-[115vh] h-[520px] w-[520px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(99,102,241,0.08),transparent_70%)] dark:bg-[radial-gradient(closest-side,rgba(0,210,255,0.07),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[length:72px_72px] dark:bg-[linear-gradient(rgba(56,189,248,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.035)_1px,transparent_1px)]" />
      </div>

      <Navbar />
      <main className="relative z-10 flex-1 animate-fadeInSoft">
        <Outlet />
      </main>
      <Footer />
      <FloatingAiButton />
      <BottomNav />
    </div>
  );
};
