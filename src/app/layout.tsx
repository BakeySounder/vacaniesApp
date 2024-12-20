'use client'
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };
export const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" >
      <QueryClientProvider client={queryClient}>
      <body>
        {/* {children} */}
          {children}
      </body>
      </QueryClientProvider>  
    </html>
  );
}
