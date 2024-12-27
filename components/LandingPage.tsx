"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email submission logic
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-4 font-sans">
      <div className="max-w-md mx-auto w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2">
            <Sparkles className="h-10 w-10 text-emerald-600" />
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl font-serif">
              InsightForge AI
            </h1>
          </div>
          <p className="mt-4 text-xl text-gray-600 font-light">
            Revolutionize healthcare with AI-powered insights
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ArrowRight
                  className="h-5 w-5 text-emerald-500 group-hover:text-emerald-400"
                  aria-hidden="true"
                />
              </span>
              Get Early Access
            </button>
          </div>
        </form>
        {isSubmitted && (
          <div className="mt-3 text-sm text-emerald-600 text-center font-medium">
            Thank you! We'll be in touch soon with exclusive insights.
          </div>
        )}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Join the waitlist for our AI-powered healthcare optimization
            platform.
          </p>
        </div>
      </div>
      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>&copy; 2024 InsightForge AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
