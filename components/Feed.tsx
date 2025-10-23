'use client';

import { EnhancedPost } from '@/lib/openai';
import { DesignTheme } from '@/lib/openai';
import FeedPost from './FeedPost';
import { useEffect, useState } from 'react';

interface FeedProps {
  initialPosts: EnhancedPost[];
  theme: DesignTheme;
}

export default function Feed({ initialPosts, theme }: FeedProps) {
  const [layoutStyle, setLayoutStyle] = useState<string>('masonry');
  const [animationStyle, setAnimationStyle] = useState<string>('subtle');

  useEffect(() => {
    setLayoutStyle(theme.layoutStyle);
    setAnimationStyle(theme.animation);
  }, [theme]);

  const getLayoutClasses = () => {
    switch (layoutStyle) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'masonry':
        return 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6';
      case 'list':
        return 'flex flex-col gap-6 max-w-2xl mx-auto';
      case 'cards':
        return 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  return (
    <div className={getLayoutClasses()}>
      {initialPosts.map((post, index) => (
        <div
          key={post.id}
          className={layoutStyle === 'masonry' ? 'break-inside-avoid' : ''}
        >
          <FeedPost
            post={post}
            index={index}
            animationStyle={animationStyle}
          />
        </div>
      ))}
    </div>
  );
}
