import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arcade Reaction Master',
  description: 'Test your reflexes in this arcade-style reaction game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Add pixel font for better arcade look */}
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="game-root">
          {children}
        </div>
      </body>
    </html>
  );
}