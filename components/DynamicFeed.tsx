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
  const [titleClass, setTitleClass] = useState('');
  const [currentTitle, setCurrentTitle] = useState('¥ØĐØ.ŁØŁ');
  const [currentSubtitle, setCurrentSubtitle] = useState('AI-Powered Psychedelic Nightmare Feed');

  // Occult, alchemical, astronomical symbols and obscure emojis for buttons
  const voidSymbols = [
    '🜏 ⛤ ☿ 🝚', '⛧ ☾ ♆ 🜨', '🜍 ⚛ ☄ ⸙', '☊ 🜔 ⛢ 🝝',
    '♇ ⚗ 🜃 ⸚', '🝱 ☌ 🜑 ⛥', '☋ 🜘 ♅ 🝢', '⚚ ☽ 🜦 ⸜',
  ];

  const chaosSymbols = [
    '🜂 ⚸ ☿ 🝛', '⛦ ♂ 🜓 ⸏', '🜎 ☄ ⚕ 🝞', '⛧ 🜕 ♃ ⸝',
    '☊ ⚛ 🜡 🝣', '🜄 ⛤ ☌ ⚜', '♄ 🜗 ⚹ 🝤', '⚡︎ 🜚 ☋ 🗲',
  ];

  const warpSymbols = [
    '🜁 ⛥ ♀ 🝜', '☽ 🜒 ⚝ ⸎', '🜏 ♆ ⚞ 🝥', '⛢ 🜖 ☿ ⚟',
    '🜃 ♇ ⚘ 🝦', '⚛ 🜙 ⛧ 🝠', '☾ 🜤 ♅ ⸙', '🜨 ⚗ ☌ 🝧',
  ];

  const [voidSymbol, setVoidSymbol] = useState(voidSymbols[0]);
  const [chaosSymbol, setChaosSymbol] = useState(chaosSymbols[0]);
  const [warpSymbol, setWarpSymbol] = useState(warpSymbols[0]);

  // Rotate symbols every 2 seconds for maximum mysticism
  useEffect(() => {
    const interval = setInterval(() => {
      setVoidSymbol(voidSymbols[Math.floor(Math.random() * voidSymbols.length)]);
      setChaosSymbol(chaosSymbols[Math.floor(Math.random() * chaosSymbols.length)]);
      setWarpSymbol(warpSymbols[Math.floor(Math.random() * warpSymbols.length)]);
    }, 2000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Title variations - misspellings and different extensions
  const titleVariations = [
    '¥ØĐØ.ŁØŁ',
    'YODO.LOL',
    'YØDO.COM',
    'YODO.NET',
    'Y0D0.ORG',
    'YODO.WTF',
    'YODO.XYZ',
    'YODO.LIFE',
    'YØĐØ.IO',
    'Y0DO.APP',
    'YODO.ZONE',
    'YODO.CHAOS',
    'YODO.VOID',
    'Y̴O̴D̴O̴.̴L̴O̴L̴',  // corrupted text
    'YODO.???',
    'YODO.EXE',
    'YOOD.LOL',  // misspelled
    'YODO.LOI',  // misspelled
    'YODO.LOL?',
    'YØÐØ.ŁØŁ',
    'Y҉O҉D҉O҉.L҉O҉L҉',  // zalgo-lite
  ];

  // Subtitle variations
  const subtitleVariations = [
    'AI-Powered Psychedelic Nightmare Feed',
    'Reality Dissolution Engine',
    'Consciousness Fragmentation Interface',
    'Digital Schizophrenia Simulator',
    'Interdimensional Meme Portal',
    'Sentient Chaos Generator',
    'Existential Dread Aggregator',
    'Timeline Corruption Feed',
    'Void Screaming Visualizer',
    'Reality.exe Has Stopped Working',
    'Your Regularly Scheduled Breakdown',
    'The Cosmic Horror Social Network',
    'Where Sanity Goes To Die',
    'Powered By Dissociation',
    'A̷I̷-̷P̷o̷w̷e̷r̷e̷d̷ ̷G̷l̷i̷t̷c̷h̷',
    'Embrace The Static',
    'We Are All Just Vibing In The Abyss',
    'Mom I\'m Scared',
    'This Is Fine [̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]',
    'Hell Is Other People\'s Posts',
  ];

  // Apply theme on mount and when theme changes
  useEffect(() => {
    ThemeEngine.applyTheme(theme);
  }, [theme]);

  // Auto-refresh theme every 15 seconds for MAXIMUM CHAOS
  useEffect(() => {
    const interval = setInterval(() => {
      changeTheme();
    }, 15000); // 15 seconds - MUCH MORE AGGRESSIVE

    return () => clearInterval(interval);
  }, []);

  // Random title effects that change every 3 seconds
  useEffect(() => {
    const effects = ['glitch-text', 'wave-text', 'melt-text', 'spiral-text', ''];
    const interval = setInterval(() => {
      setTitleClass(effects[Math.floor(Math.random() * effects.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Random title text changes every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTitle = titleVariations[Math.floor(Math.random() * titleVariations.length)];
      setCurrentTitle(randomTitle);
    }, 4000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Random subtitle changes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomSubtitle = subtitleVariations[Math.floor(Math.random() * subtitleVariations.length)];
      setCurrentSubtitle(randomSubtitle);
    }, 5000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          className={`text-5xl md:text-7xl font-bold mb-4 ${titleClass}`}
          style={{
            color: 'var(--primary-color)',
            fontFamily: 'var(--font-family)',
          }}
        >
          {currentTitle}
        </h1>
        <p
          className="text-lg md:text-xl mb-6 opacity-80"
          style={{ color: 'var(--text-color)' }}
        >
          {currentSubtitle}
        </p>

        {/* Theme Info */}
        <motion.div
          className="inline-block px-6 py-3 rounded-full mb-6 float-random"
          style={{
            backgroundColor: 'var(--secondary-color)',
            color: 'var(--text-color)',
          }}
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Current Vibe: <strong className="glitch-text">{theme.mood}</strong>
        </motion.div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <button
            onClick={refreshAll}
            disabled={isRefreshing || isThemeChanging}
            className="px-6 py-3 rounded-lg font-semibold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'var(--background-color)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            {isRefreshing ? '⚙ ⚙ ⚙' : voidSymbol}
          </button>

          <button
            onClick={refreshFeed}
            disabled={isRefreshing}
            className="px-6 py-3 rounded-lg font-semibold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{
              backgroundColor: 'var(--secondary-color)',
              color: 'var(--background-color)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            {isRefreshing ? '⚙ ⚙ ⚙' : chaosSymbol}
          </button>

          <button
            onClick={changeTheme}
            disabled={isThemeChanging}
            className="px-6 py-3 rounded-lg font-semibold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--background-color)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            {isThemeChanging ? '⚙ ⚙ ⚙' : warpSymbol}
          </button>
        </div>

        {/* Auto-morph indicator */}
        <p
          className="mt-4 text-sm opacity-50"
          style={{ color: 'var(--text-color)' }}
        >
          ⚠️ Reality shifts every 15 seconds ⚠️
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
          Powered by OpenAI + Reddit + Severe Mental Instability
        </p>
        <p
          className="text-xs opacity-30 mt-2"
          style={{ color: 'var(--text-color)' }}
        >
          nothing is real. everything is permitted. reality is optional.
        </p>
      </motion.footer>
    </div>
  );
}
