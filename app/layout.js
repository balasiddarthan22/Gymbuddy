import './globals.css';

export const metadata = {
  title: 'GymBuddy',
  description: 'Your personal AI gym guide',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
