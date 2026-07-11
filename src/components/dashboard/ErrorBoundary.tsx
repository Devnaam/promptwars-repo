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
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-2xl border border-monsoon-rose/35 bg-white p-5 shadow-xl shadow-monsoon-rose/10 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3 text-monsoon-rose">
            <svg className="h-8 w-8 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-black tracking-tight">General Monsoon Safety Guide</h2>
          </div>
          <p className="mb-6 leading-7 text-monsoon-plum/80">
            We could not render the personalized experience. Please use these general safety guidelines while you retry.
          </p>
          <ul className="space-y-4 text-monsoon-plum/85">
            {[
              ['Stay Indoors', 'Avoid travel unless absolutely necessary. Never walk or drive through floodwater.'],
              ['Electrical Safety', 'Unplug non-essential appliances and stay far away from downed power lines.'],
              ['Emergency Kit', 'Keep drinking water, non-perishable food, flashlights, batteries, and first aid ready.'],
              ['Stay Informed', 'Follow official alerts and keep emergency contacts accessible.'],
            ].map(([title, body]) => (
              <li key={title} className="flex items-start gap-3 rounded-xl bg-monsoon-yellow/30 p-4">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-monsoon-rose" aria-hidden="true" />
                <span>
                  <strong className="text-monsoon-plum">{title}:</strong> {body}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-8 w-full rounded-xl bg-monsoon-plum px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-monsoon-rose focus:outline-none focus:ring-4 focus:ring-monsoon-yellow sm:w-auto"
          >
            Acknowledge & Try Again
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
