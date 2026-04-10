import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ISAC — German Application Centre',
  description: 'Create professional German CVs and motivation letters.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
