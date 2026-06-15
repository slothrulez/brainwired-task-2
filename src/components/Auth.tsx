import React, { useState } from 'react';
import { motion } from 'motion/react';
import { db, isSupabaseConfigured } from '../supabase';
import { Shield, Sparkles, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  statusMessage?: string;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all standard credentials.');
      return;
    }
    if (isSignUp && !fullName) {
      setError('Please provide your name.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      if (isSignUp) {
        const user = await db.signUp(email, password, fullName);
        setSuccessMessage(
          isSupabaseConfigured 
            ? 'Account created! Please check your inbox for validation email if required, or log in.' 
            : 'Welcome to your Workspace Sandbox! Directing you inside...'
        );
        setTimeout(() => {
          if (user) onAuthSuccess(user);
        }, 1500);
      } else {
        const user = await db.signIn(email, password);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-container" className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#FBFFA8]/5 border border-neutral-200/60 rounded-3xl p-8 md:p-10 bg-white/70 backdrop-blur-xl shadow-sm"
      >
        <div id="status-header" className="flex justify-between items-center mb-10 font-mono text-[11px] tracking-wide uppercase text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span></span>
          </span>
        </div>

        <div className="mb-8">
          <h2 className="font-serif text-3xl font-normal tracking-tight text-neutral-900 leading-tight mb-2">
            {isSignUp ? 'Create Workspace' : 'Sign in to ടുഡു'}
          </h2>
          <p className="text-neutral-500 text-sm">
            {isSignUp 
              ? 'Join us to organize, prioritize, and structure your daily notes and work.' 
              : 'Unlock your elegant to-do collection and take control of your day.'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 bg-rose-50 border border-rose-200/50 text-rose-700 text-xs p-3.5 rounded-2xl mb-6"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-xs p-3.5 rounded-2xl mb-6"
          >
            <Check className="h-4 w-4 shrink-0 mt-0.5 bg-emerald-100 rounded-full p-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400" htmlFor="fullname">
                Full Name
              </label>
              <input
                id="fullname"
                type="text"
                placeholder="Charlotte Perriand"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-full px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="ടുഡു@agmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-full px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-full px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-full border border-transparent bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 h-11 px-6 py-2.5 font-medium text-sm transition-all shadow-sm mt-2"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                {isSignUp ? 'Initialize Account' : 'Access Workspace'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col items-center gap-3">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccessMessage(null);
            }}
            className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors uppercase font-mono tracking-wider"
          >
            {isSignUp ? 'Already registered? Log in' : 'Create new workspace account'}
          </button>

          {!isSupabaseConfigured && (
            <div id="sandbox-badge" className="mt-4 flex items-center justify-center gap-1.5 bg-amber-500/10 border border-amber-500/15 text-amber-800 text-[10px] font-mono tracking-normal py-2 px-4 rounded-xl max-w-sm text-center">
              <Sparkles className="h-3 w-3 text-amber-600 shrink-0" />
              <span>
                Running in local state mode. Setting config environment variables connects your real Supabase.
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
