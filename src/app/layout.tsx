import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JobBoard - Find Your Next Career Opportunity',
  description: 'Find and post job opportunities',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link 
          rel="stylesheet" 
          href="/_next/static/css/74f7cf27fa1a3546.css"
          as="style"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} transition-colors duration-200`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen bg-white dark:bg-gray-900">
              {children}
            </main>
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
