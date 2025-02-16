"use client";

import { SessionProvider } from "next-auth/react";
  // Import the global CSS file
  import "./globals.css"; // Correct way if in the project root

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Music App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-black text-white">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
