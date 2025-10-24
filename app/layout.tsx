import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'YODO.LOL - AI-Powered Chaotic Reddit Feed',
  description: 'A living, breathing web page that morphs with every visit. Powered by AI, fueled by Reddit chaos.',
  keywords: ['AI', 'Reddit', 'Dynamic', 'Creative', 'Social Media'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
