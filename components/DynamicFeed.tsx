'use client';

import { useEffect, useState } from 'react';
import { EnhancedPost, DesignTheme } from '@/lib/openai';
import { ThemeEngine } from '@/lib/theme-engine';
import Feed from './Feed';
import { motion } from 'framer-motion';

interface DynamicFeedProps {
  initialPosts: EnhancedPost[];
  initialTheme: DesignTheme;
}

export default function DynamicFeed({ initialPosts, initialTheme }: DynamicFeedProps) {
  const [posts, setPosts] = useState<EnhancedPost[]>(initialPosts);
  const [theme, setTheme] = useState<DesignTheme>(initialTheme);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isThemeChanging, setIsThemeChanging] = useState(false);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    ThemeEngine.applyTheme(theme);
  }, [theme]);

  // Auto-refresh theme every 30 seconds for the "morphing" effect
  useEffect(() => {
    const interval = setInterval(() => {
      changeTheme();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshFeed = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/feed?limit=15');
      const data = await response.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const changeTheme = async () => {
    setIsThemeChanging(true);
    try {
      const response = await fetch('/api/theme');
      const data = await response.json();
      if (data.theme) {
        setTheme(data.theme);
      }
    } catch (error) {
      console.error('Error changing theme:', error);
    } finally {
      setTimeout(() => setIsThemeChanging(false), 800);
    }
  };

  const refreshAll = async () => {
    setIsRefreshing(true);
    setIsThemeChanging(true);
    try {
      const [feedResponse, themeResponse] = await Promise.all([
        fetch('/api/feed?limit=15'),
        fetch('/api/theme'),
      ]);

      const [feedData, themeData] = await Promise.all([
        feedResponse.json(),
        themeResponse.json(),
      ]);

      if (feedData.posts) setPosts(feedData.posts);
      if (themeData.theme) setTheme(themeData.theme);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setIsThemeChanging(false), 800);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.header
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1
          className="text-5xl md:text-7xl font-bold mb-4"
          style={{
            color: 'var(--primary-color)',
            fontFamily: 'var(--font-family)',
          }}
        >
          YODO.LOL
        </h1>
        <p
          className="text-lg md:text-xl mb-6 opacity-80"
          style={{ color: 'var(--text-color)' }}
        >
          AI-Powered Chaotic Reddit Feed
        </p>

        {/* Theme Info */}
        <div
          className="inline-block px-6 py-3 rounded-full mb-6"
          style={{
            backgroundColor: 'var(--secondary-color)',
            color: 'var(--text-color)',
          }}
        >
          Current Mood: <strong>{theme.mood}</strong>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <button
            onClick={refreshAll}
            disabled={isRefreshing || isThemeChanging}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'var(--background-color)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            {isRefreshing ? '🔄 Loading...' : '🎲 Chaos Mode (New Everything)'}
          </button>

          <button
            onClick={refreshFeed}
            disabled={isRefreshing}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{
              backgroundColor: 'var(--secondary-color)',
              color: 'var(--background-color)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            {isRefreshing ? '🔄 Loading...' : '📱 New Posts'}
          </button>

          <button
            onClick={changeTheme}
            disabled={isThemeChanging}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--background-color)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            {isThemeChanging ? '✨ Morphing...' : '🎨 New Theme'}
          </button>
        </div>

        {/* Auto-morph indicator */}
        <p
          className="mt-4 text-sm opacity-50"
          style={{ color: 'var(--text-color)' }}
        >
          ✨ Theme auto-morphs every 30 seconds
        </p>
      </motion.header>

      {/* Feed */}
      {posts.length > 0 ? (
        <Feed initialPosts={posts} theme={theme} />
      ) : (
        <div className="text-center py-20">
          <p className="text-xl opacity-75" style={{ color: 'var(--text-color)' }}>
            No posts found. Try refreshing!
          </p>
        </div>
      )}

      {/* Footer */}
      <motion.footer
        className="mt-16 text-center pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <p
          className="text-sm opacity-50"
          style={{ color: 'var(--text-color)' }}
        >
          Powered by OpenAI GPT + Reddit + Pure Chaos
        </p>
        <p
          className="text-xs opacity-30 mt-2"
          style={{ color: 'var(--text-color)' }}
        >
          Every visit is a new adventure. Nothing stays the same.
        </p>
      </motion.footer>
    </div>
  );
}
