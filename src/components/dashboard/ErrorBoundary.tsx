'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-rose-50 dark:bg-rose-950/30 rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-200 dark:border-rose-900/50 transition-all duration-500 animate-in fade-in">
          <div className="flex items-center gap-3 mb-6 text-rose-700 dark:text-rose-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <h2 className="text-2xl font-bold tracking-tight">General Monsoon Safety Guide</h2>
          </div>
          <p className="text-rose-900 dark:text-rose-200 mb-6 leading-relaxed">
            We are currently experiencing high traffic or API connectivity issues and could not generate your personalized plan. However, please follow these crucial general safety guidelines immediately:
          </p>
          <ul className="space-y-4 text-rose-800 dark:text-rose-300">
            <li className="flex items-start gap-3 bg-white/40 dark:bg-black/20 p-4 rounded-xl">
              <span className="font-bold text-rose-600 dark:text-rose-400 mt-0.5">•</span>
              <span><strong className="text-rose-900 dark:text-rose-100">Stay Indoors:</strong> Avoid traveling unless absolutely necessary. Do not walk or drive through flooded waters as they may contain unseen hazards.</span>
            </li>
            <li className="flex items-start gap-3 bg-white/40 dark:bg-black/20 p-4 rounded-xl">
              <span className="font-bold text-rose-600 dark:text-rose-400 mt-0.5">•</span>
              <span><strong className="text-rose-900 dark:text-rose-100">Electrical Safety:</strong> Unplug non-essential electronic appliances. Stay far away from downed power lines and report them to local authorities.</span>
            </li>
            <li className="flex items-start gap-3 bg-white/40 dark:bg-black/20 p-4 rounded-xl">
              <span className="font-bold text-rose-600 dark:text-rose-400 mt-0.5">•</span>
              <span><strong className="text-rose-900 dark:text-rose-100">Emergency Kit:</strong> Ensure you have clean drinking water, non-perishable food, flashlights, extra batteries, and a basic first-aid kit ready.</span>
            </li>
            <li className="flex items-start gap-3 bg-white/40 dark:bg-black/20 p-4 rounded-xl">
              <span className="font-bold text-rose-600 dark:text-rose-400 mt-0.5">•</span>
              <span><strong className="text-rose-900 dark:text-rose-100">Stay Informed:</strong> Keep a battery-operated radio tuned to local news and weather updates. Follow official government alerts.</span>
            </li>
          </ul>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-8 px-6 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-rose-500/50 w-full sm:w-auto"
          >
            Acknowledge & Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
