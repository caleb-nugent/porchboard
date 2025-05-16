import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'PorchBoard - City Event Discovery Platform',
  description: 'Discover and share local events in your city',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full bg-gray-50`}>
      <body className="h-full">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
} 