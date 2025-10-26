'use client';

import { EnhancedPost } from '@/lib/openai';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface FeedPostProps {
  post: EnhancedPost;
  index: number;
  animationStyle: string;
}

export default function FeedPost({ post, index, animationStyle }: FeedPostProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getAnimationVariants = () => {
    switch (animationStyle) {
      case 'bouncy':
        return {
          hidden: { opacity: 0, scale: 0.8, y: 50 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              bounce: 0.4,
              duration: 0.8,
              delay: index * 0.1,
            }
          },
        };
      case 'glitchy':
        return {
          hidden: { opacity: 0, x: -20 },
          visible: {
            opacity: 1,
            x: 0,
            transition: {
              duration: 0.2,
              delay: index * 0.05,
            }
          },
        };
      case 'chaotic':
        return {
          hidden: { opacity: 0, rotate: -10, scale: 0.9 },
          visible: {
            opacity: 1,
            rotate: 0,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 200,
              damping: 10,
              delay: index * 0.08,
            }
          },
        };
      case 'smooth':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: 'easeOut',
              delay: index * 0.1,
            }
          },
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.5,
              delay: index * 0.1,
            }
          },
        };
    }
  };

  if (imageError || !post.imageUrl) return null;

  return (
    <motion.div
      className="feed-post"
      variants={getAnimationVariants()}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      style={{
        backgroundColor: 'var(--secondary-color)',
        borderRadius: 'var(--border-radius)',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Post Header */}
      <div
        className="p-4 flex items-center gap-3"
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
          style={{
            backgroundColor: 'var(--accent-color)',
            color: 'var(--background-color)',
          }}
        >
          {post.subreddit[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-bold" style={{ color: 'var(--text-color)' }}>
            r/{post.subreddit}
          </div>
          {post.aiPersonality && (
            <div
              className="text-sm opacity-75"
              style={{ color: 'var(--text-color)' }}
            >
              {post.aiPersonality}
            </div>
          )}
        </div>
        {post.mood && (
          <div
            className="px-3 py-1 rounded-full text-xs"
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--background-color)',
            }}
          >
            {post.mood}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-800">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-transparent"></div>
          </div>
        )}
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading={index < 3 ? "eager" : "lazy"}
          priority={index < 3}
        />
      </div>

      {/* Post Content */}
      <div className="p-4">
        {/* AI Caption */}
        {post.aiCaption && (
          <p
            className="mb-3 text-sm font-medium"
            style={{ color: 'var(--text-color)' }}
          >
            {post.aiCaption}
          </p>
        )}

        {/* Original Title */}
        <p
          className="text-sm opacity-75 mb-2"
          style={{ color: 'var(--text-color)' }}
        >
          {post.title}
        </p>

        {/* Post Stats */}
        <div
          className="flex gap-4 text-xs opacity-60"
          style={{ color: 'var(--text-color)' }}
        >
          <span>↑ {post.score.toLocaleString()}</span>
          <span>💬 {post.numComments.toLocaleString()}</span>
          <span>by u/{post.author}</span>
        </div>
      </div>

      {/* View on Reddit Link */}
      <div className="px-4 pb-4">
        <a
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--accent-color)' }}
        >
          View on Reddit →
        </a>
      </div>
    </motion.div>
  );
}
