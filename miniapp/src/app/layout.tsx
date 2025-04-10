import './globals.css';
import { Providers } from './providers';
import { getSession } from '~/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disperse App',
  description: 'Distribute ETH and tokens to multiple addresses in one transaction',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-black dark:bg-gray-900 dark:text-white">
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
